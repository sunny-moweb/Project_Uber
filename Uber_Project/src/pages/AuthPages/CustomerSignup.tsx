import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import OTPInput from "./OTPInput";
import { useNavigate } from "react-router-dom";
import API from "../../components/auth/axiosInstance";
import { toast } from "react-toastify";
import { useLoader } from "../../components/common/LoaderContext";
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { FiCalendar } from "react-icons/fi";

export default function CustomerSignup() {
    const [otpSent, setOtpSent] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [enteredMobileNumber, setEnteredMobileNumber] = useState<string>("");
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState<string | null>(null);

    //* Loader
    const { showLoader, hideLoader } = useLoader();
    const navigate = useNavigate();

    const formik = useFormik<{
        first_name: string;
        last_name: string;
        gender: string;
        mobile_number: string;
        dob: string;
        address: string;
    }>({
        initialValues: {
            first_name: "",
            last_name: "",
            gender: "",
            mobile_number: "",
            dob: "",
            address: "",
        },
        validationSchema: Yup.object({
            first_name: Yup.string()
                .max(15, "Must be 15 characters or less")
                .required("First name is required"),
            last_name: Yup.string()
                .max(20, "Must be 20 characters or less")
                .required("Last name is required"),
            gender: Yup.string().required("Gender is required"),
            mobile_number: Yup.string()
                .matches(/\+91[6-9]\d{9}$/, "Invalid mobile number")
                .required("Mobile number is required"),
            dob: Yup.string()
                .required("Date of birth is required"),
            address: Yup.string()
                .min(10, "Address must be at least 10 characters")
                .required("Address is required"),
        }),
        onSubmit: async (values) => {
            try {
                showLoader();
                setSuccessMessage(null);

                const payload = {
                    ...values,
                    user_type: "customer", //----------------------sending type along with data
                };

                const response = await API.post("/signup", payload);

                if (response.status === 201) {
                    setSuccessMessage("Signup successful! Please verify the OTP sent to your mobile number.");
                    setOtpSent(true);
                    setEnteredMobileNumber(values.mobile_number);
                    toast.success("Registered Successfully!..."); // Store the mobile number
                }
            } catch (error: any) {
                console.error("Signup API Error:", error);

            } finally {
                hideLoader();
            }
        },
    });

    const verifyOtp = async (otp: string) => {
        try {
            const response = await API.post("/otp-verification", {
                mobile_number: enteredMobileNumber,
                otp,
            });
            const { access, refresh, role } = response.data.data; // Fix: Use correct keys

            if (!access || !refresh) {
                throw new Error("Tokens missing in API response");
            }

            // Save tokens to local storage
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            localStorage.setItem("user_role", role);
            navigate("/customer/home");
        } catch (error: any) {
            if (error.response && error.response.data) {
                const serverError = error.response.data;
                console.log("Full server error:", serverError);

                // const message = error.response.data.errors?.otp;
                const otpErrorMsg =
                    serverError.errors?.otp ||
                    serverError.errors?.login ||
                    serverError.message
                setOtpError(otpErrorMsg);
            }
            else {
                console.error("Unexpected error:", error.message || "An error occurred.");
                setOtpError("An error occurred. Please check your network and try again.");
            }
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
            {!otpSent ? (
                <form
                    onSubmit={formik.handleSubmit}
                    className="bg-white p-6 rounded shadow-md w-full max-w-150"
                >
                    <h2 className="text-2xl font-bold mb-4">Customer Sign Up</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                First Name
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                placeholder="Enter First Name"
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
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                placeholder="Enter Last Name"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.last_name}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                            {formik.touched.last_name && formik.errors.last_name && (
                                <div className="text-red-500 text-sm">{formik.errors.last_name}</div>
                            )}
                        </div>

                        {/* Gender */}
                        <div>
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
                                <option value="" disabled>Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            {formik.touched.gender && formik.errors.gender && (
                                <div className="text-red-500 text-sm">{formik.errors.gender}</div>
                            )}
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">
                                Mobile Number
                            </label>
                            <input
                                type="text"
                                id="mobile_number"
                                name="mobile_number"
                                placeholder="Enter Mobile Number"
                                maxLength={13}
                                onChange={(e) => {
                                    let value = e.target.value.replace(/[^0-9+]/g, "");
                                    formik.setFieldValue("mobile_number", value);
                                }}
                                onBlur={formik.handleBlur}
                                value={formik.values.mobile_number}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                            {formik.touched.mobile_number && formik.errors.mobile_number && (
                                <div className="text-red-500 text-sm">{formik.errors.mobile_number}</div>
                            )}
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                Date of Birth
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={formik.values.dob ? new Date(formik.values.dob) : null}
                                    onChange={(date: Date | null) =>
                                        formik.setFieldValue("dob", date?.toISOString().split("T")[0])
                                    }
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select DOB"
                                    className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm"
                                />
                                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" />
                            </div>
                            {formik.touched.dob && formik.errors.dob && (
                                <div className="text-red-500 text-sm">{formik.errors.dob}</div>
                            )}
                        </div>
                    </div>

                    {/* Address - Full width */}
                    <div className="mt-4">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            placeholder="Enter Address"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.address}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            rows={3}
                        />
                        {formik.touched.address && formik.errors.address && (
                            <div className="text-red-500 text-sm">{formik.errors.address}</div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 text-center">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            ) : (
                <OTPInput otp={otp} setOtp={setOtp} onVerifyOtp={verifyOtp} otpError={otpError} mobileNumber={enteredMobileNumber} />
            )}
        </div>
    );
}
