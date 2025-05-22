"use client";
import { useState, useEffect } from "react";

export default function ToDoList({ selectedDate }) {
  const [task, setTask] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [displayDate, setDisplayDate] = useState("");

  useEffect(() => {
    // Initialize current time
    updateCurrentTime();

    // Update current time every minute
    const interval = setInterval(() => {
      updateCurrentTime();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Update display date when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      const formattedDate = selectedDate.toLocaleDateString("en-GB", options);
      setDisplayDate(formattedDate);

      // Load tasks for the selected date
      loadTasks(formattedDate);
    }
  }, [selectedDate]);

  // Load tasks from localStorage for a specific date
  const loadTasks = (dateStr) => {
    if (!dateStr) return;

    const storedTasks = localStorage.getItem("todoTasks");
    if (storedTasks) {
      const allTasks = JSON.parse(storedTasks);

      // Filter tasks for the selected date
      const filteredTasks = allTasks.filter((task) => task.date === dateStr);
      setTaskList(filteredTasks);
    }
  };

  // Save tasks to localStorage
  const saveTasks = (tasks) => {
    const storedTasks = localStorage.getItem("todoTasks");
    let allTasks = storedTasks ? JSON.parse(storedTasks) : [];

    // Remove existing tasks for this date
    const dateStr = displayDate;
    allTasks = allTasks.filter((task) => task.date !== dateStr);

    // Add new tasks for this date
    allTasks = [...allTasks, ...tasks];

    localStorage.setItem("todoTasks", JSON.stringify(allTasks));
  };

  // Update current time and check for expired tasks
  const updateCurrentTime = () => {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    setCurrentTime(timeString);

    // Check each task for expiration
    checkTaskExpirations(timeString);
  };

  // Check all tasks for expiration
  const checkTaskExpirations = (currentTimeString) => {
    setTaskList((prev) =>
      prev.map((item) => {
        if (!item.done && item.endTime <= currentTimeString) {
          return { ...item, expired: true };
        }
        return item;
      })
    );
  };

  // Calculate duration between start and end time
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";

    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    let durationMinutes =
      endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

    // Handle cases where end time is on the next day
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const handleSave = () => {
    if (task && startTime && endTime && taskList.length < 5) {
      const duration = calculateDuration(startTime, endTime);

      // Check if task is already expired when created
      const isExpired = endTime <= currentTime;

      const newTask = {
        date: displayDate,
        task,
        startTime,
        endTime,
        duration,
        done: false,
        expired: isExpired,
        type: "To-Do", // Add type for consistency with event system
      };

      const newTaskList = [...taskList, newTask];
      setTaskList(newTaskList);

      // Save the updated task list
      saveTasks([newTask]);

      setTask("");
      setStartTime("");
      setEndTime("");
    }
  };

  // Mark task as done
  const markAsDone = (index) => {
    const updatedTaskList = taskList.map((t, idx) => {
      if (idx === index) {
        return { ...t, done: true, expired: false };
      }
      return t;
    });

    setTaskList(updatedTaskList);
    saveTasks(updatedTaskList);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full mt-6 max-w-7xl mx-auto">
      {/* Header with selected date */}

      {/* Input Section */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-[#058CBF] text-white font-bold text-lg px-4 py-2 rounded-md shadow">
          {selectedDate ? selectedDate.getDate() : new Date().getDate()}{" "}
          {selectedDate
            ? selectedDate
                .toLocaleString("default", { month: "short" })
                .toUpperCase()
            : new Date()
                .toLocaleString("default", { month: "short" })
                .toUpperCase()}
        </div>
        <input
          type="text"
          placeholder="Add task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="flex-1 p-2 rounded-md shadow-md"
        />
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="p-2 rounded-md shadow-md"
            placeholder="Start Time"
          />
          <span className="text-gray-500">to</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="p-2 rounded-md shadow-md"
            placeholder="End Time"
          />
        </div>
        <button
          onClick={handleSave}
          className="bg-[#058CBF] hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md shadow"
          disabled={!task || !startTime || !endTime}
        >
          Save
        </button>
      </div>

      {/* Duration Display */}
      {startTime && endTime && (
        <div className="mt-2 text-sm text-gray-600">
          Duration: {calculateDuration(startTime, endTime)}
        </div>
      )}

      {/* Task Table */}
      {taskList.length > 0 && (
        <div className="shadow-md rounded-md overflow-hidden mt-9">
          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-4 bg-[#e4ebf5] px-4 py-3 rounded-t-md">
            <div className="col-span-2 bg-[#058CBF] text-white font-bold text-center py-1 px-4 rounded-md shadow-md">
              Date
            </div>
            <div className="col-span-5 bg-[#058CBF] text-white font-bold text-center py-1 px-4 rounded-md shadow-md">
              To-Do List
            </div>
            <div className="col-span-3 bg-[#058CBF] text-white font-bold text-center py-1 px-4 rounded-md shadow-md">
              Time
            </div>
            <div className="col-span-2 bg-[#058CBF] text-white font-bold text-center py-1 px-4 rounded-md shadow-md">
              Duration
            </div>
          </div>

          {/* Task Rows */}
          {taskList.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 px-4 py-2 border-t border-gray-200"
              style={{
                background: item.done
                  ? "#f1e720" // Yellow for completed
                  : item.expired
                  ? "linear-gradient(to right, #ff6b6b, #FFFFFF)" // Red gradient for expired
                  : "linear-gradient(to right, #018ABE, #FFFFFF)", // Default blue gradient
              }}
            >
              <div className="col-span-2 flex justify-center items-center">
                <div className="w-full px-2 py-2 rounded-md bg-white text-black shadow-md text-center">
                  {item.date}
                </div>
              </div>
              <div className="col-span-5 flex justify-center items-center">
                <div className="w-full px-2 py-2 rounded-md bg-white shadow-md text-center text-black">
                  {item.task}
                </div>
              </div>
              <div className="col-span-3 flex justify-center items-center">
                <div className="w-full px-2 py-2 rounded-md bg-white shadow-md text-center text-black">
                  {item.startTime} to {item.endTime}
                </div>
              </div>
              <div className="col-span-2 flex justify-between items-center gap-2">
                <div className="flex-1 px-2 py-2 rounded-md bg-white shadow-md text-center text-black">
                  {item.duration}
                </div>
                {!item.done && !item.expired && (
                  <button
                    onClick={() => markAsDone(i)}
                    className="px-3 py-1 rounded-md text-sm font-medium bg-gray-300 text-gray-800 hover:bg-gray-400"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
