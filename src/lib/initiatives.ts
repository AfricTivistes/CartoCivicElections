import { getAll } from "./contentNocodb.astro";
import { slug } from "@/utils/slug";

/**
 * Fonction utilitaire pour limiter les requêtes à un certain taux (rate limiting)
 * @param ms Temps d'attente en millisecondes entre les requêtes
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper pour les appels à l'API avec rate limiting
 * @param fetcher Fonction de récupération de données
 * @param args Arguments pour la fonction de récupération
 * @param rateLimit Délai entre les requêtes en ms (200ms = 5 requêtes/seconde)
 */
async function rateLimitedFetch(fetcher: Function, args: any[], rateLimit: number = 200) {
  // Attendre le délai spécifié avant d'exécuter la requête
  await delay(rateLimit);
  // Exécuter la requête
  return await fetcher(...args);
}

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

  // Utiliser la fonction avec rate limiting
  const rawInitiatives = await rateLimitedFetch(getAll, [tableId, query]);

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
  // Utiliser la fonction avec rate limiting
  const productEntries = await rateLimitedFetch(getAll, [tableId, query]);

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
