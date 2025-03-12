import { getAll } from "./contentNocodb.astro";
import { slug } from "@/utils/slug";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { promisify } from "util";
import sharp from "sharp";

/**
 * Fonction utilitaire pour limiter les requêtes à un certain taux (rate limiting)
 * @param ms Temps d'attente en millisecondes entre les requêtes
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wrapper pour les appels à l'API avec rate limiting
 * @param fetcher Fonction de récupération de données
 * @param args Arguments pour la fonction de récupération
 * @param rateLimit Délai entre les requêtes en ms (200ms = 5 requêtes/seconde)
 */
async function rateLimitedFetch(
  fetcher: Function,
  args: any[],
  rateLimit: number = 1000,
) {
  // Attendre le délai spécifié avant d'exécuter la requête
  await delay(rateLimit);
  // Exécuter la requête
  return await fetcher(...args);
}

/**
 * Télécharge et optimise une image depuis une URL
 * @param imageUrl URL de l'image à télécharger
 * @param initiativeSlug Slug de l'initiative pour nommer le fichier
 * @returns Chemin local de l'image optimisée ou null en cas d'erreur
 */
async function downloadAndOptimizeImage(
  imageUrl: string,
  initiativeSlug: string,
): Promise<string | null> {
  try {
    // Créer le dossier d'images s'il n'existe pas
    const imageDir = path.join(process.cwd(), "public", "initiatives");
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileName = `${initiativeSlug}.webp`;
    const filePath = path.join(imageDir, fileName);

    // Vérifier si l'image existe déjà
    if (fs.existsSync(filePath)) {
      return `/initiatives/${fileName}`;
    }

    // Télécharger l'image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(
        `Erreur lors du téléchargement de l'image: ${response.statusText}`,
      );
      return null;
    }

    // Obtenir les données de l'image
    const imageBuffer = await response.buffer();

    // Optimiser l'image avec sharp
    await sharp(imageBuffer)
      .resize(800) // Redimensionner l'image (largeur maximale de 800px)
      .webp({ quality: 80 }) // Convertir en WebP avec une qualité de 80%
      .toFile(filePath);

    return `/initiatives/${fileName}`;
  } catch (error) {
    console.error(`Erreur lors du traitement de l'image: ${error}`);
    return null;
  }
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
      "image-logo", // Ajout du champ pour l'image/logo
    ],
    where: `(Status,eq,Traiter)~and(Langue,eq,${language})`,
  };

  // Utiliser la fonction avec rate limiting
  const rawInitiatives = await rateLimitedFetch(getAll, [tableId, query]);

  const initiatives = [];

  if (Array.isArray(rawInitiatives?.list)) {
    // Traiter chaque initiative séquentiellement pour éviter de surcharger le serveur
    for (const initiative of rawInitiatives.list) {
      const title = initiative["Nom de l'initiative"] || "Initiative sans nom";
      const initiativeSlug = slug(title);
      let logoPath = null;

      // Traiter l'image si elle existe
      if (initiative["image-logo"] && initiative["image-logo"][0]?.signedUrl) {
        const imageUrl = initiative["image-logo"][0].signedUrl;
        try {
          // Télécharger et optimiser l'image
          logoPath = await downloadAndOptimizeImage(imageUrl, initiativeSlug);
        } catch (error) {
          console.error(
            `Erreur lors du traitement de l'image pour ${title}: ${error}`,
          );
        }
      }

      initiatives.push({
        title,
        country: initiative["Pays"] || "Pays non spécifié",
        langue: initiative["Langue"] || "Langue non spécifiée",
        category: initiative["Catégorie de l'initiative"] || "Non catégorisé",
        thematic: initiative["Thématique de l'initiative"] || "Non spécifié",
        description:
          initiative["Résumé descriptif de l'initiative"] ||
          "Description non disponible",
        logo: logoPath, // Ajouter le chemin de l'image optimisée
      });
    }
  }

  return initiatives;
}

// Fonction pour récupérer la requête de base des détails d'initiative
export function getInitiativeQuery(language: string = "fr") {
  const tableId = "m9erh9bplb8jihp";
  const query = {
    viewId: "vwdobxvm00ayso6s",
    fields: [
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
      "L’initiative a-t-elle été soutenue par des partenaires ?",
      "Si OUI, quels étaient les principaux partenaires",
      "Zone d'intervention des partenaires",
      "Quel a été leur apport",
      "Cibles de l’initiative",
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
    ],
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

  const details = [];

  for (const product of productEntries.list) {
    const initiativeName = product["Nom de l'initiative"];
    const productSlug =
      typeof initiativeName === "string" ? slug(initiativeName) : "";

    // Construire le chemin local potentiel pour l'image
    const localImagePath = `/initiatives/${productSlug}.webp`;

    // Vérifier si l'image existe déjà localement (si elle a été téléchargée précédemment)
    const publicPath = path.join(
      process.cwd(),
      "public",
      "initiatives",
      `${productSlug}.webp`,
    );
    let logoPath = fs.existsSync(publicPath) ? localImagePath : null;

    // Si l'image n'existe pas localement et qu'il y a une URL d'image disponible, la télécharger
    if (
      !logoPath &&
      product["image-logo"] &&
      product["image-logo"][0]?.signedUrl
    ) {
      try {
        logoPath = await downloadAndOptimizeImage(
          product["image-logo"][0].signedUrl,
          productSlug,
        );
      } catch (error) {
        console.error(
          `Erreur lors du traitement de l'image pour ${initiativeName}: ${error}`,
        );
        // Utiliser l'image par défaut si le téléchargement échoue
        logoPath = null;
      }
    }

    // Ajouter le chemin de l'image optimisée à l'objet produit
    const updatedProduct = {
      ...product,
      "image-logo-optimized": logoPath,
    };

    details.push({
      params: { slug: productSlug },
      props: { product: updatedProduct },
    });
  }

  return details;
}
