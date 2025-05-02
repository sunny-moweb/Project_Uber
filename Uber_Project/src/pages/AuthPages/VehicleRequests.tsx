// New code
import Badge from "../../components/ui/badge/Badge";
import { useEffect, useRef, useState } from "react";
import API from "../../components/auth/axiosInstance";
import { FiEye, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "../../components/common/Pagination";
//* filters
import SearchField from "../../components/common/Filters/SearchField";
import DateFilter from "../../components/common/Filters/DateFilter";
import StatusDropdown from "../../components/common/Filters/StatusDropdown";

interface Driver {
    id: number;
    name: string;
    mobile_number: string;
    vehicle_number: string | number;
    vehicle_type: string | number;
    status: string;
    created_at: string;
    verification_code: string;
}

const ITEMS_PER_PAGE = 5;

export default function VehicleRequests() {
    const [data, setData] = useState<Driver[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [startDate, setStartDate] = useState<Date | null>(null);

    const recordsPerPage = 5; //*Number of data per page

    //! API for driver-data----------------------
    const fetchVehicles = async () => {
        try {
            const params: any = {};
            if (statusFilter && statusFilter !== "all") {
                params.status = statusFilter;
            }
            if (searchTerm) params.search = searchTerm;
            if (startDate) {
                const formatDate = (date: Date) =>
                    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                params.start_date = formatDate(startDate);
            }
    
            // const ordering = sortOrder === "asc" ? sortColumn : `-${sortColumn}`;
            if (sortColumn) {
                params.ordering = sortColumn; 
            }
    
            const response = await API.get(`/adminVehicleStatusListView`, {
                params});
    
            setData(response.data || []);
        } catch (error) {
            console.error("Error fetching drivers:", error);
        }
    };
    

    //* Filters-------------------------------
    //^ Search-filter
    const filteredData = data.filter((vehicle) => {
        const fullName = `${vehicle.name}`;

        return (
            fullName.includes(searchTerm.toLowerCase())
        );
    })

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    filteredData.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const handleStatusChange = (selectedStatus: string) => {
        setStatusFilter(selectedStatus);
    };

    useEffect(() => {
        fetchVehicles();
    }, [statusFilter, searchTerm, startDate, sortColumn, sortOrder]);


    return (
        <>
            <PageMeta
                title="React.js Driver List Dashboard"
                description="This is React.js Driver List Dashboard"
            />
            <PageBreadcrumb pageTitle="Vehicle Requests" />
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

                <div className="flex justify-between items-center px-4 py-2 mt-4">
                    {/* Search field */}
                    <SearchField
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search here..."
                    />

                    <div className="flex items-center gap-3">
                        {/* Status Filter */}
                        <StatusDropdown value={statusFilter} onChange={handleStatusChange} options={["all", "pending", "approved", "rejected"]} />

                        {/* Calendar Icon and DatePicker */}
                        <div className="relative mt-3">
                            <DateFilter selectedDate={startDate} onChange={setStartDate} />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="max-w-full overflow-x-auto m-4 border-radius-4">
                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 border-b">S.No</th>
                                <th
                                    className="text-left px-4 py-3 border-b cursor-pointer"
                                    onClick={() => {
                                        setSortColumn("name");
                                        setSortOrder(sortColumn === "name" && sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        <div className="flex ml-1 gap-1">
                                            <FiArrowUp
                                                className={
                                                    sortColumn === "driver__user__first_name" && sortOrder === "asc"
                                                        ? "text-black"
                                                        : "text-gray-400"
                                                }
                                            />
                                            <FiArrowDown
                                                className={
                                                    sortColumn === "driver__user__first_name" && sortOrder === "desc"
                                                        ? "text-black"
                                                        : "text-gray-400"
                                                }
                                            />
                                        </div>
                                    </div>
                                </th>
                                <th className="text-left px-4 py-3 border-b">Vehicle Number</th>
                                <th className="text-left px-4 py-3 border-b">Vehicle Type</th>
                                <th
                                    className="text-left px-4 py-3 border-b cursor-pointer"
                                    onClick={() => {
                                        setSortColumn("created_at");
                                        setSortOrder(
                                            sortColumn === "created_at" && sortOrder === "asc" ? "desc" : "asc"
                                        );
                                    }}
                                >
                                    <div className="flex items-center gap-1">
                                        Registered At
                                        <div className="flex ml-1 gap-1">
                                            <FiArrowUp
                                                className={
                                                    sortColumn === "created_at" && sortOrder === "asc"
                                                        ? "text-black"
                                                        : "text-gray-400"
                                                }
                                            />
                                            <FiArrowDown
                                                className={
                                                    sortColumn === "created_at" && sortOrder === "desc"
                                                        ? "text-black"
                                                        : "text-gray-400"
                                                }
                                            />
                                        </div>
                                    </div>
                                </th>
                                <th className="text-left px-4 py-3 border-b">Status</th>
                                <th className="text-left px-18 py-3 border-b">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(currentData) && currentData.map((vehicle, index) => (
                                <tr key={vehicle.id}>
                                    <td className="border px-4 py-2 border-b">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>
                                    <td className="px-4 py-2">{vehicle.name}</td>
                                    <td className="px-4 py-2">{vehicle.vehicle_number}</td>
                                    <td className="px-4 py-2">{vehicle.vehicle_type}</td>
                                    <td className="px-4 py-2">
                                        {new Date(vehicle.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2">
                                        <Badge
                                            color={
                                                vehicle.status.toLowerCase() === "approved"
                                                    ? "success"
                                                    : vehicle.status.toLowerCase() === "pending"
                                                        ? "warning"
                                                        : "error"
                                            }
                                        >
                                            {vehicle.status[0].toUpperCase() + vehicle.status.slice(1)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button className="flex justify-center items-center w-40">
                                            <FiEye
                                                className="text-gray-500 hover:text-blue-700"
                                                onClick={() =>
                                                    navigate(`/vehicle-request-view/${vehicle.id}`)
                                                }
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </>
    );
}
