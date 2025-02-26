
import { getAll } from "@/lib/contentNocodb.astro";
import countryCoordinates from "@/utils/pays.json";

let cachedPoints = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET({ params, request }) {
  const now = Date.now();
  
  if (cachedPoints && (now - lastCacheTime) < CACHE_DURATION) {
    return new Response(JSON.stringify(cachedPoints));
  }

  const tableId = "mrv8bch7o0jh5ld";
  const query = {
    viewId: "vw793taeypy81he9",
    fields: ["Pays / Country"],
  };

  const Initiatives = await getAll(tableId, query);
  
  const countryData = {};
  Initiatives.list.forEach((initiative) => {
    const country = initiative["Pays / Country"];
    if (country) {
      countryData[country] = (countryData[country] || { count: 0 });
      countryData[country].count += 1;
    }
  });

  cachedPoints = {
    type: "FeatureCollection",
    features: Object.entries(countryData)
      .map(([country, data]) => {
        const coordinates = countryCoordinates[country];
        return coordinates ? {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coordinates,
          },
          properties: {
            title: country,
            description: `Initiatives en ${country}`,
            country: country,
            count: data.count,
          },
        } : null;
      })
      .filter(Boolean),
  };

  lastCacheTime = now;
  return new Response(JSON.stringify(cachedPoints));
}
