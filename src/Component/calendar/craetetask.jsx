'use client';
import { useState, useEffect, forwardRef } from "react";
import { LuCalendarClock } from "react-icons/lu";
import { IoMdArrowDropdown } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={onClick}
    ref={ref}
    className="flex-1 text-left bg-white focus:outline-none placeholder:text-gray-500 text-gray-800 cursor-pointer"
  >
    {value || "Select date"}
  </button>
));

export default function TaskForm({ onSave, onClose, selectedDate }) {
  const [note, setNote] = useState("");
  const [startTime, setStartTime] = useState("");
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Daily Task");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [date, setDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const [remindBefore, setRemindBefore] = useState(15);
  const userId = "64b81234567890abcdef1234";

  const categories = ["Daily Task", "Reminder", "Deadline", "Leaves", "Other"];

  const times = [];
  for (let hour = 1; hour <= 12; hour++) {
    for (let minute of ['00', '15', '30', '45']) {
      times.push(`${hour}:${minute} AM`);
      times.push(`${hour}:${minute} PM`);
    }
  }

  const handleSubmit = async () => {
    if (!note.trim() || !startTime) {
      toast.error("Please fill all required fields!");
      return;
    }

    const taskData = {
      userId,
      type: selectedCategory, // Now dynamic based on selection
      title: note,
      description: "",
      date: date.toISOString().split('T')[0],
      time: startTime,
      category: selectedCategory,
      reminder: true,
      remindBefore: parseInt(remindBefore, 10)
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create task');
      }

      toast.success(`${selectedCategory} created successfully!`);
      
      if (onSave) {
        onSave(taskData.date, taskData.category, taskData.title);
      }

      // Reset form
      setNote("");
      setDate(new Date());
      setStartTime("");
      setSelectedCategory("Daily Task");
      setRemindBefore(15);

      if (onClose) onClose();

    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.message || "Failed to create task");
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg p-6 bg-white rounded-md shadow-md">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Add Title - e.g., Company Annual Picnic"
            className="w-full border-b border-[#71717] focus:outline-none py-1 text-[#71717] placeholder:text-[#71717]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="mb-4 border-b border-gray-900 pb-2">
          <div className="flex items-center gap-2">
            <LuCalendarClock className="text-gray-600 text-xl" />
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              customInput={<CustomDateInput />}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="font-semibold text-[#3B3939] block mb-2">Category:</label>
          <div className="relative">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center justify-between gap-1 px-4 py-2 text-sm rounded-lg bg-[#F1F2F8] text-[#333] w-full border border-gray-200 cursor-pointer"
            >
              <span>{selectedCategory}</span>
              <IoMdArrowDropdown className="text-gray-600 text-base" />
            </button>

            {isCategoryOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto p-1">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-sm text-left px-2 py-2 rounded-lg ${
                      selectedCategory === category ? 'bg-blue-500 text-white' : 'text-gray-800'
                    } hover:bg-blue-100`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="font-semibold text-[#3B3939] block mb-2">Reminder Settings:</label>
          <div className="flex flex-col gap-3 ml-2 text-sm text-[#717171]">
            <div className="flex items-center gap-2">
              <span className="min-w-[50px]">Time:</span>
              <div className="relative">
                <button
                  onClick={() => setIsStartOpen(!isStartOpen)}
                  className="flex items-center justify-between gap-1 px-4 py-[2px] text-sm rounded-full bg-[#F1F2F8] text-[#333] w-[105px] border border-gray-200 cursor-pointer"
                >
                  <span>{startTime || 'Select Time'}</span>
                  <IoMdArrowDropdown className="text-gray-600 text-base" />
                </button>

                {isStartOpen && (
                  <div className="absolute z-10 mt-2 w-[120px] bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto p-1">
                    {times.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setStartTime(time);
                          setIsStartOpen(false);
                        }}
                        className={`w-full text-sm text-left px-2 py-[4px] rounded-full ${
                          startTime === time ? 'bg-blue-500 text-white' : 'text-gray-800'
                        } hover:bg-blue-100`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span>Remind Before (minutes):</span>
              <input
                type="number"
                value={remindBefore}
                onChange={(e) => setRemindBefore(e.target.value)}
                className="w-20 px-2 py-1 border rounded"
                min="1"
              />
            </div>
          </div>
        </div>

        <hr className="my-5 border-gray-800" />

        <div className="flex justify-end gap-6 text-sm font-semibold">
          <button onClick={onClose} className="text-black hover:underline">Cancel</button>
          <button onClick={handleSubmit} className="text-[#058CBF] hover:underline">Create</button>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}