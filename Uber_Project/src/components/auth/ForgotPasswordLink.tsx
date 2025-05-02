import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import { useParams } from "react-router-dom";
import API from "./axiosInstance";
import { useNavigate } from "react-router-dom";

interface ForgotPasswordLinkValues {
    newPassword: string;
    confirmPassword: string;
}

const ForgotPasswordLink: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);
    const { verification_code } = useParams<{ verification_code: string }>();
    const navigate = useNavigate();

    const initialValues: ForgotPasswordLinkValues = {
        newPassword: "",
        confirmPassword: "",
    };

    const validationSchema = Yup.object({
        newPassword: Yup.string()
            .required("New Password is required")
            .min(6, "Password must be at least 6 characters"),
        confirmPassword: Yup.string()
            .required("Confirm Password is required")
            .oneOf([Yup.ref("newPassword")], "Passwords must match"),
    });

    const handleSubmit = async (values: ForgotPasswordLinkValues) => {
        try {
            const payload = {
                password: values.newPassword,
                confirm_password: values.confirmPassword,
            };
            const response = await API.put(`/forgot-password/${verification_code}`, payload);
            console.log("Password reset successful:", response.data);
            toast.success("Password reset successful!");
            navigate("/admin/signIn");
        } catch (error: any) {
            console.error("Error resetting password:", error?.response?.data || error.message);
        }
    };

    return (
        <>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            <div className="max-w-md mx-auto p-4 border rounded-md shadow bg-white mt-10">
                <h2 className="text-3xl font-semibold mb-6 text-center">Reset Password</h2>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            <div className="relative">
                                <label htmlFor="newPassword" className="block mb-1 font-medium">
                                    New Password
                                </label>
                                <Field
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    placeholder="Enter new password"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-brand-500 pr-10"
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 mt-5 transform -translate-y-1/2 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <FiEye className="w-5 h-3.5 text-gray-700" />
                                    ) : (
                                        <FiEyeOff className="w-5 h-3.5 text-gray-700" />
                                    )}
                                </span>
                                <ErrorMessage
                                    name="newPassword"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>

                            <div className="relative">
                                <label htmlFor="confirmPassword" className="block mb-1 font-medium">
                                    Confirm Password
                                </label>
                                <Field
                                    type={showCPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Enter confirm password"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-brand-500 pr-10"
                                />
                                <span
                                    onClick={() => setShowCPassword(!showCPassword)}
                                    className="absolute right-3 mt-5 transform -translate-y-1/2 cursor-pointer"
                                >
                                    {showCPassword ? (
                                        <FiEye className="w-5 h-3.5 text-gray-700" />
                                    ) : (
                                        <FiEyeOff className="w-5 h-3.5 text-gray-700" />
                                    )}
                                </span>
                                <ErrorMessage
                                    name="confirmPassword"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-brand-500 text-white py-2 rounded-md hover:bg-brand-600 disabled:opacity-50"
                            >
                                {isSubmitting ? "Resetting..." : "Reset Password"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </>
    );
};

export default ForgotPasswordLink;
