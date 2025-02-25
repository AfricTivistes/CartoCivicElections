
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function FeaturesMap({ language }) {
  const [mapData, setMapData] = useState(null);
  const apiEndpoint = language === 'fr' ? '/fr/api/map_fr.json' : '/api/map.json';

  useEffect(() => {
    fetch(apiEndpoint)
      .then(response => response.json())
      .then(data => setMapData(data))
      .catch(error => console.error('Error fetching map data:', error));
  }, [language, apiEndpoint]);

  if (typeof window === 'undefined' || !mapData) {
    return <div>Loading map...</div>;
  }

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer
        center={[4.3947, 18.5582]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {mapData.features.map((feature, index) => (
          <Marker
            key={index}
            position={[...feature.geometry.coordinates].reverse()}
          >
            <Popup>
              <h3>{feature.properties.title}</h3>
              <p>{feature.properties.description}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default FeaturesMap;
