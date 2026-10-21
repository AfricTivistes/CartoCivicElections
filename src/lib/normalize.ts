import type { Initiative } from "@/collections/initiatives/config";
import type { Lang } from "@/i18n/ui";
import paysData from "@/utils/pays.json";

/**
 * Les réponses NocoDB sont saisies à la main : espaces parasites, accents
 * incohérents, pluriels, plusieurs valeurs dans un même champ séparées par
 * « / », « , » ou « - ». Ce module les ramène à des valeurs comparables pour
 * l'observatoire. Les fiches détaillées continuent d'afficher le texte d'origine.
 */

const pays = paysData as Record<string, { en?: string; coords: number[] }>;

/** Clé de comparaison : sans accents, minuscules, espaces compactés. */
export const keyOf = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const NA_KEYS = new Set([
  "",
  "-",
  "non concernee",
  "not applicable",
  "non specifie",
  "non specifiee",
  "not specified",
  "vide",
  "pays non specifie",
  "nom non specifie",
  "organisation non specifiee",
  "non categorise",
]);

export const isNA = (s: string | undefined | null) => !s || NA_KEYS.has(keyOf(s));

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Valeur unique nettoyée, ou null si non renseignée. */
export function clean(s: string | undefined | null): string | null {
  if (isNA(s)) return null;
  return capitalize(s!.replace(/\s+/g, " ").trim());
}

/** Oui / Non → true / false ; le reste → null. */
export function yesNo(s: string | undefined | null): boolean | null {
  if (isNA(s)) return null;
  const k = keyOf(s!);
  if (/^(oui|yes)\b/.test(k)) return true;
  if (/^(non|no)\b/.test(k)) return false;
  return null;
}

// Alias (clé normalisée → clé normalisée) pour les synonymes que la
// racinisation ne rapproche pas ; les deux langues coexistent parfois.
const ALIASES: Record<string, string> = {
  parliamentary: "legislative",
  "young people": "youth",
  wowen: "women",
  finances: "financier",
  "and human resources": "human resources",
  ocs: "cso",
  "mouvement citoyen": "mouvement",
  "citizen movement": "movement",
  "sensitisation, information, education": "sensibilisation, information, education",
};

/**
 * Clé de regroupement : accents, casse, alias, puis racine grossière de chaque
 * mot (sans « s » ni « e » final) pour fusionner Régional / Régionales,
 * Électeur / Électeurs, Générale / Général…
 */
export const groupKey = (s: string) => {
  const k = keyOf(s);
  return (ALIASES[k] ?? k)
    .split(" ")
    .map((w) => (w.length > 3 ? w.replace(/s$/, "").replace(/e$/, "") : w))
    .join(" ");
};

/** Découpe un champ multi-valeurs, normalise et dédoublonne chaque valeur. */
export function multi(
  s: string | undefined | null,
  sep: RegExp = /\s*[\/,;]\s*|\s+-\s*|\s*-\s+/,
): { key: string; label: string }[] {
  if (isNA(s)) return [];
  const out = new Map<string, string>();
  for (const part of s!.split(sep)) {
    const label = part.replace(/^[\s.\-–•]+|[\s.\-–•]+$/g, "").replace(/\s+/g, " ");
    if (isNA(label) || label.length < 2) continue;
    const k = groupKey(label);
    if (!out.has(k)) out.set(k, capitalize(label));
  }
  return [...out].map(([key, label]) => ({ key, label }));
}

/** Pays → clé pays.json (nom français canonique) + libellé dans la langue. */
const countryIndex = new Map(Object.keys(pays).map((k) => [keyOf(k), k]));
export function country(s: string | undefined | null, lang: Lang) {
  if (isNA(s)) return null;
  const canonical = countryIndex.get(keyOf(s!)) ?? clean(s)!;
  const label = lang === "en" ? (pays[canonical]?.en ?? canonical) : canonical;
  return { key: keyOf(canonical), name: canonical, label };
}

export function countryLabel(name: string, lang: Lang) {
  return lang === "en" ? (pays[name]?.en ?? name) : name;
}

export function countryCoords(name: string): [number, number] | null {
  const c = pays[name]?.coords;
  return c && c.length === 2 ? [c[0], c[1]] : null;
}

