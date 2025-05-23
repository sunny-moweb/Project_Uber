import { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { connectWebSocket } from "../../components/auth/WebSocket";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../components/auth/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import useDriverLocation from "./DriverLocation";
// import { useLoader } from "../../components/common/LoaderContext";
// import { toast, ToastContainer } from "react-toastify";
// import LocationMap from "../../components/common/LocationMap";

interface RideData {
    id: number;
    pickup_location: string;
    drop_location: string;
    durations: string | number;
    distance: string | number;
    estimated_time: string | number;
    mobile_number: number;
    total_fare: number;
}

export default function DriverRideStatus() {

    const socketRef = useRef<WebSocket | null>(null);
    const location = useLocation();
    console.log("Location State:", location.state);
    const tripFromLocation = location.state?.tripData;
    const [rideRequests, setRideRequests] = useState<RideData[]>(tripFromLocation ? [tripFromLocation] : []);
    const trip = rideRequests.find((item) => item.id === tripFromLocation?.id);
    //* handling reach--------------  
    const [reachedClicked, setReachedClicked] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSubmitting, setOtpSubmitting] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    //* handling data after submitting OTP--------------
    const [reachingData, setReachingData] = useState<RideData[]>([]);


    const { getLatitude, getLongitude } = useDriverLocation();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const navigate = useNavigate();

    //* Web-socket connection usage--------------------------------->
    useEffect(() => {
        const socket = connectWebSocket();
        if (!socket) return;

        socketRef.current = socket;

        socket.onopen = () => {
            console.log("✅ WebSocket connected");

            const sendLocation = () => {
                const latitude = getLatitude();
                const longitude = getLongitude();
                console.log("Sending location every 2s:", latitude, longitude);

                if (latitude && longitude && socketRef.current) {
                    const locationPayload = {
                        type: "receive_location_update",
                        status: "success",
                        location: "pickup_location",
                        data: {
                            trip_id: tripFromLocation.id,
                            lat: latitude.toString(),
                            long: longitude.toString(),
                        },
                    };
                    socketRef.current.send(JSON.stringify(locationPayload));
                } else {
                    console.warn("Location not found!");
                }
            };

            intervalRef.current = setInterval(sendLocation, 5000);
        };

        socket.onmessage = (event) => {
            try {
                // const rideData
                const response = JSON.parse(event.data);
                const data: RideData = response.data;

                if (response.event === "location_update") {
                    // Stop sending location when distance is 0
                    if (data.distance == 0 && intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        // console.log("🛑 Stopped sending location updates — distance is 0");
                    }
                    setRideRequests((prev) => {
                        const exists = prev.find((item) => item.id === data.id);

                        if (exists) {
                            return prev.map((item) => (item.id === data.id ? data : item));
                        } else {
                            return [data, ...prev]; //Adds new arrived trips---------
                        }
                    });
                    if (isOtpVerified == true) {
                        setReachingData((prev) => {
                            const exists = prev.find((item) => item.id === data.id);

                            if (exists) {
                                return prev.map((item) => (item.id === data.id ? data : item));
                            } else {
                                return [data, ...prev];
                            }
                        });
                    }
                }
                else if (response.event === "remove_trip_update") {
                    setRideRequests((prev) => prev.filter((ride) => ride.id !== data.id));
                    toast.info("Ride been caceled by rider!");
                    setTimeout(() => {
                        navigate("/driver/home")
                    }, 1000);
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

    //* sending reached status----------------->
    const handleReached = async (id: number) => {
        try {
            await API.patch(`/reachedPickUpLocationView/${id}`);
        } catch {
            toast.error("Cannot reach the destination!");
        }
    };

    //* OTP-verification----------------------->
    const handleOtpSubmit = async (id: number) => {
        try {
            const res = await API.patch(`/verifiedDriverAtPickUpLocationView/${id}`, {
                otp: otp,
            });
            if (res.data.status === "success") {
                toast.success("OTP verified successfully...");
                setIsOtpVerified(true);

                //* sending location after otp-verification
                try {
                    const latitude = getLatitude();
                    const longitude = getLongitude();

                    if (latitude && longitude && socketRef.current) {
                        const locationPayload = {
                            type: "receive_location_update",
                            status: "success",
                            location: "drop_location",
                            data: {
                                trip_id: tripFromLocation.id,
                                lat: latitude.toString(),
                                long: longitude.toString(),
                            },
                        };
                        socketRef.current.send(JSON.stringify(locationPayload));
                    } else {
                        console.log("Latitude or longitude is missing, or socket not connected");
                    }
                } catch (err) {
                    console.error("Failed to send location via socket:", err);
                }
            }
        } catch {
            toast.error("Invalid OTP!");
        }
    }

    const shortenLocation = (location?: string) => {
        if (!location) return "";
        return location.split(",")[0];
    };

    //* distance data handling for OTP
    const parseDistance = (distance: string | number): number => {
        if (typeof distance === "number") return distance;
        const match = distance.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    };
    const distance = parseDistance(tripFromLocation.distance);


    return (
        <>
            <PageMeta
                title="React.js Driver Dashboard"
                description="This is React.js Driver Ride Status page"
            />
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            <h4 className="font-semibold text-xl text-center mb-4 text-green-500">--- Trip Summary 🚖---</h4>
            {rideRequests.length > 0 ? (
                rideRequests.map((trip) => (
                    <div
                        key={trip.id}
                        className="mt-6 p-4 w-80 bg-gray-50 border-t-2 border-gray-200 rounded-lg shadow-sm content-center mx-auto flex flex-col items-center"
                    >
                        {isOtpVerified ? (
                            <>
                                <h3 className="text-blue-700">* Going to Drop Customer *</h3>
                                <p>
                                    <strong>Pickup Location:</strong> {shortenLocation(trip.pickup_location)}
                                </p>
                                <p>
                                    <strong>Drop Location:</strong> {shortenLocation(trip.drop_location)}
                                </p>
                                <p>
                                    <strong>Distance:</strong> {trip.distance} Km
                                </p>
                                <p>
                                    <strong>Reaching Time:</strong> {trip.durations}
                                </p>
                                <p>
                                    <strong>Estimated Reaching Time:</strong> {trip.estimated_time}
                                </p>
                                <p>
                                    <strong>Phone Number:</strong> {trip.mobile_number}
                                </p>
                                <p>
                                    <strong>Total Fare:</strong> Rs:- {trip.total_fare}
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-purple-700">* Going to Pick Customer *</h3>
                                <p>
                                    <strong>Pickup Location:</strong> {shortenLocation(trip.pickup_location)}
                                </p>
                                <p>
                                    <strong>Drop Location:</strong> {shortenLocation(trip.drop_location)}
                                </p>
                                <p>
                                    <strong>Distance:</strong> {trip.distance} Km
                                </p>
                                <p>
                                    <strong>Reaching Time:</strong> {trip.durations}
                                </p>
                                <p>
                                    <strong>Estimated Reaching Time:</strong> {trip.estimated_time}
                                </p>
                                <p>
                                    <strong>Phone Number:</strong> {trip.mobile_number}
                                </p>
                                <p>
                                    <strong>Total Fare:</strong> Rs:- {trip.total_fare}
                                </p>

                                {distance == 0 && !reachedClicked && (
                                    <button
                                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                                        onClick={() => {
                                            setReachedClicked(true);
                                            handleReached(trip.id);
                                        }}
                                    >
                                        Reached
                                    </button>
                                )}

                                {reachedClicked && (
                                    <div className="mt-4">
                                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                            Enter OTP:
                                        </label>
                                        <input
                                            type="text"
                                            id="otp"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={4}
                                            className="mt-1 px-3 py-2 border rounded w-full"
                                            placeholder="Enter OTP"
                                        />

                                        <button
                                            onClick={() => handleOtpSubmit(trip.id)}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                                            disabled={otpSubmitting || otp.length !== 4}
                                        >
                                            {otpSubmitting ? "Verifying..." : "Submit OTP"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))
            ) : (
                <p>No ride requests</p>
            )}
        </>
    );
}