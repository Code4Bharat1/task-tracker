"use client";
import { useState, useEffect, useRef } from "react";

const punchData = [
  {
    date: "01/05/2025",
    InLocation: "Panvel",
    inTime: "09:36:15",
    OutLocation: "Panvel",
    outTime: "18:33:15",
    remark: "Present",
  },
  {
    date: "02/05/2025",
    InLocation: "Panvel",
    inTime: "10:50:33",
    OutLocation: "Panvel",
    outTime: "20:25:00",
    remark: "Late",
  },
  {
    date: "03/05/2025",
    InLocation: "Panvel",
    inTime: "08:44:30",
    OutLocation: "Panvel",
    outTime: "18:44:34",
    remark: "Present",
  },
  {
    date: "05/05/2025",
    InLocation: "Panvel",
    inTime: "10:40:48",
    OutLocation: "Panvel",
    outTime: "19:58:16",
    remark: "Late",
  },
  {
    date: "06/05/2025",
    InLocation: "Panvel",
    inTime: "-",
    OutLocation: "Panvel",
    outTime: "-",
    remark: "Absent",
  },
  {
    date: "07/05/2025",
    InLocation: "Panvel",
    inTime: "09:56:48",
    OutLocation: "Panvel",
    outTime: "20:12:10",
    remark: "Present",
  },
];

