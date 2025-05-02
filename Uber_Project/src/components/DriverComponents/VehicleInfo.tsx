import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import PageMeta from '../common/PageMeta';
import DriverPageBreadcrumb from '../common/DriverPageBreadCrumb';
import API from '../auth/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import { useLoader } from "../../components/common/LoaderContext";


interface VehicleFormValues {
    vehicle_front_image: File | null;
    vehicle_back_image: File | null;
    vehicle_rightSide_image: File | null;
    vehicle_leftSide_image: File | null;
    vehicle_rc_front_image: File | null;
    vehicle_rc_back_image: File | null;
    vehicle_number: string;
    vehicle_type: string | number;
    vehicle_chassis_number: string | number;
    vehicle_engine_number: string | number;
}

const initialValues: VehicleFormValues = {
    vehicle_front_image: null,
    vehicle_back_image: null,
    vehicle_rightSide_image: null,
    vehicle_leftSide_image: null,
    vehicle_rc_front_image: null,
    vehicle_rc_back_image: null,
    vehicle_number: '',
    vehicle_type: '',
    vehicle_chassis_number: '',
    vehicle_engine_number: '',
};


//* image validationSchema for image-fields---------------------
const imageValidation = Yup.mixed()
    .required('Image is required')
    .test(
        'fileType',
        'Only image files are allowed!',
        (value) =>
            value &&
            value instanceof File && ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'].includes(value.type)
    );

const validationSchema = Yup.object({
    vehicle_number: Yup.string().required('Required'),
    vehicle_type: Yup.string().required('Required'),
    vehicle_chassis_number: Yup.string().required('Required'),
    vehicle_engine_number: Yup.string().required('Required'),
    vehicle_front_image: imageValidation,
    vehicle_back_image: imageValidation,
    vehicle_rightSide_image: imageValidation,
    vehicle_leftSide_image: imageValidation,
    vehicle_rc_front_image: imageValidation,
    vehicle_rc_back_image: imageValidation,
});



const VehicleInfo = () => {
    const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
    //* Loader
    const { showLoader, hideLoader } = useLoader();


    //! API for adding vehicle-info
    const handleSubmit = async (values: VehicleFormValues, { resetForm }: any) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value as string);
            }
        });

        try {
            showLoader();

            // Make the API request
            const response = await API.post('/addVehicleView', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            });

            console.log('Form submitted successfully:', response.data);
            toast.success('Vehicle added successfully!');
            resetForm();
            setImagePreviews({});
        } catch (error: any) {
            console.error('Error submitting form:', error);
            toast.error('Failed to add vehicle. Please try again.');
        } finally {
            hideLoader();
        }
    };

    //* file-image-preview
    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFieldValue: any,
        fieldName: string
    ) => {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            const file = e.currentTarget.files[0];
            setFieldValue(fieldName, file);
            const imageUrl = URL.createObjectURL(file);
            setImagePreviews((prev) => ({ ...prev, [fieldName]: imageUrl }));
        }
    };

    return (
        <>
            <PageMeta
                title="React.js Driver Dashboard"
                description="This is React.js Driver Dashboard page for Adding Vehicle Information"
            />
            <DriverPageBreadcrumb pageTitle="Vehicle Information" />
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            <Formik initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, formikHelpers) => handleSubmit(values, formikHelpers)}
            >
                {({ setFieldValue }) => (
                    <Form className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-xl space-y-6">
                        <h2 className="text-center mb-3 text-2xl font-semibold text-gray-800">Vehicle Information</h2>

                        {/* Centered grid for image fields */}
                        <div className="flex flex-wrap justify-center gap-6 mt-10">
                            {[
                                'vehicle_front_image',
                                'vehicle_back_image',
                                'vehicle_rightSide_image',
                                'vehicle_leftSide_image',
                                'vehicle_rc_front_image',
                                'vehicle_rc_back_image',
                            ].map((field) => (
                                <div key={field} className="flex flex-col gap-1 w-64">
                                    <label className="text-gray-700 capitalize">
                                        {field.replace(/_/g, ' ')}
                                    </label>

                                    <div className="relative h-36 w-full border border-gray-300 rounded-md overflow-hidden cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={(e) => {
                                                const file = e.currentTarget.files?.[0];
                                                if (file) {
                                                    setFieldValue(field, file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setImagePreviews((prev) => ({ ...prev, [field]: reader.result as string }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                                        />

                                        <img
                                            src={imagePreviews[field]}
                                            alt="Preview"
                                            className={`absolute inset-0 w-full h-full object-cover z-10 ${imagePreviews[field] ? '' : 'hidden'}`}
                                        />
                                        <div
                                            id={`${field}-placeholder`}
                                            className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm z-0"
                                        >
                                            Upload image
                                        </div>
                                    </div>
                                    <ErrorMessage name={field} component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="flex flex-col gap-1 w-64">
                                <label className="text-gray-700">Vehicle Number</label>
                                <Field
                                    name="vehicle_number"
                                    maxLength={10}
                                    placeholder="Enter Vehicle number"
                                    className="border border-gray-300 rounded-md p-2"
                                />
                                <ErrorMessage name="vehicle_number" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div className="flex flex-col gap-1 w-64">
                                <label className="text-gray-700">Vehicle Type</label>
                                <Field
                                    as="select"
                                    name="vehicle_type"
                                    className="border border-gray-300 rounded-md p-2"
                                >
                                    <option value="" disabled>Select Vehicle Type</option>
                                    <option value="2 Wheeler">2 Wheeler</option>
                                    <option value="3 Wheeler">3 Wheeler</option>
                                    <option value="4 Wheeler">4 Wheeler</option>
                                </Field>
                                <ErrorMessage name="vehicle_type" component="div" className="text-red-500 text-sm" />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="flex flex-col gap-1 w-64">
                                <label className="text-gray-700">Vehicle Chassis Number</label>
                                <Field
                                    name="vehicle_chassis_number"
                                    maxLength={17}
                                    placeholder="Enter Vehicle chassis number"
                                    className="border border-gray-300 rounded-md p-2"
                                />
                                <ErrorMessage name="vehicle_chassis_number" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div className="flex flex-col gap-1 w-64">
                                <label className="text-gray-700">Vehicle Engine Number</label>
                                <Field
                                    name="vehicle_engine_number"
                                    maxLength={17}
                                    placeholder="Enter Vehicle engine number"
                                    className="border border-gray-300 rounded-md p-2"
                                />
                                <ErrorMessage name="vehicle_engine_number" component="div" className="text-red-500 text-sm" />
                            </div>
                        </div>


                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
                            >
                                Submit
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>

        </>
    );
};

export default VehicleInfo
