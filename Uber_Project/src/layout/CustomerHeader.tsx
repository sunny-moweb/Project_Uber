import { useEffect, useRef, useState } from "react";
import CustomerDropdown from "../components/header/CustomerDropdown";
import { Link, useNavigate } from "react-router-dom";

const CustomerHeader: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate()

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "k") {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <header className="sticky top-0 w-full bg-white z-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <Link to="/customer/home">
                    <h2 className="text-xl sm:text-2xl font-semibold text-blue-600">Ride Booking</h2>
                </Link>
                <div className="flex items-center space-x-4">
                    {/* <ThemeToggleButton /> */}
                    {/* <NotificationDropdown /> */}
                    <CustomerDropdown />
                </div>
            </div>
        </header>
    );
};

export default CustomerHeader;

