import { useEffect, useState } from 'react';
import API from '../auth/axiosInstance';
import Pagination from '../common/Pagination';
import PageBreadcrumb from '../common/PageBreadCrumb';
// import Header from '../../common/Header';

type Driver = {
    id: number;
    first_name: string;
    last_name: string;
    mobile_number: string;
};

const ITEMS_PER_PAGE = 5;

const RecentDrivers = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [sortColumn, setSortColumn] = useState<string | null>(null);


    //! API for drivers-list----------------
    const fetchDrivers = async () => {
        try {

            const params: any = {};
            // const ordering = sortOrder === "asc" ? sortColumn : `-${sortColumn}`;
            if (sortColumn) {
                params.ordering = sortColumn;
            }

            const response = await API.get('/driverDraftView', {
                params,
            });
            setDrivers(response.data || []);
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        }
    };

    // Refetch on sort change
    useEffect(() => {
        setCurrentPage(1);
        fetchDrivers();
    }, [sortColumn, sortOrder]);

    const totalPages = Math.ceil(drivers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentDrivers = drivers.slice(startIndex, startIndex + ITEMS_PER_PAGE);


    return (
        <>
            <PageBreadcrumb pageTitle="Recent Drivers" />
            <div className="m-6">
                {/* <h2 className=" mb-4 text-center text-green-500" style={{ fontSize: "25px" }}>--- Draft Drivers ---</h2> */}
                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2">S.No</th>
                            <th className="text-left px-4 py-3 border-b">First Name</th>
                            <th className="text-left px-4 py-3 border-b">Last Name</th>
                            <th className="text-left px-4 py-3 border-b">Mobile Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDrivers.map((driver, index) => (
                            <tr key={driver.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border px-6 py-2 ">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-6 py-3 border-b">{driver.first_name}</td>
                                <td className="px-6 py-3 border-b">{driver.last_name}</td>
                                <td className="px-4 py-3 border-b">{driver.mobile_number}</td>
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

export default RecentDrivers;