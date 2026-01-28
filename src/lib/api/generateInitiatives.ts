// src/lib/generateInitiatives.ts
import fs from "fs";
import path from "path";
import { slug } from "@/utils/slug";
import fetch from "node-fetch";
import sharp from "sharp";
import { api, isApiConfigured } from './nocodb';

/**
 * Helper to get field value with flexible apostrophe matching
 * NocoDB has mixed apostrophe types: ASCII ' (U+0027) and Unicode ' (U+2019)
 */
function getField(product: any, fieldName: string): any {
  // Try with the original field name first
  if (product[fieldName] !== undefined) {
    return product[fieldName];
  }
  // Try replacing ASCII apostrophe with Unicode
  const unicodeVersion = fieldName.replace(/'/g, '\u2019');
  if (product[unicodeVersion] !== undefined) {
    return product[unicodeVersion];
  }
  // Try replacing Unicode apostrophe with ASCII
  const asciiVersion = fieldName.replace(/\u2019/g, "'");
  if (product[asciiVersion] !== undefined) {
    return product[asciiVersion];
  }
  return undefined;
}

/**
 * Cleans and normalizes a URL
 * - Trims whitespace
 * - Takes only the first URL if multiple are concatenated
 * - Adds https:// if missing
 */
function cleanUrl(url: string | undefined): string {
  if (!url || url === "Vide" || url === "Non spécifié") {
    return "Vide";
  }

  // Trim whitespace
  let cleaned = url.trim();

  // If multiple URLs are concatenated (e.g., "url1 // url2"), take only the first one
  if (cleaned.includes(' // ')) {
    cleaned = cleaned.split(' // ')[0].trim();
  }

  // If URL doesn't start with http, add https://
  if (cleaned && !cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }

  return cleaned || "Vide";
}

const getAll = async (tableId: string, query: object = {}) => {
  try {
    let allRecords = [];
    let page = 1;
    let hasMore = true;
    let totalRows = 0;
    const baseParams = {
      viewId: query?.viewId,
      fields: query?.fields,
      where: query?.where
    };
    
    // Première requête pour obtenir le nombre total d'enregistrements
    const firstResponse = await api.get(`/api/v2/tables/${tableId}/records`, {
      params: {
        ...baseParams,
        limit: 100,
        page: 1
      }
    });
    
    const firstData = firstResponse.data as ApiResponse;
    if (!firstData.pageInfo) {
      throw new Error('Format de réponse API invalide : pageInfo manquant');
    }
    
    totalRows = firstData.pageInfo.totalRows;
    allRecords = [...firstData.list];
    
    // Calcul du nombre total de pages
    const totalPages = Math.ceil(totalRows / 100);
    
    // Récupération des pages restantes
    while (page < totalPages) {
      page++;
      
      try {
        const response = await api.get(`/api/v2/tables/${tableId}/records`, {
          params: {
            ...baseParams,
            limit: 100,
            page: page
          }
        });
        
        const data = response.data as ApiResponse;
        if (!data.list) {
          throw new Error(`Format de réponse API invalide pour la page ${page}`);
        }
        
        allRecords = [...allRecords, ...data.list];
        
        // Pause courte entre les requêtes pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Erreur lors de la récupération de la page ${page}:`, error);
        throw new Error(`Échec de la récupération de la page ${page}`);
      }
    }
    
    return {
      list: allRecords,
      total: allRecords.length,
      pageInfo: {
        totalRows,
        totalPages,
        pageSize: 100
      }
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les données:', error);
    throw error;
  }
};

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
    const imageDir = path.join(process.cwd(), "public", "initiatives");
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    const fileName = `${initiativeSlug}.webp`;
    const filePath = path.join(imageDir, fileName);

    if (fs.existsSync(filePath)) {
      return `/initiatives/${fileName}`;
    }

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
      .resize(800) 
      .webp({ quality: 80 }) 
      .toFile(filePath);

    return `/initiatives/${fileName}`;
  } catch (error) {
    console.error(`Erreur lors du traitement de l'image: ${error}`);
    return null;
  }
}

/**
 * Supprime l'ancien fichier d'initiatives s'il existe
 * @param filePath Chemin du fichier à supprimer
 */
async function removeOldInitiativesFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    console.log("🗑️ Suppression de l'ancien fichier initiatives.json...");
    fs.unlinkSync(filePath);
  }
}

/**
 * Enregistre les initiatives dans un fichier JSON
 * @param initiatives Données des initiatives à sauvegarder
 * @param filePath Chemin du fichier où sauvegarder les données
 */
async function saveInitiativesToFile(initiatives: any, filePath: string) {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(initiatives, null, 2), "utf8");
  console.log(`✅ ${initiatives.length} initiatives sauvegardées dans ${filePath}`);
}

/**
 * Enregistre les détails de l'initiative dans un fichier JSON
 * @param {object} initiative Données de l'initiative à sauvegarder
 * @param {string} language Langue de l'initiative (fr ou en)
 * @param {string} initiativeSlug Slug de l'initiative pour le nom du fichier
 */
