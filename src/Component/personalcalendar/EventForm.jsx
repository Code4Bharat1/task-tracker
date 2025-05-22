"use client";
import React, { useState, useEffect, useRef } from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";

const EventForm = ({ formData, handleInputChange, categoryDotColors }) => {
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Refs for auto-close timers
  const timeCloseTimer = useRef(null);
  const categoryCloseTimer = useRef(null);

  const timeOptions = Array.from({ length: 16 }).map((_, i) => {
    const hour = i + 6; // 6 AM to 9 PM
    const displayHour = hour % 12 || 12;
    const amPm = hour < 12 ? "AM" : "PM";
    return {
      value: `${hour.toString().padStart(2, "0")}:00`,
      label: `${displayHour}:00 ${amPm}`,
    };
  });

  const categoryOptions = [
    { value: "Reminder", label: "Reminder" },
    { value: "Leaves", label: "Leaves" },
    { value: "Deadline", label: "Deadline" },
    { value: "Birthday", label: "Birthday" },
  ];

  // Auto-close functions
  const startTimeAutoClose = () => {
    if (timeCloseTimer.current) {
      clearTimeout(timeCloseTimer.current);
    }
    timeCloseTimer.current = setTimeout(() => {
      setIsTimeDropdownOpen(false);
    }, 3000);
  };

  const startCategoryAutoClose = () => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
    }
    categoryCloseTimer.current = setTimeout(() => {
      setIsCategoryDropdownOpen(false);
    }, 3000);
  };

  const clearTimeAutoClose = () => {
    if (timeCloseTimer.current) {
      clearTimeout(timeCloseTimer.current);
    }
  };

  const clearCategoryAutoClose = () => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
    }
  };

  // Effect to start auto-close when dropdowns open
  useEffect(() => {
    if (isTimeDropdownOpen) {
      startTimeAutoClose();
    } else {
      clearTimeAutoClose();
    }

    return () => clearTimeAutoClose();
  }, [isTimeDropdownOpen]);

  useEffect(() => {
    if (isCategoryDropdownOpen) {
      startCategoryAutoClose();
    } else {
      clearCategoryAutoClose();
    }

    return () => clearCategoryAutoClose();
  }, [isCategoryDropdownOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeAutoClose();
      clearCategoryAutoClose();
    };
  }, []);

  const handleTimeSelect = (timeValue) => {
    clearTimeAutoClose();
    handleInputChange({ target: { name: "time", value: timeValue } });
    setIsTimeDropdownOpen(false);
  };

  const handleCategorySelect = (categoryValue) => {
    clearCategoryAutoClose();
    handleInputChange({ target: { name: "category", value: categoryValue } });
    setIsCategoryDropdownOpen(false);
  };

  const selectedTimeLabel =
    timeOptions.find((option) => option.value === formData.time)?.label ||
    "Select Time";
  const selectedCategoryLabel =
    categoryOptions.find((option) => option.value === formData.category)
      ?.label || "Select Category";

  return (
    <div>
      {/* Title Input */}
      <input
        type="text"
        name="title"
        placeholder="Add Title"
        className="w-full border-b border-gray-300 py-2 mb-4 focus:outline-none"
        value={formData.title || ""}
        onChange={handleInputChange}
      />

      {/* Date Input */}
      <div className="flex items-center mb-4">
        <input
          type="date"
          name="date"
          className="border-b border-gray-300 py-2 focus:outline-none"
          value={formData.date.split("-").reverse().join("-")}
          onChange={handleInputChange}
        />
      </div>
      {/* Category Dropdown */}
      <div
        className="mb-4"
        onMouseEnter={clearCategoryAutoClose}
        onMouseLeave={startCategoryAutoClose}
      >
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <div className="relative">
          <button
            type="button"
            className="w-full bg-gray-100 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#058CBF] transition duration-200 text-left flex items-center justify-between"
            onClick={() => {
              clearCategoryAutoClose();
              setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
            }}
          >
            <span
              className={formData.category ? "text-black" : "text-gray-500"}
            >
              {selectedCategoryLabel}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isCategoryDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isCategoryDropdownOpen && (
            <div
              className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1"
              onMouseEnter={clearCategoryAutoClose}
              onMouseLeave={startCategoryAutoClose}
            >
              <div className="max-h-32 overflow-y-auto">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-150 ${
                      formData.category === option.value
                        ? "bg-blue-50 text-[#058CBF]"
                        : "text-gray-700"
                    }`}
                    onClick={() => handleCategorySelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Dropdown */}
      <div
        className="mb-6"
        onMouseEnter={clearTimeAutoClose}
        onMouseLeave={startTimeAutoClose}
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time
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

      {/* Repeat After 15 Minutes Toggle */}
      <div className="flex items-center mt-4">
        <span className="text-gray-700 mr-3">Repeat after 15 minutes:</span>
        <label
          htmlFor="repeat-after-15"
          className="relative inline-flex items-center cursor-pointer"
        >
          <input
            id="repeat-after-15"
            type="checkbox"
            className="sr-only peer"
            checked={formData.repeatAfter15Min || false}
            onChange={(e) =>
              handleInputChange({
                target: {
                  name: "repeatAfter15Min",
                  value: e.target.checked,
                },
              })
            }
          />
          <div className="w-11 h-6 bg-[#ced9de] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#e2e9eb] rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#058CBF]"></div>
        </label>
      </div>
    </div>
  );
};

export default EventForm;
