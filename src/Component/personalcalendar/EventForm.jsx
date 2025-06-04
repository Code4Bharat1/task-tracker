"use client";
import { useState, forwardRef } from "react";
import { LuCalendarClock } from "react-icons/lu";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaBell, FaPlane, FaHourglass, FaRegClock } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    ref={ref}
    type="button"
    className="flex items-center justify-between w-full px-4 py-2 text-gray-700 bg-white border rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500 transition-colors"
  >
    <span>{value || "Select date"}</span>
    <LuCalendarClock className="text-gray-400 ml-2" />
  </button>
));
CustomDateInput.displayName = "CustomDateInput";

const TimeDropdown = ({
  times,
  selectedTime,
  setSelectedTime,
  setShowTimeDropdown,
}) => {
  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
      {times.map((time) => (
        <button
          key={time}
          onClick={() => {
            setSelectedTime(time);
            setShowTimeDropdown(false);
          }}
          className={`w-full px-4 py-2 text-left text-sm ${selectedTime === time
              ? "bg-purple-50 text-purple-600 font-semibold"
              : "text-gray-700 hover:bg-gray-50"
            } transition-colors`}
        >
          {formatTime(time)}
        </button>
      ))}
    </div>
  );
};

const CategoryDropdown = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  setIsCategoryOpen,
}) => (
  <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
    {categories.map((category) => (
      <button
        key={category}
        onClick={() => {
          setSelectedCategory(category);
          setIsCategoryOpen(false);
        }}
        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${selectedCategory === category
            ? "bg-purple-50 text-purple-600 font-semibold"
            : "text-gray-700 hover:bg-gray-50"
          } transition-colors`}
      >
        {categoryData[category].icon}
        {category}
      </button>
    ))}
  </div>
);

const categoryData = {
  Reminder: {
    color: "text-green-600",
    bgColor: "bg-green-600",
    hoverBgColor: "hover:bg-green-700",
    icon: <FaBell className="text-green-600" />,
  },
  Leaves: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-600",
    hoverBgColor: "hover:bg-yellow-700",
    icon: <FaPlane className="text-yellow-600" />,
  },
  Deadline: {
    color: "text-purple-600",
    bgColor: "bg-purple-600",
    hoverBgColor: "hover:bg-purple-700",
    icon: <FaRegClock className="text-purple-600" />,
  },
};

export default function EventForm({ onSave, onClose, selectedDate }) {
  const [note, setNote] = useState("");
  const [date, setDate] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );
  const [startTime, setStartTime] = useState("");
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Reminder");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [remindBefore, setRemindBefore] = useState(15);

  const categories = ["Reminder", "Leaves", "Deadline"];

  // times array for dropdown (24h in HH:mm format)
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of ["00", "15", "30", "45"]) {
      times.push(`${hour.toString().padStart(2, "0")}:${minute}`);
    }
  }

  const formatDisplayTime = (time) => {
    if (!time) return "Select time";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Reset all form fields
    setNote("");
    setDate(new Date());
    setStartTime("");
    setSelectedCategory("Reminder");
    setRemindBefore(15);
    setIsStartOpen(false);
    setIsCategoryOpen(false);

    // Call onClose if provided
    if (onClose && typeof onClose === "function") {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!note.trim() || !startTime) {
      toast.error("Please fill all required fields!");
      return;
    }

    const taskData = {
      type: "Event",
      title: note,
      description: "",
      date: date.toISOString().split("T")[0],
      time: formatDisplayTime(startTime),
      category: selectedCategory,
      reminder: true,
      remindBefore: parseInt(remindBefore, 10),
      calType: "Personal",
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) throw new Error("Failed to create task");

      toast.success("Event created successfully!");
      if (onSave && typeof onSave === "function") {
        onSave(taskData.date, taskData.category, taskData.title);
      }

      // Reset form
      setNote("");
      setDate(new Date());
      setStartTime("");
      setSelectedCategory("Reminder");
      setRemindBefore(15);

      if (onClose && typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        {/* Title */}
        <input
          type="text"
          placeholder="Add Title - e.g., Company Annual Picnic"
          className="w-full border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 text-gray-700 placeholder-gray-400 text-lg font-semibold transition-colors mb-6"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="space-y-6">
          <div className="mb-2">
            <label
              htmlFor="date"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Select Date:
            </label>
            <input
              type="date"
              id="date"
              className="w-full px-4 py-1 border border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={date.toISOString().split("T")[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Category */}
          <div className="mb-2 relative">
            <label className="block mb-2 font-medium text-gray-700">
              Select Category :
            </label>
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className={`flex items-center gap-2 w-full px-4 py-2 text-gray-700 bg-white border rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500 transition-colors shadow-sm`}
              type="button"
            >
              <span
                className={`${categoryData[selectedCategory].color} flex items-center gap-2`}
              >
                {categoryData[selectedCategory].icon}
                {selectedCategory}
              </span>
              <IoMdArrowDropdown className="ml-auto text-gray-500" />
            </button>
            {isCategoryOpen && (
              <CategoryDropdown
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                setIsCategoryOpen={setIsCategoryOpen}
              />
            )}
          </div>

          {/* Time picker and remind before */}
          <div className="mb-6 flex gap-4 items-center">
            <div className="relative w-1/2">
              <label className="block mb-2 font-medium text-gray-700">
                Time
              </label>
              <button
                onClick={() => setIsStartOpen(!isStartOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-gray-700 bg-white border rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                type="button"
              >
                <span>{formatDisplayTime(startTime)}</span>
                <IoMdArrowDropdown className="text-gray-500 ml-2" />
              </button>
              {isStartOpen && (
                <TimeDropdown
                  times={times}
                  selectedTime={startTime}
                  setSelectedTime={setStartTime}
                  setShowTimeDropdown={setIsStartOpen}
                />
              )}
            </div>

            <div className="w-1/2">
              <label className="block mb-2 whitespace-nowrap font-medium text-gray-700">
                Remind Before (mins)
              </label>
              <select
                value={remindBefore}
                onChange={(e) => setRemindBefore(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg border-gray-300 bg-white text-gray-700 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancel}
              type="button"
              className="px-5 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="button"
              className={`${categoryData[selectedCategory].bgColor} ${categoryData[selectedCategory].hoverBgColor} px-5 py-2 text-white rounded-lg font-medium transition-colors`}
            >
              Create
            </button>
          </div>

          <ToastContainer position="top-center" />
        </div>
      </div>
    </div>
  );
}
