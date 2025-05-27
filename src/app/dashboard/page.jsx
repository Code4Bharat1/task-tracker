"use client";

import React, { useState, useEffect } from "react";
import OverviewHeader from "@/Component/dashboard/overview";
import AttendanceChart from "@/Component/dashboard/attendancechart";
import ProjectStatusChart from "@/Component/dashboard/projectstatuschart";
import Sidebar from "@/Component/Usersidebar/usersidebar";
import MobileSidebar from "@/Component/Usersidebar/mobilesidebar";
import NavBar from "@/Component/Navbar/navbar";
import MobileNavbar from "@/Component/Navbar/mobilenavbar";
import TaskPriorityChart from "@/Component/dashboard/TaskPriorityChart";
import { axiosInstance } from "@/lib/axiosInstance";
import PerformanceChart from "@/Component/dashboard/performancechart";
import PerformanceBoard from "@/Component/dashboard/Performanceboard";
import FloatingButtons from "@/Component/FloatingButtons";
import { Menu } from "lucide-react";

// Import mobile components (you'll need to create these)
import MobileOverviewHeader from "@/Component/dashboard/mobileoverview";
import MobileAttendanceChart from "@/Component/dashboard/mobileattendancechart";
import MobileProjectStatusChart from "@/Component/dashboard/mobileprojectstatuschart";
import MobileTaskPriorityChart from "@/Component/dashboard/MobileTaskPriorityChart";
import MobilePerformanceChart from "@/Component/dashboard/mobileperformancechart";
import MobilePerformanceBoard from "@/Component/dashboard/MobilePerformanceboard";

function Page() {
  const [selected, setSelected] = useState("This Year");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    attendance: null,
    tasks: null,
    loading: true,
    error: null,
    errorDetails: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData((prev) => ({
          ...prev,
          loading: true,
          error: null,
          errorDetails: null,
        }));

        // Make API calls separately to better identify errors
        try {
          const attendanceRes = await axiosInstance.get(
            "/attendance/punchHistory"
          );
          setDashboardData((prev) => ({
            ...prev,
            attendance: attendanceRes.data,
          }));
        } catch (err) {
          console.error("Error fetching attendance data:", err);
          setDashboardData((prev) => ({
            ...prev,
            error: "Failed to load attendance data",
            errorDetails: `Status: ${
              err.response?.status || "Unknown"
            }, Message: ${err.message}`,
          }));
        }

        try {
          const tasksRes = await axiosInstance.get("/tasks/getTasks");
          setDashboardData((prev) => ({
            ...prev,
            tasks: tasksRes.data?.data || [],
          }));
        } catch (err) {
          console.error("Error fetching tasks data:", err);
          setDashboardData((prev) => ({
            ...prev,
            error: prev.error
              ? `${prev.error} and tasks data`
              : "Failed to load tasks data",
            errorDetails: prev.errorDetails
              ? `${prev.errorDetails} | Tasks API: Status: ${
                  err.response?.status || "Unknown"
                }, Message: ${err.message}`
              : `Status: ${err.response?.status || "Unknown"}, Message: ${
                  err.message
                }`,
          }));
        }

        setDashboardData((prev) => ({ ...prev, loading: false }));
      } catch (err) {
        console.error("General error in dashboard data fetching:", err);
        setDashboardData({
          attendance: null,
          tasks: null,
          loading: false,
          error: "Failed to load dashboard data",
          errorDetails: err.message,
        });
      }
    };

    fetchDashboardData();
  }, []);

  // Check if API endpoints might be incorrect
  const checkApiEndpoints = () => {
    console.log("Checking API configuration...");
    axiosInstance
      .get("/api-status")
      .then((res) => console.log("API connection test successful"))
      .catch((err) => console.error("API connection test failed:", err));
  };

  // Loading state
  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Desktop Loading */}
        <div className="hidden md:flex w-full">
          <div className="md:w-1/6">
            <Sidebar />
          </div>
          <div className="w-full md:w-5/6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-gray-500">Loading dashboard...</p>
            </div>
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="block md:hidden">
          <MobileNavbar />
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-gray-500">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardData.error) {
    return (
      <div className="min-h-screen bg-white">
        {/* Desktop Error */}
        <div className="hidden md:flex w-full">
          <div className="md:w-1/6">
            <Sidebar />
          </div>
          <div className="w-full md:w-5/6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2 font-semibold">
                {dashboardData.error}
              </p>
              {dashboardData.errorDetails && (
                <p className="text-sm text-gray-600 mb-4">
                  Error details: {dashboardData.errorDetails}
                </p>
              )}
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
                <button
                  onClick={checkApiEndpoints}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Check API
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Error */}
        <div className="block md:hidden">
          <MobileNavbar />
          <div className="flex items-center justify-center h-screen p-4">
            <div className="text-center">
              <p className="text-red-500 mb-2 font-semibold">
                {dashboardData.error}
              </p>
              {dashboardData.errorDetails && (
                <p className="text-xs text-gray-600 mb-4">
                  Error details: {dashboardData.errorDetails}
                </p>
              )}
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
                <button
                  onClick={checkApiEndpoints}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Check API
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Data availability checks
  const hasAttendanceData = dashboardData.attendance !== null;
  const hasTasksData =
    Array.isArray(dashboardData.tasks) && dashboardData.tasks.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop View */}
      <div className="hidden md:flex w-full">
        {/* Sidebar */}
        <div className="md:w-1/6">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="w-full md:w-5/6">
          <NavBar />

          <main className="px-6 py-6">
            <OverviewHeader selected={selected} setSelected={setSelected} />

            {/* First row - 2x2 grid for charts */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <TaskPriorityChart
                selected={selected}
                tasks={dashboardData.tasks}
              />

              {hasAttendanceData ? (
                <AttendanceChart
                  selected={selected}
                  attendanceRecords={dashboardData.attendance}
                />
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                  <p className="text-gray-500">No attendance data available</p>
                </div>
              )}

              <ProjectStatusChart
                selected={selected}
                tasks={dashboardData.tasks}
              />

              <PerformanceChart selected={selected} />
            </div>

            {/* Second row - Full width Performance Board */}
            <div className="mt-6">
              <PerformanceBoard />
            </div>
          </main>

          <FloatingButtons />
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden relative">
        {/* Mobile Header with Menu Button */}
        <div className="flex items-center relative">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="absolute left-4 top-4 z-50 text-white"
          >
            <Menu size={28} />
          </button>
          <MobileNavbar />
        </div>

        {/* Overlay for sidebar */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-35"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
        />

        {/* Mobile Dashboard Content */}
        <main className="p-4">
          <MobileOverviewHeader selected={selected} setSelected={setSelected} />

          {/* Mobile Charts - Single column layout */}
          <div className="space-y-4 mt-4">
            <MobileTaskPriorityChart
              selected={selected}
              tasks={dashboardData.tasks}
            />

            {hasAttendanceData ? (
              <MobileAttendanceChart
                selected={selected}
                attendanceRecords={dashboardData.attendance}
              />
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                <p className="text-gray-500 text-sm">
                  No attendance data available
                </p>
              </div>
            )}

            <MobileProjectStatusChart
              selected={selected}
              tasks={dashboardData.tasks}
            />

            <MobilePerformanceChart selected={selected} />

            {/* Mobile Performance Board */}
            <MobilePerformanceBoard />
          </div>
        </main>

        <FloatingButtons />
      </div>
    </div>
  );
}

export default Page;
