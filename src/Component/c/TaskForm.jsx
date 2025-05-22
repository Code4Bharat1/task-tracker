import React, { useState, useEffect, useRef } from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";

const TaskForm = ({ formData, handleInputChange }) => {
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Ref for auto-close timer
  const timeCloseTimer = useRef(null);

  // Generate time options from 6:00 AM to 12:00 AM (midnight)
  const timeOptions = Array.from({ length: 72 }).map((_, i) => {
    const totalMinutes = 6 * 60 + i * 15; // Start from 6:00 AM
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const period = hours < 12 ? "AM" : "PM";
    const label = `${displayHours}:${String(minutes).padStart(
      2,
      "0"
    )} ${period}`;
    return { value, label };
  });

  // Auto-close functions
  const startTimeAutoClose = () => {
    if (timeCloseTimer.current) {
      clearTimeout(timeCloseTimer.current);
    }
    timeCloseTimer.current = setTimeout(() => {
      setIsTimeDropdownOpen(false);
    }, 3000);
  };

  const clearTimeAutoClose = () => {
    if (timeCloseTimer.current) {
      clearTimeout(timeCloseTimer.current);
    }
  };

  // Effect to start auto-close when dropdown opens
  useEffect(() => {
    if (isTimeDropdownOpen) {
      startTimeAutoClose();
    } else {
      clearTimeAutoClose();
    }

    return () => clearTimeAutoClose();
  }, [isTimeDropdownOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeAutoClose();
    };
  }, []);

  const handleTimeSelect = (value) => {
    clearTimeAutoClose();
    handleInputChange({ target: { name: "time", value } });
    setIsTimeDropdownOpen(false);
  };

  const selectedTimeLabel = formData.time
    ? timeOptions.find((option) => option.value === formData.time)?.label ||
      "Select Time"
    : "Select Time";

  return (
    <div>
      <input
        type="text"
        name="title"
        placeholder="Add Task Title"
        className="w-full border-b border-gray-300 py-2 mb-4 focus:outline-none"
        value={formData.title}
        onChange={handleInputChange}
      />

      <div className="flex items-center mb-4">
        <input
          type="date"
          name="date"
          className="border-b border-gray-300 py-2 focus:outline-none"
          value={formData.date.split("-").reverse().join("-")}
          onChange={handleInputChange}
        />
      </div>

      {/* Time Dropdown */}
      <div
        className="mb-4"
        onMouseEnter={clearTimeAutoClose}
        onMouseLeave={startTimeAutoClose}
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Time
        </label>
        <div className="relative">
          <button
            type="button"
            className="w-full bg-gray-100 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#058CBF] transition duration-200 text-left flex items-center justify-between"
            onClick={() => {
              clearTimeAutoClose();
              setIsTimeDropdownOpen(!isTimeDropdownOpen);
            }}
          >
            <span className={formData.time ? "text-black" : "text-gray-500"}>
              {selectedTimeLabel}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isTimeDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isTimeDropdownOpen && (
            <div
              className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1"
              onMouseEnter={clearTimeAutoClose}
              onMouseLeave={startTimeAutoClose}
            >
              <div className="max-h-32 overflow-y-auto">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-150 ${
                      formData.time === option.value
                        ? "bg-blue-50 text-[#058CBF]"
                        : "text-gray-700"
                    }`}
                    onClick={() => handleTimeSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <textarea
        name="description"
        placeholder="Add Task Description"
        className="w-full h-16 border rounded-md p-2 mb-4 bg-blue-50 focus:outline-none resize-none"
        value={formData.description}
        onChange={handleInputChange}
      ></textarea>

      {/* Hidden field to ensure tasks are properly categorized */}
      <input type="hidden" name="category" value="Daily Task" />
    </div>
  );
};

export default TaskForm;
