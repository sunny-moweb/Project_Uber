import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TbBikeFilled } from "react-icons/tb";

// Fix marker icon issue with Leaflet
import 'leaflet/dist/leaflet.css';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon]);
  }, [lat, lon]);
  return null;
};

interface DriverLiveMapProps {
  driverLat: number;
  driverLon: number;
}

const DriverLocationStatus: React.FC<DriverLiveMapProps> = ({ driverLat, driverLon }) => {
  const [position, setPosition] = useState<[number, number]>([driverLat, driverLon]);

  // useEffect(() => {
  //   // This simulates long polling or backend location update
  //   const interval = setInterval(() => {
  //     // Replace with your actual polling API call
  //     fetch(`/api/driver-location`)
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.lat && data.lon) {
  //           setPosition([data.lat, data.lon]);
  //         }
  //       });
  //   }, 5000); // every 5 seconds

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <MapContainer center={position} zoom={15} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Driver is here <TbBikeFilled/> </Popup>
      </Marker>
      <RecenterMap lat={position[0]} lon={position[1]} />
    </MapContainer>
  );
};

export default DriverLocationStatus;
