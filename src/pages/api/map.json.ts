import type { APIRoute } from "astro";
import paysData from "@/utils/pays.json";
import { getInitiatives } from "@/lib/initiatives";
import type { Initiative } from "@/collections/initiatives/config";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    // Extraction de la langue à partir de l'URL complète
    const url = new URL(request.url);

    // Détection de la langue basée sur l'URL
    const lang = url.pathname.startsWith("/fr") ? "fr" : "en";

    // Conversion de l'objet pays pour le rendre compatible avec le code existant
    const countryCoordinates: Record<string, number[]> = Object.entries(
      paysData,
    ).reduce((acc: Record<string, number[]>, [key, value]) => {
      acc[key] = value.coords;
      // Ajouter aussi les noms en anglais pour permettre la correspondance
      if (lang === "en" && value.en) {
        acc[value.en] = value.coords;
      }
      return acc;
    }, {});

    const initiatives = await getInitiatives(lang);

    // Traitement des données par pays
    const countryData: Record<
      string,
      { count: number; initiatives: string[] }
    > = initiatives.reduce(
      (
        acc: Record<string, { count: number; initiatives: string[] }>,
        initiative: Initiative,
      ) => {
        const country = initiative.country;

        if (country) {
          if (!acc[country]) {
            acc[country] = { count: 0, initiatives: [] };
          }
          acc[country].count += 1;
          acc[country].initiatives.push(initiative.title);
        }
        return acc;
      },
      {},
    );

    // Création du GeoJSON pour la carte
    const points = {
      type: "FeatureCollection",
      features: Object.entries(countryData)
        .map(([country, data]) => {
          const coordinates = countryCoordinates[country];
          if (
            coordinates &&
            Array.isArray(coordinates) &&
            coordinates.length === 2
          ) {
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: coordinates,
              },
              properties: {
                title: country,
                count: data.count,
                country: country,
                initiatives: data.initiatives || [],
              },
            };
          }
          return null;
        })
        .filter(Boolean),
    };

    // Retourne la réponse JSON
    return new Response(JSON.stringify(points), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération des données de carte:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors du chargement des données" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
};
