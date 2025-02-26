
import { getAll } from "./contentNocodb.astro";

export const initiativeFields = [
  "image-logo",
  "Type d'organisation",
  "Nom de l'initiative",
  "Résumé descriptif de l'initiative",
  "Pays",
  "Thématique de l'initiative",
  "Quels étaient les principaux objectifs de cette initiative citoyenne",
  "Catégorie de l'initiative",
  "Site web de l'initiative",
  "Type d'élection",
  "Date de début",
  "Date de fin",
  "L'initiative a-t-elle été soutenue par des partenaires ?",
  "Si OUI, quels étaient les principaux partenaires",
  "Zone d'intervention des partenaires",
  "Quel a été leur apport",
  "Cibles de l'initiative",
  "Type d'organisation",
  "zone géographique couverte par l'initiative",
  "Pays de mise en oeuvre",
  "Avez-vous constaté des dysfonctionnements majeurs dans le processus électoral ?",
  "Si oui, quelle était la nature des dysfonctionnements",
  "Si oui, les avez-vous portés à la connaissance des autorités compétentes pour rectification",
  "Quelle suite a été réservée à votre signalement",
  "Les dysfonctionnements ont-ils affecté l'atteinte des objectifs de l'initiative",
  "Les initiatives citoyennes électorales bénéficient-elles d'un environnement légal favorable dans votre contexte",
  "difficultés avec les pouvoirs publics dans la réalisation de vos activités",
  "Est-ce-une initiative à plusieurs composantes1",
  "Voulez-vous soumettre une autre composante de votre initiative",
  "Phases",
  "Facebook",
  "X",
  "Linkedin",
  "Ressources",
  "Obligation de reconnaissance institutionnelle de l'initiative",
  "Appréciation de la transparence du processus électoral",
];

export function getInitiativeQuery(language: string) {
  const tableId = "m9erh9bplb8jihp";
  const query = {
    viewId: "vwdobxvm00ayso6s",
    fields: initiativeFields,
    where: `(Status,eq,Traiter)~and(Langue,eq,${language})`,
  };
  return { tableId, query };
}

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
