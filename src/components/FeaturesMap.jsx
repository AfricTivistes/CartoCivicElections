import React, { useState, useEffect } from 'react';

function FeaturesMap({ language }) {
  const [mapData, setMapData] = useState(null);
  const apiEndpoint = language === 'fr' ? '/fr/api/map_fr.json' : '/api/map.json';

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        setMapData(data);
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    }
    fetchData();
  }, [apiEndpoint]);

  if (!mapData) {
    return <p>Loading map data...</p>;
  }

  // Rest of the component rendering logic using mapData
  return (
    <div>
      <h1>Map Data</h1>
      <pre>{JSON.stringify(mapData, null, 2)}</pre> </div>
  );
}

export default FeaturesMap;