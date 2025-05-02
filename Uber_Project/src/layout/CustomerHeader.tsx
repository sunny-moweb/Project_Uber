// import { useEffect, useRef, useState } from "react";
// import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
// import NotificationDropdown from "../components/header/NotificationDropdown";
// import CustomerDropdown from "../components/header/CustomerDropdown";

// const CustomerHeader: React.FC = () => {
//     const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);


//     const inputRef = useRef<HTMLInputElement>(null);

//     useEffect(() => {
//         const handleKeyDown = (event: KeyboardEvent) => {
//             if ((event.metaKey || event.ctrlKey) && event.key === "k") {
//                 event.preventDefault();
//                 inputRef.current?.focus();
//             }
//         };

//         document.addEventListener("keydown", handleKeyDown);

//         return () => {
//             document.removeEventListener("keydown", handleKeyDown);
//         };
//     }, []);

//     return (
//         <header className="sticky top-0 w-full bg-white border-gray-200 z-50 dark:border-gray-800 dark:bg-gray-900 border-b">
//             <div className="mx-auto w-full max-w-screen-2xl flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

//                 <div
//                     className={`${isApplicationMenuOpen ? "flex" : "hidden"
//                         } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
//                 >
//                     <div className="flex items-center gap-2 2xsm:gap-3">
//                         {/* <!-- Dark Mode Toggler --> */}
//                         <ThemeToggleButton />
//                         {/* <!-- Dark Mode Toggler --> */}
//                         <NotificationDropdown />
//                         {/* <!-- Notification Menu Area --> */}
//                     </div>
//                     {/* <!-- User Area --> */}
//                     <CustomerDropdown />
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default CustomerHeader;

import { useEffect, useRef, useState } from "react";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import CustomerDropdown from "../components/header/CustomerDropdown";
import { Link, useNavigate } from "react-router-dom";

const CustomerHeader: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate

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
            {/* No margins or padding added here */}
            <div className="w-full flex items-center justify-center">
                <div className="w-full flex items-center justify-between px-6 py-4">
                    <Link to="/customer/home" className="">
                        <h2 style={{ color: 'blue', fontSize: '25px' }}>Customer Dashboard</h2>
                    </Link>
                    <div className="flex items-center gap-3 ml-195">
                        {/* <ThemeToggleButton /> */}
                        {/* <NotificationDropdown /> */}
                    </div>
                    <CustomerDropdown />
                </div>
            </div>
        </header>
    );
};

export default CustomerHeader;