async function saveInitiativeDetails(initiative: any, language: string, initiativeSlug: string) {
  const detailsDir = path.join(process.cwd(), "public/details");
  if (!fs.existsSync(detailsDir)) {
    fs.mkdirSync(detailsDir);
  }
  const jsonFilePath = path.join(detailsDir, `${language}-${initiativeSlug}.json`);
  fs.writeFileSync(jsonFilePath, JSON.stringify(initiative, null, 2), "utf8")
}

/**
 * Compare les anciennes et nouvelles initiatives et affiche les changements
 */
function compareInitiatives(oldFilePath: string, newInitiatives: any[]) {
  if (!fs.existsSync(oldFilePath)) {
    console.log("📊 Première génération - pas de comparaison possible");
    return;
  }

  try {
    const oldData = JSON.parse(fs.readFileSync(oldFilePath, "utf8"));
    const oldSlugs = new Set(oldData.map((i: any) => i.params.slug));
    const newSlugs = new Set(newInitiatives.map((i: any) => i.params.slug));

    // Nouvelles initiatives
    const added = newInitiatives.filter((i: any) => !oldSlugs.has(i.params.slug));
    // Initiatives supprimées
    const removed = oldData.filter((i: any) => !newSlugs.has(i.params.slug));

    console.log("\n📊 === RAPPORT DE MISE À JOUR ===");
    console.log(`   Anciennes initiatives: ${oldData.length}`);
    console.log(`   Nouvelles initiatives: ${newInitiatives.length}`);

    if (added.length > 0) {
      console.log(`\n   ✨ ${added.length} NOUVELLE(S) INITIATIVE(S):`);
      added.forEach((i: any) => console.log(`      + ${i.props.product.title} (${i.props.product.country})`));
    }

    if (removed.length > 0) {
      console.log(`\n   🗑️ ${removed.length} INITIATIVE(S) RETIRÉE(S):`);
      removed.forEach((i: any) => console.log(`      - ${i.props.product.title} (${i.props.product.country})`));
    }

    if (added.length === 0 && removed.length === 0) {
      console.log("   ℹ️ Aucun changement détecté");
    }

    console.log("================================\n");
  } catch (error) {
    console.log("⚠️ Impossible de comparer avec l'ancien fichier");
  }
}

/**
 * Récupère les initiatives depuis l'API NocoDB
 * @returns Un objet contenant la liste des initiatives, ou null en cas d'erreur
 */