/** Année de début (dd/mm/yyyy ou yyyy-mm-dd). */
export function year(s: string | undefined | null): number | null {
  const m = String(s ?? "").match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

/** Phases du cycle électoral → pre / election / post (tout le cycle = les trois). */
export function phases(s: string | undefined | null): ("pre" | "election" | "post")[] {
  if (isNA(s)) return [];
  const k = keyOf(s!);
  if (/tout|entire|whole|all/.test(k)) return ["pre", "election", "post"];
  const out = new Set<"pre" | "election" | "post">();
  if (/pre/.test(k)) out.add("pre");
  if (/post/.test(k)) out.add("post");
  const rest = k.replace(/(pre|post)[- ]?electora\w*/g, "");
  if (/electora|pendant|during/.test(rest)) out.add("election");
  return [...out];
}

/** Appréciation de la transparence → échelle 1 (faible) … 6 (excellente). */
const TRANSPARENCY: [RegExp, number][] = [
  [/^excellen/, 6],
  [/^(tres bien|very good)/, 5],
  [/^(assez bien|fairly good)/, 3],
  [/^(bien|good)/, 4],
  [/^(passable|fair)/, 2],
  [/^(faible|poor|weak|mauvais)/, 1],
];
export function transparency(s: string | undefined | null): number | null {
  if (isNA(s)) return null;
  const k = keyOf(s!);
  for (const [re, v] of TRANSPARENCY) if (re.test(k)) return v;
  return null;
}

/** Ligne compacte envoyée au navigateur pour l'observatoire. */
export type Row = {
  slug: string;
  title: string;
  country: string | null; // nom canonique (clé de pays.json)
  countryLabel: string | null;
  year: number | null;
  category: string | null;
  thematic: string | null;
  org: string[];
  election: string[];
  targets: string[];
  phases: ("pre" | "election" | "post")[];
  zone: string | null;
  partners: boolean | null;
  contribution: string[];
  partnerZone: string[];
  legal: boolean | null;
  difficulties: boolean | null;
  recognition: boolean | null;
  issues: boolean | null;
  reported: boolean | null;
  impact: boolean | null;
  transparency: number | null;
  issuesNature: string | null;
  outcome: string | null;
  summary: string | null;
  logo: string | null;
  organisation: string | null;
  regions: string[];
  /** Fond de couverture tiré du logo (renseigné par getRows) */
  cover: { bg: string; ink: "light" | "dark" } | null;
};

/**
 * Choisit pour chaque clé normalisée le libellé le plus fréquent, afin que
 * « Electeurs » et « Électeurs » s'affichent sous une seule barre.
 */
class Canon {
  private seen = new Map<string, Map<string, number>>();
  add(xs: { key: string; label: string }[]) {
    for (const { key, label } of xs) {
      const m = this.seen.get(key) ?? new Map<string, number>();
      m.set(label, (m.get(label) ?? 0) + 1);
      this.seen.set(key, m);
    }
    return xs;
  }
  label(key: string) {
    const m = this.seen.get(key)!;
    return [...m].sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0]))[0][0];
  }
}

const one = (s: string | undefined | null) => {
  const v = clean(s);
  return v ? [{ key: groupKey(v), label: v }] : [];
};

export function toRows(initiatives: Initiative[], lang: Lang): Row[] {
  const canon = new Canon();
  const parsed = initiatives.map((i) => ({
    i,
    category: canon.add(one(i.category)),
    thematic: canon.add(one(i.thematic)),
    zone: canon.add(one(i.interventionZone)),
    org: canon.add(multi(i.typeOrganisation, /\s*\/\s*/)),
    election: canon.add(multi(i.electionType)),
    targets: canon.add(multi(i.targetAudience, /\s*[\/,;]\s*/)),
    contribution: canon.add(multi(i.partnersContribution, /\s*[\/,;]\s*|\s+and\s+/)),
    partnerZone: canon.add(multi(i.partnerZone, /\s*[\/,;]\s*/)),
  }));
  const L = (xs: { key: string }[]) => xs.map((x) => canon.label(x.key));
  const L1 = (xs: { key: string }[]) => (xs[0] ? canon.label(xs[0].key) : null);

  return parsed.map(({ i, ...p }) => {
    const c = country(i.country, lang);
    return {
      slug: i.slug,
      title: clean(i.title) ?? i.slug,
      country: c?.name ?? null,
      countryLabel: c?.label ?? null,
      year: year(i.startDate),
      category: L1(p.category),
      thematic: L1(p.thematic),
      org: L(p.org),
      election: L(p.election),
      targets: L(p.targets),
      phases: phases(i.phases),
      zone: L1(p.zone),
      partners: yesNo(i.partners),
      contribution: L(p.contribution),
      partnerZone: L(p.partnerZone),
      legal: yesNo(i.legalEnvironment),
      difficulties: yesNo(i.publicAuthoritiesDifficulties),
      recognition: yesNo(i.obligationRecognition),
      issues: yesNo(i.electionProcessIssues),
      reported: yesNo(i.reportedIssues),
      impact: yesNo(i.impactDysfunctions),
      transparency: transparency(i.transparencyAssessment),
      issuesNature: longText(i.electionIssuesNature),
      outcome: longText(i.reportOutcome),
      summary: longText(i.description),
      logo: i.logo && i.logo !== "Vide" ? i.logo : null,
      organisation: clean(i.organisation),
      regions: multi(i.region, /\s*[,\/;]\s*/)
        .map((r) => r.label.toUpperCase())
        .filter((r) => !/^(AUTRES?|OTHERS?)$/.test(r)),
      cover: null,
    };
  });
}

/** Texte libre utile (écarte « Non », « Aucune », « - »…). */
function longText(s: string | undefined | null): string | null {
  if (isNA(s)) return null;
  const t = s!.trim();
  if (t.length < 12) return null;
  if (/^description non disponible/i.test(t)) return null;
  return t;
}
