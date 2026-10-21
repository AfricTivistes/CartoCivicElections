import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export type Cover = { bg: string; ink: "light" | "dark" };

const cache = new Map<string, Cover | null>();

/**
 * Couleur de fond d'une couverture : la couleur du pourtour du logo, pour que
 * le logo paraisse posé sur sa propre couleur. L'encre (texte, motif) suit
 * la luminance du fond.
 * @param logo Chemin public du logo (ex. /initiatives/slug.webp)
 */
export async function logoCover(logo: string | null): Promise<Cover | null> {
  if (!logo) return null;
  if (cache.has(logo)) return cache.get(logo)!;
  const file = path.join(process.cwd(), "public", logo);
  let cover: Cover | null = null;
  try {
    if (fs.existsSync(file)) {
      // Moyenne du pourtour : le fond prolonge le bord du logo sans cassure
      const N = 24;
      const { data } = await sharp(file)
        .flatten({ background: "#ffffff" })
        .resize(N, N, { fit: "fill" })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      let r = 0,
        g = 0,
        b = 0,
        n = 0;
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          if (x > 0 && y > 0 && x < N - 1 && y < N - 1) continue;
          const o = (y * N + x) * 3;
          r += data[o];
          g += data[o + 1];
          b += data[o + 2];
          n++;
        }
      }
      r = Math.round(r / n);
      g = Math.round(g / n);
      b = Math.round(b / n);
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      cover = {
        bg: `rgb(${r} ${g} ${b})`,
        ink: lum > 0.6 ? "dark" : "light",
      };
    }
  } catch (error) {
    console.error(`Cover color failed for ${logo}: ${error}`);
  }
  cache.set(logo, cover);
  return cover;
}
