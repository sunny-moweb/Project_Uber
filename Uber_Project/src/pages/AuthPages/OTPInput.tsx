import React, { useEffect, useState } from "react";
import API from "../../components/auth/axiosInstance";

interface OTPInputProps {
  otp: string;
  setOtp: (otp: string) => void;
  onVerifyOtp: (otp: string) => void;
  otpError?: string | null;
  onResendOtp?: () => void;
  mobileNumber: string;
}

const OTPInput: React.FC<OTPInputProps> = ({ otp, setOtp, onVerifyOtp, otpError, onResendOtp,mobileNumber }) => {
  const [timer, setTimer] = useState(60);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  useEffect(() => {
    if (timer === 0) return;

    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // const handleResend = () => {
  //   if (onResendOtp) {
  //     onResendOtp(); // Trigger resend
  //   }
  //   setTimer(60); // Restart timer
  // };

  const handleResend = async () => {
    if (!mobileNumber) {
      alert("Mobile number is missing.");
      return;
    }
    try {
      const response = await API.put("/resendOtpView", {
        mobile_number:mobileNumber , // ensure this variable is accessible in the component
      });
  
      if (response.data) {
        console.log("OTP resent successfully:", response.data);
        setSuccessMessage("OTP has been resent successfully.");
        setTimer(60); // restart the timer
      }
    } catch (error: any) {
      console.error("Resend OTP Error:", error.response?.data || error.message);
    }
  };


  return (
    <div>
      <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
        OTP <span className="text-error-500">*</span>
      </label>
      <input
        type="text"
        id="otp"
        name="otp"
        maxLength={4}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))} // Allow only numbers
        placeholder="Enter the 4-digit OTP"
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-brand-500"
      />

      <div className="mt-2 text-sm text-gray-600">
        {timer > 0 ? (
          <>Resend OTP in <span className="font-medium">{formatTime(timer)}</span></>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-brand-600 hover:underline font-medium"
          >
            Resend OTP
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onVerifyOtp(otp)} // Pass the current OTP state
        className="w-full mt-4 px-4 py-2 text-white bg-brand-500 hover:bg-brand-600 rounded disabled:opacity-50"
      >
        Verify OTP
      </button>
      {otpError && <div className="text-red-500 text-sm mt-2">{otpError}</div>}
    </div>
  );
};


export default OTPInput;
