import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import API from "../../components/auth/axiosInstance";
import { access } from "fs";
import { useNavigate } from "react-router-dom";

export default function PersonalInfo() {
    const [adharPreview, setAdharPreview] = useState<string | null>(null);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
    const [dynamicFields, setDynamicFields] = useState<any[]>([]);
    
    const navigate = useNavigate();

    const formik = useFormik<{
        adharCardPhoto: File | null;
        profilePic: File | null;
        dateOfBirth: string;
        licenseNumber: string;
        languagePreference: { value: number; label: string }[]; 
    }>({
        initialValues: {
            adharCardPhoto: null,
            profilePic: null,
            dateOfBirth: "",
            licenseNumber: "",
            languagePreference: [], // Initialize as an empty array
        },
        
        onSubmit: async (values) => {
            if (Object.keys(formik.errors).length > 0) {
                console.log("Validation failed! Form will not submit.");
                return;
            }

            try {

                const formData = new FormData();
                if (values.adharCardPhoto instanceof File) {
                    formData.append("aadhar_photo", values.adharCardPhoto, values.adharCardPhoto.name);
                } else {
                    console.error("Aadhar Photo is not a valid File", values.adharCardPhoto);
                }

                if (values.profilePic instanceof File) {
                    formData.append("profile_pic", values.profilePic, values.profilePic.name);
                } else {
                    console.error("Profile Pic is not a valid File", values.profilePic);
                }
                formData.append("licence_number", values.licenseNumber);
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

                console.log("API Response:", response.data);
                alert("Form submitted successfully!");
                navigate('/driver-login');
            } catch (error) {
                console.error("API Error:", error);
                navigate('/driver-login');
            // if (axios.isAxiosError(error)) {
            //     console.error("Axios error:", error.response?.data || error.message);
            //     // navigate('/driver-login');
            // } else {
            //     console.error("Unexpected error:", error);
            // }
        }

        const hasAlreadyApplied = localStorage.getItem('driver_applied') === 'true';

        // If the driver has already applied, show the message and prevent submission
        if(hasAlreadyApplied) {
            setAlertMessage("Data already under verification, Please wait until verification gets over.");
            setAlertType('info');
            return;
        }

            // Simulating form submission
            localStorage.setItem('driver_applied', 'true');
        setAlertMessage("Form submitted successfully!");
            setAlertType('success');
    },        
    });

    //! Dynamic-fields API
    useEffect(() => {
        const fetchDynamicFields = async () => {
            try {
                const response = await axios.get("/add-driver-details");
                if (response.data.status === "success") {
                    setDynamicFields(response.data.required_documents);
                }
            } catch (error) {
                console.error("Error fetching dynamic fields:", error);
            }
        };

        fetchDynamicFields();
    }, []);

//! Async-multi langauge-dropdown    
const loadOptions: LoadOptions<{ value: number; label: string }, any, { page?: number }> = async (
    inputValue,
    _,
    additional
) => {
    const page = additional?.page || 1; // Default to page 1

    try {
        const response = await axios.get("/languagesListView", {
            params: { search: inputValue },
        });

        const options = response.data.map((language: { id: number; name: string }) => ({
            value: language.id,
            label: language.name,
        }));

        console.log("Mapped Options:", options);

        console.log("Returning options to AsyncPaginate:", options);
        return {
            options,
            hasMore: true,
        };
    } catch (error: any) {
        console.error("Error fetching languages:", error.message);
        return { options: [], hasMore: false };
    }
};

//! api for langauge-dropdown original
// const loadOptions: LoadOptions<{ value: number; label: string }, any, { page?: number }> = async (
//     inputValue,
//     _,
//     additional
// ) => {
//     const page = additional?.page || 1; // Default to page 1
//     const pageSize = 4;

//     try {
//         const response = await fetch(
//             `http://192.168.50.18:8000/languageListView/?search=${inputValue}`
//         );

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log("API Response:", data);

//         // Slice results manually to enforce pageSize
//         const startIndex = (page - 1) * pageSize;
//         const endIndex = startIndex + pageSize;
//         const paginatedData = data.slice(startIndex, endIndex);

//         const options = paginatedData.map((language: { id: number; name: string }) => ({
//             value: language.id,
//             label: language.name,
//         }));

//         console.log("Mapped Options:", options);

//         // Determine if there are more results
//         const hasMore = endIndex < data.length;

//         return {
//             options,
//             hasMore,
//             additional: hasMore ? { page: page + 1 } : undefined,
//         };
//     } catch (error: any) {
//         console.error("Error fetching languages:", error.message);
//         return {
//             options: [],
//             hasMore: false,
//         };
//     }
// };


// image-preview
const handleImagePreview = (file: File | null, setPreview: (url: string | null) => void) => {
    if (file) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    } else {
        setPreview(null);
    }
};

