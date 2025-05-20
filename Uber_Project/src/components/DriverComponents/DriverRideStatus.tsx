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

    const [rideRequests, setRideRequests] = useState<RideData[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const location = useLocation();
    const locationPayload = location.state;

    //* Web-socket connection usage--------------------------------->
    useEffect(() => {
        const socket = connectWebSocket();
        if (!socket) return;

        socketRef.current = socket;

        socket.onopen = () => {
            console.log("✅ WebSocket connected");

            // Emit something if needed
            if (locationPayload) {
                socket.send(JSON.stringify({
                    // event: "subscribe_to_ride",
                    type: "receive_location_update",
                    data: locationPayload,
                }));
            }
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
            <div className="mt-6 p-4 bg-gray-50 border-t-2 border-gray-200 rounded-lg">
                <h4 className="font-semibold text-xl mb-4 text-green-500">--- Trip Summary ---</h4>
                {rideRequests.length > 0 ? (
                    rideRequests.map((trip) => (
                        <div
                            key={trip.id}
                            className="mt-6 p-4 bg-gray-50 border-t-2 border-gray-200 rounded-lg shadow-sm"
                        >
                            <p>
                                <strong>Pickup Location:</strong> {shortenLocation(trip.pickup_location)}
                            </p>
                            <p>
                                <strong>Drop Location:</strong> {shortenLocation(trip.drop_location)}
                            </p>
                            <p>
                                <strong>Distance:</strong> {trip.distance} km
                            </p>
                            <p>
                                <strong>Duration:</strong> {trip.durations} mins
                            </p>
                            <p>
                                <strong>ETA:</strong> {trip.estimated_time}
                            </p>
                            <p>
                                <strong>Total Fare:</strong> ₹{trip.total_fare}
                            </p>
                        </div>
                    ))
                ) : (
                    <p></p>
                )}
            </div>
        </>
    );
}