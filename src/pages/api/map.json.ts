
import { getAll } from "@/lib/contentNocodb.astro";
import countryCoordinates from "@/utils/pays.json";

export async function GET({ params, request }) {
  const url = new URL(request.url);
  const path = url.pathname;
  const lang = path.startsWith('/fr') ? 'fr' : 'en';
  console.log(lang)

  const tableId = "m9erh9bplb8jihp";
  const query = {
    viewId: "vwdobxvm00ayso6s",
    fields: [
      "Nom de l'initiative",
      "Pays",
      "Catégorie de l'initiative",
      "Thématique de l'initiative",
      "Langue",
    ],
    where: `(Status,eq,Traiter)~and(Langue,eq,${lang})`
  };

  const Initiatives = await getAll(tableId, query);

  const countryData = {};
  Initiatives.list.forEach((initiative) => {
    const country = initiative['Pays'];
    if (country) {
      if (!countryData[country]) {
        countryData[country] = {
          count: 1,
          initiatives: [initiative]
        };
      } else {
        countryData[country].count += 1;
        countryData[country].initiatives.push(initiative);
      }
    }
  });

  const points = {
    type: 'FeatureCollection',
    features: Object.entries(countryData).map(([country, data]) => {
      const coordinates = countryCoordinates[country];
      if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          properties: {
            title: country,
            description: `${data.count} initiative${data.count > 1 ? 's' : ''} ${lang === 'fr' ? 'en' : 'in'} ${country}`,
            count: data.count
          }
        };
      }
      return null;
    }).filter(Boolean)
  };

  return new Response(JSON.stringify(points), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
