
import type { APIRoute } from 'astro';
import { getAll } from "@/lib/contentNocodb.astro";
import countryCoordinates from "@/utils/pays.json";

export const GET: APIRoute = async ({ params, request }) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Détection de la langue basée sur le chemin
  const lang = pathname.includes('/fr') ? 'fr' : 'en';
  console.log('Current language:', lang);

  const tableId = "m9erh9bplb8jihp";
  const query = {
    viewId: "vwdobxvm00ayso6s",
    fields: ["Title", "Pays", "Status", "Langue"],
    where: `(Status,eq,Traiter)~and(Langue,eq,${lang})`,
  };

  try {
    const data = await getAll(tableId, query);
    
    // Group initiatives by country
    const countryData = {};
    data.list.forEach((initiative) => {
      const country = initiative["Pays"];
      if (country) {
        if (!countryData[country]) {
          countryData[country] = {
            count: 1,
            initiatives: [initiative],
          };
        } else {
          countryData[country].count += 1;
          countryData[country].initiatives.push(initiative);
        }
      }
    });

    const points = {
      type: "FeatureCollection",
      features: Object.entries(countryData)
        .map(([country, data]) => {
          const coordinates = countryCoordinates[country];
          if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: coordinates,
              },
              properties: {
                title: country,
                description: `${data.count} initiative${data.count > 1 ? "s" : ""} ${lang === "fr" ? "dans ce pays" : "in this country"}`,
                count: data.count,
              },
            };
          }
          return null;
        })
        .filter(Boolean),
    };

    return new Response(JSON.stringify(points), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
