"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus } from "lucide-react";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRouter } from "next/navigation";

export default function OverviewHeader({ selected, setSelected }) {
  const timeOptions = ["This Year", "This Month", "This Week"];
  const [localSelected, setLocalSelected] = useState("This Year");
  const [isOpen, setIsOpen] = useState(false);
  const underlineRef = useRef(null);
  const router = useRouter();

  // API integration - Replace with your actual API endpoint
  const handleClick = async () => {
    try {
      console.log("Navigate to task page");
      
      // Example API call before navigation (adjust according to your backend)
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_task',
          timestamp: new Date().toISOString(),
          selectedTimeframe: localSelected
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Task creation initiated:', data);
      }

      // Navigate to task page
      router.push("/task");
    } catch (error) {
      console.error('Error creating task:', error);
      // Still navigate even if API call fails
      router.push("/task");
    }
  };

  // Initialize GSAP animation for underline
  useGSAP(() => {
    gsap.from(underlineRef.current, {
      scaleX: 0,
      duration: 0.8,
      ease: "power3.out",
      transformOrigin: "left center",
    });
  }, []);

  // Sync with parent if selected is passed
  useEffect(() => {
    if (selected) {
      setLocalSelected(selected);
    }
  }, [selected]);

  // API call when time selection changes
  const selectOption = async (option) => {
    try {
      setLocalSelected(option);
      setIsOpen(false);
      if (setSelected) setSelected(option);

      // API call to update time selection (adjust according to your backend)
      const response = await fetch('/api/overview/timeframe', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: option,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Timeframe updated:', data);
      }
    } catch (error) {
      console.error('Error updating timeframe:', error);
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

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