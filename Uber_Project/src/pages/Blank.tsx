import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { useState } from "react";

interface User {
  id: number;
  name: string;
  rideTime: string;
  date: string;
  reviews: string;
}

const usersData: User[] = [
  { id: 1, name: "Alice Smith", rideTime: "08:30 AM", date: "2025-03-21", reviews: "Excellent" },
  { id: 2, name: "Bob Johnson", rideTime: "09:15 AM", date: "2025-03-21", reviews: "Good" },
  { id: 3, name: "Charlie Brown", rideTime: "10:00 AM", date: "2025-03-21", reviews: "Average" },
  { id: 4, name: "Daisy Miller", rideTime: "11:45 AM", date: "2025-03-21", reviews: "Excellent" },
  { id: 5, name: "Ethan Davis", rideTime: "01:30 PM", date: "2025-03-21", reviews: "Poor" },
  { id: 6, name: "Fiona Green", rideTime: "02:15 PM", date: "2025-03-21", reviews: "Good" },
  { id: 7, name: "George King", rideTime: "03:00 PM", date: "2025-03-21", reviews: "Excellent" },
  { id: 8, name: "Hannah White", rideTime: "04:20 PM", date: "2025-03-21", reviews: "Good" },
  { id: 9, name: "Ian Black", rideTime: "05:10 PM", date: "2025-03-21", reviews: "Average" },
  { id: 10, name: "Charlie Brown", rideTime: "10:00 AM", date: "2025-03-21", reviews: "Average" },

];

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const getPaginationRange = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (left > 1) {
      range.unshift(1);
      if (left > 2) {
        range.splice(1, 0, "...");
      }
    }

    if (right < totalPages) {
      range.push(totalPages);
      if (right < totalPages - 1) {
        range.splice(range.length - 1, 0, "...");
      }
    }

    return range;
  };

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      {getPaginationRange().map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            className={`px-3 py-1 border rounded ${
              currentPage === page ? "bg-gray-300 font-bold" : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-3 py-1">
            {page}
          </span>
        )
      )}
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default function Blank() {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Calculate the total number of pages
  const totalPages = Math.ceil(usersData.length / recordsPerPage);

  // Get the data for the current page
  const currentData = usersData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div>
      <PageMeta
        title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Customers List" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-center text-blue-500" style={{ fontSize: "25px" }}>
          --- Users List ---
        </h2>
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ride Time
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Reviews
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {currentData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    {user.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.rideTime}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.date}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.reviews}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
















// import PageBreadcrumb from "../components/common/PageBreadCrumb";
// import PageMeta from "../components/common/PageMeta";

// export default function Blank() {
//   return (
//     <div>
//       <PageMeta
//         title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
//         description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
//       />
//       <PageBreadcrumb pageTitle="Customers List" />
//       {/* <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
//         <div className="mx-auto w-full max-w-[630px] text-center">
//           <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
//             Card Title Here
//           </h3>

//           <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
//             Start putting content on grids or panels, you can also use different
//             combinations of grids.Please check out the dashboard and other pages
//           </p>
          
//         </div>
//       </div> */}
//     </div>
//   );
// }
