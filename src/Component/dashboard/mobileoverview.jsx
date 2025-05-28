"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
export default function OverviewHeader({ selected, setSelected }) {
  const timeOptions = ["This Year", "This Month", "This Week"];
  const [localSelected, setLocalSelected] = useState("This Year");
  const [isOpen, setIsOpen] = useState(false);
  const underlineRef = useRef(null);
  const router = useRouter();
  // Mock router for demo
  const handleClick = () => {
    console.log("Navigate to task page");
    router.push("/task");
  };
  // Initialize underline animation
  useEffect(() => {
    if (underlineRef.current) {
      underlineRef.current.style.transform = "scaleX(0)";
      underlineRef.current.style.transformOrigin = "left center";
      underlineRef.current.style.transition = "transform 0.8s ease-out";

      // Trigger animation
      setTimeout(() => {
        underlineRef.current.style.transform = "scaleX(1)";
      }, 100);
    }
  }, []);

  // Sync with parent if selected is passed
  useEffect(() => {
    if (selected) {
      setLocalSelected(selected);
    }
  }, [selected]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectOption = (option) => {
    setLocalSelected(option);
    setIsOpen(false);
    if (setSelected) setSelected(option);
  };

  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-center py-4 px-4 sm:py-6 sm:px-9 gap-4 sm:gap-0">
      {/* Title Section */}
      <div className="relative w-full sm:w-auto">
        <h2 className="text-start sm:text-left font-semibold text-gray-800 text-xl sm:text-2xl mb-4 sm:mb-6">
          <span className="relative inline-block">
            OVERVIEW
            <span
              ref={underlineRef}
              className="absolute left-0 bottom-0 h-[2px] bg-[#058CBF] w-full"
            ></span>
          </span>
        </h2>
      </div>

      {/* Controls Section */}
      <div className="flex items-end gap-3 sm:gap-2 w-full sm:w-auto justify-end sm:justify-end">
        {/* Time Selector Dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-3 py-2 sm:px-3 sm:py-1 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-md shadow-md hover:bg-gray-50 transition-colors min-w-[120px] sm:min-w-0 justify-between"
          >
            <span className="truncate">{localSelected}</span>
            <ChevronDown
              size={16}
              className={`transition-transform flex-shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1 w-full sm:w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              {timeOptions.map((option) => (
                <div
                  key={option}
                  className={`px-4 py-3 sm:py-2 hover:bg-gray-100 cursor-pointer transition-colors text-sm sm:text-base ${
                    localSelected === option ? "bg-gray-100 font-semibold" : ""
                  }`}
                  onClick={() => selectOption(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider Line - Hidden on mobile */}
        <div className="hidden sm:block h-9 w-[1px] mx-4 bg-gray-300"></div>

        {/* Plus Button */}
        <button
          onClick={handleClick}
          className="bg-[#058CBF] rounded-full p-3 sm:p-2 text-white shadow-lg cursor-pointer hover:bg-[#5c95a9e4] transition-colors flex-shrink-0"
          aria-label="Add new task"
        >
          <Plus size={24} className="sm:w-[26px] sm:h-[26px]" />
        </button>
      </div>
    </div>
  );
}
