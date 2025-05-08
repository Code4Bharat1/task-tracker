'use client';

import { useState, forwardRef } from "react";
import { LuCalendarClock } from "react-icons/lu";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Custom input for Date Picker
const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={onClick}
    ref={ref}
    className="flex-1 text-left bg-white focus:outline-none placeholder:text-gray-500 text-gray-800"
  >
    {value || "Select date"}
  </button>
));

export default function TaskForm() {
  const [repeat, setRepeat] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");  // Added state for time picker

  return (
    <div className="flex items-center justify-center min-h-auto bg-gray-100"> {/* Flexbox centering */}
      <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-md shadow-md"> {/* Custom width */}
       

        {/* Note Input */}
        <div className="mb-4">
        
          <input
            type="text"
            placeholder=" Add Note- e.g., I have a meeting at 11 a.m."
            className="w-full border-b border-[#71717] focus:outline-none py-1 text-[#71717] placeholder:text-[#71717]"
          />
        </div>

        {/* Date Picker */}
        <div className="mb-4 border-b border-gray-900 pb-2 ">
          <div className="flex items-center gap-2">
            <LuCalendarClock className="text-gray-600 text-xl" />
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select date"
              customInput={<CustomDateInput className="h-12 w-60 px-4 py-2 rounded-lg border border-gray-300 text-gray-800" />}
            />
          </div>
        </div>

        {/* Reminder Time Selection */}
        <div className="mb-4">
          <label className="font-semibold text-[#3B3939] block mb-2">Reminder:</label>

          <div className="flex flex-col gap-3 ml-2 text-sm text-[#717171] ">
            <div className="flex items-center gap-2">
              <span className="min-w-[50px]">Time:</span>
              {/* Direct Time Picker Column */}
              <input
                type="time"
                onChange={(e) => setSelectedTime(e.target.value)}
                value={selectedTime}
                className="bg-[#F1F2F8] px-3 py-1 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.2)] text-gray-600 text-left w-28"
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Repeat after 15 minutes:</span>
              <button
                onClick={() => setRepeat(!repeat)}
                className={`w-10 h-6 rounded-full transition duration-300 relative ${
                  repeat ? 'bg-[#018ABE]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    repeat ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-5 border-gray-800" />

        {/* Buttons */}
        <div className="flex justify-end items-center gap-6 text-sm font-semibold">
  <button
    onClick={() => {
      // Clear form or reset state if needed
      window.location.reload(); // Optionally simulate "cancel" by reloading or redirecting
    }}
    className="text-black hover:underline"
  >
    Cancel
  </button>

  <button
    onClick={() => {
      // Open a new tab
      window.open('/next-page', '_blank'); // Replace '/next-page' with your desired URL or route
    }}
    className="text-[#058CBF] hover:underline"
  >
    Create
  </button>
</div>

      </div>
    </div>
  );
}
