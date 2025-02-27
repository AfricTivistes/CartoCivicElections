import { getAll } from "./contentNocodb.astro";
import { slug } from "@/utils/slug";

// Fonction pour récupérer la liste des initiatives avec les informations de base
export async function getInitiatives(language: string = "fr") {
  const tableId = "m9erh9bplb8jihp";
  const query = {
    viewId: "vwdobxvm00ayso6s",
    fields: [
      "Nom de l'initiative",
      "Pays",
      "Catégorie de l'initiative",
      "Thématique de l'initiative",
      "Langue",
      "Résumé descriptif de l'initiative",
    ],
    where: `(Status,eq,Traiter)~and(Langue,eq,${language})`,
  };

  const rawInitiatives = await getAll(tableId, query);

  return Array.isArray(rawInitiatives?.list)
    ? rawInitiatives.list.map((initiative) => ({
        title: initiative["Nom de l'initiative"] || "Initiative sans nom",
        country: initiative["Pays"] || "Pays non spécifié",
        langue: initiative["Langue"] || "Langue non spécifiée",
        category: initiative["Catégorie de l'initiative"] || "Non catégorisé",
        thematic: initiative["Thématique de l'initiative"] || "Non spécifié",
        description:
          initiative["Résumé descriptif de l'initiative"] ||
          "Description non disponible",
      }))
    : [];
}

// Fonction pour récupérer la requête de base des détails d'initiative
export function getInitiativeQuery(language: string = "fr") {
  const tableId = "m9erh9bplb8jihp";
  const query = {
    viewId: "vwdobxvm00ayso6s",

    where: `(Status,eq,Traiter)~and(Langue,eq,${language})`,
  };

  return { tableId, query };
}

// Fonction pour récupérer les détails des initiatives et les convertir en chemins statiques
export async function getInitiativeDetails(language: string = "fr") {
  const { tableId, query } = getInitiativeQuery(language);
  const productEntries = await getAll(tableId, query);

  if (!productEntries?.list) return [];

  return productEntries.list.map((product) => {
    const initiativeName = product["Nom de l'initiative"];
    const productSlug =
      typeof initiativeName === "string" ? slug(initiativeName) : "";

    return {
      params: { slug: productSlug },
      props: { product },
    };
  });
}
