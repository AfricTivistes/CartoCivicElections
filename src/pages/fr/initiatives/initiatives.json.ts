import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import { getAll } from "@/lib/contentNocodb.astro";
import { slug } from "@/utils/slug";
import fetch from "node-fetch";
import sharp from "sharp";

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

async function removeOldInitiativesFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    console.log("🗑️ Deleting the old initiatives.json...");
    fs.unlinkSync(filePath);
  }
}

/**
 * Saves the provided initiatives data to a specified JSON file path.
 *
 * This function ensures that the directory for the file path exists,
 * creating it if necessary, and writes the initiatives data in a
 * pretty-printed JSON format to the specified file path.
 *
 * @param initiatives - The data containing the list of initiatives to be saved.
 * @param filePath - The path of the file where the initiatives data should be saved.
 */

async function saveInitiativesToFile(initiatives: any, filePath: string) {
  // 📁 Save initiatives in initiatives.json
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(initiatives, null, 2), "utf8");
}

/**
 * Fetches the initiatives from the NocoDB API.
 *
 * @returns An object with the list of initiatives, or a Response object if no initiatives are found.
 */
async function fetchInitiatives() {
  console.log("🔄 Fetching initiatives from API...");
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

  const productEntries = await getAll(tableId, query);
  if (!productEntries?.list) {
    console.error("❌ No initiatives found!");
    return new Response("No initiatives found", { status: 404 });
  }

  console.log(`✅ ${productEntries.list.length} initiatives retrieved.`);
  return productEntries;
}

export const GET: APIRoute = async () => {
  // Define the path to the initiatives JSON file
  const filePath = path.join(process.cwd(), "src/content/initiatives/initiatives.json");

  
  removeOldInitiativesFile(filePath);

  
  const productEntries = await fetchInitiatives();
  if (!productEntries) {
    return;
  }


  // 🏗️ Process data and optimize images
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
          
          partners: product["L’initiative a-t-elle été soutenue par des partenaires ?"] || "Non spécifié",
          mainPartners: product["Si OUI, quels étaient les principaux partenaires"] || "Non spécifié",
          partnersContribution: product["Quel a été leur apport"] || "Non spécifié",
          partnerZone: product["Zone d'intervention des partenaires"] || "Non spécifié",
          
          targetAudience: product["Cibles de l’initiative"] || "Non spécifié",
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
  
      initiatives.push(formattedInitiative);
    }

    saveInitiativesToFile(initiatives, filePath);

  // Return the JSON file as the response
  return new Response(JSON.stringify(initiatives));
};
