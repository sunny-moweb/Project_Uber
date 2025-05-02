import { useEffect, useState } from 'react';
import API from '../auth/axiosInstance';
import Pagination from '../common/Pagination';
import PageMeta from '../common/PageMeta';
import PageBreadcrumb from '../common/PageBreadCrumb';
// import Header from '../../common/Header';

type Driver = {
    id: number;
    name: string;
    mobile_number: string;
    created_at: string;
    verified_at:string;
};

const ITEMS_PER_PAGE = 5;

const DraftVehicle = () => {
    const [vehicles, setVehicles] = useState<Driver[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [sortColumn, setSortColumn] = useState<string | null>(null);


    //! API for drivers-list----------------
    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const params: any = {};
            if (sortColumn) {
                params.ordering = sortColumn;
            }

            const response = await API.get('/draftVehicleListView', {
                params,
            });
            setVehicles(response.data || []);
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        }
    };

    // Refetch on sort change
    useEffect(() => {
        setCurrentPage(1);
        fetchVehicles();
    }, [sortColumn, sortOrder]);

    const totalPages = Math.ceil(vehicles.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentDrivers = vehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);


    return (
        <>
            <PageMeta
                title="React.js Draft Vehicle Dashboard"
                description="This is React.js Draft Vehicle Dashboard"
            />
            <PageBreadcrumb pageTitle="Draft Vehicles" />
            <div className="m-6">
                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2">S.No</th>
                            <th className="text-left px-4 py-3 border-b">Name</th>
                            <th className="text-left px-4 py-3 border-b">Mobile Number</th>
                            <th className="text-left px-4 py-3 border-b">Registered At</th>
                            <th className="text-left px-4 py-3 border-b">Verified At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDrivers.map((driver, index) => (
                            <tr key={driver.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border px-4 py-2 ">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-4 py-3 border-b">{driver.name}</td>
                                <td className="px-4 py-3 border-b">{driver.mobile_number}</td>
                                <td className="px-4 py-3 border-b">{new Date(driver.created_at).toLocaleString()}</td>
                                <td className="px-4 py-3 border-b">{new Date(driver.verified_at).toLocaleString()}</td>
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

export default DraftVehicle;