
import { getAll } from "./contentNocodb.astro";

export async function getInitiatives(language: string = 'fr') {
  const tableId = "m9erh9bplb8jihp";
  const query = {
    viewId: "vwdobxvm00ayso6s",
    fields: [
      "Nom de l'initiative",
      "Pays",
      "Catégorie de l'initiative", 
      "Thématique de l'initiative",
      "Langue",
      "Résumé descriptif de l'initiative"
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
        description: initiative["Résumé descriptif de l'initiative"] || "Description non disponible",
      }))
    : [];
}
