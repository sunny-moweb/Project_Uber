import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import RideRequest from "../../components/DriverComponents/RideRequest";
import { connectWebSocket } from "../../components/auth/WebSocket";
import API from "../../components/auth/axiosInstance";
//* using driver-location component
import useDriverLocation from "../../components/DriverComponents/DriverLocation";
import { useNavigate } from "react-router-dom";

interface RideData {
  id: number;
  distance: string;
  drop_location: string;
  pickup_location: string;
  fare: string;
  first_name: string;
  last_name: string;
  vehicle_type: string | number;
  ratings: number;
  status: "pending" | "approved" | "rejected";
}

export default function DriverHome() {
  // const [newRideRequest, setNewRideRequest] = useState<RideData | null>(null);
  const [rideRequests, setRideRequests] = useState<RideData[]>([]);
  //* state for storing data after ride approval-----------
  const [approvedTripData, setApprovedTripData] = useState<RideData | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  //* getting driver loaction and storing----------------          
  const { getLatitude, getLongitude } = useDriverLocation();

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
        const response = JSON.parse(event.data);
        const data: RideData = response.data;

        if (response.event === "send_trip_update") {
          setRideRequests((prev) => [data, ...prev]);
        } else if (response.event === "remove_trip_update") {
          setRideRequests((prev) => prev.filter((ride) => ride.id !== data.id));
        } else if (response.event === "location_update") {
          setApprovedTripData(data);
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


  //* Ride-Approval API----------------------------------->
  const handleApprove = async (rideId: number) => {
    try {
      const res = await API.patch(`/tripApprovalView/${rideId}`);
      if (res.status === 200) {
        setRideRequests((prev) =>
          prev.map((ride) =>
            ride.id === rideId ? { ...ride, status: "approved" } : ride
          )
        );
        toast.success("Trip approved successfully");

        //* sending lat-long of driver----------------
        const latitude = getLatitude();
        const longitude = getLongitude();

        if (latitude && longitude && socketRef.current) {
          const locationPayload = {
            type: "receive_location_update",
            status: "success",
            location: "pickup_location",
            data: {
              trip_id: rideId,
              lat: latitude.toString(),
              long: longitude.toString(),
            },
          };

          socketRef.current.send(JSON.stringify(locationPayload));
          console.log("Location sent after approval:", locationPayload);
        } else {
          console.warn("Location or WebSocket not ready");
        }
      }
    } catch (error) {
      console.error("Error approving trip:", error);
      toast.error("Failed to approve trip");
    }
  };

  //^ navigating to rideStatus page-------------------
  useEffect(() => {
    if (approvedTripData) {
      navigate("/driver-ride-status", { state: { tripData: approvedTripData } });
    }
  }, [approvedTripData]);


  return (
    <>
      <PageMeta
        title="React.js Driver Dashboard"
        description="This is React.js Driver Dashboard page"
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <div className="">
            {rideRequests.length > 0 ? (
              rideRequests.map((ride) => (
                <div
                  key={ride.id}
                  className={`bg-white shadow rounded-lg p-6 mb-4 border-2 transition-all ${ride.status === "approved"
                    ? "border-green-500 bg-green-50"
                    : ride.status === "rejected"
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200"
                    }`}
                >
                  <h2 className="text-lg font-semibold">🛣️ New Ride Request</h2>
                  <div className="mb-4">
                    <p className="text-gray-800">
                      Customer: <span className="text-blue-600">{ride.first_name}{ride.last_name}</span>
                    </p>
                    <p className="text-gray-700">
                      From: <span className="text-green-700">{ride.pickup_location}</span><br />
                      To: <span className="text-green-700">{ride.drop_location}</span>
                    </p>
                    {/* <p className="text-gray-600">Customer Ratings: {ride.ratings}</p> */}
                    <p className="text-gray-600">
                      Customer Ratings: {Number(ride.ratings).toFixed(2)} ⭐
                    </p>
                    <p className="text-gray-600">Vehicle: {ride.vehicle_type}</p>
                    <p className="text-gray-600">Distance: {ride.distance}</p>
                    <p className="text-gray-600">Fare: ₹{ride.fare}</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      className={`px-4 py-2 rounded text-white ${ride.status === "approved" ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                      onClick={() => handleApprove(ride.id)}
                    // disabled={ride.status !== "pending"}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    // disabled={ride.status !== "pending"}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p></p>
            )}
            {/* Past Ride-Requests component */}
            <RideRequest />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5"></div>
        <div className="col-span-12"></div>
        <div className="col-span-12 xl:col-span-5"></div>
        <div className="col-span-12 xl:col-span-7"></div>
      </div>
    </>
  );
}
