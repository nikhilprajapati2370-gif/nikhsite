import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const sendOtp = async () => {
  try {
    console.log("Sending email:", email);   // ✅ CORRECT

    await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`,
      { email }
    );

    setMsg("OTP sent to your email");
    setStep(2);
  } catch (err) {
    setMsg(err.response?.data?.detail || "Error sending OTP");
  }
};
  const resetPassword = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/reset-password`,
        {
          email,
          otp,
          new_password: newPassword,
        }
      );
      setMsg("Password reset successful");
      setStep(1);
    } catch (err) {
      setMsg("Invalid OTP or error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="bg-black p-6 rounded-md w-80">
        <h2 className="text-xl mb-4">Forgot Password</h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 mb-3 bg-gray-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={sendOtp} className="w-full bg-yellow-400 text-black p-2">
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-2 mb-3 bg-gray-800"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              className="w-full p-2 mb-3 bg-gray-800"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button onClick={resetPassword} className="w-full bg-yellow-400 text-black p-2">
              Reset Password
            </button>
          </>
        )}

        <p className="mt-3 text-sm">{msg}</p>
      </div>
    </div>
  );
};

export default ForgotPassword;
