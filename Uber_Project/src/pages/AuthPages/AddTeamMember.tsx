import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import API from "../../components/auth/axiosInstance";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import { toast, ToastContainer } from "react-toastify";
import { useLoader } from "../../components/common/LoaderContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface RoleOption {
    value: number;
    label: string;
}

export default function AddTeamMember() {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);


    //* Loader
    const { showLoader, hideLoader } = useLoader();

    const formik = useFormik<{
        first_name: string;
        last_name: string;
        mobile_number: string;
        email: string;
        password: string | number;
        gender: string;
        role: RoleOption | null;
    }>({
        initialValues: {
            first_name: "",
            last_name: "",
            mobile_number: "",
            email: "",
            password: "",
            gender: "",
            role: null,
        },
        validationSchema: Yup.object({
            first_name: Yup.string()
                .max(15, "Must be 15 characters or less")
                .required("First name is required"),
            last_name: Yup.string()
                .max(20, "Must be 20 characters or less")
                .required("Last name is required"),
            mobile_number: Yup.string()
                .matches(/\+91[6-9]\d{9}$/, "Invalid mobile number")
                .required("Mobile number is required!"),
            email: Yup.string()
                .required("Email is required")
                .email("Enter a valid email"),
            password: Yup.string()
                .required("Password is required!"),
            gender: Yup.string().required("Gender is required!"),
            role: Yup.object()
                .nullable()
                .required("Role is required!"),
        }),
        onSubmit: async (values, { setSubmitting, resetForm, setFieldError }) => {
            try {
                const payload = {
                    first_name: values.first_name,
                    last_name: values.last_name,
                    mobile_number: values.mobile_number,
                    email: values.email,
                    password: values.password,
                    gender: values.gender,
                    role: values.role?.value, // Extract the role id
                };

                showLoader();
                const response = await API.post("/addTeamMemberView", payload);

                if (response.status === 201 || response.status === 200) {
                    toast.success("Team member added successfully!");
                    resetForm();
                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } catch (error: any) {
                console.error("Error adding team member:", error);
                const errors = error.response?.data;

                if (errors) {
                    if (errors.mobile_number) {
                        setFieldError("mobile_number", errors.mobile_number[0]);
                        // toast.error(`Mobile Number: ${errors.mobile_number[0]}`);
                    }
                    if (errors.email) {
                        setFieldError("email", errors.email[0]);
                        // toast.error(`Email: ${errors.email[0]}`);
                    }
                } else {
                    toast.error("Failed to add team member.");
                }
            } finally {
                hideLoader();
                setSubmitting(false);
            }
        },
    });

    // Roles API
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


    return (
        <>
            <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar />
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
                <form
                    onSubmit={formik.handleSubmit}
                    className="bg-white p-6 rounded shadow-md w-full max-w-md"
                >
                    <h2 className="text-2xl font-bold mb-4">Add Team Member</h2>

                    {/* First Name */}
                    <div className="mb-4">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            placeholder="Enter FirstName"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.first_name}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        {formik.touched.first_name && formik.errors.first_name && (
                            <div className="text-red-500 text-sm">{formik.errors.first_name}</div>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="mb-4">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            placeholder="Enter LastName"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.last_name}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        {formik.touched.last_name && formik.errors.last_name && (
                            <div className="text-red-500 text-sm">{formik.errors.last_name}</div>
                        )}
                    </div>

                    {/* Mobile Number */}
                    <div className="mb-4">
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                            Mobile Number
                        </label>
                        <input
                            type="text"
                            id="mobile_number"
                            name="mobile_number"
                            placeholder="Enter Mobile number"
                            maxLength={13}
                            onChange={(e) => {
                                let value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
                                if (!value.startsWith("91")) {
                                    value = "91" + value;
                                }
                                formik.setFieldValue("mobile_number", `+${value}`);
                            }}
                            onBlur={formik.handleBlur}
                            value={formik.values.mobile_number}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        {formik.touched.mobile_number && formik.errors.mobile_number && (
                            <div className="text-red-500 text-sm">{formik.errors.mobile_number}</div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            placeholder="Enter Email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="text-red-500 text-sm">{formik.errors.email}</div>
                        )}
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>

                        {/* Make this container relative so the eye icon is positioned correctly */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter Password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm pr-10" // add pr-10 to give space for the icon
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                            >
                                {showPassword ? (
                                    <FiEye className="w-3 h-3.5 text-gray-700" />
                                ) : (
                                    <FiEyeOff className="w-3 h-3.5 text-gray-700" />
                                )}
                            </span>
                        </div>

                        {formik.touched.password && formik.errors.password && (
                            <div className="text-red-500 text-sm">{formik.errors.password}</div>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="mb-4">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                            Gender
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.gender}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="" disabled>
                                Select Gender
                            </option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        {formik.touched.gender && formik.errors.gender && (
                            <div className="text-red-500 text-sm">{formik.errors.gender}</div>
                        )}
                    </div>

                    {/* Roles */}
                    <div className="mb-4">
                        <label htmlFor="rolePreference" className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <AsyncPaginate<RoleOption, any, { page?: number }>
                            id="rolePreference"
                            loadOptions={loadOptions}
                            additional={{ page: 1 }}
                            onChange={(selectedOption) => {
                                console.log("Selected Role----->:", selectedOption);
                                formik.setFieldValue("role", selectedOption);
                            }}
                            onBlur={() => formik.setFieldTouched("role", true)}
                            value={formik.values.role}
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


                    {/* Success Message */}
                    {successMessage && <div className="text-green-500 text-sm mb-4">{successMessage}</div>}
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full"
                        disabled={formik.isSubmitting} // Disable the button when form is submitting
                    >
                        {formik.isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </>
    );
}
