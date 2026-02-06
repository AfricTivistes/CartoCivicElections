import { getCollection } from "astro:content";
import type { Initiative } from "@/collections/initiatives/config";
import { downloadAndOptimizeImage } from "@/utils/images";

/**
 * Retrieves initiatives from the NocoDB-backed Astro content collection,
 * filtered by language.
 * @param language Target language, defaults to "fr"
 * @returns Array of initiative data objects matching the language
 */
export async function getInitiatives(
  language: string = "fr",
): Promise<Initiative[]> {
  try {
    const allEntries = await getCollection("initiatives");

    // Download and optimize images if they don't exist yet
    // This happens during build time when getStaticPaths calls this function
    await Promise.all(
      allEntries.map(async (entry: any) => {
        if (entry.data.logoUrl) {
          console.log(`Checking/Downloading image for: ${entry.data.slug}`);
          const result = await downloadAndOptimizeImage(
            entry.data.logoUrl,
            entry.data.slug,
          );
          if (result) {
            console.log(`Successfully processed image for: ${entry.data.slug}`);
          } else {
            console.warn(`Failed to process image for: ${entry.data.slug}`);
          }
        }
      }),
    );

    return (allEntries as any[])
      .filter((entry) => entry.data.langue === language)
      .map((entry) => entry.data);
  } catch (error) {
    console.error("Error loading initiatives from collection:", error);
    return [];
  }
}

/**
 * Retrieves initiative details for generating static paths.
 * Returns data in the format expected by Astro's getStaticPaths().
 * @param language Target language, defaults to "fr"
 * @returns Array of { params: { slug }, props: { product } } objects
 */
export async function getInitiativeDetails(language: string = "fr") {
  const initiatives = await getInitiatives(language);

  if (!initiatives.length) {
    console.warn(`No initiatives found for language: ${language}`);
    return [];
  }

  return initiatives.map((initiative) => ({
    params: { slug: initiative.slug },
    props: { product: initiative },
  }));
}
