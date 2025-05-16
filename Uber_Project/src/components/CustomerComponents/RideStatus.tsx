import { useEffect, useState } from "react";
import DriverLocationStatus from "./DriverLocationStatus";

interface Ride {
    distance: string | number;
    time: string | number;
    fair: string | number;
    first_name: string;
    last_name: string;
}

const RideStatus = () => {
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [rideStatus, setRideStatus] = useState<Ride[]>([]);

    //   useEffect(() => {
    //     // Fetch driver initial location here
    //     const fetchDriverLocation = async () => {
    //       try {
    //         const res = await fetch('/api/driver-location?ride_id=123');
    //         const data = await res.json();
    //         setDriverLocation({ lat: data.lat, lon: data.lon });
    //       } catch (err) {
    //         console.error('Failed to fetch driver location:', err);
    //       }
    //     };

    //     fetchDriverLocation();
    //   }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Track Your Ride</h1>
            {driverLocation ? (
                <DriverLocationStatus driverLat={driverLocation.lat} driverLon={driverLocation.lon} />

            ) : (
                <p>Loading driver location...</p>
            )}
        </div>
    );
};

export default RideStatus;
