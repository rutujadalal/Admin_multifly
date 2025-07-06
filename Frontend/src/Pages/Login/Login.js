import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import multiflyLogo from "../../Assets/Images/Multiflylogo.png";
import backgroundVideo from "../../Assets/Images/BgVideo.mp4";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

  try {
    const response = await fetch("http://localhost:5000/api/admin/adminlogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      
      localStorage.setItem("admin_id", data.admin_id);
      localStorage.setItem("admin_email", email);

      
      navigate("/otp-verification");
    } else {
      setError(data.error || "Something went wrong");
    }
  } catch (error) {
    console.error("Login error:", error);
    setError("Failed to connect to the server.");
  }
};

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      
      <video
        src={backgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      
      
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>
      
      
      <div className="relative w-full max-w-md p-8 space-y-6 bg-white shadow-2xl rounded-2xl border-2 border-blue-900 bg-opacity-90 z-10">
        <div className="text-center mb-6">
          <img src={multiflyLogo} alt="logo" className="w-40 mx-auto" />
        </div>

        <h2 className="text-2xl font-bold text-center text-blue-900 uppercase">
          LOGIN TO MULTIFLY ADMIN
        </h2>

        {error && <p className="text-red-600 text-center font-semibold">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-blue-900 font-bold">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-blue-900 font-bold">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 text-lg font-bold text-white bg-blue-900 rounded-lg hover:bg-red-700 transition duration-300"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};






