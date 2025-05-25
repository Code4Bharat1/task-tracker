"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Calendar,
  ArrowDownUp,
  Download,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Check,
  Clock,
  XCircle,
  BarChart4,
  User,
  CalendarDays
} from "lucide-react";

export default function AttendanceTable() {
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Period filter states
  const [activeFilterPeriod, setActiveFilterPeriod] = useState("month"); // 'day', 'week', 'month', 'year'
  
  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRemarks, setSelectedRemarks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  // List of all possible remarks for filtering
  const remarkOptions = ["Present", "Late", "Absent", "Half Day", "On Leave"];

  // Function to fetch attendance data
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/attendance/allAttendance`, {
        withCredentials: true, // This enables cookies to be sent
      });

      if (response.data && Array.isArray(response.data)) {
        // Process the data
        const processedData = response.data.map((item) => ({
          id: item._id,
          userId: item.userInfo?._id || "",
          name: item.userInfo ? `${item.userInfo.firstName} ${item.userInfo.lastName}` : "Unknown User",
          department: item?.status || "N/A",
          designation: item.userInfo?.position || "N/A",
          inTime: item.punchIn ? new Date(item.punchIn) : null,
          outTime: item.punchOut ? new Date(item.punchOut) : null,
          remark: item.remark || "N/A",
          date: new Date(item.date),
          // workHours: calculateWorkHours(item.punchIn, item.punchOut),
          workHours: item.punchInLocation,
        }));
        setAttendanceData(processedData);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Failed to fetch attendance data:", err);
      setError("Failed to load attendance data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate work hours
  const calculateWorkHours = (punchIn, punchOut) => {
    if (!punchIn || !punchOut) return null;

    const inTime = new Date(punchIn);
    const outTime = new Date(punchOut);
    const diffMs = outTime - inTime;

    // Convert to hours and minutes
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  // Initial data fetch
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Period filter functions
  const setFilterToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateRange({
      startDate: today,
      endDate: today
    });
    setActiveFilterPeriod("day");
  };

  const setFilterThisWeek = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    firstDayOfWeek.setDate(diff);
    
    setDateRange({
      startDate: firstDayOfWeek.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
    setActiveFilterPeriod("week");
  };

  const setFilterThisMonth = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setDateRange({
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
    setActiveFilterPeriod("month");
  };

  const setFilterThisYear = () => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    
    setDateRange({
      startDate: firstDayOfYear.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
    setActiveFilterPeriod("year");
  };

  // Custom date range handler
  const handleCustomDateRange = (start, end) => {
    setDateRange({
      startDate: start,
      endDate: end
    });
    setActiveFilterPeriod("custom");
  };

  // Apply filters and sorting to data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...attendanceData];

    // Apply date range filter
    filtered = filtered.filter(item => {
      const itemDate = item.date.toISOString().split('T')[0];
      return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
    });

    // Apply search term filter (case-insensitive)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.department?.toLowerCase().includes(search) ||
        item.designation?.toLowerCase().includes(search)
      );
    }

    // Apply remarks filter
    if (selectedRemarks.length > 0) {
      filtered = filtered.filter(item => selectedRemarks.includes(item.remark));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc'
          ? a.date - b.date
          : b.date - a.date;
      } else if (sortConfig.key === 'inTime' || sortConfig.key === 'outTime') {
        if (!a[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        if (!b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        return sortConfig.direction === 'asc'
          ? a[sortConfig.key] - b[sortConfig.key]
          : b[sortConfig.key] - a[sortConfig.key];
      }
      return 0;
    });

    // Update total pages based on filtered results
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    if (currentPage > Math.ceil(filtered.length / itemsPerPage)) {
      setCurrentPage(1);
    }

    return filtered;
  }, [attendanceData, dateRange, searchTerm, selectedRemarks, sortConfig, itemsPerPage]);

  // Get current page data
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSortedData.slice(start, end);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  // Group data by date for display
  const groupedByDate = useMemo(() => {
    return currentData.reduce((acc, item) => {
      const dateStr = item.date.toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(item);
      return acc;
    }, {});
  }, [currentData]);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle remark selection
  const toggleRemark = (remark) => {
    if (selectedRemarks.includes(remark)) {
      setSelectedRemarks(selectedRemarks.filter(r => r !== remark));
    } else {
      setSelectedRemarks([...selectedRemarks, remark]);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    // Convert data to CSV format
    const headers = ["Date", "Name", "Department", "Designation", "In Time", "Out Time", "Work Hours", "Remark"];

    const csvRows = [];
    csvRows.push(headers.join(","));

    filteredAndSortedData.forEach(item => {
      const row = [
        item.date.toLocaleDateString(),
        `"${item.name}"`, // Quotes to handle names with commas
        `"${item.department}"`,
        `"${item.designation}"`,
        item.inTime ? item.inTime.toLocaleTimeString() : "-",
        item.outTime ? item.outTime.toLocaleTimeString() : "-",
        item.workHours || "-",
        item.remark
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

    // Create download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return "-";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLocation = (fullAddress) => {
    if (!fullAddress) return "-";

    // Split address components
    const parts = fullAddress.split(',').map(part => part.trim());

    // Extract relevant parts - adjust based on your typical data structure
    const [locality, city, , state, postal] = parts;

    return `${locality}, ${city}, ${state} ${postal || ''}`.trim();
  };
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get color based on remark
  const getRemarkColor = (remark) => {
    switch (remark) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Late":
        return "bg-orange-100 text-orange-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Half Day":
        return "bg-blue-100 text-blue-800";
      case "On Leave":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get icon based on remark
  const getRemarkIcon = (remark) => {
    switch (remark) {
      case "Present":
        return <Check size={14} className="mr-1" />;
      case "Late":
        return <Clock size={14} className="mr-1" />;
      case "Absent":
        return <XCircle size={14} className="mr-1" />;
      case "Half Day":
        return <Clock size={14} className="mr-1" />;
      case "On Leave":
        return <AlertTriangle size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  // Return summary stats
  const getAttendanceSummary = () => {
    const total = filteredAndSortedData.length;
    const present = filteredAndSortedData.filter(item => item.remark === "Present").length;
    const late = filteredAndSortedData.filter(item => item.remark === "Late").length;
    const absent = filteredAndSortedData.filter(item => item.remark === "Absent").length;
    const onLeave = filteredAndSortedData.filter(item => item.remark === "On Leave").length;
    const halfDay = filteredAndSortedData.filter(item => item.remark === "Half Day").length;

    return {
      total,
      present,
      late,
      absent,
      onLeave,
      halfDay,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  };

  const summary = getAttendanceSummary();

  // Get period label for display
  const getPeriodLabel = () => {
    switch (activeFilterPeriod) {
      case "day":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      case "custom":
        return "Custom Range";
      default:
        return "This Month";
    }
  };

  // Get active button class
  const getActiveButtonClass = (period) => {
    return activeFilterPeriod === period
      ? "bg-cyan-100 text-cyan-700 border-cyan-300"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header with title and stats */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Employee Attendance Dashboard</h1>
          
          {/* Period Selector */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={setFilterToday}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border ${getActiveButtonClass("day")}`}
            >
              Today
            </button>
            <button
              onClick={setFilterThisWeek}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border ${getActiveButtonClass("week")}`}
            >
              This Week
            </button>
            <button
              onClick={setFilterThisMonth}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border ${getActiveButtonClass("month")}`}
            >
              This Month
            </button>
            <button
              onClick={setFilterThisYear}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border ${getActiveButtonClass("year")}`}
            >
              This Year
            </button>
          </div>
        </div>

        {/* Period indicator */}
        <div className="flex items-center mb-6">
          <CalendarDays size={18} className="text-cyan-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            Viewing data for: <span className="text-cyan-700">{getPeriodLabel()}</span> ({dateRange.startDate} to {dateRange.endDate})
          </span>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Present</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-green-600">{summary.present}</p>
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                <Check size={12} className="mr-1" />
                {summary.presentPercentage}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Late</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-orange-600">{summary.late}</p>
              <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center">
                <Clock size={12} className="mr-1" />
                {summary.total > 0 ? Math.round((summary.late / summary.total) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Absent</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
              <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center">
                <XCircle size={12} className="mr-1" />
                {summary.total > 0 ? Math.round((summary.absent / summary.total) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-2xl font-bold text-blue-600">{summary.total}</p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          {/* Search */}
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <Search size={18} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee, department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={16} className="mr-2" />
              <span>Filters</span>
              {selectedRemarks.length > 0 && (
                <span className="ml-2 bg-cyan-100 text-cyan-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {selectedRemarks.length}
                </span>
              )}
            </button>

            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              <Download size={16} className="mr-2" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
              {/* Date Range */}
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Date Range</label>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <div className="relative">
                      <Calendar size={16} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={dateRange.startDate}
                        onChange={(e) => handleCustomDateRange(e.target.value, dateRange.endDate)}
                      />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <div className="relative">
                      <Calendar size={16} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={dateRange.endDate}
                        onChange={(e) => handleCustomDateRange(dateRange.startDate, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Remark Filters */}
              <div className="w-full md:w-2/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Status</label>
                <div className="flex flex-wrap gap-2">
                  {remarkOptions.map((remark) => (
                    <button
                      key={remark}
                      onClick={() => toggleRemark(remark)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${selectedRemarks.includes(remark)
                        ? getRemarkColor(remark) + " font-medium"
                        : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {selectedRemarks.includes(remark) && getRemarkIcon(remark)}
                      {remark}
                    </button>
                  ))}

                  {selectedRemarks.length > 0 && (
                    <button
                      onClick={() => setSelectedRemarks([])}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      <X size={14} className="mr-1" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {filteredAndSortedData.length} {filteredAndSortedData.length === 1 ? 'record' : 'records'}
              </div>
              <div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
            <p className="text-gray-500">Loading attendance data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertTriangle size={24} className="text-red-500 mr-4" />
            <div>
              <h3 className="font-bold text-red-800">Error Loading Data</h3>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={fetchAttendanceData}
                className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && filteredAndSortedData.length === 0 && (
        <div className="bg-white rounded-lg shadow-md py-12 px-6 flex flex-col items-center justify-center">
          <Search size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No attendance records found</h3>
          <p className="text-gray-500 text-center max-w-md mb-4">
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedRemarks([]);
              setFilterThisMonth(); // Reset to default month view
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Data View Selector */}
      {!loading && !error && filteredAndSortedData.length > 0 && (
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-cyan-700 bg-cyan-100 border border-cyan-300 rounded-l-lg"
              title="Date view"
            >
              <CalendarDays size={16} />
              <span className="ml-2 hidden sm:inline">Date View</span>
            </button>
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-300 rounded-r-lg hover:bg-gray-50"
              title="Employee view (coming soon)"
            >
              <User size={16} />
              <span className="ml-2 hidden sm:inline">Employee View</span>
            </button>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {!loading && !error && filteredAndSortedData.length > 0 ? (
        <>
          {Object.entries(groupedByDate).map(([date, records]) => (
            <div key={date} className="mb-6">
              <div className="px-4 py-2 bg-gray-100 rounded-t-lg font-medium text-gray-700 border-b border-gray-200">
                {formatDate(new Date(date))}
              </div>
              <div className="bg-white rounded-b-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('name')}
                        >
                          <div className="flex items-center">
                            <span>Employee</span>
                            <ArrowDownUp size={14} className="ml-1" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out Status</th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('inTime')}
                        >
                          <div className="flex items-center">
                            <span>In Time</span>
                            <ArrowDownUp size={14} className="ml-1" />
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('outTime')}
                        >
                          <div className="flex items-center">
                            <span>Out Time</span>
                            <ArrowDownUp size={14} className="ml-1" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {records.map((record, index) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {record.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{record.name}</div>
                                <div className="text-sm text-gray-500">{record.designation}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{record.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(record.inTime)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(record.outTime)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="max-w-[200px] truncate" title={record.workHours}>
                              {formatLocation(record.workHours)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRemarkColor(record.remark)}`}>
                              {getRemarkIcon(record.remark)}
                              {record.remark}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-md py-3 px-6 flex items-center justify-between border-t border-gray-200 mt-6">
              {/* Mobile Pagination */}
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Next
                </button>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                          ? 'z-10 bg-cyan-50 border-cyan-500 text-cyan-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-gray-500">
          {loading ? 'Loading...' : error ? 'Error loading attendance.' : 'No records found.'}
        </div>
      )}
      
      {/* Quick Stats Footer */}
      {!loading && !error && filteredAndSortedData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mt-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center mb-2 sm:mb-0">
              <BarChart4 size={18} className="text-cyan-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Quick Stats for {getPeriodLabel()}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-600">Present: {summary.present}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <span className="text-xs text-gray-600">Late: {summary.late}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-xs text-gray-600">Absent: {summary.absent}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-xs text-gray-600">On Leave: {summary.onLeave}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-xs text-gray-600">Half Day: {summary.halfDay}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}