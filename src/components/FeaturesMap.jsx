import React, { useState, useEffect } from 'react';

function FeaturesMap() {
  const [mapData, setMapData] = useState(null);
  const [language, setLanguage] = useState('en'); // Default language

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const apiEndpoint = language === 'fr' ? '/fr/api/map_fr.json' : '/api/map.json';
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        setMapData(data);
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };
    fetchMapData();
  }, [language]);

  // JSX to render the map data 
  return (
    <div>
      {mapData ? (
        <div>
          {/* Map rendering logic using mapData */}
          <h1>Map Data Loaded</h1>
          <pre>{JSON.stringify(mapData, null, 2)}</pre> {/*Example rendering*/}
        </div>
      ) : (
        <p>Loading map data...</p>
      )}
    </div>
  );
}

export default FeaturesMap;