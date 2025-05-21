import { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import API from "../../components/auth/axiosInstance";
import { useLoader } from "../../components/common/LoaderContext";
import { toast, ToastContainer } from "react-toastify";
import LocationMap from "../../components/common/LocationMap";
import { connectWebSocket } from "../../components/auth/WebSocket";
import { useLocation } from "react-router-dom";

interface RideData {
    id: number;
    pickup_location: string;
    drop_location: string;
    durations: string | number;
    distance: string | number;
    estimated_time: string | number;
    total_fare: number;
}

export default function DriverRideStatus() {

    const socketRef = useRef<WebSocket | null>(null);
    const location = useLocation();
    console.log("Location State:", location.state);
    const trip = location.state?.tripData;
    const [rideRequests, setRideRequests] = useState<RideData[]>(
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
                const data: RideData = response.data;

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

    return (
        <>
            <PageMeta
                title="React.js Driver Dashboard"
                description="This is React.js Driver Ride Status page"
            />
                <h4 className="font-semibold text-xl text-center mb-4 text-green-500">--- Trip Summary 🚖---</h4>
                {rideRequests.length > 0 ? (
                    rideRequests.map((trip) => (
                        <div
                            key={trip.id}
                            className="mt-6 p-4 w-80 bg-gray-50 border-t-2 border-gray-200 rounded-lg shadow-sm content-center mx-auto flex flex-col items-center"
                        >
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
                                <strong>Estimated Reaching Time:</strong> {trip.estimated_time}
                            </p>
                            <p>
                                <strong>Total Fare:</strong> ₹{trip.total_fare}
                            </p>
                        </div>
                    ))
                ) : (
                    <p></p>
                )}
        </>
    );
}