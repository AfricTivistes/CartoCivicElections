/**
 * Petits graphiques HTML/SVG sans dépendance, partagés par l'accueil et
 * l'observatoire. Les couleurs viennent des tokens CSS (global.css) ; le texte
 * reste dans les couleurs d'encre, jamais dans la couleur de la donnée.
 */

export type Item = { label: string; n: number };

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const pct = (n: number, total: number) =>
  total ? Math.round((n / total) * 100) : 0;

/** Compte une valeur simple ou multiple par ligne ; trié décroissant. */
export function countBy<T>(
  rows: T[],
  get: (r: T) => string | string[] | null | undefined,
): Item[] {
  const m = new Map<string, number>();
  for (const r of rows) {
    const v = get(r);
    const vs = Array.isArray(v) ? v : v ? [v] : [];
    for (const x of new Set(vs)) m.set(x, (m.get(x) ?? 0) + 1);
  }
  return [...m]
    .map(([label, n]) => ({ label, n }))
    .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
}

/** Lignes ayant répondu (au moins une valeur). */
export const answered = <T>(rows: T[], get: (r: T) => unknown) =>
  rows.filter((r) => {
    const v = get(r);
    return Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined;
  }).length;

type HbOpts = {
  total: number;
  limit?: number;
  hot?: boolean;
  more?: string;
  less?: string;
  of?: string;
};

/** Barres horizontales : libellé + « n · p % » au-dessus d'une piste. */
export function hbars(el: HTMLElement | null, items: Item[], o: HbOpts) {
  if (!el) return;
  const max = Math.max(1, ...items.map((i) => i.n));
  const limit = o.limit ?? 8;
  const expanded = el.dataset.expanded === "1";
  const shown = expanded ? items : items.slice(0, limit);
  el.classList.add("hb");
  el.classList.toggle("hot", !!o.hot);
  if (!items.length) {
    el.innerHTML = `<p class="empty">—</p>`;
    return;
  }
  el.innerHTML =
    shown
      .map(
        (i) => `<div class="row" tabindex="0" data-tip="${esc(i.label)} · ${i.n} ${esc(o.of ?? "/")} ${o.total} (${pct(i.n, o.total)} %)">
      <span class="lab">${esc(i.label)}</span>
      <span class="val">${i.n} · ${pct(i.n, o.total)} %</span>
      <div class="track"><div class="fill" style="width:${(i.n / max) * 100}%"></div></div>
    </div>`,
      )
      .join("") +
    (items.length > limit
      ? `<button type="button" class="linkish more">${esc(expanded ? o.less : o.more)} (${items.length})</button>`
      : "");
  el.querySelector<HTMLButtonElement>(".more")?.addEventListener("click", () => {
    el.dataset.expanded = expanded ? "0" : "1";
    hbars(el, items, o);
  });
}

export type Seg = { label: string; n: number; color: string; dark?: boolean };

/** Barre empilée à 100 % + légende (identité jamais portée par la seule couleur). */
export function stack(el: HTMLElement | null, segs: Seg[], opts: { height?: number; legend?: boolean } = {}) {
  if (!el) return;
  const total = segs.reduce((s, x) => s + x.n, 0);
  const bar = segs
    .filter((s) => s.n > 0)
    .map((s) => {
      const p = pct(s.n, total);
      // Libellé interne seulement si le segment est assez large
      const inner = p >= 12 ? `${p} %` : "";
      return `<div class="${s.dark ? "dk" : ""}" style="flex:${s.n};background:${s.color}" data-tip="${esc(s.label)} · ${s.n} (${p} %)" tabindex="0">${inner}</div>`;
    })
    .join("");
  const legend =
    opts.legend === false
      ? ""
      : `<div class="legend">${segs
          .map((s) => `<span><b style="background:${s.color}"></b>${esc(s.label)} <span class="num">${pct(s.n, total)} %</span></span>`)
          .join("")}</div>`;
  el.innerHTML = total
    ? `<div class="stack" style="height:${opts.height ?? 28}px">${bar}</div>${legend}`
    : `<p class="empty">—</p>`;
}

const latestColumns = new WeakMap<HTMLElement, { data: { x: number; n: number }[]; tipUnit: string }>();

