"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation"; // For Next.js 13+ App Router
// OR use this for Next.js 12 and earlier:
// import { useRouter } from "next/router";

export default function MobileSalaryPage() {
  const [filter, setFilter] = useState("Filter");
  const [showDropdown, setShowDropdown] = useState(false);

  // Use actual Next.js router
  const router = useRouter();

  const underlineRef = useRef(null);

  const salaryData = [
    { sr: 1, month: "05/11/25", salary: "₹20,000", time: "10:00AM" },
    { sr: 2, month: "05/12/25", salary: "₹20,000", time: "11:00AM" },
    { sr: 3, month: "05/01/26", salary: "₹22,000", time: "10:10AM" },
    { sr: 4, month: "05/02/26", salary: "₹20,000", time: "11:00AM" },
    { sr: 5, month: "05/03/26", salary: "₹20,000", time: "09:00AM" },
    { sr: 6, month: "05/04/26", salary: "₹20,000", time: "11:00AM" },
  ];

  const filteredData =
    filter === "Filter"
      ? salaryData
      : salaryData.filter((row) => {
          const year = `20${row.month.split("/")[2]}`;
          return year === filter;
        });

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 relative inline-block text-gray-800">
            <span
              ref={underlineRef}
              className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
            ></span>
            Salary
          </h2>
        </div>

        {/* Action Buttons - Mobile Stack */}
        <div className="space-y-4 mb-6">
          {/* Bank Information Button */}
          <button
            className="w-full flex items-center justify-center gap-3 bg-[#018ABE] hover:bg-blue-400 text-white px-6 py-4 rounded-lg shadow-md font-medium transition-colors"
            onClick={() => router.push("/salarypage/bankinformation")}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Bank Information
          </button>

          {/* Salary Slip and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 flex items-center justify-center gap-3 bg-[#018ABE] hover:bg-blue-400 text-white px-6 py-4 rounded-lg shadow-md font-medium transition-colors"
              onClick={() => router.push("/salarypage/salary")}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="hidden sm:inline">See salary slip</span>
              <span className="sm:hidden">Salary Slip</span>
            </button>

            {/* Custom Filter Dropdown */}
            <div className="relative flex-1 sm:flex-none sm:w-40">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-4 text-gray-700 shadow-sm hover:border-gray-400 transition-colors"
              >
                <span>{filter}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {["Filter", "2023", "2024", "2025", "2026"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setFilter(option);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Card View for Small Screens */}
        <div className="block sm:hidden space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((row, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm text-gray-500">#{row.sr}</div>
                  <div className="text-sm text-gray-500">{row.time}</div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-gray-800">{row.month}</div>
                  <div
                    className={`text-green-600 font-semibold ${
                      row.salary === "₹22,000"
                        ? "bg-purple-100 px-2 py-1 rounded border border-purple-300"
                        : ""
                    }`}
                  >
                    Paid {row.salary}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-500 font-medium">
                No salary records found for {filter}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto rounded-xl shadow-md">
          <table className="min-w-full border-collapse bg-white">
            <thead className="bg-[#018ABE] text-white">
              <tr>
                <th className="border border-[#018ABE] px-4 py-3 text-left">
                  Sr.No
                </th>
                <th className="border border-[#018ABE] px-4 py-3 text-left">
                  Months
                </th>
                <th className="border border-[#018ABE] px-4 py-3 text-left">
                  Salary
                </th>
                <th className="border border-[#018ABE] px-4 py-3 text-left">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="border border-gray-300 px-4 py-3">
                      {row.sr}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {row.month}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 text-green-600 font-medium ${
                        row.salary === "₹22,000"
                          ? "bg-purple-50 border-purple-300"
                          : ""
                      }`}
                    >
                      Paid {row.salary}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {row.time}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 text-center text-gray-500 font-medium"
                  >
                    No salary records found for {filter}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
