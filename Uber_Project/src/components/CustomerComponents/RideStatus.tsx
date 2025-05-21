import { useEffect, useRef, useState } from "react";
import DriverLocationStatus from "./DriverLocationStatus";
// import API from "../../components/auth/axiosInstance";
// import { toast, ToastContainer } from "react-toastify";
import { connectWebSocket } from "../../components/auth/WebSocket";
import { useLocation } from "react-router-dom";

interface Ride {
    id: number;
    distance: string | number;
    driver_name: string;
    drop_location: string;
    pickup_location: string;
    durations: string | number;
    estimated_time: string | number;
    image?: string;
    otp: number; 
    total_fare: string | number;
}

const RideStatus = () => {
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lon: number } | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const location = useLocation();
    const trip = location.state?.tripData;
    const [preview, setPreview] = useState<string | null>(null);
    const [rideRequests, setRideRequests] = useState<Ride[]>(
        trip ? [trip] : []
    );

    //* Web-socket connection usage--------------------------------->
    useEffect(() => {
        const socket = connectWebSocket();
        if (!socket) return;

        socketRef.current = socket;

        socket.onopen = () => {
            console.log("✅ WebSocket connected");
        };

        socket.onmessage = (event) => {
            try {
                // const rideData
                const response = JSON.parse(event.data);
                const data: Ride = response.data;

                if (response.event === "location_update") {
                    setRideRequests((prev) => [data, ...prev]);
                }
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
            }
        };

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        socket.onclose = (e) => {
            console.warn("⚠️ WebSocket closed:", e.code, e.reason);
        };

        return () => {
            socket.close();
        };
    }, []);

    const shortenLocation = (location?: string) => {
        if (!location) return "";
        return location.split(",")[0];
    };

    //* Initials if no image----------
    const getInitials = (driver_name: string) => {
        return `${driver_name.charAt(0).toUpperCase()}${driver_name.charAt(6).toUpperCase()}`;
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl text-green-500 font-bold mb-4 text-center">--- Track Your Ride 🚖 ---</h1>
            {rideRequests.length > 0 ? (
                rideRequests.map((trip) => (
                    <div
                        key={trip.id}
                        className="mt-6 p-4 w-80 bg-gray-50 border-t-2 border-gray-200 rounded-lg shadow-sm content-center mx-auto flex flex-col items-center"
                    >
                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-linear-to-r/increasing from-indigo-500 to-teal-400 text-2xl font-medium text-white group-hover:ring-2 group-hover:ring-blue-400">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                getInitials(trip.driver_name)
                            )}
                        </div>
                        <p>
                            <strong>DriverName: </strong> {trip.driver_name}
                        </p>
                        <p>
                            <strong>Pickup Location:</strong> {shortenLocation(trip.pickup_location)}
                        </p>
                        <p>
                            <strong>Drop Location:</strong> {shortenLocation(trip.drop_location)}
                        </p>
                        <p>
                            <strong>Distance:</strong> {trip.distance}
                        </p>
                        <p>
                            <strong>Duration:</strong> {trip.durations}
                        </p>
                        <p>
                            <strong>Estimate Time of reaching:</strong> {trip.estimated_time}
                        </p>
                        <p>
                            <strong>Total Fare:</strong> ₹{trip.total_fare}
                        </p>
                    </div>
                ))
            ) : (
                <p></p>
            )}
            
            {/* location on Map */}
            {driverLocation ? (
                <DriverLocationStatus driverLat={driverLocation.lat} driverLon={driverLocation.lon} />

            ) : (
                <p>Loading driver location...</p>
            )}
        </div>
    );
};

export default RideStatus;
