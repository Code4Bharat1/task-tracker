"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Users,
  BarChart3,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";

const MobilePerformanceBoard = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    period: "monthly",
    date: new Date().toISOString().split("T")[0],
    sortBy: "totalScore",
    sortOrder: "desc",
    searchTerm: "",
  });

  // Mock data for demo purposes
  useEffect(() => {
    const mockData = [
      {
        _id: "1",
        userId: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
        },
        weekStart: "2024-05-20",
        weekEnd: "2024-05-26",
        score: [
          {
            timesheetScore: 8.5,
            attendanceScore: 9.0,
            behaviourScore: 8.0,
            totalScore: 8.5,
          },
        ],
        remark: "Excellent performance",
      },
      {
        _id: "2",
        userId: {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
        },
        weekStart: "2024-05-20",
        weekEnd: "2024-05-26",
        score: [
          {
            timesheetScore: 7.0,
            attendanceScore: 8.5,
            behaviourScore: 9.0,
            totalScore: 8.2,
          },
        ],
        remark: "Good improvement",
      },
      {
        _id: "3",
        userId: {
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@example.com",
        },
        weekStart: "2024-05-20",
        weekEnd: "2024-05-26",
        score: [
          {
            timesheetScore: 6.0,
            attendanceScore: 5.5,
            behaviourScore: 6.5,
            totalScore: 6.0,
          },
        ],
        remark: "Needs improvement",
      },
    ];

    setTimeout(() => {
      setPerformanceData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = performanceData.filter((item) => {
      if (!item.userId) return false;

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const email = item.userId.email?.toLowerCase() || "";
        const name =
          item.userId.firstName?.toLowerCase() +
            " " +
            item.userId.lastName?.toLowerCase() || "";
        return email.includes(searchLower) || name.includes(searchLower);
      }
      return true;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "totalScore":
          aValue = a.score[0]?.totalScore || 0;
          bValue = b.score[0]?.totalScore || 0;
          break;
        case "timesheetScore":
          aValue = a.score[0]?.timesheetScore || 0;
          bValue = b.score[0]?.timesheetScore || 0;
          break;
        case "attendanceScore":
          aValue = a.score[0]?.attendanceScore || 0;
          bValue = b.score[0]?.attendanceScore || 0;
          break;
        case "behaviourScore":
          aValue = a.score[0]?.behaviourScore || 0;
          bValue = b.score[0]?.behaviourScore || 0;
          break;
        case "email":
          aValue = a.userId?.email || "";
          bValue = b.userId?.email || "";
          break;
        case "date":
          aValue = new Date(a.weekStart);
          bValue = new Date(b.weekStart);
          break;
        default:
          aValue = a.score[0]?.totalScore || 0;
          bValue = b.score[0]?.totalScore || 0;
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [performanceData, filters.sortBy, filters.sortOrder, filters.searchTerm]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (processedData.length === 0)
      return { avg: 0, highest: 0, lowest: 0, total: 0 };

    const scores = processedData.map((item) => item.score[0]?.totalScore || 0);
    const total = scores.reduce((sum, score) => sum + score, 0);
    const avg = total / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return {
      avg: avg.toFixed(2),
      highest,
      lowest,
      total: processedData.length,
    };
  }, [processedData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (sortBy) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder:
        prev.sortBy === sortBy && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-50";
    if (score >= 5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const SortIcon = ({ column }) => {
    if (filters.sortBy !== column)
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    return filters.sortOrder === "desc" ? (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Performance Board
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Track and analyze employee performance scores
          </p>
        </div>

        {/* Statistics Cards - Mobile Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  Total
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {statistics.total}
                </p>
              </div>
              <Users className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  Average
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {statistics.avg}
                </p>
              </div>
              <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  Highest
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {statistics.highest}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  Lowest
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {statistics.lowest}
                </p>
              </div>
              <TrendingDown className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border w-full justify-center"
          >
            {showMobileFilters ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
            <span className="font-medium">
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
            </span>
          </button>
        </div>

        {/* Filters - Desktop always visible, Mobile collapsible */}
        <div
          className={`bg-white p-4 lg:p-6 rounded-lg shadow-sm border mb-6 ${
            showMobileFilters ? "block" : "hidden lg:block"
          }`}
        >
          <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-wrap lg:gap-4 lg:items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">
                Period:
              </label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange("period", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 lg:flex-none"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 lg:flex-none"
              />
            </div>

            <div className="flex items-center gap-2 lg:ml-auto">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.searchTerm}
                onChange={(e) =>
                  handleFilterChange("searchTerm", e.target.value)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 lg:w-64"
              />
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 mb-6">
          {processedData.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                No performance data found
              </p>
              <p className="text-sm text-gray-500">
                Try adjusting your filters or date range
              </p>
            </div>
          ) : (
            processedData.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-lg shadow-sm border"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.userId?.firstName || "Unknown"}{" "}
                      {item.userId?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.userId?.email}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
                      item.score[0]?.totalScore || 0
                    )}`}
                  >
                    {item.score[0]?.totalScore || 0}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">
                    {formatDate(item.weekStart)}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {formatDate(item.weekEnd)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">Timesheet</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                        item.score[0]?.timesheetScore || 0
                      )}`}
                    >
                      {item.score[0]?.timesheetScore || 0}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">Attendance</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                        item.score[0]?.attendanceScore || 0
                      )}`}
                    >
                      {item.score[0]?.attendanceScore || 0}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Award className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">Behaviour</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                        item.score[0]?.behaviourScore || 0
                      )}`}
                    >
                      {item.score[0]?.behaviourScore || 0}
                    </span>
                  </div>
                </div>

                {item.remark && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Remark:</span> {item.remark}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("email")}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600"
                    >
                      Employee
                      <SortIcon column="email" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600"
                    >
                      Period
                      <SortIcon column="date" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleSort("timesheetScore")}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 mx-auto"
                    >
                      <Clock className="w-4 h-4" />
                      Timesheet
                      <SortIcon column="timesheetScore" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleSort("attendanceScore")}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 mx-auto"
                    >
                      <Users className="w-4 h-4" />
                      Attendance
                      <SortIcon column="attendanceScore" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleSort("behaviourScore")}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 mx-auto"
                    >
                      <Award className="w-4 h-4" />
                      Behaviour
                      <SortIcon column="behaviourScore" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleSort("totalScore")}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 mx-auto"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Total Score
                      <SortIcon column="totalScore" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {processedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">
                          No performance data found
                        </p>
                        <p className="text-sm">
                          Try adjusting your filters or date range
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedData.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.userId?.firstName || "Unknown User"}&nbsp;
                            {item.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.userId?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {formatDate(item.weekStart)}
                          </div>
                          <div className="text-gray-500">
                            to {formatDate(item.weekEnd)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreColor(
                            item.score[0]?.timesheetScore || 0
                          )}`}
                        >
                          {item.score[0]?.timesheetScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreColor(
                            item.score[0]?.attendanceScore || 0
                          )}`}
                        >
                          {item.score[0]?.attendanceScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreColor(
                            item.score[0]?.behaviourScore || 0
                          )}`}
                        >
                          {item.score[0]?.behaviourScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
                            item.score[0]?.totalScore || 0
                          )}`}
                        >
                          {item.score[0]?.totalScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {item.remark || "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {processedData.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600">
            <p>Showing {processedData.length} employees</p>
            <p className="text-center sm:text-right">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilePerformanceBoard;
