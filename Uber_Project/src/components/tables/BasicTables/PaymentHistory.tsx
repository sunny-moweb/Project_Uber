import { useEffect, useState } from 'react';
import API from '../../auth/axiosInstance';
import Pagination from '../../common/Pagination';
import PageMeta from '../../common/PageMeta';
import PageBreadcrumb from '../../common/PageBreadCrumb';

type Payment = {
    id: number;
    trip_id: number;
    first_name: string;
    last_name: string;
    amount: number;
    status:boolean;
};

const ITEMS_PER_PAGE = 5;

const PaymentHistory = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [sortColumn, setSortColumn] = useState<string | null>(null);


    //! API for drivers-list----------------
    const fetchPayments = async () => {
        try {

            const params: any = {};
            // const ordering = sortOrder === "asc" ? sortColumn : `-${sortColumn}`;
            if (sortColumn) {
                params.ordering = sortColumn;
            }

            const response = await API.get('/paymentListView', {
                params,
            });
            setPayments(response.data || []);
        } catch (error) {
            console.error("Failed to fetch payments", error);
        }
    };

    // Refetch on sort change
    useEffect(() => {
        setCurrentPage(1);
        fetchPayments();
    }, [sortColumn, sortOrder]);

    const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentPayments = payments.slice(startIndex, startIndex + ITEMS_PER_PAGE);


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
                            <th className="text-left px-4 py-3 border-b">First Name</th>
                            <th className="text-left px-4 py-3 border-b">Last Name</th>
                            <th className="text-left px-4 py-3 border-b">Ride Amount</th>
                            <th className="text-left px-4 py-3 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPayments.map((payment, index) => (
                            <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border px-4 py-2 ">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-4 py-3 border-b">{payment.first_name}</td>
                                <td className="px-4 py-3 border-b">{payment.last_name}</td>
                                <td className="px-4 py-3 border-b">Rs: {payment.amount}</td>
                                <td className="px-4 py-3 border-b">{payment.status ? 'Completed' : 'Pending'}</td>
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

export default PaymentHistory;