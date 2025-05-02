import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import API from "./axiosInstance";

interface ForgotPasswordValues {
    email: string;
}

const ForgotPassword: React.FC = () => {
    const initialValues: ForgotPasswordValues = {
        email: "",
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
    });

    const handleSubmit = async (values: ForgotPasswordValues, { setFieldError }: { setFieldError: (field: string, message: string) => void }) => {
        try {
            // Replace with your actual endpoint
            const response = await API.post("/forgotpassword", values);
            console.log("Success:", response.data);
            // optionally show success UI message here
        } catch (error: any) {
            const err = error?.response?.data;
            if (err?.errors?.email) {
                setFieldError("email", err.errors.email);
            } else {
                // Optional: handle non-field errors
                console.error("Error:", err?.message || error.message);
            }
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 border rounded-md shadow justify-center bg-white mt-10">
            <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setFieldError }) =>
                    handleSubmit(values, { setFieldError })
                }
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block mb-1 font-medium">
                                Email
                            </label>
                            <Field
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-brand-500"
                            />
                            <ErrorMessage
                                name="email"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-brand-500 text-white py-2 rounded-md hover:bg-brand-600 disabled:opacity-50"
                        >
                            {isSubmitting ? "Sending..." : "Submit"}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ForgotPassword;
