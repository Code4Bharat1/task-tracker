"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import axios from "axios";
import toast from "react-hot-toast";
import { CalendarIcon, FilterIcon, SearchIcon, ChevronDownIcon } from "lucide-react";

export default function LeaveTable() {
  const underlineRef = useRef(null);
  const router = useRouter();

  const [leaves, setLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort states
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  // Fetch leave data
  useEffect(() => {
    const fetchLeaves = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/leave/admin/company-leaves`,
          {
            withCredentials: true,
          }
        );

        if (data.success) {
          setLeaves(data.data);
        } else {
          toast.error("Failed to fetch leave data");
        }
      } catch (error) {
        toast.error("Error fetching leave data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  // Count leaves by status
  const countsByStatus = leaves.reduce(
    (acc, leave) => {
      const status = leave.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 }
  );

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setSortField("createdAt");
    setSortDirection("desc");
  };

  // Filter and sort leaves
  const filteredLeaves = leaves
    .filter((leave) => {
      // Filter by status tab
      if (leave.status.toLowerCase() !== activeTab.toLowerCase()) return false;
      
      // Filter by search query (name or leave type)
      const fullName = `${leave.userId?.firstName} ${leave.userId?.lastName}`.toLowerCase();
      const leaveType = leave.leaveType.toLowerCase();
      if (
        searchQuery &&
        !fullName.includes(searchQuery.toLowerCase()) &&
        !leaveType.includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      
      // Filter by date range
      if (startDate && endDate) {
        const leaveFromDate = new Date(leave.fromDate);
        const leaveToDate = new Date(leave.toDate);
        const filterStartDate = new Date(startDate);
        const filterEndDate = new Date(endDate);
        
        // Check if leave period overlaps with filter period
        if (
          (leaveFromDate > filterEndDate) || 
          (leaveToDate < filterStartDate)
        ) {
          return false;
        }
      } else if (startDate) {
        const leaveFromDate = new Date(leave.fromDate);
        const filterStartDate = new Date(startDate);
        if (leaveFromDate < filterStartDate) return false;
      } else if (endDate) {
        const leaveToDate = new Date(leave.toDate);
        const filterEndDate = new Date(endDate);
        if (leaveToDate > filterEndDate) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Handle sorting
      let valueA, valueB;
      
      switch (sortField) {
        case "name":
          valueA = `${a.userId?.firstName} ${a.userId?.lastName}`.toLowerCase();
          valueB = `${b.userId?.firstName} ${b.userId?.lastName}`.toLowerCase();
          break;
        case "leaveType":
          valueA = a.leaveType.toLowerCase();
          valueB = b.leaveType.toLowerCase();
          break;
        case "createdAt":
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case "fromDate":
          valueA = new Date(a.fromDate).getTime();
          valueB = new Date(b.fromDate).getTime();
          break;
        case "days":
          valueA = a.days;
          valueB = b.days;
          break;
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
      }
      
      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  // Render the sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 text-xs">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mt-10 px-4 mx-auto">
      {/* Heading with animation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold relative inline-block text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
          ></span>
          Leave Management
        </h2>
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["Pending", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            className={`py-3 px-6 font-medium text-sm transition-colors duration-200 relative ${
              activeTab === status
                ? "text-[#018ABE] font-semibold border-b-2 border-[#018ABE]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(status)}
          >
            {status}
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {countsByStatus[status.toLowerCase()] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by name or leave type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#018ABE] focus:border-transparent"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-gray-600 hover:text-[#018ABE] transition-colors px-4 py-2 border border-gray-300 rounded-lg"
          >
            <FilterIcon size={16} />
            <span>Filters</span>
            <ChevronDownIcon size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#018ABE]"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#018ABE]"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg transition-colors w-full"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg mx-auto bg-white">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#018ABE]"></div>
          </div>
        ) : (
          <table className="min-w-full border-collapse table-auto text-sm">
            <thead>
              <tr className="bg-[#018ABE] text-white">
                <th className="px-4 py-3 text-left w-[5%]">No.</th>
                <th 
                  className="px-4 py-3 text-left w-[15%] cursor-pointer hover:bg-[#0179a4] transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Employee Name {renderSortIndicator("name")}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left w-[15%] cursor-pointer hover:bg-[#0179a4] transition-colors"
                  onClick={() => handleSort("leaveType")}
                >
                  <div className="flex items-center">
                    Leave Type {renderSortIndicator("leaveType")}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left w-[12%] cursor-pointer hover:bg-[#0179a4] transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Applied On {renderSortIndicator("createdAt")}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left w-[12%] cursor-pointer hover:bg-[#0179a4] transition-colors"
                  onClick={() => handleSort("fromDate")}
                >
                  <div className="flex items-center">
                    From {renderSortIndicator("fromDate")}
                  </div>
                </th>
                <th className="px-4 py-3 text-left w-[12%]">To</th>
                <th 
                  className="px-4 py-3 text-left w-[7%] cursor-pointer hover:bg-[#0179a4] transition-colors"
                  onClick={() => handleSort("days")}
                >
                  <div className="flex items-center">
                    Days {renderSortIndicator("days")}
                  </div>
                </th>
                <th className="px-4 py-3 text-center w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      <p className="font-medium">No leave applications found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((entry, index) => (
                  <tr 
                    key={entry._id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{entry.userId?.firstName} {entry.userId?.lastName}</div>
                      <div className="text-xs text-gray-500">{entry.userId?.email || "No email"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.leaveType === "Sick Leave" ? "bg-red-100 text-red-800" :
                        entry.leaveType === "Casual Leave" ? "bg-green-100 text-green-800" :
                        entry.leaveType === "Annual Leave" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {entry.leaveType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(entry.fromDate).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(entry.toDate).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {entry.days || '1'} {entry.days > 1 ? "days" : "day"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => router.push(`/leavetable/${entry._id}`)}
                        className="inline-flex items-center justify-center px-3 py-1 bg-[#018ABE] text-white text-xs font-medium rounded hover:bg-[#0179a4] transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add some CSS for animations */}
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}