return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <form
            onSubmit={formik.handleSubmit}
            className="bg-white p-6 rounded shadow-md w-full max-w-3xl"
            encType="multipart/form-data"
        >
            <h2 className="text-2xl font-bold mb-6 text-center text-green-400">--Personal Information--</h2>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhaar Card Photo */}
                <div>
                    <label htmlFor="adharCardPhoto" className="block text-sm font-medium text-gray-700">
                        Aadhaar Card Photo
                    </label>
                    <div
                        className="mt-1 block w-full h-40 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-pointer flex items-center justify-center overflow-hidden"
                        onClick={() => document.getElementById("adharCardPhoto")?.click()}
                    >
                        {adharPreview ? (
                            <img
                                src={adharPreview}
                                alt="Aadhaar Preview"
                                className="w-full h-full object-contain rounded-md"
                            />
                        ) : (
                            <span>Click to upload Aadhaar Card Photo</span>
                        )}
                    </div>
                    <input
                        type="file"
                        id="adharCardPhoto"
                        name="adharCardPhoto"
                        accept="image/*"
                        onChange={(event) => {
                            const file = event.currentTarget.files?.[0] || null;
                            formik.setFieldValue("adharCardPhoto", file);
                            handleImagePreview(file, setAdharPreview);
                        }}
                        className="hidden"
                    />
                    {formik.touched.adharCardPhoto && formik.errors.adharCardPhoto && (
                        <div className="text-red-500 text-sm">{formik.errors.adharCardPhoto}</div>
                    )}
                </div>

                {/* Profile Picture */}
                <div>
                    <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">
                        Profile Picture
                    </label>
                    <div
                        className="mt-1 block w-full h-40 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-pointer flex items-center justify-center overflow-hidden"
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
                    </div>
                    <input
                        type="file"
                        id="profilePic"
                        name="profilePic"
                        accept="image/*"
                        onChange={(event) => {
                            const file = event.currentTarget.files?.[0] || null;
                            formik.setFieldValue("profilePic", file);
                            handleImagePreview(file, setProfilePreview);
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

                {/* License Number */}
                <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                        License Number
                    </label>
                    <input
                        type="text"
                        id="licenseNumber"
                        name="licenseNumber"
                        onChange={formik.handleChange}
                        maxLength={20}
                        onBlur={formik.handleBlur}
                        value={formik.values.licenseNumber}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                    {formik.touched.licenseNumber && formik.errors.licenseNumber && (
                        <div className="text-red-500 text-sm">{formik.errors.licenseNumber}</div>
                    )}
                </div>

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
            </div>
            {/* Submit Button */}
            <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full mt-6"
            >
                Submit
            </button>
            {alertMessage && (
                <div className={`mt-4 text-center p-2 ${alertType === 'success' ? 'text-green-600' : alertType === 'error' ? 'text-red-600' : 'text-blue-600'} bg-opacity-20`}>
                    {alertMessage}
                </div>
            )}
        </form>
    </div>
);
}


//! get Response{
//     "status": "success",
//     "required_documents": [
//       {
//         "document_key": "licence_number",
//         "document_label": "Licence Number",
//         "field_type": "text",
//         "is_required": true
//       },
//       {
//         "document_key": "aadhar_photo",
//         "document_label": "Aadhar Card Image",
//         "field_type": "image",
//         "is_required": true
//       },
//       {
//         "document_key": "pan_card",
//         "document_label": "Pan Card",
//         "field_type": "image",
//         "is_required": false
//       }
//     ]
//   }

//! validationschema
// validationSchema: Yup.object({
        //     adharCardPhoto: Yup.mixed()
        //         .required("Aadhaar card photo is required")
        //         .test(
        //             "fileSize",
        //             "File size should be less than 5MB", // Updated size limit
        //             (value) => !value || (value instanceof File && value.size <= 5 * 1024 * 1024) // 5MB
        //         ),
        //     profilePic: Yup.mixed()
        //         .required("Profile picture is required")
        //         .test(
        //             "fileSize",
        //             "File size should be less than 5MB", // Updated size limit
        //             (value) => !value || (value instanceof File && value.size <= 5 * 1024 * 1024) // 5MB
        //         ),
        //     dateOfBirth: Yup.string()
        //         .required("Date of Birth is required")
        //         .test(
        //             "validDate",
        //             "Date of Birth cannot be in the future",
        //             (value) => !value || new Date(value) <= new Date()
        //         ),
        //     licenseNumber: Yup.string()
        //         .required("License number is required")
        //         .max(20, "License number cannot exceed 20 characters"),
        //     languagePreference: Yup.string().required("Language preference is required"),
        // }),
        



