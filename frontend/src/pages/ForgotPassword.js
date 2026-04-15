import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
const [email, setEmail] = useState("");
const [otp, setOtp] = useState("");
const [newPassword, setNewPassword] = useState("");

const sendOtp = async () => {
  await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email })
  });
  setStep(2);
};

  const resetPassword = async () => {
  await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, otp, new_password: newPassword })
  });
};
  

  const handleSendOtp = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/send-otp`, { email });
      setMsg("OTP sent to your email");
    } catch (err) {
      setMsg("Error sending OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="bg-black p-6 rounded-md w-80">
        <h2 className="text-xl mb-4">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 mb-3 bg-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleSendOtp} className="w-full bg-yellow-400 text-black p-2">
          Send OTP
        </button>

        <p className="mt-3 text-sm">{msg}</p>
      </div>
    </div>
  );
};

export default ForgotPassword;
