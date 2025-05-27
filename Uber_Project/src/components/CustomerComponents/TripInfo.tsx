import { useEffect, useState } from 'react'
import API from '../auth/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Trip {
    id: number;
    pickup_location: string;
    drop_location: string;
    pickup_time: string;
    drop_time: string;
    distance: string | number;
    fare: number;
    name: string;
    driver_feedback: string | null;
    driver_rating: number | null;
    status: string;
}

const TripInfo = () => {
    const { id } = useParams<{ id: string }>();
    const [tripInfo, setTripInfo] = useState<Trip | null>(null);
    //* modal after amount received-------------
    const [feedbackText, setFeedbackText] = useState("");
    const [rating, setRating] = useState<number | "">("");
    const [feedbackTripId, setFeedbackTripId] = useState<number | null>(null);
    const navigate = useNavigate();

    const openFeedbackModal = (tripId: number) => {
        setFeedbackTripId(tripId);
    };

    const closeFeedbackModal = () => {
        setFeedbackTripId(null);
        setFeedbackText("");
        setRating(0);
    };

    //* handling feedbacks------------------>
    const handleFeedback = async (id: number) => {
        try {
            await API.patch(`/feedbackRatingView/${id}`, {
                feedback: feedbackText,
                rating: rating,
            });
            toast.success("Feedback submitted successfully!");
            closeFeedbackModal();
            setTimeout(() => {
                navigate("/customer/home");
            }, 1000);
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            toast.error("Failed to submit feedback");
        }
    };

    //* API for fetching trip info------------------
    useEffect(() => {
        const fetchTripInfo = async () => {
            try {
                const response = await API.get(`/tripDetailsHistoryView/${id}`);
                setTripInfo(response.data);
            } catch (error: any) {
                console.error("Failed to fetch trip info:", error);
            }
        };
        if (id) {
            fetchTripInfo();
        }
    }, [id]);

    return (
        <div className="p-6">
            <h1 className="text-2xl text-green-500 font-bold mb-4 text-center">--- Your Ride Info 🛣️ ---</h1>
            {tripInfo ? (
                <div
                    key={tripInfo.id}
                    className="bg-white shadow rounded-lg p-6 mb-6 flex items-center gap-6"
                >
                    <div className="space-y-2">
                        <p className='text-gray-700'>
                            <strong>Driver Name: </strong> {tripInfo.name}
                        </p>
                        <p className='text-gray-700'>
                            <strong>PickUp Location: </strong>{tripInfo.pickup_location} <span className='text-gray-500'>({new Date(tripInfo.pickup_time).toLocaleString()})</span>
                        </p>
                        <p className='text-gray-700'>
                            <strong>Drop Location:</strong> {tripInfo.drop_location} <span className='text-gray-500'>({new Date(tripInfo.drop_time).toLocaleString()})</span>
                        </p>
                        <p className='text-gray-700'>
                            <strong>Distance:</strong> {tripInfo.distance} km
                        </p>
                        <p className='text-gray-700'>
                            <strong>Total Fare:</strong> ₹{tripInfo.fare}
                        </p>
                        {tripInfo.driver_feedback==null && tripInfo.driver_rating==null && (
                            <button
                                onClick={() => openFeedbackModal(tripInfo.id)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Give Rating
                            </button>
                        )}
                    </div>
                    <div className="ml-auto mb-20">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium 
                            ${tripInfo.status === "Completed" ? "bg-green-200 text-green-800" : ""}`
                        }>
                            {tripInfo.status.charAt(0).toUpperCase() + tripInfo.status.slice(1)}
                        </span>
                    </div>
                    {/* Modal for feedback */}
                    {feedbackTripId !== null && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50">
                            <div className="bg-white p-4 rounded-lg shadow w-80">
                                <h3 className="text-lg font-medium mb-2">-- Driver Feedback --</h3>
                                <textarea
                                    placeholder="Write feedback here..."
                                    className="w-full h-24 px-3 py-2 border rounded text-sm resize-none"
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                />

                                <select
                                    className="w-full mt-3 px-3 py-2 border rounded text-sm"
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                >
                                    <option value="">Select Rating</option>
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>

                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        onClick={closeFeedbackModal}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={() => handleFeedback(feedbackTripId)}
                                        className="px-3 py-1 bg-green-600 text-white rounded"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-gray-500">No ride information found!</p>
            )}
        </div>
    )
}

export default TripInfo
