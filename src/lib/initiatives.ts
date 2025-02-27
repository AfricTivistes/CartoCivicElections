import { getAll } from "@/lib/contentNocodb.astro";
import { slug } from "@/utils/slug";

// Fonction utilitaire pour ajouter un délai (sleep)
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getInitiativeQuery(lang: string) {
  if (lang === "fr") {
    return {
      tableId: "mr86lcipw22zfvc",
      query: {
        viewId: "vwuwwslq1jxshmtn",
      },
    };
  } else {
    return {
      tableId: "mrh57f2pu51afu2",
      query: {
        viewId: "vwkh96tjn0gx7odf",
      },
    };
  }
}

export async function getInitiatives(lang: string) {
  try {
    const { tableId, query } = getInitiativeQuery(lang);
    const initiatives = await getAll(tableId, query);

    return initiatives.list.map((initiative) => ({
      title: initiative["Nom de l'initiative"],
      country: initiative["Pays"],
      category: initiative["Catégorie de l'initiative"],
      thematic: initiative["Thématique de l'initiative"],
      langue: lang,
      slug: slug(initiative["Nom de l'initiative"]),
    }));
  } catch (error) {
    console.error(`Erreur lors de la récupération des initiatives pour ${lang}:`, error);
    // Pause en cas d'erreur pour permettre à l'API de se "refroidir"
    await sleep(2000);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}

export async function getInitiativeDetails(lang: string) {
  try {
    const { tableId, query } = getInitiativeQuery(lang);
    const records = await getAll(tableId, query);

    return records.list.map((product) => {
      const productSlug = slug(product["Nom de l'initiative"]);

      return {
        params: { slug: productSlug },
        props: { product },
      };
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails des initiatives pour ${lang}:`, error);
    await sleep(2000); // Pause en cas d'erreur
    return []; // Retourner un tableau vide en cas d'erreur
  }
}