async function fetchInitiatives() {
  console.log("🔄 Récupération des initiatives depuis l'API...");
  const tableId = "m9erh9bplb8jihp";
  const query = {
    viewId: "vwdobxvm00ayso6s",
    where: `(Status,eq,Traiter)`,
  };

  try {
    const productEntries = await getAll(tableId, query);
    if (!productEntries?.list) {
      console.error("❌ Aucune initiative trouvée !");
      return null;
    }

    console.log(`✅ ${productEntries.list.length} initiatives récupérées.`);
    return productEntries;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des initiatives: ${error}`);
    return null;
  }
}

/**
 * Fonction principale qui gère la génération du fichier d'initiatives
 */
export async function generateInitiativesJson() {
  console.log("🚀 Démarrage de la génération des initiatives...");

  // Vérifier si l'API est configurée
  if (!isApiConfigured()) {
    console.warn("⚠️ API not configured. Skipping data generation.");
    console.warn("⚠️ Using existing initiatives.json file if available.");
    
    const filePath = path.join(process.cwd(), "src/content/initiatives/initiatives.json");
    if (fs.existsSync(filePath)) {
      console.log("✅ Using existing initiatives.json file.");
      return;
    } else {
      console.log("⚠️ No existing initiatives.json file found. Creating empty file.");
      // Create empty but valid file to avoid build errors
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf8");
      return;
    }
  }

  // Définir le chemin du fichier d'initiatives JSON
  const filePath = path.join(process.cwd(), "src/content/initiatives/initiatives.json");

  // Récupérer les initiatives depuis l'API AVANT de supprimer l'ancien fichier
  const productEntries = await fetchInitiatives();
  if (!productEntries) {
    console.error("❌ Impossible de continuer sans données d'initiatives.");
    console.log("⚠️ Conservation de l'ancien fichier initiatives.json si existant.");
    return;
  }

  // Supprimer l'ancien fichier seulement après avoir récupéré les nouvelles données
  await removeOldInitiativesFile(filePath);
  
  // Traiter les données et optimiser les images
  const initiatives = [];
  
  for (const product of productEntries.list) {
    const initiativeName = getField(product, "Nom de l'initiative") || "Initiative sans nom";
    const productSlug = slug(initiativeName);
    const localImagePath = `/initiatives/${productSlug}.webp`;
    const publicPath = path.join(process.cwd(), "public", "initiatives", `${productSlug}.webp`);
    let logoPath = fs.existsSync(publicPath) ? localImagePath : null;

    if (!logoPath && product["image-logo"] && product["image-logo"][0]?.signedUrl) {
      try {
        logoPath = await downloadAndOptimizeImage(product["image-logo"][0].signedUrl, productSlug);
      } catch (error) {
        console.error(`Erreur lors du traitement de l'image pour ${initiativeName}: ${error}`);
        logoPath = null;
      }
    }

    const formattedInitiative = {
      params: { slug: productSlug },
      props: {
        product: {
          slug: productSlug,
          title: getField(product, "Nom de l'initiative") || "Nom non spécifié",
          country: getField(product, "Pays") || "Pays non spécifié",
          langue: getField(product, "Langue") || "Langue non spécifiée",
          typeOrganisation: getField(product, "Type d'organisation") || "Organisation non spécifiée",
          category: getField(product, "Catégorie de l'initiative") || "Non catégorisé",
          thematic: getField(product, "Thématique de l'initiative") || "Non spécifié",
          description: getField(product, "Résumé descriptif de l'initiative") || "Description non disponible",
          objectives: getField(product, "Quels étaient les principaux objectifs de cette initiative citoyenne") || "Non spécifié",
          website: cleanUrl(getField(product, "Site web de l'initiative")),
          electionType: getField(product, "Type d'élection") || "Non spécifié",
          startDate: getField(product, "Date de début") || "Non spécifié",
          endDate: getField(product, "Date de fin") || "Non spécifié",

          partners: getField(product, "L'initiative a-t-elle été soutenue par des partenaires ?") || "Non spécifié",
          mainPartners: getField(product, "Si OUI, quels étaient les principaux partenaires") || "Non spécifié",
          partnersContribution: getField(product, "Quel a été leur apport") || "Non spécifié",
          partnerZone: getField(product, "Zone d'intervention des partenaires") || "Non spécifié",

          targetAudience: getField(product, "Cibles de l'initiative") || "Non spécifié",
          interventionZone: getField(product, "zone géographique couverte par l'initiative") || "Non spécifié",
          paysMiseOeuvre: getField(product, "Pays de mise en oeuvre") || "Non spécifié",

          electionProcessIssues: getField(product, "Avez-vous constaté des dysfonctionnements majeurs dans le processus électoral ?") || "Non",
          electionIssuesNature: getField(product, "Si oui, quelle était la nature des dysfonctionnements") || "Non spécifié",
          reportedIssues: getField(product, "Si oui, les avez-vous portés à la connaissance des autorités compétentes pour rectification") || "Non spécifié",
          reportOutcome: getField(product, "Quelle suite a été réservée à votre signalement") || "Non spécifié",
          impactDysfunctions: getField(product, "Les dysfonctionnements ont-ils affecté l'atteinte des objectifs de l'initiative") || "Non spécifié",

          legalEnvironment: getField(product, "Les initiatives citoyennes électorales bénéficient-elles d'un environnement légal favorable dans votre contexte") || "Non spécifié",
          publicAuthoritiesDifficulties: getField(product, "difficultés avec les pouvoirs publics dans la réalisation de vos activités") || "Non spécifié",
          transparencyAssessment: getField(product, "Appréciation de la transparence du processus électoral") || "Non spécifié",
          obligationRecognition: getField(product, "Obligation de reconnaissance institutionnelle de l'initiative") || "Non spécifié",
          isMultiComponent: getField(product, "Est-ce-une initiative à plusieurs composantes1") || "Non spécifié",
          submitAnotherComponent: getField(product, "Voulez-vous soumettre une autre composante de votre initiative") || "Non spécifié",

          phases: getField(product, "Phases") || "Non spécifié",
          initiativeType: getField(product, "Type d'initiative") || "Non spécifié",
          initiativeStatus: getField(product, "Statut de l'initiative") || "Non spécifié",

          resources: Array.isArray(product.Ressources) ? product.Ressources.map((resource: any) => ({
            title: resource.title || "Resource",
            signedUrl: resource.signedUrl
          })) : [],

          socialLinks: {
            facebook: cleanUrl(getField(product, "Facebook")),
            twitter: cleanUrl(getField(product, "X")),
            linkedin: cleanUrl(getField(product, "Linkedin")),
          },

          logo: logoPath || "Non spécifié",
        },
      },
    };

    await saveInitiativeDetails(
      formattedInitiative,
      getField(product, "Langue"),
      slug(getField(product, "Nom de l'initiative"))
    );
    
    initiatives.push(formattedInitiative);
  }
    
  
  // Sauvegarder les initiatives dans le fichier
  await saveInitiativesToFile(initiatives, filePath);
  
  console.log("✨ Génération des initiatives terminée avec succès !");
  return initiatives;
}

// Si le script est exécuté directement (pas importé)
generateInitiativesJson().catch(err => {
  console.error("❌ Erreur fatale lors de la génération des initiatives:", err);
  console.warn("⚠️ Build will continue with existing data if available.");
  // Don't exit with error code to prevent build failure
  // The build should continue even if data fetching fails
});