/** Colonnes par année (SVG). Une seule série : pas de légende, le titre la nomme. */
export function columns(el: HTMLElement | null, data: { x: number; n: number }[], tipUnit: string) {
  if (!el) return;
  if (!data.length) {
    el.innerHTML = `<p class="empty">—</p>`;
    return;
  }
  const xs = data.map((d) => d.x);
  const from = Math.min(...xs);
  const to = Math.max(...xs);
  const years: number[] = [];
  for (let y = from; y <= to; y++) years.push(y);
  const byYear = new Map(data.map((d) => [d.x, d.n]));
  const max = Math.max(1, ...data.map((d) => d.n));
  // Dimensions réelles du conteneur : le texte garde sa taille sur mobile
  const W = Math.max(280, el.clientWidth || 960);
  const H = W < 600 ? 200 : 220;
  const padB = 24;
  const padT = 18;
  const step = W / years.length;
  const bw = Math.max(2, Math.min(24, step - 4));
  const ticks = niceTicks(max);
  const y = (n: number) => H - padB - (n / ticks[ticks.length - 1]) * (H - padB - padT);
  const peak = data.reduce((a, b) => (b.n > a.n ? b : a));
  const maxLabels = Math.max(2, Math.floor(W / 56));
  const labelEvery = [1, 2, 5, 10].find((k) => years.length / k <= maxLabels) ?? 10;

  const grid = ticks
    .filter((t) => t > 0)
    .map((t) => `<line x1="0" x2="${W}" y1="${y(t)}" y2="${y(t)}" stroke="var(--rule)" stroke-width="1"/><text x="0" y="${y(t) - 4}">${t}</text>`)
    .join("");
  const bars = years
    .map((yr, i) => {
      const n = byYear.get(yr) ?? 0;
      const cx = i * step + step / 2;
      const top = y(n);
      const h = H - padB - top;
      const r = Math.min(4, h);
      const path = n
        ? `<path d="M${cx - bw / 2},${H - padB} V${top + r} q0,-${r} ${r},-${r} H${cx + bw / 2 - r} q${r},0 ${r},${r} V${H - padB} Z" fill="var(--fill)"/>`
        : "";
      const hit = `<rect x="${i * step}" y="${padT}" width="${step}" height="${H - padT}" fill="transparent" data-tip="${yr} · ${n} ${esc(tipUnit)}" tabindex="${n ? 0 : -1}"/>`;
      const lab =
        (yr - from) % labelEvery === 0 || yr === to
          ? `<text x="${cx}" y="${H - 6}" text-anchor="middle">${yr}</text>`
          : "";
      const ann = yr === peak.x ? `<text class="ann" x="${cx}" y="${top - 6}" text-anchor="middle">${n}</text>` : "";
      return path + lab + ann + hit;
    })
    .join("");
  // Redessine avec les dernières données (le filtre pays les remplace)
  const first = !latestColumns.has(el);
  latestColumns.set(el, { data, tipUnit });
  if (first) {
    let last = el.clientWidth;
    new ResizeObserver(() => {
      if (Math.abs(el.clientWidth - last) < 24) return;
      last = el.clientWidth;
      const a = latestColumns.get(el)!;
      columns(el, a.data, a.tipUnit);
    }).observe(el);
  }
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(tipUnit)}">${grid}<line x1="0" x2="${W}" y1="${H - padB}" y2="${H - padB}" stroke="var(--ink-3)" stroke-width="1"/>${bars}</svg>`;
}

function niceTicks(max: number) {
  const step = max <= 5 ? 1 : max <= 10 ? 2 : max <= 25 ? 5 : max <= 50 ? 10 : 20;
  const out: number[] = [];
  for (let t = 0; t <= max + step - 1; t += step) out.push(t);
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + step);
  return out;
}

/** Info-bulle partagée : survol souris + focus clavier sur [data-tip]. */
export function initTooltip() {
  let tip = document.getElementById("tip");
  if (!tip) {
    tip = document.createElement("div");
    tip.id = "tip";
    tip.setAttribute("role", "tooltip");
    document.body.appendChild(tip);
  }
  const t = tip;
  const show = (text: string, x: number, y: number) => {
    t.textContent = text;
    t.classList.add("show");
    const w = t.offsetWidth;
    const h = t.offsetHeight;
    t.style.left = `${Math.min(window.innerWidth - w - 8, Math.max(8, x + 12))}px`;
    t.style.top = `${y - h - 12 < 8 ? y + 16 : y - h - 12}px`;
  };
  const hide = () => t.classList.remove("show");
  document.addEventListener("pointermove", (e) => {
    const target = (e.target as Element | null)?.closest?.("[data-tip]") as HTMLElement | null;
    if (target) show(target.dataset.tip!, e.clientX, e.clientY);
    else hide();
  });
  document.addEventListener("focusin", (e) => {
    const target = (e.target as Element | null)?.closest?.("[data-tip]") as HTMLElement | null;
    if (!target) return hide();
    const r = target.getBoundingClientRect();
    show(target.dataset.tip!, r.left + r.width / 2, r.top);
  });
  document.addEventListener("focusout", hide);
  window.addEventListener("scroll", hide, { passive: true });
}
