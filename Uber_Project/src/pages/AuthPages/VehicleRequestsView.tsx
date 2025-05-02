import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../components/auth/axiosInstance";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast, ToastContainer } from "react-toastify";

interface VerificationVehicleRequest {
    id: number;
    document_name: string;
    document_text?: string;
    document_image?: string;
}

interface VehicleDetails {
    id: number;
    vehicle_number: string | number;
    vehicle_type: string | number;
    vehicle_chassis_number: string | number;
    vehicle_engine_number: string | number;
    status: string;
    action_at: string;
    action_by: string;
    rejection_reason?: string;
    documents: VerificationVehicleRequest[];
}

const VehicleRequestsView = () => {
    const { id } = useParams<{ id: string }>();
    const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const navigate = useNavigate();

    //! Fetching Vehicle-details-----------------------
    useEffect(() => {
        const fetchVehicleDetails = async () => {
            try {
                const response = await API.get(`/driverVehicleDetailsView/${id}`);
                setVehicle(response.data);
            } catch (error: any) {
                console.error("Failed to fetch driver data:", error?.response || error.message);
            }
        };
        if (id) {
            fetchVehicleDetails();
        }
    }, [id]);

    //! API for approve and rejection Vehicle---------------------
     const handleVerification = async (
        status: "approved" | "rejected",
        reason?: string
    ) => {
        try {
            const token = localStorage.getItem("access_token");
            const payload: any = {
                is_approved: status == "approved",
            };

            if (status === "rejected" && reason) {
                payload.rejection_reason = reason;
            }
            await API.patch(`/adminVehicleApprovalView/${id}`,
                payload);
                toast.success(status === "approved" ? "Request Approved!" : "Request Rejected!"
            );

            setTimeout(() => {
                navigate("/vehicle-request");
            }, 1500);
        } catch (error: any) {
            console.error(`Error on ${status}:`, error.response || error.message);
        }
    };

    if (!vehicle) return null;

    return (
        <>  
            <PageMeta
                title="React.js Vehicle List Dashboard"
                description="This is React.js Vehicle List "
            />
            <PageBreadcrumb pageTitle="Vehicle Details" />
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            <div className="p-6">
                <div className="bg-white shadow rounded-lg p-6 mb-6 flex items-center gap-6">
                    <div className="space-y-2">
                        <p className="text-gray-700"><strong>Vehicle Number:</strong> {vehicle.vehicle_number}</p>
                        <p className="text-gray-700"><strong>Vehicle Type:</strong> {vehicle.vehicle_type}</p>
                        <p className="text-gray-700"><strong>Chassis Number:</strong> {vehicle.vehicle_chassis_number}</p>
                        <p className="text-gray-700"><strong>Engine Number:</strong> {vehicle.vehicle_engine_number}</p>
                        <p className="text-gray-700"><strong>Approved At:</strong> {new Date(vehicle.action_at).toLocaleString()}</p>
                        <p className="text-gray-700"><strong>Verified By:</strong> {vehicle.action_by}</p>
                        {vehicle.status === "rejected" && vehicle.rejection_reason && (
                            <p className="text-gray-700"><strong>Rejection Reason:</strong>{vehicle.rejection_reason}</p>
                        )}
                    </div>
                    <div className="ml-auto mb-20">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium 
                            ${vehicle.status === "pending" ? "bg-yellow-200 text-orange-800" :
                                vehicle.status === "approved" ? "bg-green-200 text-green-800" :
                                    vehicle.status === "rejected" ? "bg-red-200 text-red-800" : ""}`
                        }>
                            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                        </span>
                        {/* <p className="text-gray-700 text-right"><strong>Status:</strong> {driver.status[0].toUpperCase() + driver.status.slice(1)}</p> */}
                    </div>
                </div>

                <div className="bg-gray-100 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Uploaded Documents</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {vehicle.documents?.map((doc) => {
                            console.log("Documents----------------->", doc);
                            return (
                                <div
                                    key={doc.id}
                                    className="bg-white rounded shadow p-4 flex flex-col items-start"
                                >
                                    <p className="font-semibold text-gray-700 mb-2">{doc.document_name}</p>
                                    {doc.document_text && (
                                        <p className="text-gray-600 text-sm mb-2">{doc.document_text}</p>
                                    )}
                                    {doc.document_image && (
                                        <img
                                            src={doc.document_image}
                                            alt={doc.document_name}
                                            className="w-full max-w-[200px] border rounded"
                                        />
                                    )}
                                </div>
                            );
                        })}

                    </div>
                </div>
                {vehicle.status === "pending" && (
                    <div>
                        <button className="bg-green-500 text-white px-4 py-2 rounded mt-4 mr-2"
                            onClick={() => {
                                handleVerification("approved");
                            }}>
                            Approve
                        </button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                            onClick={() =>
                                setIsRejectModalOpen(true)}>
                            Reject
                        </button>
                    </div>
                )}
                {isRejectModalOpen && (
                    <div className="fixed inset-0 z-50">
                        {/* Black semi-transparent background */}
                        <div className="absolute inset-0 bg-black opacity-70"></div>

                        {/* Modal content on top */}
                        <div className="relative flex items-center justify-center h-full">
                            <div className="bg-white p-4 rounded-lg shadow w-80 z-50">
                                <h3 className="text-lg font-medium mb-2">Rejection Reason</h3>
                                <input
                                    type="text"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter reason..."
                                    className="w-full px-3 py-2 border rounded mb-4 text-sm"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                                        onClick={() => {
                                            setIsRejectModalOpen(false);
                                            setRejectionReason("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-3 py-1 bg-red-500 text-white rounded"
                                        onClick={() => {
                                            console.log("Submitted reason:", rejectionReason);
                                            setIsRejectModalOpen(false);
                                            setRejectionReason("");
                                            handleVerification("rejected", rejectionReason);
                                            toast.error("Request Rejected!");
                                        }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default VehicleRequestsView
