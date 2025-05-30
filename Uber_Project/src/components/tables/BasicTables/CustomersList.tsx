import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../../auth/axiosInstance';
import Pagination from '../../common/Pagination';
import PageMeta from '../../common/PageMeta';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import StatusDropdown from "../../common/Filters/StatusDropdown";
import { FiArrowDown, FiArrowUp } from 'react-icons/fi';

type Customer = {
    id: number;
    first_name: string;
    last_name: string;
    total_trips: number;
    mobile_number: string;
    created_at: string;
};

const ITEMS_PER_PAGE = 5;

const CustomersList = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    //* status-filter
    const [statusFilter, setStatusFilter] = useState("all");



    //! API for customer-list----------------
    const fetchDrivers = async () => {
        try {

            const params: any = {};
            // const ordering = sortOrder === "asc" ? sortColumn : `-${sortColumn}`;
            if (sortColumn) {
                params.ordering = sortOrder === "asc" ? sortColumn : `-${sortColumn}`;
            }
            if (statusFilter && statusFilter !== "all") {
                params.trip = statusFilter;
            }

            const response = await API.get('/customerListView', {
                params,
            });
            setCustomers(response.data || []);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        }
    };
    const handleStatusChange = (selectedStatus: string) => {
        setStatusFilter(selectedStatus);
    };
    const statusOptions = [
        { value: "all", label: "All" },
        { value: "with_trips", label: "With Trips" },
        { value: "without_trips", label: "Without Trips" },
    ];

    useEffect(() => {
        setCurrentPage(1);
        fetchDrivers();
    }, [statusFilter, sortColumn, sortOrder]);

    const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentCustomer = customers.slice(startIndex, startIndex + ITEMS_PER_PAGE);


    return (
        <>
            <PageMeta
                title="Admin Customer List Dashboard"
                description="This is React.js Customer List Dashboard page"
            />
            <PageBreadcrumb pageTitle="Customer's List" />
            <div className="m-6">

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

                    <div className="flex justify-between items-center px-4 py-2 mt-4">

                        <div className="flex items-center gap-3">
                            {/* Status Filter */}
                            <StatusDropdown value={statusFilter} onChange={handleStatusChange} options={statusOptions} />
                        </div>
                    </div>
                </div>

                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2">S.No</th>
                            <th
                                className="text-left px-4 py-3 border-b cursor-pointer"
                                onClick={() => {
                                    setSortColumn("first_name");
                                    setSortOrder(
                                        sortColumn === "first_name" && sortOrder === "asc" ? "desc" : "asc"
                                    );
                                }}
                            >
                                <div className="flex items-center gap-1">
                                    First Name
                                    <div className="flex ml-1 gap-1">
                                        <FiArrowUp
                                            className={
                                                sortColumn === "first_name" && sortOrder === "asc"
                                                    ? "text-black"
                                                    : "text-gray-400"
                                            }
                                        />
                                        <FiArrowDown
                                            className={
                                                sortColumn === "first_name" && sortOrder === "desc"
                                                    ? "text-black"
                                                    : "text-gray-400"
                                            }
                                        />
                                    </div>
                                </div>
                            </th>
                            <th className="text-left px-4 py-3 border-b">Last Name</th>
                            <th className="text-left px-4 py-3 border-b">Total Trips</th>
                            <th className="text-left px-4 py-3 border-b">Mobile Number</th>
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
                        </tr>
                    </thead>
                    <tbody>
                        {currentCustomer.map((customer, index) => (
                            <tr key={customer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border px-4 py-2 ">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-4 py-3 border-b">{customer.first_name}</td>
                                <td className="px-4 py-3 border-b">{customer.last_name}</td>
                                <td className="px-10 py-3 border-b">{customer.total_trips}</td>
                                <td className="px-4 py-3 border-b">{customer.mobile_number}</td>
                                <td className="px-4 py-3 border-b">{new Date(customer.created_at).toLocaleString()}</td>
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

export default CustomersList;