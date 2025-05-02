import { useFormik } from "formik";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import axios from "axios";
import API from "../../components/auth/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

export default function PersonalInfo() {
    const [adharPreview, setAdharPreview] = useState<string | null>(null);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
    const [dynamicFields, setDynamicFields] = useState<any[]>([]);
    const [dynamicFieldErrors, setDynamicFieldErrors] = useState<Record<string, string>>({});


    const navigate = useNavigate();

    const formik = useFormik<{
        // adharCardPhoto: File | null;
        profilePic: File | null;
        dateOfBirth: string;
        // licenseNumber: string;
        languagePreference: { value: number; label: string }[];
    }>({
        initialValues: {
            // adharCardPhoto: null,
            profilePic: null,
            dateOfBirth: "",
            // licenseNumber: "",
            languagePreference: [], // Initialize as an empty array
        },

        onSubmit: async (values) => {
            console.log("Formik Errors Before Submit:", formik.errors);  // Debugging errors

            const dynamicErrors = validateDynamicFields(dynamicFields);
            setDynamicFieldErrors(dynamicErrors);

            const hasDynamicErrors = Object.values(dynamicErrors).some((error) => error);

            if (hasDynamicErrors) {
                toast.error("Please fix the document upload errors before submitting.");
                return;
            }

            try {
                const formData = new FormData();

                // document_key
                // dynamicFields.map((i) => {
                //     formData.append(i?.document_key, i?.document_value)
                // })
                dynamicFields.forEach((i) => {
                    if (i?.document_value !== undefined && i?.document_value !== null) {
                        formData.append(i?.document_key, i?.document_value);
                    }
                });

                if (values.profilePic instanceof File) {
                    formData.append("profile_pic", values.profilePic, values.profilePic.name);
                } else {
                    console.error("Profile Pic is not a valid File", values.profilePic);
                }
                formData.append("dob", values.dateOfBirth);

                values.languagePreference.forEach((lang) => {
                    formData.append("lang", lang.value.toString());
                });

                console.log("FormData Entries:", [...formData.entries()]);

                const response = await API.post("/add-driver-details", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                console.log("Submited Data--------->:", response.data);
                toast.success("Form submitted successfully!")
                // navigate('/driver-login');
                setTimeout(() => {
                    navigate("/driver/login");
                }, 1500);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.errors) {
                    const serverErrors = error.response.data.errors;
                    setDynamicFieldErrors(serverErrors); // <-- keys should match `document_key`
                }
            }
        },
    });

    //! for fetching dynamic-fields
    useEffect(() => {
        const fetchDynamicFields = async () => {
            try {
                const token = localStorage.getItem("access_token");

                const response = await API.get("/add-driver-details");
                const fields = response.data?.data?.data || [];
                console.log("Fetched dynamic fields:", response.data);
                setDynamicFields(fields);
            } catch (error) {
                console.error("Error fetching dynamic fields:", error);
            }
        };
        fetchDynamicFields();
    }, []);


    //! for async-language-dropdown
    const loadOptions: LoadOptions<{ value: number; label: string }, any, { page?: number }> = async (
        inputValue,
        _,
    ) => {
        // const page = additional?.page || 1; // Default to page 1
        const pageSize=10;
        try {
            const response = await API.get("/languagesListView", {
                params: { search: inputValue,pageSize },
            });

            const options = response.data.map((language: { id: number; name: string }) => ({
                value: language.id,
                label: language.name,
            }));

            console.log("Mapped Options:", options);

            console.log("Returning options to AsyncPaginate:", options);
            return {
                options,
                hasMore: false, // Set to true for pagination
            };
        } catch (error: any) {
            console.error("Error fetching languages:", error.message);
            return { options: [], hasMore: false };
        }
    };

    //! for image-preview
    const handleImagePreview = (file: File | null, setPreview: (url: string | null) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    //! validations for dynamic fields
    const validateDynamicFields = (fields: any[]) => {
        const errors: Record<string, string> = {};

        fields.forEach((field) => {
            const key = field.document_key;
            const value = field.document_value;
            const type = field.document_type?.toLowerCase();

            if (type === "image") {
                if (!(value instanceof File) || !value.type.startsWith("image/")) {
                    errors[key] = `${field.document_label || key} must be an image.`;
                }
            }

            // Example: License number validation
            if (key.toLowerCase().includes("license")) {
                if (typeof value !== "string") {
                    errors[key] = "License number must be a string.";
                } else {
                    if (value.length > 20) {
                        errors[key] = "License number must be max 20 characters.";
                    }
                    if (/\s/.test(value)) {
                        errors[key] = "License number cannot contain whitespace.";
                    }
                }
            }
        });

        return errors;
    };


    return (
        <>
            <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar />
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
                <form
                    onSubmit={formik.handleSubmit}
                    className="bg-white p-6 rounded shadow-md w-full max-w-3xl"
                    encType="multipart/form-data"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center text-black-400">-- Driver Personal Information --</h2>

                    {/* Profile Picture */}
                    <div>
                        <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">
                            Profile Picture
                        </label>
                        <div
                            className="mt-1 w-70 h-40 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-pointer flex items-center justify-center overflow-hidden"
                            onClick={() => document.getElementById("profilePic")?.click()}
                        >
                            {profilePreview ? (
                                <img
                                    src={profilePreview}
                                    alt="Profile Preview"
                                    className="w-full h-full object-contain rounded-md"
                                />
                            ) : (
                                <span>Click to upload Profile Picture</span>
                            )}
                            <input
                                type="file"
                                id="profilePic"
                                name="profilePic"
                                accept="image/*"
                                onChange={(event) => {
                                    const file = event.currentTarget.files?.[0] || null;
                                    if (file) {
                                        // Check if file is an image
                                        if (!file.type.startsWith("image/")) {
                                            toast.error("Only image files are allowed");
                                            formik.setFieldValue("profilePic", null); // clear the value
                                            formik.setFieldError("profilePic", "Only image files are allowed");
                                            setProfilePreview(null); // remove preview
                                            return;
                                        }
                                        formik.setFieldValue("profilePic", file);
                                        handleImagePreview(file, setProfilePreview);
                                    }else {
                                        formik.setFieldValue("profilePic", null);
                                        setProfilePreview(null);
                                      }
                                    }}
                                className="hidden"
                            />
                            {formik.touched.profilePic && formik.errors.profilePic && (
                                <div className="text-red-500 text-sm">{formik.errors.profilePic}</div>
                            )}
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                Date of Birth
                            </label>
                            <DatePicker
                                selected={selectedDate}
                                placeholderText="Select Date"
                                required
                                onChange={(date) => {
                                    setSelectedDate(date);
                                    formik.setFieldValue("dateOfBirth", date?.toISOString().split("T")[0] || "");
                                }}
                                maxDate={new Date()}
                                dateFormat="yyyy-MM-dd"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                            {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                                <div className="text-red-500 text-sm">{formik.errors.dateOfBirth}</div>
                            )}
                        </div>

                        {/* Language-dropdown */}
                        <div className="mb-4">
                            <label htmlFor="languagePreference" className="block text-sm font-medium text-gray-700">
                                Language Preference
                            </label>
                            <AsyncPaginate
                                id="languagePreference"
                                isMulti
                                // loadOptions={loadOptions}
                                loadOptions={loadOptions}
                                additional={{ page: 1 }}
                                onChange={(selected) => {
                                    console.log("Selected Languages:", selected);
                                    formik.setFieldValue("languagePreference", selected);
                                }}
                                value={formik.values.languagePreference}
                                placeholder="Select Languages..."
                                debounceTimeout={600}
                                styles={{
                                    option: (provided) => ({
                                        ...provided,
                                        color: "black",
                                    }),
                                    multiValue: (provided) => ({
                                        ...provided,
                                        backgroundColor: "#E5E7EB",
                                    }),
                                    multiValueLabel: (provided) => ({
                                        ...provided,
                                        color: "black",
                                    }),
                                    multiValueRemove: (provided) => ({
                                        ...provided,
                                        color: "#EF4444",
                                        ":hover": {
                                            backgroundColor: "#F87171",
                                            color: "white",
                                        },
                                    }),
                                }}
                            />
                        </div>

                        {/* dynamic-fields */}
                        {Array.isArray(dynamicFields) && dynamicFields.map((field, index) => (
                            <div key={index} className="mb-4">
                                <label className="block mb-1 font-medium">
                                    {field.document_label}
                                    {field.is_required && <span className="text-red-500"> *</span>}
                                </label>

                                {field.field_type === "text" && (
                                    <input
                                        type="text"
                                        name={field.document_key}
                                        maxLength={20}
                                        onInput={(event) => {
                                            const input = event.target as HTMLInputElement;
                                            input.value = input.value.replace(/\s/g, "");
                                        }}
                                        // required={field.is_required}
                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                        onChange={(event) => {
                                            const value = event.target.value.toUpperCase();
                                            event.target.value = value; // Update the input value to uppercase
                                            setDynamicFields((prevFields) =>
                                                prevFields.map((f, i) =>
                                                    i === index ? { ...f, document_value: value } : f
                                                )
                                            );
                                            setDynamicFieldErrors((prevErrors) => ({
                                                ...prevErrors,
                                                [field.document_key]: "",
                                            }));
                                        }}
                                    />
                                )}

                                {field.field_type === "image" && (
                                    <input
                                        type="file"
                                        name={field.document_key}
                                        accept="image/*"
                                        // required={field.is_required}
                                        onChange={(event) => {
                                            const file = event.target.files?.[0] || null;
                                            if (file && !file.type.startsWith("image/")) {
                                                // Set error if file is not an image
                                                setDynamicFieldErrors((prevErrors) => ({
                                                    ...prevErrors,
                                                    [field.document_key]: "Please upload a valid image file.",
                                                }));
                                                return;
                                            }
                                            // Clear any existing error on new file selection
                                            setDynamicFieldErrors((prevErrors) => ({
                                                ...prevErrors,
                                                [field.document_key]: "",
                                            }));
                                            setDynamicFields((prevFields) =>
                                                prevFields.map((f, i) =>
                                                    i === index ? { ...f, document_value: file } : f
                                                )
                                            );
                                            handleImagePreview(file, setAdharPreview);
                                        }}
                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                    />
                                )}
                                {dynamicFieldErrors?.[field.document_key] && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {dynamicFieldErrors[field.document_key]}
                                    </p>
                                )}
                            </div>
                        ))}

                    </div>
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`bg-indigo-600 text-white px-4 py-2 rounded-md w-full mt-6 ${Object.values(dynamicFieldErrors).some((err) => err)
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                        disabled={Object.values(dynamicFieldErrors).some((err) => err)}
                    >
                        Submit
                    </button>
                    {/* Alert Message */}
                    {alertMessage && (
                        <div className={`mt-4 text-center p-2 ${alertType === 'success' ? 'text-green-600' : alertType === 'error' ? 'text-red-600' : 'text-blue-600'} bg-opacity-20`}>
                            {alertMessage}
                        </div>
                    )}
                </form>
            </div>
        </>
    );
}
