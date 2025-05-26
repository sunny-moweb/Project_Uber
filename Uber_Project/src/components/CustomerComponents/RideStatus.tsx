import { useEffect, useRef, useState } from "react";
import DriverLocationStatus from "./DriverLocationStatus";
// import API from "../../components/auth/axiosInstance";
// import { toast, ToastContainer } from "react-toastify";
import { connectWebSocket } from "../../components/auth/WebSocket";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../auth/axiosInstance";

interface Ride {
    id: number;
    distance: string | number;
    name: string;
    drop_location: string;
    pickup_location: string;
    durations: string | number;
    estimated_time: string | number;
    image?: string;
    otp: number;
    total_fare: string | number;
    vehicle_number: string | number;
}

const RideStatus = () => {
    // const [driverLocation, setDriverLocation] = useState<{ lat: number; lon: number } | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const location = useLocation();
    const trip = location.state?.tripData;
    const [rideRequests, setRideRequests] = useState<Ride[]>(trip ? [trip] : []);
    //* for ride cancelation---------------
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const navigate = useNavigate();

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
                    setRideRequests((prev) => {
                        const exists = prev.find((item) => item.id === data.id);

                        if (exists) {
                            return prev.map((item) => (item.id === data.id ? data : item));
                        } else {
                            // Add new trip
                            return [data, ...prev];
                        }
                    });
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

    //* Ride cancellation API----------------------------------->
    const handleCancelBooking = async (cancelation_description: string) => {

        if (!cancelation_description) {
            toast.warning("Please provide a cancellation reason.");
            return;
        }

        try {
            const response = await API.patch(`/tripCancelView/${trip.id}`, {
                cancelation_description,
            });

            console.log("Ride cancelled:", response.data);
            toast.success("Ride cancelled successfully!");
            setShowCancelModal(false);
            setTimeout(() => {
                navigate('/customer/home')
            }, 1000);
        } catch (error) {
            console.error("Error cancelling ride:", error);
            toast.error("Failed to cancel ride.");
        }
    };

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
                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 text-lg font-medium text-blue-500 group-hover:ring-2 group-hover:ring-blue-400">
                            {trip.image ? (
                                <img
                                    src={trip.image}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                getInitials(trip.name)
                            )}
                        </div>

                        <p>
                            <strong>DriverName: </strong> {trip.name}
                        </p>
                        <p>
                            <strong>Vehicle Number: </strong>{trip.vehicle_number}
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
                            <strong>Reaching Time:</strong> {trip.durations}
                        </p>
                        <p>
                            <strong>Estimate Time of reaching:</strong> {trip.estimated_time}
                        </p>
                        <p>
                            <strong>Total Fare:</strong> ₹{trip.total_fare}
                        </p>
                        <p>
                            <strong>Ride OTP:</strong> {trip.otp}
                        </p>
                    </div>
                ))
            ) : (
                <p></p>
            )}
            <div className="mt-4 flex flex-col items-center">
                <button
                    onClick={() => setShowCancelModal(true)}
                    className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Cancel Ride
                </button>
            </div>
            {/* showing modal for cancel ride reason */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
                    <div className="bg-white p-6 rounded-md w-96">
                        <h2 className="text-lg font-semibold mb-4">Why are you cancelling?</h2>

                        {['Driver is late',
                            'Cant able to connect with driver',
                            'My pickup location was Incorrect',
                            'Driver told me to cancel',
                            'Other']
                            .map((reason) => (
                                <div key={reason} className="mb-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="cancelReason"
                                            value={reason}
                                            checked={cancelReason === reason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                        />
                                        <span>{reason}</span>
                                    </label>
                                </div>
                            ))}
                        {/* Showing text-field if "Other-option" is selected */}
                        {cancelReason === 'Other' && (
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Enter your reason..."
                                className="mt-2 w-full p-2 border rounded"
                                rows={3}
                            />
                        )}
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const reasonToSend = cancelReason === 'Other' ? customReason : cancelReason;
                                    handleCancelBooking(reasonToSend);
                                    setShowCancelModal(false);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                disabled={!cancelReason || (cancelReason === 'Other' && !customReason)}
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* location on Map */}
            {/* {driverLocation ? (
                <DriverLocationStatus driverLat={driverLocation.lat} driverLon={driverLocation.lon} />

            ) : (
                <p>Loading driver location...</p>
            )} */}
        </div >
    );
};

export default RideStatus;
