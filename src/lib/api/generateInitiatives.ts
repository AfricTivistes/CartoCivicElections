// src/lib/generateInitiatives.ts
import fs from "fs";
import path from "path";
import { slug } from "@/utils/slug";
import fetch from "node-fetch";
import sharp from "sharp";
import { api } from './nocodb';

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
 * Récupère les initiatives depuis l'API NocoDB
 * @returns Un objet contenant la liste des initiatives, ou null en cas d'erreur
 */
async function fetchInitiatives() {
  console.log("🔄 Récupération des initiatives depuis l'API...");
  const tableId = "m9erh9bplb8jihp";
  const query = {
    viewId: "vwdobxvm00ayso6s",
    fields: [
      "Langue", "Type d'organisation", "Nom de l'initiative", "Résumé descriptif de l'initiative",
      "Pays", "Thématique de l'initiative", "Quels étaient les principaux objectifs de cette initiative citoyenne",
      "Catégorie de l'initiative", "Site web de l'initiative", "Type d'élection", "Date de début",
      "Date de fin", "L’initiative a-t-elle été soutenue par des partenaires ?", "Si OUI, quels étaient les principaux partenaires",
      "Zone d'intervention des partenaires", "Quel a été leur apport", "Cibles de l’initiative", "zone géographique couverte par l'initiative",
      "Pays de mise en oeuvre", "Avez-vous constaté des dysfonctionnements majeurs dans le processus électoral ?",
      "Si oui, quelle était la nature des dysfonctionnements", "Si oui, les avez-vous portés à la connaissance des autorités compétentes pour rectification",
      "Quelle suite a été réservée à votre signalement", "Les dysfonctionnements ont-ils affecté l'atteinte des objectifs de l'initiative",
      "Les initiatives citoyennes électorales bénéficient-elles d'un environnement légal favorable dans votre contexte",
      "difficultés avec les pouvoirs publics dans la réalisation de vos activités", "Est-ce-une initiative à plusieurs composantes1",
      "Voulez-vous soumettre une autre composante de votre initiative", "Phases", "Facebook", "X", "Linkedin",
      "Ressources", "Obligation de reconnaissance institutionnelle de l'initiative",
      "Appréciation de la transparence du processus électoral", "image-logo"
    ],
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
  
  // Définir le chemin du fichier d'initiatives JSON
  const filePath = path.join(process.cwd(), "src/content/initiatives/initiatives.json");
  
  // Supprimer l'ancien fichier d'initiatives
  await removeOldInitiativesFile(filePath);
  
  // Récupérer les initiatives depuis l'API
  const productEntries = await fetchInitiatives();
  if (!productEntries) {
    console.error("❌ Impossible de continuer sans données d'initiatives.");
    return;
  }
  
  // Traiter les données et optimiser les images
  const initiatives = [];
  
  for (const product of productEntries.list) {
    const initiativeName = product["Nom de l'initiative"] || "Initiative sans nom";
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
          title: product["Nom de l'initiative"] || "Nom non spécifié",
          country: product["Pays"] || "Pays non spécifié",
          langue: product["Langue"] || "Langue non spécifiée",
          typeOrganisation: product["Type d'organisation"] || "Organisation non spécifiée",
          category: product["Catégorie de l'initiative"] || "Non catégorisé",
          thematic: product["Thématique de l'initiative"] || "Non spécifié",
          description: product["Résumé descriptif de l'initiative"] || "Description non disponible",
          objectives: product["Quels étaient les principaux objectifs de cette initiative citoyenne"] || "Non spécifié",
          website: product["Site web de l'initiative"] || "Non spécifié",
          electionType: product["Type d'élection"] || "Non spécifié",
          startDate: product["Date de début"] || "Non spécifié",
          endDate: product["Date de fin"] || "Non spécifié",
          
          partners: product["L'initiative a-t-elle été soutenue par des partenaires ?"] || "Non spécifié",
          mainPartners: product["Si OUI, quels étaient les principaux partenaires"] || "Non spécifié",
          partnersContribution: product["Quel a été leur apport"] || "Non spécifié",
          partnerZone: product["Zone d'intervention des partenaires"] || "Non spécifié",
          
          targetAudience: product["Cibles de l'initiative"] || "Non spécifié",
          interventionZone: product["zone géographique couverte par l'initiative"] || "Non spécifié",
          paysMiseOeuvre: product["Pays de mise en oeuvre"] || "Non spécifié",
          
          electionProcessIssues: product["Avez-vous constaté des dysfonctionnements majeurs dans le processus électoral ?"] || "Non",
          electionIssuesNature: product["Si oui, quelle était la nature des dysfonctionnements"] || "Non spécifié",
          reportedIssues: product["Si oui, les avez-vous portés à la connaissance des autorités compétentes pour rectification"] || "Non spécifié",
          reportOutcome: product["Quelle suite a été réservée à votre signalement"] || "Non spécifié",
          impactDysfunctions: product["Les dysfonctionnements ont-ils affecté l'atteinte des objectifs de l'initiative"] || "Non spécifié",
          
          legalEnvironment: product["Les initiatives citoyennes électorales bénéficient-elles d'un environnement légal favorable dans votre contexte"] || "Non spécifié",
          publicAuthoritiesDifficulties: product["difficultés avec les pouvoirs publics dans la réalisation de vos activités"] || "Non spécifié",
          transparencyAssessment: product["Appréciation de la transparence du processus électoral"] || "Non spécifié",
          obligationRecognition: product["Obligation de reconnaissance institutionnelle de l'initiative"] || "Non spécifié",
          isMultiComponent: product["Est-ce-une initiative à plusieurs composantes1"] || "Non spécifié",
          submitAnotherComponent: product["Voulez-vous soumettre une autre composante de votre initiative"] || "Non spécifié",
          
          phases: product["Phases"] || "Non spécifié",
          initiativeType: product["Type d'initiative"] || "Non spécifié",
          initiativeStatus: product["Statut de l'initiative"] || "Non spécifié",
          
          resources: Array.isArray(product.Ressources) ? product.Ressources.map((resource: any) => resource.signedUrl) : [],
          
          socialLinks: {
            facebook: product["Facebook"] || "Non spécifié",
            twitter: product["X"] || "Non spécifié",
            linkedin: product["Linkedin"] || "Non spécifié",
          },
          
          logo: logoPath || "Non spécifié",
        },
      },
    };

    await saveInitiativeDetails(
      formattedInitiative, 
      product["Langue"], 
      slug(product["Nom de l'initiative"])
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
  process.exit(1);
});