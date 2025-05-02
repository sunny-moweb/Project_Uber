// //! New
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../auth/axiosInstance";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import PageMeta from "../../common/PageMeta";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { useLoader } from "../../common/LoaderContext";



interface VerificationDocument {
    id: number;
    document_name: string;
    document_text?: string;
    document_image?: string;
}

interface DriverDetails {
    id: number;
    first_name: string;
    last_name: string;
    mobile_number: string;
    status: string;
    created_at: string;
    rejection_reason?: string;
    profile_pic: string;
    verification_documents: VerificationDocument[];
}


const DriverDetailsView = () => {
    const { id } = useParams<{ id: string }>();
    const [driver, setDriver] = useState<DriverDetails | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get("status");
    //* Loader
    const { showLoader, hideLoader } = useLoader();


    const navigate = useNavigate();

    //! Fetching Driver-details----------------
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



    //! API for approve and rejection----------------
    const handleVerification = async (
        status: "approved" | "rejected",
        reason?: string
    ) => {
        try {
            showLoader();
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
            // toast.success("Request Approved!");
        } catch (error: any) {
            console.error(`Error on ${status}:`, error.response || error.message);
        }
        finally {
            hideLoader();
        }
    };

    //   if (!driver) return;
    if (!driver) return null;

    console.log("Driver status---------------", driver.status);
    return (
        <>
            <PageMeta
                title="React.js Driver List Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Driver List Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
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
                        <p className="text-gray-700"><strong>First_Name:</strong> {driver.first_name} {driver.last_name}</p>
                        <p className="text-gray-700"><strong>Mobile:</strong> {driver.mobile_number}</p>
                        <p className="text-gray-700"><strong>Registered At:</strong> {new Date(driver.created_at).toLocaleString()}</p>
                        {driver.status === "rejected" && driver.rejection_reason && (
                            <p className="text-gray-700"><strong>Rejection Reason:</strong> {driver.rejection_reason}</p>
                        )}
                    </div>
                    {/* status on top-right */}
                    <div className="ml-auto mb-20">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium 
                            ${driver.status === "pending" ? "bg-yellow-200 text-orange-800" :
                                driver.status === "approved" ? "bg-green-200 text-green-800" :
                                    driver.status === "rejected" ? "bg-red-200 text-red-800" : ""}`
                        }>
                            {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                        </span>
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
                            onClick={() => {
                                setIsRejectModalOpen(true)
                            }}>
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
    );
};

export default DriverDetailsView;









{/* {isRejectModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
        <div className="bg-white p-4 rounded-lg shadow w-80">
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
                    onClick={() => setIsRejectModalOpen(false)}
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
                        // you can add API call logic here
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    </div>
)} */}








// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import API from "../components/auth/axiosInstance";

// interface VerificationDocument {
//     id: number;
//     document_name: string;
//     document_text?: string;
//     document_image?: string;
// }

// interface DriverDetails {
//     id: number;
//     first_name: string;
//     last_name: string;
//     mobile_number: string;
//     status: string;
//     created_at: string;
//     profile_pic: string;
//     verification_documents: VerificationDocument[];
// }

// const DriverDetailsView = () => {
//     //   const { verification_code } = useParams();
//     const { verification_code } = useParams<{ verification_code: string }>();
//     const [driver, setDriver] = useState<DriverDetails | null>(null);

//     useEffect(() => {
//         const fetchDriverDetails = async () => {
//             try {
//                 const token = localStorage.getItem("access_token");
//                 console.log("Received verification_code from URL:", verification_code);

//                 const response = await API.get(`/driverDetailsApprovalPendingView/${verification_code}`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });

//                 console.log("Full API Response:", response.data);
//                 setDriver(response.data); // or response.data[0] based on actual response
//             } catch (error: any) {
//                 console.error("Failed to fetch driver data:", error?.response || error.message || error);
//             }
//         };

//         if (verification_code) {
//             fetchDriverDetails();
//         }
//     }, [verification_code]);


//     //   useEffect(() => {
//     //     const fetchDriverDetails = async () => {
//     //         try {
//     //             const token = localStorage.getItem("access_token");
//     //             const response = await API.get(`/driverDetailsApprovalPendingView/${verification_code}`, {
//     //             headers: {
//     //               Authorization: `Bearer ${token}`,
//     //             },
//     //           });
//     //         // const response = await API.get(`/driverDetailsApprovalPendingView/${verification_code}`);
//     //         setDriver(response.data[0]);
//     //         console.log("Driver Details:-----------------", response.data[0]);
//     //       } catch (error) {
//     //         console.error("Failed to fetch driver data:", error);
//     //       }
//     //     };

//     //     if (verification_code) {
//     //       fetchDriverDetails();
//     //     }
//     //   }, [verification_code]);

//     //   if (!driver) return <div>Loading...</div>;

//     return (
//         <>
//             {driver && (
//                 <div className="p-6">
//                     <h1 className="text-2xl font-bold mb-4">Driver Details</h1>
//                     <div className="flex items-center gap-6 mb-6">
//                         <img
//                             src={driver.profile_pic}
//                             alt="Profile"
//                             className="w-32 h-32 rounded-full object-cover border"
//                         />
//                         <div>
//                             <p><strong>Name:</strong> {driver.first_name} {driver.last_name}</p>
//                             <p><strong>Mobile:</strong> {driver.mobile_number}</p>
//                             <p><strong>Status:</strong> {driver.status}</p>
//                             <p><strong>Created At:</strong> {new Date(driver.created_at).toLocaleString()}</p>
//                         </div>
//                     </div>

//                     <h2 className="text-xl font-semibold mb-3">Verification Documents</h2>
//                     <div className="space-y-4">
//                         {driver.verification_documents.map((doc) => (
//                             <div key={doc.id}>
//                                 <p className="font-medium">{doc.document_name}</p>
//                                 {doc.document_text && <p>{doc.document_text}</p>}
//                                 {doc.document_image && (
//                                     <img
//                                         src={doc.document_image}
//                                         alt={doc.document_name}
//                                         className="w-48 border rounded mt-2"
//                                     />
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default DriverDetailsView;

