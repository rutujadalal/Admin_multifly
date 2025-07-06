

import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import BgImage from "../../Assets/Images/Bg.otp.jpg";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const email = localStorage.getItem("admin_email");
      const response = await fetch("http://localhost:5000/api/admin/verifyotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("admin", JSON.stringify(data.token));
          navigate("/dashboard");
        } else {
          setError("Invalid response from server");
        }
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP Verification error:", error);
      setError("Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cover bg-center bg-black bg-opacity-50 backdrop-blur-md" style={{ backgroundImage: `url(${BgImage})` }}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-center text-2xl font-bold text-blue-900 mb-4">
          OTP VERIFICATION
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Enter the 6-digit OTP sent to your email: <b>{email}</b>
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength="6"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-3 rounded-lg mt-4 font-semibold hover:bg-red-700 transition duration-300"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Didn't receive an OTP?{" "}
          <span className="text-red-600 cursor-pointer">Resend</span>
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;

