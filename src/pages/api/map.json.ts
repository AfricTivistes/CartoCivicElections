
import { getAll } from "@/lib/contentNocodb.astro";
import countryCoordinates from "@/utils/pays.json";

export async function GET() {
  const tableId = "m9erh9bplb8jihp";
  const segments = Astro.url.pathname.split('/');
  const lang = segments.includes('fr') ? 'fr' : 'en';

  const query = {
    viewId: "vwdobxvm00ayso6s",
    fields: [
      "Nom de l'initiative",
      "Pays",
      "Catégorie de l'initiative",
      "Thématique de l'initiative",
      "Langue",
    ],
    where: `(Status,eq,Traiter)~and(Langue,eq,${lang})`,
  };

  try {
    const data = await getAll(tableId, query);
    
    // Group initiatives by country
    const countryData = data.reduce((acc, initiative) => {
      const country = initiative["Pays"];
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(initiative);
      return acc;
    }, {});

    // Create GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: Object.entries(countryData).map(([country, data]) => {
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
              description: `${data.length} initiative${data.length > 1 ? 's' : ''} dans ce pays`,
              count: data.length,
            },
          };
        }
        return null;
      }).filter(Boolean),
    };

    return new Response(JSON.stringify(geojson), {
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
}
