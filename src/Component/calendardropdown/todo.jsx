"use client";
import { useState, useEffect } from "react";
export default function ToDo() {
  const [date, setDate] = useState("");
  const [task, setTask] = useState("");
  const [time, setTime] = useState("");
  const [taskList, setTaskList] = useState([]);

  useEffect(() => {
    const today = new Date();
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    setDate(today.toLocaleDateString("en-GB", options));
  }, []);

  const handleSave = () => {
    if (task && time && taskList.length < 5) {
      setTaskList((prev) => [...prev, { date, task, time }]);
      setTask("");
      setTime("");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-[1230px] mx-auto">
      {/* Input Section */}
      <div className="flex items-center">
        <div className="bg-[#058CBF] text-white font-bold text-lg px-4 py-2 rounded-md mr-4 shadow">
          {new Date().getDate()}{" "}
          {new Date().toLocaleString("default", { month: "short" }).toUpperCase()}
        </div>
        <input
          type="text"
          placeholder="Add task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="flex-1 p-2 rounded-md shadow-md mr-2"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="p-2 rounded-md shadow-md mr-2"
        />
        <button
          onClick={handleSave}
          className="bg-[#058CBF] hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md shadow"
        >
          Save
        </button>
      </div>

      {/* Task Table */}
      {taskList.length > 0 && (
        <div className="shadow-md rounded-md overflow-hidden mt-9">
          {/* Table Headers */}
          <div className="grid grid-cols-3 gap-4 bg-[#e4ebf5] px-4 py-3 rounded-t-md">
            <div className="bg-[#058CBF] text-white font-bold text-center py-1 px-4 rounded-md shadow-md">
              Date
            </div>
            <div className="bg-[#058CBF] text-white font-bold text-center py-1 px-4 rounded-md shadow-md">
              To-Do List
            </div>
            <div className="bg-[#058CBF] text-white font-bold text-center py-1 px-4 rounded-md shadow-md">
              Time
            </div>
          </div>

          {/* Task Rows */}
          {taskList.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-2 px-4 py-2 border-t border-gray-200 bg-[#FEFAE0]"
            >
              <div className="flex justify-center">
                <div className="w-full px-2 py-2 rounded-md bg-white text-black shadow-md">
                  {item.date}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full px-2 py-2 rounded-md bg-white text-black shadow-md">
                  {item.task}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full px-2 py-2 rounded-md bg-white text-black shadow-md">
                  {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}