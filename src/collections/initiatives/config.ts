import { z } from "astro/zod";
import { slug } from "@/utils/slug";
import fs from "fs";
import path from "path";

/**
 * Helper to get field value with flexible apostrophe matching.
 * NocoDB has mixed apostrophe types: ASCII ' (U+0027) and Unicode ' (U+2019)
 */
function getField(product: any, fieldName: string): any {
  let value;
  if (product[fieldName] !== undefined) {
    value = product[fieldName];
  } else {
    const unicodeVersion = fieldName.replace(/'/g, "\u2019");
    if (product[unicodeVersion] !== undefined) {
      value = product[unicodeVersion];
    } else {
      const asciiVersion = fieldName.replace(/\u2019/g, "'");
      if (product[asciiVersion] !== undefined) {
        value = product[asciiVersion];
      }
    }
  }

  if (
    value === "Vide" ||
    value === "Non spécifié" ||
    value === "Non spécifiée"
  ) {
    return undefined;
  }
  return value;
}

/**
 * Cleans and normalizes a URL.
 * - Trims whitespace
 * - Takes only the first URL if multiple are concatenated
 * - Adds https:// if missing
 */
function cleanUrl(url: string | undefined): string {
  if (!url || url === "Vide" || url === "Non spécifié") {
    return "Vide";
  }
  let cleaned = url.trim();
  if (cleaned.includes(" // ")) {
    cleaned = cleaned.split(" // ")[0].trim();
  }
  if (
    cleaned &&
    !cleaned.startsWith("http://") &&
    !cleaned.startsWith("https://")
  ) {
    cleaned = "https://" + cleaned;
  }
  return cleaned || "Vide";
}

/**
 * Zod schema for initiative data.
 * All fields are optional strings with defaults to handle missing NocoDB data gracefully.
 */
const resourceSchema = z.object({
  title: z.string().optional().default("Resource"),
  signedUrl: z.string().optional(),
  url: z.string().optional(),
});

const socialLinksSchema = z.object({
  facebook: z.string().optional().default("Vide"),
  twitter: z.string().optional().default("Vide"),
  linkedin: z.string().optional().default("Vide"),
});

export const initiativeSchema = z.object({
  slug: z.string(),
  title: z.string().default("Nom non spécifié"),
  country: z.string().default("Pays non spécifié"),
  langue: z.string().default("Langue non spécifiée"),
  typeOrganisation: z.string().default("Organisation non spécifiée"),
  category: z.string().default("Non catégorisé"),
  thematic: z.string().default("Non spécifié"),
  description: z.string().default("Description non disponible"),
  objectives: z.string().default("Non spécifié"),
  website: z.string().default("Vide"),
  electionType: z.string().default("Non spécifié"),
  startDate: z.string().default("Non spécifié"),
  endDate: z.string().default("Non spécifié"),

  // Partners
  partners: z.string().default("Non spécifié"),
  mainPartners: z.string().default("Non spécifié"),
  partnersContribution: z.string().default("Non spécifié"),
  partnerZone: z.string().default("Non spécifié"),

  // Targets & zones
  targetAudience: z.string().default("Non spécifié"),
  interventionZone: z.string().default("Non spécifié"),
  paysMiseOeuvre: z.string().default("Non spécifié"),

  // Election process issues
  electionProcessIssues: z.string().default("Non"),
  electionIssuesNature: z.string().default("Non spécifié"),
  reportedIssues: z.string().default("Non spécifié"),
  reportOutcome: z.string().default("Non spécifié"),
  impactDysfunctions: z.string().default("Non spécifié"),

  // Legal & institutional
  legalEnvironment: z.string().default("Non spécifié"),
  publicAuthoritiesDifficulties: z.string().default("Non spécifié"),
  transparencyAssessment: z.string().default("Non spécifié"),
  obligationRecognition: z.string().default("Non spécifié"),
  isMultiComponent: z.string().default("Non spécifié"),
  submitAnotherComponent: z.string().default("Non spécifié"),

  // Status & phases
  phases: z.string().default("Non spécifié"),
  initiativeType: z.string().default("Non spécifié"),
  initiativeStatus: z.string().default("Non spécifié"),

  // Resources & social
  resources: z.array(resourceSchema).optional().default([]),
  socialLinks: socialLinksSchema.optional().default({}),

  // Image
  logo: z.string().default("Non spécifié"),
  logoUrl: z.string().optional(),
});

export type Initiative = z.infer<typeof initiativeSchema>;

/**
 * Mapper function that transforms raw NocoDB records into
 * the initiative schema shape. This replaces the logic from
 * generateInitiatives.ts.
 */
export const initiativeMapper = (raw: any) => {
  const initiativeName =
    getField(raw, "Nom de l'initiative") || "Initiative sans nom";
  const initiativeSlug = slug(initiativeName);

  // Build the local image path (images are pre-downloaded during prebuild or cached)
  const localImagePath = `/initiatives/${initiativeSlug}.webp`;
  const imageExists = fs.existsSync(
    path.join(process.cwd(), "public", "initiatives", `${initiativeSlug}.webp`),
  );

  return {
    Id: raw.Id || raw.id || initiativeSlug, // Use NocoDB ID for uniqueness in Astro store
    slug: initiativeSlug,
    title: getField(raw, "Nom de l'initiative") || "Nom non spécifié",
    country: getField(raw, "Pays") || "Pays non spécifié",
    langue: getField(raw, "Langue") || "Langue non spécifiée",
    typeOrganisation:
      getField(raw, "Type d'organisation") || "Organisation non spécifiée",
    category: getField(raw, "Catégorie de l'initiative") || "Non catégorisé",
    thematic: getField(raw, "Thématique de l'initiative") || "Non spécifié",
    description:
      getField(raw, "Résumé descriptif de l'initiative") ||
      "Description non disponible",
    objectives:
      getField(
        raw,
        "Quels étaient les principaux objectifs de cette initiative citoyenne",
      ) || "Non spécifié",
    website: cleanUrl(getField(raw, "Site web de l'initiative")),
    electionType: getField(raw, "Type d'élection") || "Non spécifié",
    startDate: getField(raw, "Date de début") || "Non spécifié",
    endDate: getField(raw, "Date de fin") || "Non spécifié",

    partners:
      getField(
        raw,
        "L'initiative a-t-elle été soutenue par des partenaires ?",
      ) || "Non spécifié",
    mainPartners:
      getField(raw, "Si OUI, quels étaient les principaux partenaires") ||
      "Non spécifié",
    partnersContribution:
      getField(raw, "Quel a été leur apport") || "Non spécifié",
    partnerZone:
      getField(raw, "Zone d'intervention des partenaires") || "Non spécifié",

    targetAudience: getField(raw, "Cibles de l'initiative") || "Non spécifié",
    interventionZone:
      getField(raw, "zone géographique couverte par l'initiative") ||
      "Non spécifié",
    paysMiseOeuvre: getField(raw, "Pays de mise en oeuvre") || "Non spécifié",

    electionProcessIssues:
      getField(
        raw,
        "Avez-vous constaté des dysfonctionnements majeurs dans le processus électoral ?",
      ) || "Non",
    electionIssuesNature:
      getField(raw, "Si oui, quelle était la nature des dysfonctionnements") ||
      "Non spécifié",
    reportedIssues:
      getField(
        raw,
        "Si oui, les avez-vous portés à la connaissance des autorités compétentes pour rectification",
      ) || "Non spécifié",
    reportOutcome:
      getField(raw, "Quelle suite a été réservée à votre signalement") ||
      "Non spécifié",
    impactDysfunctions:
      getField(
        raw,
        "Les dysfonctionnements ont-ils affecté l'atteinte des objectifs de l'initiative",
      ) || "Non spécifié",

    legalEnvironment:
      getField(
        raw,
        "Les initiatives citoyennes électorales bénéficient-elles d'un environnement légal favorable dans votre contexte",
      ) || "Non spécifié",
    publicAuthoritiesDifficulties:
      getField(
        raw,
        "difficultés avec les pouvoirs publics dans la réalisation de vos activités",
      ) || "Non spécifié",
    transparencyAssessment:
      getField(raw, "Appréciation de la transparence du processus électoral") ||
      "Non spécifié",
    obligationRecognition:
      getField(
        raw,
        "Obligation de reconnaissance institutionnelle de l'initiative",
      ) || "Non spécifié",
    isMultiComponent:
      getField(raw, "Est-ce-une initiative à plusieurs composantes1") ||
      "Non spécifié",
    submitAnotherComponent:
      getField(
        raw,
        "Voulez-vous soumettre une autre composante de votre initiative",
      ) || "Non spécifié",

    phases: getField(raw, "Phases") || "Non spécifié",
    initiativeType: getField(raw, "Type d'initiative") || "Non spécifié",
    initiativeStatus: getField(raw, "Statut de l'initiative") || "Non spécifié",

    resources: Array.isArray(raw.Ressources)
      ? raw.Ressources.map((resource: any) => ({
          title: resource.title || "Resource",
          signedUrl: resource.signedUrl,
          url: resource.url,
        }))
      : [],

    socialLinks: {
      facebook: cleanUrl(getField(raw, "Facebook")),
      twitter: cleanUrl(getField(raw, "X")),
      linkedin: cleanUrl(getField(raw, "Linkedin")),
    },

    logo: imageExists ? localImagePath : "Vide",
    logoUrl: (() => {
      const logoField = getField(raw, "Logo") || getField(raw, "image-logo");
      if (Array.isArray(logoField) && logoField.length > 0) {
        return logoField[0].signedUrl || logoField[0].url;
      }
      return undefined;
    })(),
  };
};
