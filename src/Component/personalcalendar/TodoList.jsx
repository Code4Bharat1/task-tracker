"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
  withCredentials: true,
});

export default function ToDoList({ selectedDate }) {
  const [task, setTask] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [currentTime, setCurrentTime] = useState("");

  // Format date string from selectedDate in 'dd/mm/yyyy'
  const formatDateStr = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formattedDate = formatDateStr(selectedDate);

  // Update current time every minute
  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load tasks whenever selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      loadTasks(formattedDate);
    }
  }, [selectedDate]);

  // Check for expired tasks whenever currentTime or taskList changes
  useEffect(() => {
    checkTaskExpirations(currentTime);
  }, [currentTime, taskList]);

  const updateCurrentTime = () => {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    setCurrentTime(timeString);
  };

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

  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    let diff = endH * 60 + endM - (startH * 60 + startM);
    if (diff < 0) diff += 24 * 60;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  const loadTasks = async (dateStr) => {
    try {
      const response = await api.get(`/todo/getTask?date=${dateStr}`);
      // response.data is an array directly from your API
      setTaskList(response.data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const handleSave = async () => {
    if (task && startTime && endTime && taskList.length < 5) {
      const duration = calculateDuration(startTime, endTime);
      const isExpired = endTime <= currentTime;

      const newTask = {
        date: formattedDate, // use formattedDate here
        task,
        startTime,
        endTime,
        duration,
        done: false,
        expired: isExpired,
        type: "To-Do",
      };

      const updatedList = [...taskList, newTask];
      setTaskList(updatedList);
      setTask("");
      setStartTime("");
      setEndTime("");

      try {
        await api.post("/todo/createTask", newTask);
      } catch (error) {
        console.error("Error saving task:", error);
      }

      // Update expired status immediately
      checkTaskExpirations(currentTime);
    }
  };

  const markAsDone = async (index) => {
    const updatedList = taskList.map((t, i) =>
      i === index ? { ...t, done: true, expired: false } : t
    );
    setTaskList(updatedList);

    try {
      const taskToUpdate = updatedList[index];
      await api.post("/todo/mark-done", {
        date: taskToUpdate.date,
        task: taskToUpdate.task,
        startTime: taskToUpdate.startTime,
      });
    } catch (error) {
      console.error("Error marking done:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full mt-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-[#058CBF] text-white font-bold text-lg px-4 py-2 rounded-md shadow">
          {selectedDate ? selectedDate.getDate() : new Date().getDate()}{" "}
          {selectedDate
            ? selectedDate
                .toLocaleString("default", { month: "short" })
                .toUpperCase()
            : new Date().toLocaleString("default", { month: "short" }).toUpperCase()}
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
          />
          <span className="text-gray-500">to</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="p-2 rounded-md shadow-md"
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

      {startTime && endTime && (
        <div className="mt-2 text-sm text-gray-600">
          Duration: {calculateDuration(startTime, endTime)}
        </div>
      )}

      {taskList.length > 0 && (
        <div className="shadow-md rounded-md overflow-hidden mt-9">
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

          {taskList.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 px-4 py-2 border-t border-gray-200"
              style={{
                background: item.done
                  ? "#f1e720"
                  : item.expired
                  ? "linear-gradient(to right, #ff6b6b, #FFFFFF)"
                  : "linear-gradient(to right, #018ABE, #FFFFFF)",
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
                {!item.done && !item.expired ? (
                  <button
                    onClick={() => markAsDone(i)}
                    className="px-3 py-1 rounded-md text-sm font-medium bg-gray-300 text-gray-800 hover:bg-gray-400"
                  >
                    Done
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-400 cursor-not-allowed"
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
