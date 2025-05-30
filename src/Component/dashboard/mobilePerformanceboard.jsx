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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    period: "monthly",
    date: new Date().toISOString().split("T")[0],
    sortBy: "totalScore",
    sortOrder: "desc",
    searchTerm: "",
  });

  // Fetch performance data from API
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        filter: filters.period,
        ...(filters.date && { date: filters.date }),
      });

      const response = await fetch(
        `http://localhost:4110/api/performance/getPerformanceScore?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPerformanceData(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching performance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [filters.period, filters.date]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = performanceData.filter((item) => {
      if (!item.userId) return false;

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const email = item.userId.email?.toLowerCase() || "";
        const name = item.userId.name?.toLowerCase() || "";
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

  const getSortLabel = (sortBy) => {
    const labels = {
      totalScore: "Total Score",
      timesheetScore: "Timesheet",
      attendanceScore: "Attendance",
      behaviourScore: "Behaviour",
      email: "Name",
      date: "Date",
    };
    return labels[sortBy] || "Total Score";
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button
            onClick={fetchPerformanceData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Performance</h1>
              <p className="text-sm text-gray-600">Employee scores</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {showFilters ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Statistics Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">
                  {statistics.total}
                </p>
              </div>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Average</p>
                <p className="text-lg font-bold text-gray-900">
                  {statistics.avg}
                </p>
              </div>
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Highest</p>
                <p className="text-lg font-bold text-gray-900">
                  {statistics.highest}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Lowest</p>
                <p className="text-lg font-bold text-gray-900">
                  {statistics.lowest}
                </p>
              </div>
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Name or email..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      handleFilterChange("searchTerm", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Period and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period
                  </label>
                  <select
                    value={filters.period}
                    onChange={(e) =>
                      handleFilterChange("period", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="totalScore">Total Score</option>
                  <option value="timesheetScore">Timesheet Score</option>
                  <option value="attendanceScore">Attendance Score</option>
                  <option value="behaviourScore">Behaviour Score</option>
                  <option value="email">Name</option>
                  <option value="date">Date</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Sort Order
                </span>
                <button
                  onClick={() =>
                    handleFilterChange(
                      "sortOrder",
                      filters.sortOrder === "desc" ? "asc" : "desc"
                    )
                  }
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium"
                >
                  {filters.sortOrder === "desc" ? "High to Low" : "Low to High"}
                  {filters.sortOrder === "desc" ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Employee Cards */}
        <div className="space-y-3">
          {processedData.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-500 mb-2">
                No data found
              </p>
              <p className="text-sm text-gray-400">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            processedData.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-lg shadow-sm border"
              >
                {/* Employee Info Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {item.userId?.firstName || "Unknown"}{" "}
                      {item.userId?.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {item.userId?.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
                        item.score[0]?.totalScore || 0
                      )}`}
                    >
                      {item.score[0]?.totalScore || 0}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Total</p>
                  </div>
                </div>

                {/* Period */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {formatDate(item.weekStart)} - {formatDate(item.weekEnd)}
                  </span>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-3 gap-3 mb-3">
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

                {/* Remark */}
                {item.remark && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Remark:</span> {item.remark}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {processedData.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-1">Showing {processedData.length} employees</p>
              <p className="text-xs">Updated: {new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilePerformanceBoard;
