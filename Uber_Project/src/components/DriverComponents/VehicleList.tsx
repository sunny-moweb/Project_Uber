import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../auth/axiosInstance';
import Pagination from '../common/Pagination';
import { useNavigate } from 'react-router-dom';
import { FiArrowDown, FiArrowUp, FiEye } from 'react-icons/fi';
import SearchField from '../common/Filters/SearchField';
import DateFilter from '../common/Filters/DateFilter';
import PageMeta from '../common/PageMeta';
import PageBreadcrumb from '../common/PageBreadCrumb';

type Vehicle = {
    id: number;
    name: string;
    vehicle_number: string;
    vehicle_type: string;
    created_at: string;
    action_at:string;
    status: string;
};

const ITEMS_PER_PAGE = 5;

const VehicleList = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const navigate = useNavigate();

    //! API for Vehicle-list
    const fetchVehicles = async (startDate: Date | null = null,) => {
        try {
            const token = localStorage.getItem("access_token");

            const params: any = {};
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

            const response = await API.get("/vehicleListView", {params,
            });
            setVehicles(response.data || []);
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        }
    };

    //^ Search-filter
    const filteredData = vehicles.filter((vehicle) => {
        const fullName = `${vehicle.name}`;

        return (
            fullName.includes(searchTerm)
        );
    })

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentVehicles = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
        fetchVehicles();
    }, [searchTerm, startDate, sortColumn, sortOrder]);


    return (
        <>
            <PageMeta
                title="React.js Vehicle List Dashboard"
                description="This is React.js Vehicle List Dashboard page"
            />
            <PageBreadcrumb pageTitle="Vehicle List" />
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="flex justify-between items-center px-4 py-2">
                    {/* Search field */}
                    <SearchField
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search here..."
                    />
                    <div className="flex items-center gap-3">
                        {/* Calendar Icon and DatePicker */}
                        <div className="relative mt-3">
                            <DateFilter selectedDate={startDate} onChange={setStartDate} />
                        </div>
                    </div>
                </div>
                <div className="max-w-full overflow-x-auto m-4 border-radius-4">
                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 border-b">S.No</th>
                                <th
                                    className="text-left px-4 py-3 border-b cursor-pointer"
                                    onClick={() => {
                                        setSortColumn("name");
                                        setSortOrder(
                                            sortColumn === "name" && sortOrder === "asc" ? "desc" : "asc"
                                        );
                                    }}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        <div className="flex ml-1 gap-1">
                                            <FiArrowUp
                                                className={
                                                    sortColumn === "name" && sortOrder === "asc"
                                                        ? "text-black"
                                                        : "text-gray-400"
                                                }
                                            />
                                            <FiArrowDown
                                                className={
                                                    sortColumn === "name" && sortOrder === "desc"
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
                                <th
                                    className="text-left px-4 py-3 border-b cursor-pointer"
                                    onClick={() => {
                                        setSortColumn("action_at");
                                        setSortOrder(
                                            sortColumn === "action_at" && sortOrder === "asc" ? "desc" : "asc"
                                        );
                                    }}
                                >
                                    <div className="flex items-center gap-1">
                                        Verified At
                                        <div className="flex ml-1 gap-1">
                                            <FiArrowUp
                                                className={
                                                    sortColumn === "action_at" && sortOrder === "asc"
                                                        ? "text-black"
                                                        : "text-gray-400"
                                                }
                                            />
                                            <FiArrowDown
                                                className={
                                                    sortColumn === "action_at" && sortOrder === "desc"
                                                        ? "text-black"
                                                        : "text-gray-400"
                                                }
                                            />
                                        </div>
                                    </div>
                                </th>
                                <th className="text-left px-4 py-3 border-b" style={{ width: "60px", maxWidth: "60px" }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentVehicles.map((vehicle, index) => (
                                <tr key={vehicle.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    {/* <td className="px-4 py-3 border-b">{driver.id}</td> */}
                                    <td className="border px-4 py-2">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td className="px-4 py-3 border-b">{vehicle.name}</td>
                                    <td className="px-4 py-3 border-b">{vehicle.vehicle_number}</td>
                                    <td className="px-4 py-3 border-b">{vehicle.vehicle_type}</td>
                                    <td className="px-4 py-3 border-b">{new Date(vehicle.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3 border-b">{new Date(vehicle.action_at).toLocaleString()}</td>
                                    <td className="px-4 py-3 border-b" style={{ width: "60px", maxWidth: "60px" }}>
                                        <button className="w-full flex justify-center items-center">
                                            <FiEye
                                                className="text-gray-500 hover:text-blue-700 cursor-pointer"
                                                onClick={() => navigate(`/vehicle-request-view/${vehicle.id}`)}
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
        </>
    )
}

export default VehicleList
