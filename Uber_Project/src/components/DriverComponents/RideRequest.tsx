import { useEffect, useState } from "react";
import API from "../../components/auth/axiosInstance";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import DriverPageBreadcrumb from "../common/DriverPageBreadCrumb";

interface RideData {
  id: number;
  first_name: string;
  last_name: string;
  pickup_location: string;
  drop_location: string;
  vehicle_type: string | number;
  fare: number | string;
  distance: string;
  status: "pending" | "approved" | "rejected";
}

interface RideRequestProps {
  ride: RideData | null;
}

const RideRequest = () => {
  const [rides, setRides] = useState<RideData[]>([]);
  const [rideRequests, setRideRequests] = useState<RideData[]>([]);


  // Fetch ride requests
  // useEffect(() => {
  //   const fetchRides = async () => {
  //     try {
  //       const response = await API.get("/driverTripPendingView");
  //       setRides(response.data);
  //     } catch (error) {
  //       toast.error("Failed to fetch ride requests.");
  //       console.error("Error fetching rides:", error);
  //     }
  //   };
  //   fetchRides();
  // }, []);

  //* Ride-Approval API----------------------------------->
  const handleApprove = async (rideId: number) => {
    try {
      const res = await API.patch(`/tripApprovalView/${rideId}`);
      if (res.status === 200) {
        // Update the status of the ride in the local state
        setRideRequests((prev) =>
          prev.map((ride) =>
            ride.id === rideId ? { ...ride, status: "approved" } : ride
          )
        );
        toast.success("Trip approved successfully");
      }
    } catch (error) {
      console.error("Error approving trip:", error);
      toast.error("Failed to approve trip");
    }
  };

  return (
    <>
      <PageMeta title="Ride Requests" description="Manage ride requests" />
      {/* <DriverPageBreadcrumb pageTitle="Ride Request" /> */}
      <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar />

      <div className="p-6">
        {rides.length > 0 ? (
          rides.map((ride) => (
            <div
              key={ride.id}
              className={`bg-white shadow rounded-lg p-6 mb-4 border-2 transition-all ${ride.status === "approved"
                ? "border-green-500 bg-green-50"
                : ride.status === "rejected"
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200"
                }`}
            >
              <div className="mb-4">
                <p className="text-gray-800">
                  Customer: <span className="text-blue-600">{ride.first_name}{ride.last_name}</span>
                </p>
                <p className="text-gray-700">
                  From: <span className="text-green-700">{ride.pickup_location}</span><br />
                  To: <span className="text-green-700">{ride.drop_location}</span>
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
                  >
                    Reject
                  </button>
              </div>
            </div>
          ))
        ) : (
          <p>No ride requests</p>
        )}
      </div>
    </>
  );
};

export default RideRequest;
