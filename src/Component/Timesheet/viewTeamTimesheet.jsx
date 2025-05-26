"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  FiSearch, FiCalendar, FiFilter, FiDownload,
  FiRefreshCw, FiAlertCircle, FiUser, FiClock,
  FiChevronDown, FiX, FiCheck
} from "react-icons/fi";
import axios from "axios";
import debounce from "lodash/debounce";
import * as XLSX from 'xlsx';
import { axiosInstance } from "@/lib/axiosInstance";


export default function ViewTeamTimesheet() {
  // Primary state
  const [currentView, setCurrentView] = useState("day");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [timesheetData, setTimesheetData] = useState([]);
  const [filteredTimesheetData, setFilteredTimesheetData] = useState([]);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Filter states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEmployeeListOpen, setIsEmployeeListOpen] = useState(false);
  const [filterBuckets, setFilterBuckets] = useState([]);
  const [selectedBuckets, setSelectedBuckets] = useState([]);

  // Date states
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [dateRange, setDateRange] = useState({ firstDay: "", lastDay: "" });

  // Employee data states
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employeePage, setEmployeePage] = useState(1);
  const [hasMoreEmployees, setHasMoreEmployees] = useState(true);
  const employeeListRef = useRef(null);

  // Domain refs
  const viewDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);

  // Constants
  const EMPLOYEES_PER_PAGE = 20;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2020 + 6 },
    (_, i) => 2020 + i
  );

  // Memoized data processing
  const uniqueEmployees = useMemo(() => {
    if (!timesheetData.length) return [];
    const employeeMap = new Map();
    timesheetData.forEach(timesheet => {
      const userId = timesheet.userId._id;
      if (!employeeMap.has(userId)) {
        employeeMap.set(userId, {
          id: userId,
          name: `${timesheet.userId.firstName} ${timesheet.userId.lastName}`,
          firstName: timesheet.userId.firstName,
          lastName: timesheet.userId.lastName,
          position: timesheet.userId.position || 'Employee',
          email: timesheet.userId.email
        });
      }
    });
    return Array.from(employeeMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [timesheetData]);

  // Employee filtering logic
  const filterEmployees = useCallback((query) => {
    const lowercaseQuery = query.toLowerCase();
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(lowercaseQuery) ||
      employee.email.toLowerCase().includes(lowercaseQuery)
    );
  }, [employees]);

  // Update filtered employees
  useEffect(() => {
    if (employees.length > 0) {
      const filtered = filterEmployees(employeeSearchQuery);
      setFilteredEmployees(filtered.slice(0, EMPLOYEES_PER_PAGE * employeePage));
      setHasMoreEmployees(filtered.length > EMPLOYEES_PER_PAGE * employeePage);
    }
  }, [employeeSearchQuery, employees, employeePage, filterEmployees]);

  // Initialize employees
  useEffect(() => {
    if (uniqueEmployees.length > 0) {
      setEmployees(uniqueEmployees);
      if (selectedEmployee) {
        const freshEmployee = uniqueEmployees.find(e => e.id === selectedEmployee.id);
        setSelectedEmployee(freshEmployee || uniqueEmployees[0]);
      } else {
        setSelectedEmployee(uniqueEmployees[0]);
      }
    }
  }, [uniqueEmployees]);

  // Fetch timesheets
  const fetchTimesheets = async () => {
  setIsLoading(true);
  setErrorMessage("");

  try {
    // First, get user role/position
    const userRes = await axiosInstance.get('/user/auth/me', { withCredentials: true });
    const position = userRes?.data?.role;

    let endpoint = "";

    if (position === "TeamLeader") {
      endpoint = `${process.env.NEXT_PUBLIC_BACKEND_API}/timesheet/user/timesheets`;
    } else if (position === "Manager" || position === "HR") {
      endpoint = `${process.env.NEXT_PUBLIC_BACKEND_API}/timesheet/admin/timesheets`;
    } else {
      throw new Error("Unauthorized access to timesheet data");
    }

    const response = await axios.get(endpoint, { withCredentials: true });

    if (response.data.success) {
      setTimesheetData(response.data.data);

      const buckets = [
        ...new Set(
          response.data.data.flatMap(sheet =>
            sheet.items?.map(item => item.bucket) || []
          )
        ),
      ];
      setFilterBuckets(buckets);
      updateFilteredData(response.data.data);
    } else {
      throw new Error("Invalid data format received");
    }
  } catch (error) {
    console.error("Failed to fetch timesheets:", error);
    setErrorMessage(error.response?.data?.message || error.message || "Failed to load data");
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    fetchTimesheets();
  }, []);

  // Event listeners for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target)) {
        setIsViewOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setIsEmployeeListOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search handlers
  const handleEmployeeSearch = (query) => {
    setEmployeeSearchQuery(query);
    setEmployeePage(1);
  };

  // Scroll handler
  const handleEmployeeListScroll = () => {
    if (!employeeListRef.current || !hasMoreEmployees) return;
    const { scrollTop, scrollHeight, clientHeight } = employeeListRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setEmployeePage(prev => prev + 1);
    }
  };

  // Helper function to get the first and last day of the week for a given date
  const getWeekRange = (date) => {
    const currentDate = new Date(date);
    const day = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.

    // Calculate the first day (Sunday) of the week
    const firstDay = new Date(currentDate);
    firstDay.setDate(currentDate.getDate() - day);

    // Calculate the last day (Saturday) of the week
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);

    return {
      firstDay: firstDay.toISOString().split("T")[0],
      lastDay: lastDay.toISOString().split("T")[0],
    };
  };

  // Helper function to get the first and last day of the month
  const getMonthRange = (year, month) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    return {
      firstDay: firstDay.toISOString().split("T")[0],
      lastDay: lastDay.toISOString().split("T")[0],
    };
  };

  // Helper function to get the first and last day of the year
  const getYearRange = (year) => {
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);

    return {
      firstDay: firstDay.toISOString().split("T")[0],
      lastDay: lastDay.toISOString().split("T")[0],
    };
  };

  // Format timesheet data for display
  const formatTimesheetData = (apiData) => {
    if (!selectedEmployee) return [];

    // Group entries by date
    const entriesByDate = {};

    apiData.forEach(timesheet => {
      // Only process entries for the selected employee
      if (timesheet.userId._id === selectedEmployee.id) {
        // Use the timesheet date as the base date
        const date = timesheet.date;

        if (!entriesByDate[date]) {
          entriesByDate[date] = {
            date,
            entries: []
          };
        }

        // Process each timesheet item
        timesheet.items.forEach(item => {
          // Skip if bucket is filtered out
          if (selectedBuckets.length > 0 && !selectedBuckets.includes(item.bucket)) {
            return;
          }

          entriesByDate[date].entries.push({
            bucket: item.bucket || "Uncategorized",
            task: item.task,
            time: item.timeRange,
            duration: item.duration,
            type: item.type,
            userId: timesheet.userId._id,
            userName: `${timesheet.userId.firstName} ${timesheet.userId.lastName}`,
            projectName: timesheet.projectName
          });
        });

        // Remove dates with no entries after filtering
        if (entriesByDate[date].entries.length === 0) {
          delete entriesByDate[date];
        }
      }
    });

    // Convert to array and sort by date (newest first)
    return Object.values(entriesByDate).sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );
  };

  // Update filtered data based on current view and filters
  const updateFilteredData = (data = timesheetData) => {
    let newDateRange = {};

    if (currentView === "day") {
      // For day view, only show the selected date
      newDateRange = {
        firstDay: selectedDate,
        lastDay: selectedDate
      };
    } else if (currentView === "week") {
      newDateRange = getWeekRange(selectedDate);
    } else if (currentView === "month") {
      newDateRange = getMonthRange(selectedYear, selectedMonth);
    } else if (currentView === "year") {
      newDateRange = getYearRange(selectedYear);
    }

    setDateRange(newDateRange);

    // Format and filter the data
    const formattedData = formatTimesheetData(data);

    // Filter by date range
    const filtered = formattedData.filter(item => {
      return item.date >= newDateRange.firstDay && item.date <= newDateRange.lastDay;
    });

    setFilteredTimesheetData(filtered);
  };

  // Update filtered data when relevant state changes
  useEffect(() => {
    updateFilteredData();
  }, [selectedDate, selectedMonth, selectedYear, currentView, selectedBuckets, selectedEmployee]);

  // Handle filter changes
  const toggleBucketFilter = (bucket) => {
    if (selectedBuckets.includes(bucket)) {
      setSelectedBuckets(selectedBuckets.filter(b => b !== bucket));
    } else {
      setSelectedBuckets([...selectedBuckets, bucket]);
    }
  };

  // Total Duration Calculation
  function calculateTotalDuration(entries) {
    let totalMinutes = 0;
    entries.forEach((entry) => {
      const [hours, minutes] = entry.duration.split(":").map(Number);
      totalMinutes += hours * 60 + minutes;
    });
    const h = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (totalMinutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  // Calculate grand total duration
  function calculateGrandTotal() {
    let totalMinutes = 0;
    filteredTimesheetData.forEach((day) => {
      day.entries.forEach((entry) => {
        const [hours, minutes] = entry.duration.split(":").map(Number);
        totalMinutes += hours * 60 + minutes;
      });
    });

    const h = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (totalMinutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle exporting data
  const handleExport = async () => {
    if (filteredTimesheetData.length === 0) {
      alert("No data to export");
      return;
    }

    try {
      setIsLoading(true);

      // Transform data to Excel-friendly format
      const rows = [];
      const header = [
        "Date",
        "Bucket",
        "Task",
        "Start Time",
        "End Time",
        "Duration",
        "Employee",
        "Position",
        "Project"
      ];
      rows.push(header);

      filteredTimesheetData.forEach(day => {
        day.entries.forEach(entry => {
          const [startTime, endTime] = entry.time.split(" - ");
          rows.push([
            day.date,
            entry.bucket,
            entry.task,
            startTime,
            endTime,
            entry.duration,
            entry.userName,
            selectedEmployee?.position || "N/A",
            entry.projectName || "N/A"
          ]);
        });
      });

      // Create worksheet and workbook
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");

      // Generate file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;

      // Corrected variable name here
      const dateRangeString = currentView === 'day'
        ? selectedDate
        : `${dateRange.firstDay}_to_${dateRange.lastDay}`;

      link.download = `Timesheet_${selectedEmployee?.name}_${dateRangeString}.xlsx`;
      link.click();

      URL.revokeObjectURL(url);
      setIsLoading(false);
    } catch (error) {
      console.error("Error exporting data:", error);
      setErrorMessage("Failed to export data");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Employee Selector */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="mb-4 relative" ref={employeeDropdownRef}>
          <div className="text-sm text-gray-500 mb-1 font-medium">Employee</div>
          <div
            onClick={() => setIsEmployeeListOpen(!isEmployeeListOpen)}
            className="flex items-center justify-between p-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                {selectedEmployee ? selectedEmployee.firstName[0] + selectedEmployee.lastName[0] : "?"}
              </div>
              <div>
                <div className="font-medium">{selectedEmployee?.name || "Select Employee"}</div>
                <div className="text-xs text-gray-500">{selectedEmployee?.position}</div>
              </div>
            </div>
            <FiChevronDown className={`transition-transform ${isEmployeeListOpen ? "rotate-180" : ""}`} />
          </div>

          {isEmployeeListOpen && (
            <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={employeeSearchQuery}
                    onChange={(e) => handleEmployeeSearch(e.target.value)}
                    placeholder="Search employees..."
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md"
                  />
                  {employeeSearchQuery && (
                    <button
                      onClick={() => handleEmployeeSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>

              <div
                className="max-h-60 overflow-y-auto"
                ref={employeeListRef}
                onScroll={handleEmployeeListScroll}
              >
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`flex items-center p-2 hover:bg-blue-50 cursor-pointer ${selectedEmployee?.id === employee.id ? "bg-blue-50" : ""}`}
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setIsEmployeeListOpen(false);
                    }}
                  >
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                      {employee.firstName[0] + employee.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-xs text-gray-500">{employee.position}</div>
                    </div>
                    {selectedEmployee?.id === employee.id && <FiCheck className="text-blue-600" />}
                  </div>
                ))}
                {filteredEmployees.length === 0 && (
                  <div className="p-4 text-center text-gray-500">No employees found</div>
                )}
                {hasMoreEmployees && (
                  <div className="p-2 text-center text-gray-500 text-sm">Scroll to load more</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View selector */}
          <div className="flex flex-col relative" ref={viewDropdownRef}>
            <button
              onClick={() => setIsViewOpen(!isViewOpen)}
              className={`border border-gray-300 px-3 py-2 bg-white flex justify-between items-center min-w-32 rounded-md hover:border-blue-400 transition-colors`}
            >
              <FiCalendar className="mr-2 text-gray-600" />
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
              <FiChevronDown className={`ml-2 transition-transform ${isViewOpen ? "rotate-180" : ""}`} />
            </button>

            {isViewOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                {["day", "week", "month", "year"].map((view) => (
                  <div
                    key={view}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center ${currentView === view ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    onClick={() => {
                      setCurrentView(view);
                      setIsViewOpen(false);
                    }}
                  >
                    {currentView === view && <FiCheck className="mr-2" />}
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date selectors */}
          {(currentView === "day" || currentView === "week") && (
            <div className="flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 hover:border-blue-400 transition-colors"
              />
            </div>
          )}

          {currentView === "month" && (
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8 hover:border-blue-400 transition-colors"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1} className="bg-white">
                      {month}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <FiChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8 hover:border-blue-400 transition-colors"
                >
                  {years.map((year) => (
                    <option key={year} value={year} className="bg-white">
                      {year}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <FiChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {currentView === "year" && (
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8 hover:border-blue-400 transition-colors"
              >
                {years.map((year) => (
                  <option key={year} value={year} className="bg-white">
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <FiChevronDown className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Filter dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`border border-gray-300 rounded-md px-3 py-2 bg-white flex items-center gap-2 hover:border-blue-400 transition-colors ${selectedBuckets.length > 0 ? "border-blue-400 text-blue-600" : ""
                }`}
            >
              <FiFilter className={selectedBuckets.length > 0 ? "text-blue-600" : "text-gray-600"} />
              <span>
                {selectedBuckets.length > 0
                  ? `Filters (${selectedBuckets.length})`
                  : "Filters"}
              </span>
            </button>

            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-md z-10">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium">Bucket Types</h3>
                  <button
                    onClick={() => setSelectedBuckets([])}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={selectedBuckets.length === 0}
                  >
                    Clear All
                  </button>
                </div>
                <div className="p-3 max-h-60 overflow-y-auto">
                  {filterBuckets.length > 0 ? (
                    filterBuckets.map((bucket) => (
                      <div key={bucket} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`bucket-${bucket}`}
                          checked={selectedBuckets.includes(bucket)}
                          onChange={() => toggleBucketFilter(bucket)}
                          className="mr-2 w-4 h-4 accent-blue-600"
                        />
                        <label
                          htmlFor={`bucket-${bucket}`}
                          className="cursor-pointer flex-1"
                        >
                          {bucket}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No bucket types found</p>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header with actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#018ABE]">
            {selectedEmployee ? `${selectedEmployee.name}'s Timesheet` : "Timesheet"}
          </h2>
          <p className="text-gray-600">
            {currentView === "day" && (selectedDate ? formatDate(selectedDate) : "Select a date")}
            {currentView === "week" && (
              <>Week of {dateRange.firstDay ? formatDate(dateRange.firstDay) : "--"} to{" "}
                {dateRange.lastDay ? formatDate(dateRange.lastDay) : "--"}</>
            )}
            {currentView === "month" && <>{months[selectedMonth - 1]} {selectedYear}</>}
            {currentView === "year" && <>Year {selectedYear}</>}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Refresh button */}
          <button
            onClick={fetchTimesheets}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white flex items-center gap-2 hover:bg-gray-50"
            disabled={isLoading}
          >
            <FiRefreshCw className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || filteredTimesheetData.length === 0}
          >
            {isLoading ? (
              <FiRefreshCw className="animate-spin text-gray-600" />
            ) : (
              <FiDownload className="text-gray-600" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? 'Exporting...' : 'Export Excel'}
            </span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-md animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {errorMessage}
              </p>
            </div>
            <button
              className="ml-auto text-red-400 hover:text-red-600"
              onClick={() => setErrorMessage("")}
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#018ABE]"></div>
        </div>
      ) : (
        /* Main Content */
        <div className="space-y-6">
          {filteredTimesheetData.length > 0 ? (
            <>
              {/* Timesheet Entries */}
              {filteredTimesheetData.map((dayData) => (
                <div key={dayData.date} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Date Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2 sm:mb-0">
                      {formatDate(dayData.date)}
                    </h3>
                    <div className="bg-blue-50 px-3 py-1 rounded-full text-sm font-medium text-[#018ABE]">
                      Total: {calculateTotalDuration(dayData.entries)}
                    </div>
                  </div>

                  {/* Entries Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[120px]">
                            Bucket
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Task
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 min-w-[100px]">
                            Time
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 min-w-[80px]">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayData.entries.map((entry, index) => (
                          <tr
                            key={index}
                            className={`border-t border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                          >
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {entry.bucket}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {entry.task}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-700">
                              {entry.time}
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                              {entry.duration}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Grand Total */}
              <div className="bg-[#018ABE] p-4 rounded-lg shadow-sm text-white">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Grand Total</span>
                  <span className="font-bold text-xl">
                    {calculateGrandTotal()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* No Data State */
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
              <div className="flex items-center">
                <FiAlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
                <div>
                  <p className="text-sm text-yellow-700">
                    No timesheet entries found for the selected period and filters.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}