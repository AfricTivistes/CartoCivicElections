# Sóobu · Tech4Elections

Cartographie et observatoire des initiatives citoyennes électorales en Afrique, porté par [AfricTivistes](https://africtivistes.com) dans le cadre du projet [AHEAD Africa](https://ahead.africa), co-financé par l'Union européenne.

Site : <https://soobu.tech>

## Ce que contient le site

| Page | Rôle |
| --- | --- |
| `/` · `/fr/` | Accueil : chiffres clés, carte, aperçu des données, initiatives récentes, FAQ |
| `/observatoire/` · `/fr/observatoire/` | Observatoire : tous les graphiques, recalculés par pays (`?country=`) |
| `/initiatives/` · `/fr/initiatives/` | Liste filtrable (`?country=`, `?cat=`, `?them=`, `?q=` ; l'ancien `?tags=` reste accepté) |
| `/initiatives/<slug>/` | Fiche détaillée d'une initiative |
| `/about/`, `/contact/` | À propos, contact (formulaire Netlify) |

## Stack

- [Astro 7](https://astro.build) (sortie statique), Node ≥ 22.22
- [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite`, tokens de la charte dans `src/styles/global.css`
- [MapLibre GL](https://maplibre.org) + fonds [OpenFreeMap](https://openfreemap.org) (sans clé API)
- Graphiques en HTML/SVG sans dépendance : `src/scripts/viz.ts`
- Données : table NocoDB chargée par un loader de contenu maison (`src/content.config.ts`)

## Démarrer

```bash
npm install
cp .env.example .env   # renseigner API_URL et API_TOKEN (NocoDB)
npm run dev
```

Sans accès NocoDB, on peut prévisualiser avec un export JSON au format du schéma :

```bash
SOOBU_FIXTURE=/chemin/vers/initiatives.json npm run dev
```

Commandes : `npm run check` (types), `npm run build` (build + minification HTML), `npm run preview`.

## Données

- Seules les lignes `Status = Traiter` sont publiées.
- `src/collections/initiatives/config.ts` : schéma et correspondance des colonnes NocoDB.
- `src/lib/normalize.ts` : nettoyage pour l'observatoire (espaces, accents, pluriels, champs multi-valeurs séparés par `/`, `,` ou `-`, Oui/Non, échelle de transparence). Les fiches affichent le texte d'origine.
- Les logos sont téléchargés et convertis en WebP dans `public/initiatives/` au build.

## Charte

Noir Sóobu `#161512` et le trio des flèches du logo : bleu `#2C83F5`, jaune `#FFC24B`, orange `#FF5836`. Typographie Onest. Les couleurs de données (catégorielles, rampe ordinale) sont validées pour le daltonisme et le contraste, en clair et en sombre ; voir l'en-tête de `src/styles/global.css`.

## Licence

Voir [LICENSE](LICENSE).
