import { useEffect, useState } from 'react';
import API from '../../auth/axiosInstance';
import Pagination from '../../common/Pagination';
import { useNavigate } from 'react-router-dom';
import { FiArrowDown, FiArrowUp, FiEye } from 'react-icons/fi';
import SearchField from "../../common/Filters/SearchField";
import DateFilter from '../../common/Filters/DateFilter';
import PageMeta from '../../common/PageMeta';
import PageBreadcrumb from '../../common/PageBreadCrumb';


type Driver = {
  id: number;
  first_name: string;
  last_name: string;
  mobile_number: string;
  created_at: string;
  action_at: string | null;
  verification_code: string;
};

const ITEMS_PER_PAGE = 5;

const DriversTable = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const navigate = useNavigate();

  //! API for drivers-list
  const fetchDrivers = async (startDate: Date | null = null, ) => {
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

      const response = await API.get("/driverListView", {
       params,
      });
      setDrivers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch drivers", error);
    }
  };

  // useEffect(() => {
  //   const fetchDrivers = async (
  //     search = "",
  //     startDate: Date | null = null,
  //   ) => {

  //     try {
  //       const token = localStorage.getItem("access_token");
  //       const params: any = {};
  //       if (search) params.search = search;
  //       if (startDate) {
  //         const formatDate = (date: Date) => 
  //           `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  //         params.start_date = formatDate(startDate);
  //     }
  //       const response = await API.get('/driverList', {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       setDrivers(response.data || []);
  //     } catch (error) {
  //       console.error("Failed to fetch drivers", error);
  //     }
  //   };
  //   fetchDrivers();
  // }, []);

  //* Filters-------------------------------
  //^ Search-filter
  const filteredData = drivers.filter((driver) => {
    const fullName = `${driver.first_name} ${driver.last_name}`;
    const mobile = driver.mobile_number;

    return (
      fullName.includes(searchTerm) || mobile.includes(searchTerm.toUpperCase())
    );
  })

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentDrivers = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchDrivers();
  }, [searchTerm, startDate, sortColumn, sortOrder]);

  return (
    <>
      <PageMeta
        title="React.js Driver List Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Driver List Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Driver List" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex justify-between items-center px-4 py-2">
          {/* Search field */}
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search here..."
          />
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            {/* <StatusDropdown value={statusFilter} onChange={handleStatusChange} options={["pending", "approved", "rejected"]}/> */}

            {/* Calendar Icon and DatePicker */}
            <div className="relative mt-3">
              <DateFilter selectedDate={startDate} onChange={setStartDate} />
            </div>
          </div>
        </div>
        {/* <h2 className=" mb-4 text-center text-green-500" style={{ fontSize: "25px" }}>--- Drivers ---</h2> */}
        <div className="max-w-full overflow-x-auto m-4 border-radius-4">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                {/* <th className="text-left px-4 py-3 border-b">ID</th> */}
                <th className="text-left px-4 py-3 border-b">S.No</th>
                {/* <th className="text-left px-4 py-3 border-b">First Name</th> */}
                <th
                  className="text-left px-4 py-3 border-b cursor-pointer"
                  onClick={() => {
                    setSortColumn("user__first_name");
                    setSortOrder(
                      sortColumn === "user__first_name" && sortOrder === "asc" ? "desc" : "asc"
                    );
                  }}
                >
                  <div className="flex items-center gap-1">
                    First Name
                    <div className="flex ml-1 gap-1">
                      <FiArrowUp
                        className={
                          sortColumn === "user__first_name" && sortOrder === "asc"
                            ? "text-black"
                            : "text-gray-400"
                        }
                      />
                      <FiArrowDown
                        className={
                          sortColumn === "user__first_name" && sortOrder === "desc"
                            ? "text-black"
                            : "text-gray-400"
                        }
                      />
                    </div>
                  </div>
                </th>
                <th className="text-left px-4 py-3 border-b">Last Name</th>
                <th className="text-left px-4 py-3 border-b">Mobile Number</th>
                {/* <th className="text-left px-4 py-3 border-b">Registered At</th> */}
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
                {/* <th className="text-left px-4 py-3 border-b">Verified At</th> */}
                <th className="text-left px-4 py-3 border-b" style={{ width: "60px", maxWidth: "60px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentDrivers.map((driver, index) => (
                <tr key={driver.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {/* <td className="px-4 py-3 border-b">{driver.id}</td> */}
                  <td className="border px-4 py-2">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                  <td className="px-4 py-3 border-b">{driver.first_name}</td>
                  <td className="px-4 py-3 border-b">{driver.last_name}</td>
                  <td className="px-4 py-3 border-b">{driver.mobile_number}</td>
                  <td className="px-4 py-3 border-b">{new Date(driver.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 border-b">
                    {driver.action_at ? new Date(driver.action_at).toLocaleString() : 'Not Verified'}
                  </td>
                  <td className="px-4 py-3 border-b" style={{ width: "60px", maxWidth: "60px" }}>
                    <button className="w-full flex justify-center items-center">
                      <FiEye
                        className="text-gray-500 hover:text-blue-700 cursor-pointer"
                        onClick={() => navigate(`/driver-details/${driver.id}`)}
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
  );
};

export default DriversTable;












// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHeader,
//   TableRow,
// } from "../../ui/table";

// import Badge from "../../ui/badge/Badge";
// import { useState } from "react";

// interface Order {
//   id: number;
//   user: {
//     image: string;
//     name: string;
//     role: string;
//   };
//   projectName: string;
//   team: {
//     images: string[];
//   };
//   status: string;
//   budget: string;
// }

// // Define the table data using the interface
// const tableData: Order[] = [
//   {
//     id: 1,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Lindsey Curtis",
//       role: "Web Designer",
//     },
//     projectName: "Agency Website",
//     team: {
//       images: [
//         "/images/user/user-22.jpg",
//         "/images/user/user-23.jpg",
//         "/images/user/user-24.jpg",
//       ],
//     },
//     budget: "3.9K",
//     status: "Active",
//   },
//   {
//     id: 2,
//     user: {
//       image: "/images/user/user-18.jpg",
//       name: "Kaiya George",
//       role: "Project Manager",
//     },
//     projectName: "Technology",
//     team: {
//       images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
//     },
//     budget: "24.9K",
//     status: "Pending",
//   },
//   {
//     id: 3,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Zain Geidt",
//       role: "Content Writing",
//     },
//     projectName: "Blog Writing",
//     team: {
//       images: ["/images/user/user-27.jpg"],
//     },
//     budget: "12.7K",
//     status: "Active",
//   },
//   {
//     id: 4,
//     user: {
//       image: "/images/user/user-20.jpg",
//       name: "Abram Schleifer",
//       role: "Digital Marketer",
//     },
//     projectName: "Social Media",
//     team: {
//       images: [
//         "/images/user/user-28.jpg",
//         "/images/user/user-29.jpg",
//         "/images/user/user-30.jpg",
//       ],
//     },
//     budget: "2.8K",
//     status: "Cancel",
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       role: "Front-end Developer",
//     },
//     projectName: "Website",
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     budget: "4.5K",
//     status: "Active",
//   },
//   {
//     id: 6,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "George",
//       role: "Front-end Developer",
//     },
//     projectName: "React",
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     budget: "4.5K",
//     status: "Active",
//   },
//   {
//     id: 7,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Zain Geidt",
//       role: "Content Writing",
//     },
//     projectName: "Blog Writing",
//     team: {
//       images: ["/images/user/user-27.jpg"],
//     },
//     budget: "12.7K",
//     status: "Active",
//   },
//   {
//     id: 8,
//     user: {
//       image: "/images/user/user-20.jpg",
//       name: "Lindsey Curtis",
//       role: "Web Designer",
//     },
//     projectName: "Agency Website",
//     team: {
//       images: [
//         "/images/user/user-22.jpg",
//         "/images/user/user-23.jpg",
//         "/images/user/user-24.jpg",
//       ],
//     },
//     budget: "3.9K",
//     status: "Active",
//   },
// ];

// const Pagination = ({
//   currentPage,
//   totalPages,
//   onPageChange,
// }: {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
// }) => {
//   const getPaginationRange = () => {
//     const delta = 2; // Adjust how many page numbers to show around the current page
//     const range: (number | string)[] = [];
//     const left = Math.max(1, currentPage - delta);
//     const right = Math.min(totalPages, currentPage + delta);

//     for (let i = left; i <= right; i++) {
//       range.push(i);
//     }

//     if (left > 1) {
//       range.unshift(1);
//       if (left > 2) {
//         range.splice(1, 0, "...");
//       }
//     }

//     if (right < totalPages) {
//       range.push(totalPages);
//       if (right < totalPages - 1) {
//         range.splice(range.length - 1, 0, "...");
//       }
//     }

//     return range;
//   };

//   return (
//     <div className="flex items-center justify-center gap-2 p-4">
//       <button
//         className="px-3 py-1 border rounded disabled:opacity-50"
//         disabled={currentPage === 1}
//         onClick={() => onPageChange(currentPage - 1)}
//       >
//         Prev
//       </button>
//       {getPaginationRange().map((page, index) =>
//         typeof page === "number" ? (
//           <button
//             key={index}
//             className={`px-3 py-1 border rounded ${
//               currentPage === page ? "bg-gray-300 font-bold" : ""
//             }`}
//             onClick={() => onPageChange(page)}
//           >
//             {page}
//           </button>
//         ) : (
//           <span key={index} className="px-3 py-1">
//             {page}
//           </span>
//         )
//       )}
//       <button
//         className="px-3 py-1 border rounded disabled:opacity-50"
//         disabled={currentPage === totalPages}
//         onClick={() => onPageChange(currentPage + 1)}
//       >
//         Next
//       </button>
//     </div>
//   );
// };

// export default function BasicTableOne() {

//   const [currentPage, setCurrentPage] = useState(1);
//   const recordsPerPage = 3;

//   // Calculate the total number of pages
//   const totalPages = Math.ceil(tableData.length / recordsPerPage);

//   // Get the data for the current page
//   const currentData = tableData.slice(
//     (currentPage - 1) * recordsPerPage,
//     currentPage * recordsPerPage
//   );



//   return (
//     <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
//       <div className="max-w-full overflow-x-auto">
//         <Table>
//           {/* Table Header */}
//           <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
//             <TableRow>
//               <TableCell
//                 isHeader
//                 className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
//               >
//                 User
//               </TableCell>
//               <TableCell
//                 isHeader
//                 className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
//               >
//                 Project Name
//               </TableCell>
//               <TableCell
//                 isHeader
//                 className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
//               >
//                 Team
//               </TableCell>
//               <TableCell
//                 isHeader
//                 className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
//               >
//                 Status
//               </TableCell>
//               <TableCell
//                 isHeader
//                 className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
//               >
//                 Budget
//               </TableCell>
//             </TableRow>
//           </TableHeader>

//           {/* Table Body */}
//           <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
//             {currentData.map((order) => (
//               <TableRow key={order.id}>
//                 <TableCell className="px-5 py-4 sm:px-6 text-start">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 overflow-hidden rounded-full">
//                       <img
//                         width={40}
//                         height={40}
//                         src={order.user.image}
//                         alt={order.user.name}
//                       />
//                     </div>
//                     <div>
//                       <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
//                         {order.user.name}
//                       </span>
//                       <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
//                         {order.user.role}
//                       </span>
//                     </div>
//                   </div>
//                 </TableCell>
//                 <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
//                   {order.projectName}
//                 </TableCell>
//                 <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
//                   <div className="flex -space-x-2">
//                     {order.team.images.map((teamImage, index) => (
//                       <div
//                         key={index}
//                         className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
//                       >
//                         <img
//                           width={24}
//                           height={24}
//                           src={teamImage}
//                           alt={`Team member ${index + 1}`}
//                           className="w-full size-6"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </TableCell>
//                 <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
//                   <Badge
//                     size="sm"
//                     color={
//                       order.status === "Active"
//                         ? "success"
//                         : order.status === "Pending"
//                         ? "warning"
//                         : "error"
//                     }
//                   >
//                     {order.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
//                   {order.budget}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//       {/* Pagination */}
//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={setCurrentPage}
//       />
//     </div>
//   );
// }
