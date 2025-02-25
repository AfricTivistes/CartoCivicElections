
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const FeaturesMap = ({ language }) => {
  const [mapData, setMapData] = useState(null);
  const apiEndpoint = language === 'fr' ? '/fr/api/map_fr.json' : '/api/map.json';

  useEffect(() => {
    fetch(apiEndpoint)
      .then(response => response.json())
      .then(data => setMapData(data))
      .catch(error => console.error('Error fetching map data:', error));
  }, [language, apiEndpoint]);

  const customIcon = new L.Icon({
    iconUrl: '/marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  if (!mapData) {
    return <div>Loading map...</div>;
  }

  return (
    <MapContainer
      center={[4.3947, 18.5582]}
      zoom={3}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {mapData.features.map((feature, index) => (
        <Marker
          key={index}
          position={[...feature.geometry.coordinates].reverse()}
          icon={customIcon}
        >
          <Popup>
            <h3>{feature.properties.title}</h3>
            <p>{feature.properties.description}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default FeaturesMap;
