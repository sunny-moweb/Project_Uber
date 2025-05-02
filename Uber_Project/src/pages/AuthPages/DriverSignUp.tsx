import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useState } from "react";
import OTPInput from "./OTPInput";
import { useNavigate } from "react-router-dom";
import API from "../../components/auth/axiosInstance";
import { toast } from "react-toastify";
import { useLoader } from "../../components/common/LoaderContext";

export default function DriverSignUp() {
    const [otpSent, setOtpSent] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [enteredMobileNumber, setEnteredMobileNumber] = useState<string>("");
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState<string | null>(null);

    //* Loader
    const { showLoader, hideLoader } = useLoader();
    // const { setLoading } = useLoader();
    const navigate = useNavigate();

    const formik = useFormik<{
        first_name: string;
        last_name: string;
        gender: string;
        mobile_number: string;
    }>({
        initialValues: {
            first_name: "",
            last_name: "",
            gender: "",
            mobile_number: "",
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
        }),
        onSubmit: async (values) => {
            try {
                showLoader();
                setSuccessMessage(null);

                const payload = {
                    ...values,
                    user_type: "driver",
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
                hideLoader(); // Stop loading after API call
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
            navigate("/driver-info");
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
                    className="bg-white p-6 rounded shadow-md w-full max-w-md"
                >
                    <h2 className="text-2xl font-bold mb-4">Driver Sign Up</h2>

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
            ) : (
                <OTPInput otp={otp} setOtp={setOtp} onVerifyOtp={verifyOtp} otpError={otpError} mobileNumber={enteredMobileNumber} />
            )}
        </div>
    );
}
