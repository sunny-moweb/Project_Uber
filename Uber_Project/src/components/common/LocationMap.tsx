import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Mapmarker from '../../../Vehicle_Images/map-marker.jpg'

interface Location {
  lat: number;
  lon: number;
  name?: string;
}

interface LocationMapProps {
  from?: Location;
  to?: Location;
}

const LocationMap: React.FC<LocationMapProps> = ({ from, to }) => {
  // Fallback center
  const center = from
    ? [from.lat, from.lon]
    : to
      ? [to.lat, to.lon]
      : [20.5937, 78.9629];

  const DefaultIcon = L.icon({
    iconUrl: Mapmarker,
    iconSize: [25, 40],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
  L.Marker.prototype.options.icon = DefaultIcon;

  return (
    <div style={{ height: '300px', marginTop: '1rem' }}>
      <MapContainer center={center as [number, number]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {from && (
          <Marker position={[from.lat, from.lon]}>
            <Popup>From: {from.name || 'Start'}</Popup>
          </Marker>
        )}

        {to && (
          <Marker position={[to.lat, to.lon]}>
            <Popup>To: {to.name || 'Destination'}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
