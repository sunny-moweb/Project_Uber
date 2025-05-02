//! New
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../../components/auth/axiosInstance";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import { TbTransferIn } from "react-icons/tb";

interface VerificationDocument {
    id: number;
    document_name: string;
    document_text?: string;
    document_image?: string;
}

interface DriverDetails {
    id: number;
    type: string;
    first_name: string;
    last_name: string;
    mobile_number: string;
    status: string;
    created_at: string;
    profile_pic: string;
    rejection_reason?: string;
    verifier_name?: string;
    action_at: string | number | Date;
    verification_documents: VerificationDocument[];
}

const DriverDetailsView = () => {
    const { id } = useParams<{ id: string }>();
    const [driver, setDriver] = useState<DriverDetails | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const location = useLocation();

    const navigate = useNavigate();

    //! Fetching Driver-details---------------------------->
    useEffect(() => {
        const fetchDriverDetails = async () => {
            try {
                console.log("Fetching details for:", id);

                const response = await API.get(`/driverPersonalDetailView/${id}`);

                // console.log("Full API Response:", response.data);
                setDriver(response.data);
            } catch (error: any) {
                console.error("Failed to fetch driver data:", error?.response || error.message);
            }
        };

        if (id) {
            fetchDriverDetails();
        }
    }, [id]);

    // //! API for approve and rejection---------------------------->
    const handleVerification = async (
        status: "approved" | "rejected",
        reason?: string
    ) => {
        try {
            const payload: any = {
                is_approved: status == "approved",
            };
            if (status === "rejected" && reason) {
                payload.rejection_reason = reason;
            }

            await API.patch(`/admin-verify-driver/${id}`,
                payload,
            );
            toast.success(
                status === "approved" ? "Request Approved!" : "Request Rejected!"
            );

            setTimeout(() => {
                navigate("/driver-request-details");
            }, 1500);
        } catch (error: any) {
            console.error(`Error on ${status}:`, error.response || error.message);
        }
    };

    //! Impersonation Action API-------------------------------->
    const handleImpersonation = async () => {
        try {
            const res = await API.post("/ImpersonationView", {
                id: id,
                type: driver?.type,
            });

            if (res.data.status === "success") {
                const { access, refresh, role } = res.data.data;

                localStorage.setItem("impersonation_access_token", access);
                localStorage.setItem("impersonation_refresh_token", refresh);
                localStorage.setItem("impersonation_role", role);
                const currentURL = window.location.href;
                localStorage.setItem("lastVisitedURL", currentURL);
                navigate("/driver/home");
                window.location.reload();
            }
        } catch (error) {
            toast.error("Error during processing!");
        }
    };


    //   if (!driver) return;
    if (!driver) return null;

    return (
        <>
            <PageMeta
                title="React.js Driver Details Dashboard"
                description="This is React.js Driver Deatil page"
            />
            <PageBreadcrumb pageTitle="Driver Details" />
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            <div className="p-6">
                {/* <h1 className="text-2xl text-center text-green-400 font-bold mb-6">--- Driver Details ---</h1> */}
                <div className="bg-white shadow rounded-lg p-6 mb-6 flex items-center gap-6">
                    <img
                        src={driver.profile_pic}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border"
                    />
                    <div className="space-y-2">
                        <p className="text-gray-700"><strong>Name:</strong> {driver.first_name} {driver.last_name}</p>
                        <p className="text-gray-700"><strong>Mobile:</strong> {driver.mobile_number}</p>
                        <p className="text-gray-700"><strong>Registered At:</strong> {new Date(driver.created_at).toLocaleString()}</p>
                        {driver.status === "rejected" && driver.rejection_reason && (
                            <p className="text-gray-700"><strong>Rejection Reason:</strong> {driver.rejection_reason}</p>
                        )}
                        <p className="text-gray-700"><strong>Verified By:</strong>{driver.verifier_name}</p>
                        <p className="text-gray-700"><strong>Approved At:</strong> {new Date(driver.action_at).toLocaleString()}</p>
                    </div>
                    <div className="ml-auto mb-20">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium 
                            ${driver.status === "pending" ? "bg-yellow-200 text-orange-800" :
                                driver.status === "approved" ? "bg-green-200 text-green-800" :
                                    driver.status === "rejected" ? "bg-red-200 text-red-800" : ""}`
                        }>
                            {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                        </span>
                        <TbTransferIn onClick={handleImpersonation} className="mt-3 ml-4 text-2xl text-gray-500 cursor-pointer hover:text-gray-700" />
                    </div>
                </div>

                <div className="bg-gray-100 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Uploaded Documents</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {driver.verification_documents.map((doc) => (
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
                        ))}
                    </div>
                </div>
                {driver.status === "pending" && (
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
    );
};

export default DriverDetailsView;