// Custom Calendar Component
const CustomCalendar = ({
  onDateSelect,
  onClose,
  selectedDate,
  mode = "date",
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (day, month, year) => {
    const d = day.toString().padStart(2, "0");
    const m = (month + 1).toString().padStart(2, "0");
    return `${d}/${m}/${year}`;
  };

  const formatMonth = (month, year) => {
    const m = (month + 1).toString().padStart(2, "0");
    return `01/${m}/${year}`;
  };

  const handleDateClick = (day) => {
    if (mode === "date") {
      const formattedDate = formatDate(day, currentMonth, currentYear);
      onDateSelect(formattedDate);
    }
    onClose();
  };

  const handleMonthClick = (monthIndex) => {
    if (mode === "month") {
      const formattedMonth = formatMonth(monthIndex, currentYear);
      onDateSelect(formattedMonth);
      onClose();
    } else {
      setCurrentMonth(monthIndex);
    }
  };

  const renderDateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate === formatDate(day, currentMonth, currentYear);
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-8 w-8 rounded text-sm flex items-center justify-center transition-colors ${
            isSelected
              ? "bg-[#058CBF] text-white"
              : "hover:bg-blue-100 text-gray-700"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderMonthCalendar = () => {
    return (
      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => {
          const isSelected =
            mode === "month" &&
            selectedDate === formatMonth(index, currentYear);
          return (
            <button
              key={month}
              onClick={() => handleMonthClick(index)}
              className={`p-3 text-sm rounded-lg transition-colors ${
                isSelected
                  ? "bg-[#058CBF] text-white"
                  : "hover:bg-blue-100 text-gray-700 bg-gray-50"
              }`}
            >
              {month}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => {
              if (mode === "date") {
                setCurrentMonth(currentMonth === 0 ? 11 : currentMonth - 1);
                if (currentMonth === 0) setCurrentYear(currentYear - 1);
              } else {
                setCurrentYear(currentYear - 1);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h3 className="font-semibold text-gray-800">
            {mode === "date"
              ? `${months[currentMonth]} ${currentYear}`
              : currentYear}
          </h3>

          <button
            onClick={() => {
              if (mode === "date") {
                setCurrentMonth(currentMonth === 11 ? 0 : currentMonth + 1);
                if (currentMonth === 11) setCurrentYear(currentYear + 1);
              } else {
                setCurrentYear(currentYear + 1);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Calendar Body */}
        <div className="p-4">
          {mode === "date" ? renderDateCalendar() : renderMonthCalendar()}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-4 border-t">
          <button
            onClick={() => onDateSelect("")}
            className="px-4 py-2 text-sm text-[#058CBF] hover:bg-blue-50 rounded"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MobilePunchHistory() {
  const [selectedDate, setSelectedDate] = useState("");
  const [remarkFilter, setRemarkFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState("all");
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState("date");
  const underlineRef = useRef(null);

  useEffect(() => {
    if (underlineRef.current) {
      underlineRef.current.style.width = "0%";
      setTimeout(() => {
        underlineRef.current.style.width = "100%";
        underlineRef.current.style.transition = "width 1s ease-out";
      }, 100);
    }
  }, []);

  const filteredData = punchData.filter((item) => {
    let dateMatch = true;
    if (viewType === "date" && selectedDate) {
      dateMatch = item.date === selectedDate;
    } else if (viewType === "month" && selectedDate) {
      const selectedMonth = selectedDate.split("/")[1];
      const selectedYear = selectedDate.split("/")[2];
      const itemMonth = item.date.split("/")[1];
      const itemYear = item.date.split("/")[2];
      dateMatch = selectedMonth === itemMonth && selectedYear === itemYear;
    }

    const remarkMatch = remarkFilter ? item.remark === remarkFilter : true;
    return dateMatch && remarkMatch;
  });

  const exportToExcel = () => {
    console.log("Exporting to Excel...", filteredData);
  };

  const getRemarkColor = (remark) => {
    switch (remark) {
      case "Present":
        return "text-green-600 bg-green-50";
      case "Late":
        return "text-orange-600 bg-orange-50";
      case "Absent":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const clearFilters = () => {
    setSelectedDate("");
    setRemarkFilter("");
    setViewType("all");
    setShowViewDropdown(false);
    setShowStatusDropdown(false);
  };

  const openCalendar = (mode) => {
    setCalendarMode(mode);
    setShowCalendar(true);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const getDisplayDate = () => {
    if (!selectedDate) return "";
    if (viewType === "month") {
      const [, month, year] = selectedDate.split("/");
      const monthName = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][parseInt(month) - 1];
      return `${monthName} ${year}`;
    }
    return selectedDate;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-6 text-center">
          <div className="inline-block relative">
            <span
              ref={underlineRef}
              className="absolute bottom-0 left-0 h-[2px] w-full bg-[#018ABE]"
            />
            <h1 className="text-xl font-bold text-gray-800 relative z-10">
              Punch History
            </h1>
          </div>
        </div>

        {/* Filter Toggle Button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-[#058CBF] text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
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
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-4 pb-4 space-y-3 bg-gray-50 border-t">
            {/* View Type Filter */}
            <div className="relative w-full">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                View Type
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowViewDropdown(!showViewDropdown)}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#058CBF] text-left"
                >
                  {viewType === "all"
                    ? "All Records"
                    : viewType === "date"
                    ? "Specific Date"
                    : "Full Month"}
                </button>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showViewDropdown ? "rotate-180" : ""
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
                </div>
                {showViewDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-40 max-h-40 overflow-y-auto">
                    <button
                      onClick={() => {
                        setViewType("all");
                        setSelectedDate("");
                        setShowViewDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-left hover:bg-blue-50 border-b border-gray-100"
                    >
                      All Records
                    </button>
                    <button
                      onClick={() => {
                        setViewType("date");
                        setShowViewDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-left hover:bg-blue-50 border-b border-gray-100"
                    >
                      Specific Date
                    </button>
                    <button
                      onClick={() => {
                        setViewType("month");
                        setShowViewDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-left hover:bg-blue-50"
                    >
                      Full Month
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Date/Month Picker */}
            {(viewType === "date" || viewType === "month") && (
              <div className="w-full">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {viewType === "date" ? "Select Date" : "Select Month"}
                </label>
                <button
                  onClick={() => openCalendar(viewType)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#058CBF] text-left flex items-center justify-between"
                >
                  <span
                    className={selectedDate ? "text-gray-900" : "text-gray-500"}
                  >
                    {selectedDate
                      ? getDisplayDate()
                      : `Select ${viewType === "date" ? "Date" : "Month"}`}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Status Filter */}
            <div className="relative w-full">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#058CBF] text-left"
                >
                  {remarkFilter === "" ? "All Status" : remarkFilter}
                </button>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showStatusDropdown ? "rotate-180" : ""
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
                </div>
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-40 max-h-40 overflow-y-auto">
                    <button
                      onClick={() => {
                        setRemarkFilter("");
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-left hover:bg-blue-50 border-b border-gray-100"
                    >
                      All Status
                    </button>
                    <button
                      onClick={() => {
                        setRemarkFilter("Present");
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-left hover:bg-blue-50 border-b border-gray-100"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => {
                        setRemarkFilter("Late");
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-left hover:bg-blue-50 border-b border-gray-100"
                    >
                      Late
                    </button>
                    <button
                      onClick={() => {
                        setRemarkFilter("Absent");
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-left hover:bg-blue-50"
                    >
                      Absent
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedDate || remarkFilter || viewType !== "all") && (
              <button
                onClick={clearFilters}
                className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium text-sm mt-2"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {/* Results Summary */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-[#058CBF]">
              {filteredData.length}
            </span>{" "}
            records
          </p>
        </div>

        {/* Records */}
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <div className="text-gray-400 text-4xl mb-4">📅</div>
            <p className="text-gray-500 text-lg">No records found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Date Header */}
                <div className="bg-[#058CBF] text-white px-4 py-3">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-semibold text-sm">{item.date}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getRemarkColor(
                        item.remark
                      )}`}
                    >
                      {item.remark}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-4">
                  {/* Locations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">In Location</p>
                        <p className="font-medium text-sm truncate">
                          {item.InLocation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">Out Location</p>
                        <p className="font-medium text-sm truncate">
                          {item.OutLocation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Time In/Out */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">In Time</p>
                        <p className="font-medium text-sm">{item.inTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">Out Time</p>
                        <p className="font-medium text-sm">{item.outTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Button */}
        {filteredData.length > 0 && (
          <div className="mt-6 mb-4">
            <button
              onClick={exportToExcel}
              className="w-full bg-[#058CBF] text-white py-4 px-6 rounded-lg font-medium text-lg shadow-md active:bg-blue-700 transition-colors"
            >
              📊 Export to Excel
            </button>
          </div>
        )}
      </div>

      {/* Custom Calendar Modal */}
      {showCalendar && (
        <CustomCalendar
          onDateSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
          selectedDate={selectedDate}
          mode={calendarMode}
        />
      )}
    </div>
  );
}
