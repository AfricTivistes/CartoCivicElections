import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import sharp from "sharp";

/**
 * Downloads and optimizes an image from a URL to WebP format.
 * Skips download if the file already exists locally.
 * @param imageUrl URL of the image to download
 * @param initiativeSlug Slug used for the file name
 * @returns Local path to the optimized image, or null on error
 */
export async function downloadAndOptimizeImage(
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

    // Skip if already downloaded
    if (fs.existsSync(filePath)) {
      return `/initiatives/${fileName}`;
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Error downloading image: ${response.statusText}`);
      return null;
    }

    const imageBuffer = await response.buffer();

    await sharp(imageBuffer).resize(800).webp({ quality: 80 }).toFile(filePath);

    return `/initiatives/${fileName}`;
  } catch (error) {
    console.error(`Error processing image: ${error}`);
    return null;
  }
}
