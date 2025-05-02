//* Final-code----------------------------------------------------------
import { useState } from "react";
import axios from "axios";
import Label from "../../components/form/Label";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FaArrowLeft } from "react-icons/fa";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import API from "../../components/auth/axiosInstance";
import OTPInput from "./OTPInput";

export default function DriverLogin() {
  const [enteredMobileNumber, setEnteredMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Validation schema for the form
  const validationSchema = Yup.object({
    mobileNumber: Yup.string()
      .required("Mobile number is required")
      .matches(/\+91[6-9]\d{9}$/, "Invalid mobile number"),
  });

  //! sendOtp-mobile API----------------------------
  const sendOtp = async (mobile_number: string) => {
    try {
      console.log("Sending OTP to mobile number:", mobile_number);

      // Send the API request to send OTP
      const response = await API.post("/mobile_number", { mobile_number });

      if (response.data) {
        console.log("OTP sent successfully:", response.data);
        setEnteredMobileNumber(mobile_number);
        setOtpSent(true); // Show OTP input
        setMobileError(null);
      } else {
        throw new Error("Unexpected response structure. Please try again.");
      }
    } catch (error: any) {
      // Check if the error comes from the server (response error)
      if (error.response && error.response.data) {
        const serverError = error.response.data;
        console.log("Full server error:", serverError);

        const message = error.response.data.errors?.mobile_number;
        setMobileError(message || "An error occurred. Please try again.");
      } else {
        console.error("Unexpected error:", error.message || "An error occurred.");
        setMobileError("An error occurred. Please check your network and try again.");
      }
    }
  };

  //! Verify-otp API----------------------------
  const verifyOtp = async (otp: string) => {
    try {
      console.log("Verifying OTP for mobile number:", enteredMobileNumber);

      // Send OTP verification request
      const response = await API.post("/otp-verification", {
        mobile_number: enteredMobileNumber,
        otp,
      });

      console.log("Full API Response:", response.data);

      // Extract access and refresh tokens correctly
      const { access, refresh, role, approved } = response.data.data;

      if (!access || !refresh ) {
        throw new Error("Tokens missing in API response");
      }

      // Save tokens to local storage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user_role", role); 
      if (role === "driver") {
        navigate(approved ? "/driver/home" : "/driver-info");
      }
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
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8 mt-4 text-center">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Driver Login
            </h1>
          </div>

          {!otpSent ? (
            <Formik
              initialValues={{ mobileNumber: "" }}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={(values) => sendOtp(values.mobileNumber)}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form>
                  <div className="space-y-6">
                    <div>
                      <span></span>
                      <Label>
                        Mobile Number <span className="text-error-500">*</span>
                      </Label>
                      <div className="relative flex items-center">
                        <Field
                          name="mobileNumber"
                          type="tel"
                          placeholder="Enter your mobile number"
                          maxLength={13}
                          className={`w-full px-10 py-2 border rounded-md focus:outline-none focus:ring focus:ring-brand-500}`}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            let value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
                            if (!value.startsWith("91")) {
                              value = "91" + value;
                            }
                            setFieldValue("mobileNumber", `+${value}`);
                            setMobileError(null);
                          }}
                          value={values.mobileNumber}
                        />
                      </div>
                      {mobileError && <span className="text-red-500 text-sm mt-2">{mobileError}</span>}
                      {!mobileError && (
                        <ErrorMessage
                          name="mobileNumber"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      )}
                    </div>

                    <div>
                      <button
                        className="w-full mt-4 px-4 py-2 text-white bg-brand-500 hover:bg-brand-600 rounded disabled:opacity-50"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <OTPInput otp={otp} setOtp={setOtp} onVerifyOtp={verifyOtp} otpError={otpError} mobileNumber={enteredMobileNumber} />
          )}
          <button
            className="w-full px-4 py-2 mt-4 text-brand-500 border border-brand-500 rounded flex items-center justify-center gap-2 hover:bg-brand-100"
            type="button"
            onClick={() => {
              navigate("/driver/signup");
            }}
          >
            Sign Up
          </button>
          <div className="flex justify-center">
            <button
              className="flex justify-center w-60 px-4 py-2 mt-4 text-brand-500 border border-brand-500 rounded flex items-center justify-center gap-2 hover:bg-brand-100"
              type="button"
              onClick={() => {
                navigate("/admin/signIn");
              }}
            >
              <FaArrowLeft className="text-lg" /> Back to Admin Sign-In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}