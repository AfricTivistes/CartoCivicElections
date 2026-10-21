import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Les logos des initiatives sont téléchargés depuis NocoDB dans public/initiatives
// pendant la génération des pages (getStaticPaths -> getInitiatives), c'est-à-dire
// APRÈS la copie de public/ vers le dossier de build. Sans cette recopie finale,
// le logo d'une initiative fraîchement ajoutée sur NocoDB est absent du build et
// la page de détail retombe sur l'image placeholder.
function copyInitiativeLogos() {
  return {
    name: "copy-initiative-logos",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const source = path.join(process.cwd(), "public", "initiatives");
        if (!fs.existsSync(source)) return;

        const destination = fileURLToPath(new URL("initiatives/", dir));
        await fs.promises.cp(source, destination, {
          recursive: true,
          force: true,
        });
        logger.info(`Logos des initiatives copiés vers ${destination}`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://soobu.tech/",
  prefetch: true,
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: "en", locales: { en: "en", fr: "fr" } },
    }),
    copyInitiativeLogos(),
  ],
  output: "static",
  adapter: vercel(),
});
