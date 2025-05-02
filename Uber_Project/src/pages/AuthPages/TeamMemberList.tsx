import { useEffect, useState } from 'react';
import API from '../../components/auth/axiosInstance';
import Pagination from '../../components/common/Pagination';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { FiArrowDown, FiArrowUp } from 'react-icons/fi';
import { RiDeleteBin5Fill } from "react-icons/ri"
import SearchField from '../../components/common/Filters/SearchField';
import { FaEdit } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import { toast, ToastContainer } from 'react-toastify';
import { useLoader } from '../../components/common/LoaderContext';
import { MdTransferWithinAStation } from "react-icons/md";
import { type } from 'os';



type TeamM = {
    type: string;
    id: number;
    name: string;
    mobile_number: string;
    email: string;
    role_name: string;
    created_at: string;
};

interface RoleOption {
    value: number;
    label: string;
}

const ITEMS_PER_PAGE = 5;

const TeamMemberList = () => {
    const [teamMember, setTeamMember] = useState<TeamM[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const { isOpen, openModal, closeModal } = useModal();
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
    //* Loader
    const { showLoader, hideLoader } = useLoader();

    const navigate = useNavigate();

    //! API for drivers-list------------------>
    const fetchDrivers = async () => {
        try {

            const params: any = {};
            // const ordering = sortOrder === "asc" ? sortColumn : `-${sortColumn}`;
            if (searchTerm) params.search = searchTerm;

            if (sortColumn) {
                params.ordering = sortColumn;
            }

            const response = await API.get('/listTeamMemberView', {
                params,
            });
            setTeamMember(response.data || []);
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        }
    };

    //* API Modal-Data
    const [formData, setFormData] = useState<{
        id: number | null,
        first_name: string;
        last_name: string;
        email: string;
        mobile_number: string;
        gender: string;
        role: RoleOption | null;
    }>({
        id: null,
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        gender: "",
        role: null,
    });

    //! Modal Data display API----------------------->
    const fetchProfile = async (id: number) => {
        try {
            const response = await API.get(`/updateTeamMemberView/${id}`);
            console.log('API Response:', response.data);
            const { role, role_id, role_name, ...rest } = response.data;
            setFormData({
                ...rest,
                id,
                role: {
                    value: role_id,
                    label: role_name,
                },
            });
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    //! for Role-API in Modal--------------------------------->
    const loadOptions: LoadOptions<RoleOption, any, { page?: number }> = async (
        inputValue,
        _,
    ) => {
        // const page = additional?.page || 1; // Default to page 1
        const pageSize = 10;
        try {
            const response = await API.get("/roleListView", {
                params: { search: inputValue, pageSize },
            });

            const options = response.data.map((Role: { id: number; role_name: string }) => ({
                value: Role.id,
                label: Role.role_name,
            }));

            return {
                options,
                hasMore: false,
            };
        } catch (error: any) {
            console.error("Error fetching languages:", error.message);
            return { options: [], hasMore: false };
        }
    };

    const handleOpenModal = (id: number) => {
        openModal();
        fetchProfile(id);
    };

    //! API for update TeamMember------------------------------>
    const handleSave = async () => {
        try {
            showLoader();
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                mobile_number: formData.mobile_number,
                gender: formData.gender,
                role: formData.role ? formData.role.value : null,
            };
            console.log("formdataId---------", formData.id);

            // Use formData.id here, which will have the correct value set from the modal.
            await API.patch(`/updateTeamMemberView/${formData.id}`, payload);

            setTimeout(() => {
                toast.success("Profile updated successfully!");
                closeModal();
            }, 1500);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile.");
        } finally {
            hideLoader();
        }
    };

    //! API for Delete Team-Member
    const handleDelete = async (id: number) => {
        try {
            showLoader();
            await API.delete(`/destroyTeamMemberView/${id}`);
            toast.success("Team member deleted successfully!");

        } catch (error) {
            console.error("Error deleting team member:", error);
            toast.error("Failed to delete team member.");
        } finally {
            hideLoader();
        }
    };

    //! Impersonation-Action API-------------------------------->
    const handleImpersonation = async (id: number, type: string) => {
        try {
            const res = await API.post("/ImpersonationView", { id, type });

            if (res.data.status === "success") {
                const { access, refresh, role } = res.data.data;

                localStorage.setItem("impersonation_access_token", access);
                localStorage.setItem("impersonation_refresh_token", refresh);
                localStorage.setItem("impersonation_role", role);
                const currentURL = window.location.href;
                localStorage.setItem("lastVisitedURL", currentURL);
                navigate("/home");

                window.location.reload();
            }
        } catch (error) {
            toast.error("Error during processing!");
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchDrivers();
    }, [searchTerm, sortColumn, sortOrder]);

    const totalPages = Math.ceil(teamMember.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentTeamMember = teamMember.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    //! Action-Buttons-Access
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
    const canEdit = permissions.includes("edit_team_member");
    const canDelete = permissions.includes("remove_team_member");
    const viewMember = permissions.includes("view_team_members");

    return (
        <>
            <PageMeta
                title="React.js Team Member List"
                description="This is React.js Team Member List Dashboard page"
            />
            <PageBreadcrumb pageTitle="Team Member List" />
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            <div className="flex justify-between items-center px-4 py-2 mt-4">
                {/* Search field */}
                <SearchField
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search here..."
                />
            </div>
            <div className="m-6">
                {/* <h2 className=" mb-4 text-center text-green-500" style={{ fontSize: "25px" }}>--- Draft Drivers ---</h2> */}
                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2">S.No</th>
                            <th
                                className="text-left px-4 py-3 border-b cursor-pointer"
                                onClick={() => {
                                    setSortColumn("name");
                                    setSortOrder(
                                        sortColumn === "name" && sortOrder === "asc" ? "desc" : "asc"
                                    );
                                }}
                            >
                                <div className="flex items-center gap-1">
                                    Name
                                    <div className="flex ml-1 gap-1">
                                        <FiArrowUp
                                            className={
                                                sortColumn === "name" && sortOrder === "asc"
                                                    ? "text-black"
                                                    : "text-gray-400"
                                            }
                                        />
                                        <FiArrowDown
                                            className={
                                                sortColumn === "name" && sortOrder === "desc"
                                                    ? "text-black"
                                                    : "text-gray-400"
                                            }
                                        />
                                    </div>
                                </div>
                            </th>
                            <th className="text-left px-4 py-3 border-b">Mobile Number</th>
                            <th className="text-left px-4 py-3 border-b">Email</th>
                            <th className="text-left px-4 py-3 border-b">Role</th>
                            <th
                                className="text-left px-8 py-3 border-b cursor-pointer"
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
                            <th className="text-left px-16 py-3 border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTeamMember.map((teamM, index) => (
                            <tr key={teamM.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border px-4 py-2 ">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-4 py-3 border-b">{teamM.name}</td>
                                <td className="px-4 py-3 border-b">{teamM.mobile_number}</td>
                                <td className="px-4 py-3 border-b">{teamM.email}</td>
                                <td className="px-4 py-3 border-b">{teamM.role_name}</td>
                                <td className="px-4 py-3 border-b">{new Date(teamM.created_at).toLocaleString()}</td>

                                <td className="px-4 py-2">
                                    <button className="flex justify-center items-center w-40">
                                        <div className="flex items-center space-x-2">
                                            {canEdit && (
                                                <FaEdit
                                                    className="text-xl text-gray-500 hover:text-blue-700 cursor-pointer"
                                                    onClick={() => handleOpenModal(teamM.id)}
                                                />
                                            )}
                                            {canDelete && (
                                                <RiDeleteBin5Fill
                                                    className="text-xl text-gray-500 hover:text-red-700 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedDeleteId(teamM.id);
                                                        setShowConfirmDelete(true);
                                                    }}
                                                />
                                            )}
                                            {viewMember && (
                                                <MdTransferWithinAStation
                                                    className="text-xl text-gray-500 hover:text-red-700 cursor-pointer"
                                                    onClick={() => handleImpersonation(teamM.id, teamM.type)}
                                                />
                                            )}
                                        </div>

                                        {showConfirmDelete && (
                                            <div className="fixed inset-0 backdrop-blur-sm  flex justify-center items-center z-50">
                                                <div className="bg-white p-6 rounded-xl shadow-xl w-96">
                                                    <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                                                    <p>Are you sure you want to delete this team member?</p>
                                                    <div className="flex justify-end mt-6 space-x-4">
                                                        <button
                                                            onClick={() => setShowConfirmDelete(false)}
                                                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (selectedDeleteId !== null) {
                                                                    handleDelete(selectedDeleteId);
                                                                }
                                                                setShowConfirmDelete(false);
                                                            }}
                                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Edit-teammeber Modal */}
                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
                    <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-2xl bg-white p-4 dark:bg-gray-900">
                        <div className="px-2 pr-10">
                            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
                                Edit Team Member Information
                            </h4>
                        </div>

                        <form className="flex flex-col">
                            <div className="custom-scrollbar max-h-[300px] overflow-y-auto px-2 pb-3">
                                {/* Personal Information */}
                                <div>
                                    <h5 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                                        Team Member Information
                                    </h5>
                                    <div className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
                                        <div>
                                            <Label>First Name</Label>
                                            <Input
                                                type="text"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Last Name</Label>
                                            <Input
                                                type="text"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Email Address</Label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Phone</Label>
                                            <Input
                                                type="text"
                                                value={formData.mobile_number}
                                                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>Gender</Label>
                                            <select
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                value={formData.gender || ''}
                                                onChange={(e) => {
                                                    const newGender = e.target.value;
                                                    console.log("Selected gender:", newGender);
                                                    setFormData({ ...formData, gender: newGender });
                                                }}
                                            >
                                                <option value="" disabled>Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label>Role</Label>
                                            <AsyncPaginate<RoleOption, any, { page?: number }>
                                                id="rolePreference"
                                                loadOptions={loadOptions}
                                                additional={{ page: 1 }}
                                                onChange={(selectedOption) => {
                                                    setFormData({ ...formData, role: selectedOption });
                                                }}
                                                value={formData.role}
                                                placeholder="Select Role...."
                                                debounceTimeout={600}
                                                styles={{
                                                    option: (provided) => ({
                                                        ...provided,
                                                        color: "black",
                                                    }),
                                                }}
                                            />

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 px-2 mt-4">
                                <Button size="sm" variant="outline" onClick={closeModal}>
                                    Close
                                </Button>
                                <button type="button" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>

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

export default TeamMemberList;