// import { useEffect, useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { AsyncPaginate } from "react-select-async-paginate";
// import { useNavigate } from "react-router-dom";

// export default function PersonalInfo() {
//     const [dynamicFields, setDynamicFields] = useState([]);
//     const [profilePreview, setProfilePreview] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchDynamicFields = async () => {
//             try {
//                 const response = await axios.get("/add-driver-details/");
//                 setDynamicFields(response.data.required_documents);
//             } catch (error) {
//                 console.error("Error fetching dynamic fields:", error?.response?.data || error?.message);
//             }
//         };
//         fetchDynamicFields();
//     }, []);

//     const formik = useFormik({
//         initialValues: {
//             profilePic: null,
//             dateOfBirth: "",
//             languagePreference: [],
//         },
//         validationSchema: Yup.object({
//             profilePic: Yup.mixed().required("Profile picture is required"),
//             dateOfBirth: Yup.string().required("Date of Birth is required"),
//         }),
//         onSubmit: async (values) => {
//             try {
//                 const token = localStorage.getItem("access_token");
//                 const formData = new FormData();

//                 if (values.profilePic) formData.append("profile_pic", values.profilePic);
//                 formData.append("dob", values.dateOfBirth);

//                 values.languagePreference.forEach(lang => {
//                     formData.append("lang", lang.value.toString());
//                 });

//                 // ✅ Append Dynamic Fields
//                 dynamicFields.forEach(field => {
//                     if (values[field.document_key]) {
//                         formData.append(field.document_key, values[field.document_key]);
//                     }
//                 });

//                 const response = await axios.post("/add-driver-details/", formData, {
//                     headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
//                 });

//                 console.log("API Response:", response.data);
//                 alert("Form submitted successfully!");
//                 navigate('/driver-login');
//             } catch (error) {
//                 console.error("API Error:", error?.response?.data || error?.message);
//             }
//         },
//     });

//     const loadOptions = async (inputValue) => {
//         try {
//             const response = await axios.get("/languagesListView/", { params: { search: inputValue } });
//             return { options: response.data.map(lang => ({ value: lang.id, label: lang.name })), hasMore: false };
//         } catch (error) {
//             console.error("Error fetching languages:", error?.response?.data || error?.message);
//             return { options: [], hasMore: false };
//         }
//     };

//     return (
//         <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
//             <h2>-- Personal Information --</h2>

//             {/* Profile Picture */}
//             <div>
//                 <label>Profile Picture</label>
//                 <input
//                     type="file"
//                     name="profilePic"
//                     accept="image/*"
//                     onChange={(event) => {
//                         const file = event.currentTarget.files?.[0];
//                         if (file) {
//                             formik.setFieldValue("profilePic", file);
//                             setProfilePreview(URL.createObjectURL(file));
//                         }
//                     }}
//                 />
//                 {profilePreview && <img src={profilePreview} alt="Profile Preview" width={100} />}
//                 {formik.errors.profilePic && <p style={{ color: "red" }}>{formik.errors.profilePic}</p>}
//             </div>

//             {/* Date of Birth */}
//             <div>
//                 <label>Date of Birth</label>
//                 <DatePicker
//                     selected={formik.values.dateOfBirth ? new Date(formik.values.dateOfBirth) : null}
//                     onChange={(date) => {
//                         formik.setFieldValue("dateOfBirth", date?.toISOString().split("T")[0] || "");
//                     }}
//                     maxDate={new Date()}
//                     dateFormat="yyyy-MM-dd"
//                 />
//                 {formik.errors.dateOfBirth && <p style={{ color: "red" }}>{formik.errors.dateOfBirth}</p>}
//             </div>

//             {/* Language Preference */}
//             <div>
//                 <label>Language Preference</label>
//                 <AsyncPaginate
//                     loadOptions={loadOptions}
//                     onChange={(selected) => formik.setFieldValue("languagePreference", selected || [])}
//                     isMulti={true}
//                 />
//             </div>

//             {/* Dynamic Fields - Auto Generated */}
//             {dynamicFields.map(field => (
//                 <div key={field.document_key}>
//                     <label>{field.document_label} {field.is_required && "*"}</label>
//                     {field.field_type === "text" ? (
//                         <input
//                             type="text"
//                             name={field.document_key}
//                             onChange={formik.handleChange}
//                             required={field.is_required}
//                         />
//                     ) : (
//                         <input
//                             type="file"
//                             name={field.document_key}
//                             accept="image/*"
//                             onChange={(event) => {
//                                 const file = event.currentTarget.files?.[0];
//                                 if (file) {
//                                     formik.setFieldValue(field.document_key, file);
//                                 }
//                             }}
//                             required={field.is_required}
//                         />
//                     )}
//                 </div>
//             ))}

//             <button type="submit">Submit</button>
//         </form>
//     );
// }
