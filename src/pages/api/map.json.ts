import { getAll } from "@/lib/contentNocodb.astro";
import countryCoordinates from "@/utils/pays.json";
interface Props {
  title?: string;
}

// Fetch initiatives data
const tableId = "mrv8bch7o0jh5ld";
const query = {
  viewId: "vw793taeypy81he9",
  fields: ["Pays / Country"],
};

const Initiatives = await getAll(tableId, query);

// Process initiatives to get country data
const countryData = {};
Initiatives.list.forEach((initiative) => {
  const country = initiative["Pays / Country"];
  if (country) {
    if (!countryData[country]) {
      countryData[country] = {
        count: 0,
      };
    }
    countryData[country].count += 1;
  }
});

// Create features array for the map
const points = {
  type: "FeatureCollection",
  features: Object.entries(countryData)
    .map(([country, data]) => {
      const coordinates = countryCoordinates[country];
      if (coordinates) {
        return {
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
        };
      }
      return null;
    })
    .filter(Boolean),
};

export async function GET({ params, request }) {
  return new Response(JSON.stringify(points));
}
