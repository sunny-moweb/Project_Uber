import { useEffect, useRef } from 'react';

const useDriverLocation = () => {
  const latRef = useRef<number | null>(null);
  const lngRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        latRef.current = position.coords.latitude;
        lngRef.current = position.coords.longitude;
        console.log('Driver location:', latRef.current, lngRef.current);
      },
      (err) => {
        console.error('Error getting location:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return {
    getLatitude: () => latRef.current,
    getLongitude: () => lngRef.current,
  };
};

export default useDriverLocation;
