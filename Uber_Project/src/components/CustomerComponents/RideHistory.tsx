import { useEffect, useState } from 'react';
import API from '../auth/axiosInstance';
import Pagination from '../common/Pagination';
import PageMeta from '../common/PageMeta';
import PageBreadcrumb from '../common/PageBreadCrumb';
import { FaInfoCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

type Rides = {
    id: number;
    pickup_location: string;
    drop_location: string;
    cancelled_at: string;
    drop_time: string;
    distance: string | number;
    fare: number;
    status: string;
    name: string;
};

const ITEMS_PER_PAGE = 5;

const RideHistory = () => {
    const [pastRides, setPastRides] = useState<Rides[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const navigate=useNavigate();


    //! API for past-ride-list----------------
    const fetchPastRides = async () => {
        try {

            const params: any = {};
            // const ordering = sortOrder === "asc" ? sortColumn : `-${sortColumn}`;
            if (sortColumn) {
                params.ordering = sortColumn;
            }

            const response = await API.get('/tripHistoryView', {
                params,
            });
            setPastRides(response.data || []);
        } catch (error) {
            console.error("Failed to fetch payments", error);
        }
    };

    // Refetch on sort change
    useEffect(() => {
        setCurrentPage(1);
        fetchPastRides();
    }, [sortColumn, sortOrder]);

    const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    const totalPages = Math.ceil(pastRides.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentRides = pastRides.slice(startIndex, startIndex + ITEMS_PER_PAGE);


    return (
        <>
            <PageMeta
                title="React.js Payment list Dashboard"
                description="This is React.js Payment List Dashboard page for Admin"
            />
            <PageBreadcrumb pageTitle="Ride-Payments History" />
            <div className="m-6">
                {/* <h2 className=" mb-4 text-center text-green-500" style={{ fontSize: "25px" }}>--- Draft Drivers ---</h2> */}
                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2">S.No</th>
                            {/* <th className="text-left px-4 py-3 border-b">Name</th> */}
                            {/* <th className="text-left px-4 py-3 border-b">Pickup Point</th> */}
                            <th className="text-left px-4 py-3 border-b">Drop Point</th>
                            {/* <th className="text-left px-4 py-3 border-b">Pickup Time</th> */}
                            <th className="text-left px-4 py-3 border-b">Last Action Time</th>
                            <th className="text-left px-4 py-3 border-b">Distance</th>
                            <th className="text-left px-4 py-3 border-b">Fare Amount</th>
                            <th className="text-left px-4 py-3 border-b">Status</th>
                            <th className="text-left px-4 py-3 border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRides.map((ride, index) => (
                            <tr key={ride.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border px-4 py-2 ">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                {/* <td className="px-4 py-3 border-b">{ride.name}</td> */}
                                {/* <td className="px-4 py-3 border-b">{ride.pickup_location}</td> */}
                                <td className="px-4 py-3 border-b">{ride.drop_location}</td>
                                {/* <td className="px-4 py-3 border-b">{formatDate(ride.pickup_time)}</td> */}
                                <td className="px-4 py-3 border-b">
                                    {formatDate(ride.drop_time || ride.cancelled_at)}
                                </td>
                                <td className="px-4 py-3 border-b">{ride.distance} km</td>
                                <td className="px-4 py-3 border-b">Rs: {ride.fare}</td>
                                <td className="px-4 py-3 border-b">{ride.status}</td>
                                <td className="px-8 py-3 border-b">
                                    <FaInfoCircle
                                        className={
                                            ride.status === "Accepted" 
                                                ? "text-blue-500 cursor-pointer"
                                                : "text-gray-400 cursor-not-allowed opacity-50"
                                        }
                                        onClick={() => navigate(`/trip-details/${ride.id}`)}
                                        aria-disabled={ride.status !== "Accepted"}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                />

            </div>
        </>
    );
};

export default RideHistory;