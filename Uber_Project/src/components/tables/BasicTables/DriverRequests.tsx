// New code
import Badge from "../../ui/badge/Badge";
import { useEffect, useState } from "react";
import API from "../../auth/axiosInstance";
import { FiEye, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../common/PageMeta";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "../../common/Pagination";
//* filters
import SearchField from "../../common/Filters/SearchField";
import DateFilter from "../../common/Filters/DateFilter";
import StatusDropdown from "../../common/Filters/StatusDropdown";

interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  mobile_number: string;
  status: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 5;

//* Pagination--------------------
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
//     const delta = 2;
//     const range: (number | string)[] = [];
//     const left = Math.max(1, currentPage - delta);
//     const right = Math.min(totalPages, currentPage + delta);

//     for (let i = left; i <= right; i++) {
//       range.push(i);
//     }

//     if (left > 1) {
//       range.unshift(1);
//       if (left > 2) range.splice(1, 0, "...");
//     }

//     if (right < totalPages) {
//       range.push(totalPages);
//       if (right < totalPages - 1) range.splice(range.length - 1, 0, "...");
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

export default function DriverRequests() {
  const [data, setData] = useState<Driver[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  // const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, setStartDate] = useState<Date | null>(null);

  const recordsPerPage = 5; //*Number of data per page

  //! API for driver-data----------------------
  const fetchDrivers = async (
  ) => {
    try {
      const params: any = {};
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (searchTerm) params.search = searchTerm;
      if (startDate) {
        const formatDate = (date: Date) =>
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        params.start_date = formatDate(startDate);
      }
      if (sortColumn) {
        params.ordering = sortOrder === "asc" ? sortColumn : `-${sortColumn}`;
      }

      const response = await API.get(`/adminDriverStatusList`, {
        params,
      });
      setData(response.data || []);
      // const { verification_code } = response.data;
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };


  //* Filters-------------------------------
  //^ Search-filter
  const filteredData = data.filter((driver) => {
    const fullName = `${driver.first_name} ${driver.last_name}`;
    const mobile = driver.mobile_number;

    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      mobile.includes(searchTerm.toLowerCase())
    );
  })

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
  ];

  const handleStatusChange = (selectedStatus: string) => {
    setStatusFilter(selectedStatus);
  };


  useEffect(() => {
    fetchDrivers();
  }, [statusFilter, searchTerm, startDate, sortColumn, sortOrder]);



  return (
    <>
      <PageMeta
        title="React.js Driver List Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Driver List Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Driver Requests" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

        <div className="flex justify-between items-center px-4 py-2 mt-4">
          {/* Search field */}
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search here..."
          />

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <StatusDropdown value={statusFilter} onChange={handleStatusChange} options={statusOptions} />

            {/* Calendar Icon and DatePicker */}
            <div className="relative mt-3">
              <DateFilter selectedDate={startDate} onChange={setStartDate} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto m-4 border-radius-4">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-3 border-b">S.No</th>
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
                <th className="text-left px-4 py-3 border-b">Status</th>
                <th className="text-left px-18 py-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(currentData) && currentData.map((driver, index) => (
                <tr key={driver.id}>
                  <td className="border px-4 py-2 border-b">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-4 py-2">{driver.first_name}</td>
                  <td className="px-4 py-2">{driver.last_name}</td>
                  <td className="px-4 py-2">{driver.mobile_number}</td>
                  <td className="px-4 py-2">
                    {new Date(driver.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <Badge
                      color={
                        driver.status.toLowerCase() === "approved"
                          ? "success"
                          : driver.status.toLowerCase() === "pending"
                            ? "warning"
                            : "error"
                      }
                    >
                      {driver.status[0].toUpperCase() + driver.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <button className="flex justify-center items-center w-40">
                      <FiEye
                        className="text-gray-500 hover:text-blue-700"
                        onClick={() =>
                          navigate(`/driver-request-details/${driver.id}`)
                        }
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}