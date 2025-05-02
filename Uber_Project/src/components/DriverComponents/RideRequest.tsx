import React from 'react'
import { toast, ToastContainer } from "react-toastify";
import API from "../../components/auth/axiosInstance";
import PageMeta from "../../components/common/PageMeta";
import DriverPageBreadcrumb from '../common/DriverPageBreadCrumb';

interface RideRequestDetails {
    id: number;
    from: string | number;
    to: string | number;
    fare: string | number;
}

const RideRequest = () => {
    return (
        <>
            <PageMeta
                title="React.js Driver Ride Request Dashboard"
                description="This is React.js Driver Ride Request page"
            />
            <DriverPageBreadcrumb pageTitle="Ride Requests list" />
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            <div className='m-6'>
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left px-4 py-3 border-b">From</th>
                            <th className="text-left px-4 py-3 border-b">To</th>
                            <th className="text-left px-4 py-3 border-b">Fare/Price</th>
                            <th className="text-left px-4 py-3 border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tbody>    
                </table>
            </div>
        </>
    )
}

export default RideRequest
