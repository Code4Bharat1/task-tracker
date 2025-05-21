import React, { useEffect, useRef } from "react";
import { CalendarIcon } from "lucide-react";

const EventForm = ({ formData, handleInputChange, categoryDotColors }) => {
  const timeSelectRef = useRef(null);

  // Scroll to the bottom of the time dropdown when it opens
  useEffect(() => {
    if (timeSelectRef.current) {
      // Using setTimeout to ensure this happens after the dropdown renders
      setTimeout(() => {
        if (timeSelectRef.current) {
          // Calculate total scroll height and set to maximum
          const totalHeight = timeSelectRef.current.scrollHeight;
          const visibleHeight = timeSelectRef.current.clientHeight;
          timeSelectRef.current.scrollTop = totalHeight - visibleHeight;
        }
      }, 100); // Slightly longer timeout to ensure dropdown is fully rendered
    }
  }, []); // Only run once on component mount

  // Add a separate handler for the dropdown focus to ensure it scrolls to bottom
  const handleTimeSelectFocus = () => {
    setTimeout(() => {
      if (timeSelectRef.current) {
        const totalHeight = timeSelectRef.current.scrollHeight;
        const visibleHeight = timeSelectRef.current.clientHeight;
        timeSelectRef.current.scrollTop = totalHeight - visibleHeight;
      }
    }, 50);
  };

  // Helper function to get current hour formatted as "HH:00"
  const getCurrentHourFormatted = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:00`;
  };

  return (
    <div>
      <input
        type="text"
        name="title"
        placeholder="Add Title"
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

      <div className="mb-4">
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          className="w-full bg-gray-100 rounded-md py-2 px-3 focus:outline-none"
          value={formData.category}
          onChange={handleInputChange}
        >
          <option value="Reminder">Reminder</option>
          <option value="Leaves">Leaves</option>
          <option value="Deadline">Deadline</option>
        </select>
      </div>

      <div className="mb-6">
        <div className="relative overflow-visible  mb-2">
          <select
            ref={timeSelectRef}
            name="time"
            className="bg-gray-100 rounded-md py-2 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={formData.time}
            onChange={handleInputChange}
            onFocus={handleTimeSelectFocus}
            onClick={handleTimeSelectFocus}
            style={{ scrollBehavior: "smooth" }}
          >
            <option value="">Select Time</option>
            {Array.from({ length: 16 }).map((_, i) => {
              const hour = i + 6; // 6 AM to 9 PM
              const displayHour = hour % 12 || 12;
              const amPm = hour < 12 ? "AM" : "PM";
              return (
                <option
                  key={hour}
                  value={`${hour.toString().padStart(2, "0")}:00`}
                >
                  {displayHour}:00 {amPm}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="number"
            name="reminderTime"
            className="border border-gray-300 rounded-md py-1 px-2 w-16"
            value={formData.reminderTime}
            onChange={handleInputChange}
          />
          <span className="ml-2">minutes before</span>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
