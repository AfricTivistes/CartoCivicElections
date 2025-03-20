import fs from "fs";
import path from "path";


/**
 * Récupère la liste des initiatives selon la langue
 * @param {string} language Langue souhaitée, par défaut "fr"
 * @returns {any[]} La liste des initiatives correspondant à la langue demandée
 */
export function getInitiatives(language: string = "fr") {
  const filePath = path.join(process.cwd(), "src/content/initiatives/initiatives.json");

  if (!fs.existsSync(filePath)) {
    console.error("❌ Le fichier initiatives.json n'existe pas !");
    return [];
  }

  const initiativesData = fs.readFileSync(filePath, "utf8");
  let initiatives;
  
  try {
    initiatives = JSON.parse(initiativesData);
  } catch (error) {
    console.error("❌ Erreur de parsing du fichier initiatives.json:", error);
    return [];
  }

  const filteredInitiatives = initiatives.filter((init: any) => init.props.product.langue === language);
  console.log(`✅ ${filteredInitiatives.length} initiatives trouvées pour la langue : ${language}`);


  return filteredInitiatives;
}


  /**
   * Récupère la liste des détails des initiatives selon la langue
   * @param {string} language Langue souhaitée, par défaut "fr"
   * @returns {any[]} La liste des détails des initiatives correspondant à la langue demandée,
   *                 avec les propriétés :
   *                 - `params`: Les paramètres de la page, avec la clé `slug`
   *                 - `props`: Les propriétés de la page, avec la clé `product`
   *                 - `json`: Le nom du fichier JSON correspondant à l'initiative
   */
export async function getInitiativeDetails(language: string = "fr") {
  // Charger les initiatives depuis le fichier JSON
  const initiatives = getInitiatives(language);

  if (!initiatives.length) {
    console.warn(`⚠️ Aucune initiative trouvée pour la langue : ${language}`);
    return [];
  }

  const details = initiatives.map((initiative: any) => ({
    params: { slug: initiative.params.slug },
    props: { product: initiative.props.product },
    json: `${initiative.params.slug}.json`,
  }));

  return details;
}
