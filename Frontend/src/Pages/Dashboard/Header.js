

import { useState, useEffect } from "react";
import { FiChevronDown, FiLogOut, FiMenu } from "react-icons/fi";
import { FaPlane, FaCar, FaHotel } from "react-icons/fa";
import profilePlaceholder from "../../Assets/Images/profile.jpg";

export const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isTravelDropdownOpen, setIsTravelDropdownOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const handleLogout = async () => {
    try {
      console.log("Attempting logout...");
      console.log("Successuflly logged out"); 
      window.alert("Successfully logged out"); 
      
      localStorage.removeItem("admin");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred while logging out.");
    }
  };

  const travelOptions = [
    { icon: <FaPlane />, label: "Flights" },
    { icon: <FaCar />, label: "Cab Bookings" },
    { icon: <FaHotel />, label: "Hotel Reservations" },
  ];

  return (
    <header className="bg-white h-20 shadow-sm flex items-center justify-between px-6 sticky top-0 z-50">
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 hover:text-grey-800">
        <FiMenu size={24} />
      </button>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <button
            onClick={() => setIsTravelDropdownOpen(!isTravelDropdownOpen)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <span className="hidden md:inline">Travel</span>
            <FiChevronDown />
          </button>
          {isTravelDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              {travelOptions.map((option, index) => (
                <div key={index} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                  <span className="mr-2">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center space-x-3">
            <img
              src={admin?.photo || profilePlaceholder}
              alt="User"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-gray-700 hidden md:inline">
              {admin?.name || "Admin"}
            </span>
            <FiChevronDown className="text-gray-600" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">Settings</div>
              <div
                className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                <FiLogOut className="mr-2" /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};