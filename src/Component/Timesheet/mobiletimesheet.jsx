import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AiFillDelete } from "react-icons/ai";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiCheck,
  FiX,
} from "react-icons/fi";

// Toast Component
const Toast = ({ message, type, onClose, isVisible }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          type === "success"
            ? "bg-green-500 text-white"
            : "bg-blue-500 text-white"
        }`}
      >
        {type === "success" ? <FiCheck /> : <FiCheck />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2">
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};

export default function MobileTimeline() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [projectName, setProjectName] = useState("");
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [todayHours, setTodayHours] = useState([]);
  const [totalTime, setTotalTime] = useState("00:00");
  const [validationErrors, setValidationErrors] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const bucketOptions = ["Project", "Meeting", "Miscellaneous"];
  const managers = ["Awab Fakih", "Ayaan Raje", "Prashant Patil"];

  const inputRefs = useRef({
    projectName: null,
    items: [],
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  const initializeDefaultItems = () => {
    const defaultTimes = Array.from({ length: 8 }, (_, i) => {
      const start = new Date(0, 0, 0, 9 + i, 0);
      const end = new Date(0, 0, 0, 10 + i, 0);
      return {
        timeRange: `${formatTime(start)} - ${formatTime(end)}`,
        task: "",
        type: "Work",
        duration: "01:00",
        bucket: "Project",
      };
    });

    const defaultDurations = defaultTimes.map(() => "0100");
    setItems(defaultTimes);
    setTodayHours(defaultDurations);
    setTotalTime(calculateTotalTime(defaultDurations));
  };

  useEffect(() => {
    initializeDefaultItems();
  }, []);

  useEffect(() => {
    inputRefs.current.items = Array(items.length)
      .fill()
      .map(() => ({ task: null, duration: null }));
  }, [items.length]);

  const calculateTotalTime = (timeArray) => {
    let totalMinutes = 0;
    for (const time of timeArray) {
      if (time && time.length === 4) {
        const h = parseInt(time.slice(0, 2), 10);
        const m = parseInt(time.slice(2, 4), 10);
        if (!isNaN(h) && !isNaN(m) && h < 24 && m < 60) {
          totalMinutes += h * 60 + m;
        }
      }
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDuration = (duration) => {
    let numericValue = duration.replace(/\D/g, "").slice(0, 4);
    if (numericValue.length === 4) {
      return `${numericValue.slice(0, 2)}:${numericValue.slice(2, 4)}`;
    }
    return "00:00";
  };

  const getNextTimeRange = () => {
    if (items.length === 0) return "09:00 AM - 10:00 AM";
    const lastTime = items[items.length - 1].timeRange.split(" - ")[1];
    const [time, period] = lastTime.split(" ");
    let [hour, minute] = time.split(":").map(Number);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    const start = new Date(0, 0, 0, hour, minute);
    const end = new Date(start.getTime() + 60 * 60000);
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const addTimelineItem = () => {
    const newItem = {
      timeRange: getNextTimeRange(),
      duration: "01:00",
      type: "Work",
      bucket: "Project",
      task: "",
    };

    setItems((prev) => [...prev, newItem]);
    const newDuration = "0100";
    setTodayHours((prev) => {
      const updatedHours = [...prev, newDuration];
      setTotalTime(calculateTotalTime(updatedHours));
      return updatedHours;
    });

    showToast("New row added successfully!");
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);

    if (field === "task" && value.trim() !== "") {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`task-${index}`];
        return newErrors;
      });
    }
  };

  const handleDurationChange = (index, value) => {
    let formattedDuration = formatDuration(value);
    updateItem(index, "duration", formattedDuration);

    const numericValue = value.replace(/\D/g, "").slice(0, 4).padStart(4, "0");
    setTodayHours((prev) => {
      const updated = [...prev];
      updated[index] = numericValue;
      setTotalTime(calculateTotalTime(updated));
      return updated;
    });
  };

  const deleteItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setTodayHours((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setTotalTime(calculateTotalTime(updated));
      return updated;
    });

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`task-${index}`];
      return newErrors;
    });

    showToast("Row deleted successfully!");
  };

  const validateForm = () => {
    const errors = {};
    if (!projectName.trim()) errors.projectName = "Project name is required";
    if (selectedManagers.length === 0)
      errors.managers = "At least one manager must be selected";

    items.forEach((item, index) => {
      if (!item.task?.trim())
        errors[`task-${index}`] = "Task description is required";
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const payload = {
      date,
      projectName,
      items,
      notifiedManagers: selectedManagers,
    };

    try {
      console.log("Submitting timesheet:", payload);
      showToast("Timesheet submitted successfully!");
      // Stay on the same page after successful submission
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      showToast("Failed to submit timesheet", "error");
    }
  };

  // Navigation functions using Next.js router
  const navigateToEditTimesheet = () => {
    router.push("/timesheet/edittimesheet");
  };

  const navigateToAddTask = () => {
    router.push("/task");
  };

  // Calendar functions
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate.toISOString().split("T")[0]);
    setShowCalendar(false);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const isSelectedDate = (calendarDate) => {
    if (!calendarDate) return false;
    return calendarDate.toISOString().split("T")[0] === date;
  };

  const isToday = (calendarDate) => {
    if (!calendarDate) return false;
    return calendarDate.toDateString() === new Date().toDateString();
  };

  const totalMinutes =
    parseInt(totalTime.split(":")[0]) * 60 + parseInt(totalTime.split(":")[1]);
  const isLessThanEightHours = totalMinutes < 480;

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
      />

      {/* Header */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <h2 className="text-xl font-bold mb-1 text-gray-800">
          <span className="relative">
            Add Time
            <span className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"></span>
          </span>
          sheet
        </h2>

        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={navigateToEditTimesheet}
            className="bg-[#018ABE] hover:bg-[#0177a6] text-white font-semibold px-4 py-3 rounded-md text-sm"
          >
            Edit Timesheet
          </button>
          <button
            onClick={navigateToAddTask}
            className="bg-[#018ABE] hover:bg-[#0177a6] text-white font-semibold px-4 py-3 rounded-md text-sm"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Form Controls */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm space-y-4">
        {/* Date Input */}
        <div className="relative">
          <label className="block mb-2 font-medium text-gray-700 text-sm">
            Date
          </label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full border border-gray-300 rounded-md px-4 py-3 flex items-center justify-between text-sm bg-white"
          >
            <span className="text-gray-800">{formatDisplayDate(date)}</span>
            <FiCalendar className="text-gray-600 text-lg" />
          </button>

          {showCalendar && (
            <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg w-full z-20 shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FiChevronLeft className="text-gray-600" />
                </button>
                <span className="font-semibold text-gray-800">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FiChevronRight className="text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day && (
                      <button
                        onClick={() => handleDateSelect(day)}
                        className={`w-full h-full rounded-md text-sm font-medium transition-colors ${
                          isSelectedDate(day)
                            ? "bg-[#018ABE] text-white"
                            : isToday(day)
                            ? "bg-blue-100 text-[#018ABE]"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCalendar(false)}
                className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Manager Selection */}
        <div className="relative">
          <label className="block mb-2 font-medium text-gray-700 text-sm">
            Select Manager
          </label>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`w-full border ${
              validationErrors.managers ? "border-red-500" : "border-gray-300"
            } rounded-md px-4 py-3 flex items-center justify-between text-sm`}
          >
            <span className="text-gray-800">
              {selectedManagers.length === 0
                ? "Select managers"
                : `Selected (${selectedManagers.length})`}
            </span>
            <FiChevronDown className="text-gray-600 text-lg" />
          </button>
          {validationErrors.managers && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.managers}
            </p>
          )}

          {showDropdown && (
            <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-md w-full z-10 shadow-lg">
              {managers.map((managerName) => (
                <label
                  key={managerName}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <input
                    className="w-4 h-4 text-blue-600"
                    type="checkbox"
                    checked={selectedManagers.includes(managerName)}
                    onChange={() =>
                      setSelectedManagers((prev) => {
                        const updated = prev.includes(managerName)
                          ? prev.filter((m) => m !== managerName)
                          : [...prev, managerName];
                        if (updated.length > 0) {
                          setValidationErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.managers;
                            return newErrors;
                          });
                        }
                        return updated;
                      })
                    }
                  />
                  {managerName}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Project Name */}
        <div>
          <label className="block mb-2 font-medium text-gray-700 text-sm">
            Project Name
          </label>
          <input
            type="text"
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (e.target.value.trim() !== "") {
                setValidationErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.projectName;
                  return newErrors;
                });
              }
            }}
            ref={(el) => (inputRefs.current.projectName = el)}
            className={`w-full border ${
              validationErrors.projectName
                ? "border-red-500"
                : "border-gray-300"
            } rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#018ABE] text-sm`}
          />
          {validationErrors.projectName && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.projectName}
            </p>
          )}
        </div>

        {/* Add Row Button */}
        <button
          onClick={addTimelineItem}
          className="w-full py-3 rounded-lg text-sm font-medium bg-[#018ABE] text-white"
        >
          Add Row
        </button>
      </div>

      {/* Task Cards */}
      <div className="space-y-3 mb-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-gray-500">
                Task #{index + 1}
              </span>
              <button
                onClick={() => deleteItem(index)}
                className="p-2 rounded-full hover:bg-red-50"
              >
                <AiFillDelete className="text-lg text-red-600" />
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Bucket
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={item.bucket}
                onChange={(e) => updateItem(index, "bucket", e.target.value)}
              >
                {bucketOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Task Description
              </label>
              <textarea
                className={`w-full border ${
                  validationErrors[`task-${index}`]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md p-2 text-sm resize-none`}
                rows="3"
                value={item.task}
                onChange={(e) => updateItem(index, "task", e.target.value)}
                placeholder="Enter task description"
              />
              {validationErrors[`task-${index}`] && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors[`task-${index}`]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Time Range
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 text-xs bg-gray-50 text-center"
                  readOnly
                  value={item.timeRange}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={item.duration}
                  onChange={(e) => handleDurationChange(index, e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-center"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Hours */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-800">Total Hours</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isLessThanEightHours
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {totalTime}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className=" bottom-4">
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-lg font-semibold text-lg bg-[#018ABE] text-white shadow-lg"
        >
          Submit Timesheet
        </button>
      </div>
    </div>
  );
}
