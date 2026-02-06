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

    await Promise.all(
      allEntries.map(async (entry: any) => {
        if (entry.data.logoUrl) {
          const result = await downloadAndOptimizeImage(
            entry.data.logoUrl,
            entry.data.slug,
          );
        }
      }),
    );

    const filtered = (allEntries as any[]).filter(
      (entry) => entry.data.langue === language,
    );

    return filtered.map((entry) => entry.data);
  } catch (error) {
    console.error("Error loading initiatives from collection:", error);
    return [];
  }
}

/**
 * Retrieves initiative details for generating static paths.
 * Returns data in the format expected by Astro's getStaticPaths().
 * @param language Target language, defaults to "fr"
 * @returns Array of { params: { slug }, props: { initiative } } objects
 */
export async function getInitiativeDetails(language: string = "fr") {
  const initiatives = await getInitiatives(language);

  if (!initiatives.length) {
    console.warn(`No initiatives found for language: ${language}`);
    return [];
  }

  // Update to use 'initiative' instead of 'product' for consistency
  return initiatives.map((initiative) => ({
    params: { slug: initiative.slug },
    props: { initiative },
  }));
}
