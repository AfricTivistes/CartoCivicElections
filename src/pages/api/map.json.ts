import type { APIRoute } from "astro";
import { getAll } from "@/lib/contentNocodb.astro";
import paysData from "@/utils/pays.json";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    // Extraction de la langue à partir de l'URL complète
    const url = new URL(request.url);
    
    // Détection de la langue basée sur l'URL
    const lang = url.pathname.startsWith("/fr") ? "fr" : "en";

    console.log("Current language:", lang, "URL:", url.toString());
    
    // Conversion de l'objet pays pour le rendre compatible avec le code existant
    const countryCoordinates = Object.entries(paysData).reduce((acc, [key, value]) => {
      acc[key] = value.coords;
      // Ajouter aussi les noms en anglais pour permettre la correspondance
      if (lang === "en" && value.en) {
        acc[value.en] = value.coords;
      }
      return acc;
    }, {});

    // Utilisation d'un cache en mémoire pour éviter les requêtes répétées
    const cacheKey = `map_data_${lang}`;
    if (global[cacheKey]) {
      console.log("Serving from cache");
      return new Response(global[cacheKey], {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const tableId = "m9erh9bplb8jihp";
    const query = {
      viewId: "vwdobxvm00ayso6s",
      fields: ["Nom de l'initiative", "Pays"],
      where: `(Status,eq,Traiter)~and(Langue,eq,${lang})`,
    };

    const Initiatives = await getAll(tableId, query);

    // Traitement des données par pays de manière plus efficace
    const countryData = {};

    if (Initiatives?.list && Array.isArray(Initiatives.list)) {
      Initiatives.list.forEach((initiative) => {
        const country = initiative["Pays"];
        if (country) {
          if (!countryData[country]) {
            countryData[country] = { count: 0, initiatives: [] };
          }
          countryData[country].count += 1;
          // S'assurer que le nom de l'initiative est une chaîne valide avant de l'ajouter
          const initiativeName =
            initiative["Nom de l'initiative"] || "Initiative sans nom";
          countryData[country].initiatives.push(initiativeName);
        }
      });
    } else {
      console.error("Pas de données d'initiatives disponibles");
    }

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
            // Traduction du nom du pays selon la langue
            const displayCountry = lang === "en" && paysData[country]?.en 
              ? paysData[country].en 
              : country;
            
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: coordinates,
              },
              properties: {
                title: displayCountry, // Utiliser le nom traduit
                count: data.count,
                country: country, // Conserver le nom original pour référence
                originalCountry: country, // Ajouter le nom original
                initiatives: data.initiatives || [],
                // Les slugs seront générés côté client pour simplifier
              },
            };
          }
          return null;
        })
        .filter(Boolean), // Supprime les entrées null
    };

    // Mise en cache du résultat
    const jsonResponse = JSON.stringify(points);
    global[cacheKey] = jsonResponse;

    // Retourne la réponse JSON
    return new Response(jsonResponse, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300", // Cache pendant 5 minutes
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
