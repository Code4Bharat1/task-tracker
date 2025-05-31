"use client";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const MobilePerformanceChart = ({ selected = "This Week" }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemarks, setShowRemarks] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, [selected]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = "";
      let params = {};

      switch (selected) {
        case "This Week":
          endpoint = "/performance/getIndividualWeeklyScore";
          break;
        case "This Month":
          endpoint = "/performance/getIndividualMonthlyScore";
          break;
        case "This Year":
          endpoint = "/performance/getIndividualYearlyScore";
          break;
        default:
          endpoint = "/performance/getIndividualWeeklyScore";
      }

      const response = await axiosInstance.get(endpoint, { params });
      setPerformanceData(response.data);
    } catch (err) {
      console.error("Error fetching performance data:", err);
      setError("Failed to load performance data");
      // Set empty data structure instead of null
      setPerformanceData(getEmptyDataStructure(selected));
    } finally {
      setLoading(false);
    }
  };

  const getEmptyDataStructure = (period) => {
    if (period === "This Week") {
      return {
        score: [
          {
            timesheetScore: 0,
            attendanceScore: 0,
            behaviourScore: 0,
            totalScore: 0,
          },
        ],
        remark: "No data available for this period",
      };
    } else {
      const dataPoints = period === "This Month" ? 4 : 12;
      const data = [];

      for (let i = 1; i <= dataPoints; i++) {
        if (period === "This Month") {
          data.push({
            week: i,
            avgTimesheetScore: 0,
            avgAttendanceScore: 0,
            avgBehaviourScore: 0,
            remark: "No data available",
          });
        } else {
          data.push({
            month: `Month ${i}`,
            monthNumber: i,
            avgTimesheetScore: 0,
            avgAttendanceScore: 0,
            avgBehaviourScore: 0,
            remark: "No data available",
          });
        }
      }

      return {
        data: data,
        overallAvgScore: 0,
        remark: "No data available for this period",
      };
    }
  };

  const RemarksModal = ({ isOpen, onClose, remarks, title }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md mx-auto max-h-96 overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-2">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-3 sm:p-4 max-h-80 overflow-y-auto">
            {remarks && remarks.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {remarks.map((remark, index) => (
                  <div
                    key={index}
                    className="p-2.5 sm:p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">
                      {selected === "This Month"
                        ? `Week ${remark.week || index + 1}`
                        : selected === "This Year"
                        ? remark.month || `Month ${index + 1}`
                        : `Entry ${index + 1}`}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-800">
                      {remark.remark || "No remark available"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4 text-sm">
                No remarks available
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 w-full max-w-md mx-auto">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Initialize empty data structure if no data is available
  const currentData = performanceData || getEmptyDataStructure(selected);

  // Render pie chart for weekly data
  if (selected === "This Week") {
    // Always show chart, even with zero values
    const scoreData = currentData?.score?.[0] || {
      timesheetScore: 0,
      attendanceScore: 0,
      behaviourScore: 0,
      totalScore: 0,
    };

    const { timesheetScore, attendanceScore, behaviourScore, totalScore } =
      scoreData;
    const backendRemark =
      currentData?.remark || "No data available for this period";

    const pieData = {
      labels: ["Timesheet", "Attendance", "Behaviour"],
      datasets: [
        {
          label: "Weekly Performance Score",
          data: [timesheetScore, attendanceScore, behaviourScore],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          borderColor: ["#fff", "#fff", "#fff"],
          borderWidth: 2,
        },
      ],
    };

    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // We'll create custom legend
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const label = context.label;
              return `${label}: ${value}`;
            },
          },
        },
      },
    };

    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 w-full">
        <h2 className="text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4">
          Weekly Performance
        </h2>
        <div className="h-48 sm:h-64 mb-3 sm:mb-4">
          <Pie data={pieData} options={pieOptions} />
        </div>

        {/* Custom Legend - responsive grid layout */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-center sm:items-center sm:flex-wrap sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center justify-center sm:justify-start">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#FF6384] rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-700 text-center sm:text-left">
              Timesheet
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-start">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#36A2EB] rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-700 text-center sm:text-left">
              Attendance
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-start">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#FFCE56] rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-700 text-center sm:text-left">
              Behaviour
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-base sm:text-lg font-medium text-gray-700 mb-2">
            Total Score: {totalScore}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2.5 sm:p-3 rounded-lg mb-3">
            {backendRemark}
          </div>
          {error && (
            <div className="text-xs text-orange-500 mt-2">
              Note: Unable to fetch data, showing zero values
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render line chart for monthly/yearly data
  if (selected === "This Month" || selected === "This Year") {
    // Always show chart, even with zero values
    const chartData = currentData?.data || getEmptyDataStructure(selected).data;

    const labels = chartData.map((item) => {
      if (selected === "This Month") {
        return `Week ${item.week}`;
      } else {
        return item.month || `Month ${item.monthNumber}`;
      }
    });

    const timesheetData = chartData.map((item) => item.avgTimesheetScore || 0);
    const attendanceData = chartData.map(
      (item) => item.avgAttendanceScore || 0
    );
    const behaviourData = chartData.map((item) => item.avgBehaviourScore || 0);

    const lineData = {
      labels,
      datasets: [
        {
          label: "Timesheet Score",
          data: timesheetData,
          borderColor: "#FF6384",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: "Attendance Score",
          data: attendanceData,
          borderColor: "#36A2EB",
          backgroundColor: "rgba(54, 162, 235, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: "Behaviour Score",
          data: behaviourData,
          borderColor: "#FFCE56",
          backgroundColor: "rgba(255, 206, 86, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
      ],
    };

    const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // We'll create custom legend
        },
        title: {
          display: true,
          text: `${selected} Performance Trend`,
          font: {
            size: window.innerWidth < 640 ? 14 : 16,
            weight: "bold",
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: selected === "This Month" ? "Weeks" : "Months",
            font: {
              size: window.innerWidth < 640 ? 11 : 12,
            },
          },
          ticks: {
            font: {
              size: window.innerWidth < 640 ? 10 : 11,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Score",
            font: {
              size: window.innerWidth < 640 ? 11 : 12,
            },
          },
          beginAtZero: true,
          max: 10,
          ticks: {
            font: {
              size: window.innerWidth < 640 ? 10 : 11,
            },
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    };

    const backendRemark =
      currentData?.remark || "No data available for this period";

    return (
      <>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 w-full">
          <div className="h-64 sm:h-80 mb-3 sm:mb-4">
            <Line data={lineData} options={lineOptions} />
          </div>

          {/* Custom Legend - responsive grid layout */}
          <div className="grid grid-cols-1 gap-2 sm:flex sm:justify-center sm:items-center sm:flex-wrap sm:gap-4 mb-4">
            <div className="flex items-center justify-center sm:justify-start">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#FF6384] rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></div>
              <span className="text-xs font-medium text-gray-700">
                Timesheet Score
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#36A2EB] rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></div>
              <span className="text-xs font-medium text-gray-700">
                Attendance Score
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#FFCE56] rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></div>
              <span className="text-xs font-medium text-gray-700">
                Behaviour Score
              </span>
            </div>
          </div>

          {/* Average Score and Button - responsive layout */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="text-base sm:text-lg font-medium text-gray-700 text-center sm:text-left">
              Average Score: {currentData?.overallAvgScore || 0}
            </div>
            <button
              onClick={() => setShowRemarks(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto"
            >
              View Detailed Remarks
            </button>
          </div>

          {error && (
            <div className="text-xs text-orange-500 mt-3 text-center">
              Note: Unable to fetch data, showing zero values
            </div>
          )}
        </div>

        <RemarksModal
          isOpen={showRemarks}
          onClose={() => setShowRemarks(false)}
          remarks={chartData}
          title={`${selected} Detailed Remarks`}
        />
      </>
    );
  }

  return null;
};

export default MobilePerformanceChart;