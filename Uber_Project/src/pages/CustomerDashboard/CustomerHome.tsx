import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import SearchBox from "../../components/CustomerComponents/SearchBox";
import API from "../../components/auth/axiosInstance";
import { MdElectricRickshaw, MdElectricBike, MdDirectionsCarFilled } from "react-icons/md";
import { useLoader } from "../../components/common/LoaderContext";
import { toast, ToastContainer } from "react-toastify";
import LocationMap from "../../components/common/LocationMap";
import axios, { Axios } from "axios";
import Loader from "../../components/CustomerComponents/Loader";

interface FareDetails {
    id: string;
    pickup_location: string;
    drop_location: string;
    distance: string | number;
    estimated_time: string | number;
    total_fare: {
        '2 wheeler': number;
        '3 wheeler': number;
        '4 wheeler': number;
    };
}

export default function CustomerHome() {
    const [from, setFrom] = useState<any>(null);
    const [to, setTo] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);
    const [tripDetails, setTripDetails] = useState<FareDetails | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<string>("");
    const [confirmedTrip, setConfirmedTrip] = useState<any>(null);

    // ride cancelation-----------
    const [showBookingLoader, setShowBookingLoader] = useState(false);
    const [bookingCancelled, setBookingCancelled] = useState(false);

    // Ride-cancel reson modal
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [customReason, setCustomReason] = useState('');



    //* Loader
    const { showLoader } = useLoader();

    //! API for fetching trip-details---------------------------->
    const handleSubmit = async () => {
        if (from && to) {
            const payload = {
                pickup_location_latitude: from.lat,
                pickup_location_longitude: from.lon,
                pickup_location: from.name,
                drop_location_latitude: to.lat,
                drop_location_longitude: to.lon,
                drop_location: to.name
            };

            try {
                const response = await API.post('/tripDetails', payload);
                console.log('Trip details fetched:', response.data);
                setTripDetails(response.data.data);
                setSubmitted(true);
            } catch (error) {
                console.error('Error fetching trip details:', error);
                setSubmitted(false);
            }
        } else {
            console.log("Please select both 'From' and 'To' locations.");
            setSubmitted(false);
        }
    };

    //! API for Confirming trip------------------------------->
    const handleBookRide = async () => {
        if (from && to && selectedVehicle && tripDetails) {
            // showLoader()
            setBookingCancelled(false);
            setShowBookingLoader(true);
            const vehicleTypeMap: Record<string, string> = {
                "2 wheeler": "2 Wheeler",
                "3 wheeler": "3 Wheeler",
                "4 wheeler": "4 Wheeler",
            };
            const mappedVehicleType = vehicleTypeMap[selectedVehicle];
            const estimatedTimeRaw = tripDetails?.estimated_time ?? "";
            const estimated_time = typeof estimatedTimeRaw === "string"
                ? estimatedTimeRaw.replace(/mins?/i, "").trim()
                : estimatedTimeRaw.toString();
            const distance = parseFloat(String(tripDetails?.distance ?? "0"));
            const fare = tripDetails.total_fare?.[selectedVehicle as keyof typeof tripDetails.total_fare];

            if (!mappedVehicleType || !distance || !estimated_time || !fare) {
                console.log({ mappedVehicleType, distance, estimated_time, fare });
                console.error("Missing or invalid trip details.");
                return;
            }
            const payload = {
                pickup_location_latitude: from.lat.toString(),
                pickup_location_longitude: from.lon.toString(),
                pickup_location: from.name,
                drop_location_latitude: to.lat.toString(),
                drop_location_longitude: to.lon.toString(),
                drop_location: to.name,
                vehicle_type: mappedVehicleType,
                distance: distance,
                estimated_time: estimated_time,
                fare: fare
            };
            try {
                // const riderequest = await axios.post('http://localhost:3001/rideRequests', payload);
                // console.log("Ride Request Sent to json-server:", riderequest.data);

                const response = await API.post("/addTripDetails", payload);
                console.log("Trip Booked-------", response.data);
                setConfirmedTrip(response.data.data);
                setSubmitted(true);
                // toast.loading("Waiting for Driver to accept ride......");
                // setTimeout(() => {
                //     window.location.reload()
                // }, 1000);
            } catch (error) {
                console.error('error booking trip:', error);
                setSubmitted(false);
                toast.error("Problem booking trip!");
            } finally {
                // hideLoader()
            }
        }
    }


    // const handleCancelBooking = (reason?: string) => {
    //     setBookingCancelled(true);
    //     setShowBookingLoader(false);
    //     console.log('Booking cancelled with reason:', reason);
    //     // Call your API or perform cancel logic here
    // };

    //* Ride cancellation API----------------------------------->
    const handleCancelBooking = async (reason?: string) => {
        const description = cancelReason === 'Other' ? customReason : cancelReason;
        if (!description) {
            toast.warning("Please provide a cancellation reason.");
            return;
        }

        try {
            setShowBookingLoader(true);
            const response = await API.patch(`/tripCancelView/${confirmedTrip.id}`, {
                description: description
            });

            // condition
            console.log("Ride cancelled:", response.data);
            toast.success("Ride cancelled successfully!");
            setBookingCancelled(true);
            setConfirmedTrip(null);
            setShowCancelModal(false);
        } catch (error) {
            console.error("Error cancelling ride:", error);
            toast.error("Failed to cancel ride.");
        } finally {
            setShowBookingLoader(false);
        }
    };


    useEffect(() => {
        if (showCancelModal) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        // Clean up on unmount
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [showCancelModal]);



    const shortenLocation = (location?: string) => {
        if (!location) return "";
        return location.split(",")[0];
    };

    return (
        <>
            <PageMeta
                title="React.js Customer Dashboard"
                description="This is React.js Customer Dashboard page"
            />
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            <div className="grid grid-cols-12 gap-4 md:gap-6 text-center mt-5 items-center px-40 ml-70">
                {/* From / To Location Select Section */}
                <div className="w-85 col-span-12 md:col-span-6 lg:col-span-4 bg-white p-6 rounded-lg shadow-lg mx-auto">
                    <h3 className="text-2xl font-semibold mb-4 text-center text-green-500">Select Location</h3>

                    <SearchBox label="From" onSelect={(location: any) => setFrom(location)} />
                    <SearchBox label="To" onSelect={(location: any) => setTo(location)} />

                    <button
                        onClick={handleSubmit}
                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                        disabled={!from || !to}
                    >
                        Search Trip
                    </button>

                    {from && to && (
                        <div className="mt-6 h-64 w-full rounded overflow-hidden">
                            <LocationMap from={from} to={to} />
                        </div>
                    )}

                    {/* Displays Fair information */}
                    {submitted && tripDetails && (
                        <div className="mt-6 p-4 bg-gray-50 border-t-2 border-gray-200 rounded-lg">
                            <h4 className="font-semibold text-xl mb-4 text-green-500">--- Trip Summary ---</h4>

                            <p>
                                <strong>Pickup Location:</strong> {shortenLocation(tripDetails.pickup_location)}
                            </p>
                            <p>
                                <strong>Drop Location:</strong> {shortenLocation(tripDetails.drop_location)}
                            </p>
                            <p>
                                <strong>Distance:</strong> {tripDetails.distance}
                            </p>
                            <p>
                                <strong>Reaching Till:</strong> {tripDetails.estimated_time}
                            </p>

                            <div className="mt-3">
                                <strong>Total Fare:</strong>
                                <div className="mt-2 text-center ml-10">

                                    <label className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            name="vehicle"
                                            value="2 wheeler"
                                            checked={selectedVehicle === "2 wheeler"}
                                            onChange={() => setSelectedVehicle("2 wheeler")}
                                            className="mr-2"
                                        />
                                        <MdElectricBike className="text-2xl mr-2 text-red-500" />
                                        Rs:-{tripDetails?.total_fare?.["2 wheeler"] ?? "—"}
                                    </label>

                                    <label className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            name="vehicle"
                                            value="3 wheeler"
                                            checked={selectedVehicle === "3 wheeler"}
                                            onChange={() => setSelectedVehicle("3 wheeler")}
                                            className="mr-2"
                                        />
                                        <MdElectricRickshaw className="text-2xl mr-2 text-blue-500" />
                                        Rs:-{tripDetails?.total_fare?.["3 wheeler"] ?? "-"}
                                    </label>

                                    <label className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            name="vehicle"
                                            value="4 wheeler"
                                            checked={selectedVehicle === "4 wheeler"}
                                            onChange={() => setSelectedVehicle("4 wheeler")}
                                            className="mr-2"
                                        />
                                        <MdDirectionsCarFilled className="text-2xl mr-2 text-green-500" />
                                        Rs:-{tripDetails?.total_fare?.["4 wheeler"] ?? "-"}
                                    </label>
                                </div>
                                {selectedVehicle && (
                                    <div className="mt-4 text-center">
                                        <button
                                            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${(!selectedVehicle || showBookingLoader) ? 'cursor-not-allowed opacity-50' : ''
                                                }`}
                                            onClick={handleBookRide}
                                            disabled={!selectedVehicle || showBookingLoader}
                                        >
                                            Book Ride
                                        </button>
                                    </div>
                                )}
                                {showBookingLoader && (
                                    <div className="mt-4 flex flex-col items-center">
                                        <Loader />
                                        <h3 className="text-green-400 font-medium">Waiting for Driver...</h3>
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Cancel Ride
                                        </button>
                                    </div>
                                )}

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

                                            {/* Show text field if "Other" is selected */}
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
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
