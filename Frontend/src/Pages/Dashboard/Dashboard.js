import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DashboardCards } from "./DashboardCards";
import CalendarComponent from "./CalendarComponent";
export const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-0 md:ml-64" : "ml-0 md:ml-20"
        }`}
      >
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="p-4 md:p-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-6">
            <h1 className="text-xl md:text-2xl font-semibold">Welcome back,Admin!</h1>
            <p className="mt-1 text-blue-100 text-sm md:text-base">
              Here's what's happening with your dashboard today.
            </p>
          </div>
          <DashboardCards />
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Calendar</h2>
            <CalendarComponent />
          </div>
        </main>
      </div>
    </div>
  );
};


