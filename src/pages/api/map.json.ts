import type { APIRoute } from "astro";
import { getAll } from "@/lib/contentNocodb.astro";
import paysData from "@/utils/pays.json";
import { getInitiatives } from "@/lib/initiatives";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    // Extraction de la langue à partir de l'URL complète
    const url = new URL(request.url);
    
    // Détection de la langue basée sur l'URL
    const lang = url.pathname.startsWith("/fr") ? "fr" : "en";

    // Conversion de l'objet pays pour le rendre compatible avec le code existant
    const countryCoordinates = Object.entries(paysData).reduce((acc: any, [key, value]) => {
      acc[key] = value.coords;
      // Ajouter aussi les noms en anglais pour permettre la correspondance
      if (lang === "en" && value.en) {
        acc[value.en] = value.coords;
      }
      return acc;
    }, {});

    const tableId = "m9erh9bplb8jihp";
    const query = {
      viewId: "vwdobxvm00ayso6s",
      fields: ["Nom de l'initiative", "Pays"],
      where: `(Status,eq,Traiter)~and(Langue,eq,${lang})`,
    };

    //const Initiatives = await getAll(tableId, query);
    const Initiatives = await getInitiatives(lang);
    // Traitement des données par pays de manière plus efficace
    const countryData = Initiatives.reduce((acc, initiative) => {
      const country = initiative.props.product.country;


      if (country) {
        if (!acc[country]) {
          acc[country] = { count: 0, initiatives: [] };
        }
        acc[country].count += 1;
        // S'assurer que le nom de l'initiative est une chaîne valide avant de l'ajouter
        const initiativeName =
          initiative.props.product.title;
        acc[country].initiatives.push(initiativeName);
      }
      return acc;
    }, {});

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
            // Les coordonnées dans pays.json sont déjà [longitude, latitude]
            // donc on respecte ce format et on n'inverse pas
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
                // Les slugs seront générés côté client pour simplifier
              },
            };
          }
          return null;
        })
        .filter(Boolean), // Supprime les entrées null
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
