
import { getAll } from "@/lib/contentNocodb.astro";
import countryCoordinates from "@/utils/pays.json";

// Fetch initiatives data
const tableId = "mrv8bch7o0jh5ld";
const query = {
  viewId: "vw793taeypy81he9",
  fields: [
    "Pays / Country"
  ]
};

export async function GET({params, request}) {
  const Initiatives = await getAll(tableId, query);

  // Process initiatives to get country data
  const countryData = {};
  Initiatives.list.forEach((initiative) => {
    const country = initiative['Pays / Country'];
    if (country) {
      if (!countryData[country]) {
        countryData[country] = {
          count: 0
        };
      }
      countryData[country].count += 1;
    }
  });

  // Create features array for the map
  const points = {
    type: 'FeatureCollection',
    features: Object.entries(countryData).map(([country, data]) => {
      const coordinates = countryCoordinates[country];
      console.log(`Processing country: ${country}, coordinates:`, coordinates);
      if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          properties: {
            title: country,
            description: `${data.count} initiative${data.count > 1 ? 's' : ''} en ${country}`,
            count: data.count
          }
        };
      }
      console.log(`Missing or invalid coordinates for country: ${country}`);
      return null;
    }).filter(Boolean)
  };

  console.log('Generated GeoJSON:', JSON.stringify(points, null, 2));

  return new Response(
    JSON.stringify(points),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }
  );
}
