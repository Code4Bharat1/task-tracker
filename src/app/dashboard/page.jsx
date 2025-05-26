'use client';

import React, { useState, useEffect } from "react";
import OverviewHeader from "@/Component/dashboard/overview";
import AttendanceChart from "@/Component/dashboard/attendancechart";
import ProjectStatusChart from "@/Component/dashboard/projectstatuschart";
import Sidebar from "@/Component/Usersidebar/usersidebar";
import NavBar from "@/Component/Navbar/navbar";
import TaskPriorityChart from "@/Component/dashboard/TaskPriorityChart";
import { axiosInstance } from '@/lib/axiosInstance';
import PerformanceSummary from "@/Component/dashboard/performancesummary";
import PerformanceChart from "@/Component/dashboard/performancechart";

function Page() {
  const [selected, setSelected] = useState("This Year");
  const [dashboardData, setDashboardData] = useState({
    attendance: null,
    tasks: null,
    loading: true,
    error: null,
    errorDetails: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null, errorDetails: null }));

        // Make API calls separately to better identify errors
        try {
          const attendanceRes = await axiosInstance.get('/attendance/punchHistory');
          setDashboardData(prev => ({ ...prev, attendance: attendanceRes.data }));
        } catch (err) {
          console.error('Error fetching attendance data:', err);
          setDashboardData(prev => ({
            ...prev,
            error: 'Failed to load attendance data',
            errorDetails: `Status: ${err.response?.status || 'Unknown'}, Message: ${err.message}`
          }));
        }

        try {
          const tasksRes = await axiosInstance.get('/tasks/getTasks');
          setDashboardData(prev => ({
            ...prev,
            tasks: tasksRes.data?.data || []
          }));
        } catch (err) {
          console.error('Error fetching tasks data:', err);
          setDashboardData(prev => ({
            ...prev,
            error: prev.error ? `${prev.error} and tasks data` : 'Failed to load tasks data',
            errorDetails: prev.errorDetails
              ? `${prev.errorDetails} | Tasks API: Status: ${err.response?.status || 'Unknown'}, Message: ${err.message}`
              : `Status: ${err.response?.status || 'Unknown'}, Message: ${err.message}`
          }));
        }

        setDashboardData(prev => ({ ...prev, loading: false }));
      } catch (err) {
        console.error('General error in dashboard data fetching:', err);
        setDashboardData({
          attendance: null,
          tasks: null,
          loading: false,
          error: 'Failed to load dashboard data',
          errorDetails: err.message
        });
      }
    };

    fetchDashboardData();
  }, []);

  // Check if API endpoints might be incorrect
  const checkApiEndpoints = () => {
    // Try to verify if the API base URL and endpoints are configured correctly
    console.log('Checking API configuration...');

    // You could make a simple test request to a known working endpoint here
    axiosInstance.get('/api-status')
      .then(res => console.log('API connection test successful'))
      .catch(err => console.error('API connection test failed:', err));
  };

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen md:flex bg-white">
        <div className="md:w-1/6">
          <Sidebar />
        </div>
        <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="min-h-screen md:flex bg-white">
        <div className="md:w-1/6">
          <Sidebar />
        </div>
        <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2 font-semibold">{dashboardData.error}</p>
            {dashboardData.errorDetails && (
              <p className="text-sm text-gray-600 mb-4">Error details: {dashboardData.errorDetails}</p>
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
    );
  }

  // Proceed with rendering if we have at least some data
  const hasAttendanceData = dashboardData.attendance !== null;
  const hasTasksData = Array.isArray(dashboardData.tasks) && dashboardData.tasks.length > 0;

  return (
    <div className="min-h-screen md:flex bg-white">
      <div className="md:w-1/6">
        <Sidebar />
      </div>

      <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
        <NavBar />

        <main className="hidden md:block px-6 py-6">
          <OverviewHeader selected={selected} setSelected={setSelected} />

          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mt-6">
            {!hasTasksData && (
              <TaskPriorityChart
                selected={selected}
                tasks={dashboardData.tasks}
              />
            )}
            {hasTasksData && (
              <TaskPriorityChart
                selected={selected}
                tasks={dashboardData.tasks}
              />
            )}

            {!hasAttendanceData && (
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                <p className="text-gray-500">No attendance data available</p>
              </div>
            )}
            {hasAttendanceData && (
              <AttendanceChart
                selected={selected}
                attendanceRecords={dashboardData.attendance}
              />
            )}

            {!hasTasksData && (
              <ProjectStatusChart
                selected={selected}
                tasks={dashboardData.tasks}
              />
            )}
            {hasTasksData && (
              <ProjectStatusChart
                selected={selected}
                tasks={dashboardData.tasks}
              />
            )}

            <PerformanceChart selected={selected} />
          </div>
        </main>

        <main className="block md:hidden">
          <div className="p-6">
            <p className="text-center text-gray-500">Dashboard is optimized for desktop view</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Page;