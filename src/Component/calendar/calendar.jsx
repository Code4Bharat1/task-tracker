"use client";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TbCalendarPlus } from "react-icons/tb";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import TaskForm from "./craetetask";
import EventPage from "./event";
import SchedualPage from "./schedual";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const categoryColors = {
  "Daily Task": "bg-blue-600",
  Meeting: "bg-red-500",
  Reminder: "bg-green-500",
  Deadline: "bg-purple-600",
  Leaves: "bg-yellow-400",
  Other: "bg-orange-400",
};

const tabs = [
  { label: "Event", key: "Event", content: <TaskForm /> },
  { label: "Task", key: "Task", content: <EventPage /> },
  { label: "Schedule Meeting", key: "Schedule", content: <SchedualPage /> },
];

const eventDates = {
  "2025-05-01": ["Daily Task"],
  "2025-05-03": ["Daily Task", "Meeting"],
  "2025-05-05": ["Deadline"],
};

export default function CalendarPage() {
  const initialDate = new Date(2025, 4); // May 2025
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [todayKey, setTodayKey] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Task");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setTodayKey(key);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMonthChange = (direction) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction));
  };

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const endOffset = (7 - (firstDay + daysInMonth) % 7) % 7;

  return (
    <div className="max-w-6xl mx-auto p-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h1 className="text-3xl font-bold underline underline-offset-8 decoration-4 decoration-red-500 font-[Poppins,sans-serif]">
          My Calendar
        </h1>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg border border-[#877575] bg-white text-black font-medium transition duration-200 ease-in-out hover:bg-gray-100 hover:shadow ml-auto"
          >
            Day
            <FiChevronDown className={`transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow z-10 w-40">
              {[
                { label: "Day", href: "/daycalendar" },
                { label: "Month", href: "/calendar" },
                { label: "Year", href: "/yearcalendar" },
              ].map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm text-gray-700">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center text-xl font-bold text-gray-800 mb-4">
          <div>
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <FiChevronLeft className="text-2xl" />
            </button>
            <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-gray-100 rounded-full">
              <FiChevronRight className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="py-6">
          <div className="h-2 w-full rounded-md mb-4 bg-[#D9D9D9]"></div>
          <div className="grid grid-cols-7 text-center font-semibold text-lg">
            {days.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 mt-3">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`start-${i}`}
              className="h-20 rounded-xl bg-[#f2f4ff] shadow-sm text-sm text-gray-400 flex items-center justify-center"
            >
              <span className="invisible">0</span>
            </div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const events = eventDates[dateKey] || [];
            const weekday = (firstDay + day - 1) % 7;
            const isSunday = weekday === 0;
            const isToday = dateKey === todayKey;

            let bgClass = "bg-[#f2f4ff] text-black";
            if (isSunday) bgClass = "bg-sky-400 text-white";
            if (isToday) bgClass = "bg-black text-white";

            return (
              <div
                key={day}
                className={`h-20 rounded-xl flex flex-col justify-center items-center text-sm font-medium shadow-sm cursor-pointer hover:bg-sky-400 transition ${bgClass}`}
              >
               <span className="text-lg md:text-xl font-bold">{day}</span>

                <div className="flex gap-1 mt-1">
                  {events.map((event, idx) => (
                    <span
                      key={idx}
                      className={`w-4 h-4 rounded-sm ${categoryColors[event] || ""} hover:opacity-75`}
                    ></span>
                  ))}
                </div>
              </div>
            );
          })}

          {Array.from({ length: endOffset }).map((_, i) => (
            <div
              key={`end-${i}`}
              className="h-20 rounded-xl bg-[#f2f4ff] shadow-sm text-sm text-gray-400 flex items-center justify-center"
            >
              <span className="invisible">0</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories + Create Button */}
      <div className="flex flex-col md:flex-row items-start justify-between bg-white p-4 rounded-xl shadow-md mt-6 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Categories</h2>
          <div className="flex gap-10 text-sm font-medium">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-600 rounded-sm"></span> Daily Task
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-500 rounded-sm"></span> Meeting
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded-sm"></span> Reminder
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-purple-600 rounded-sm"></span> Deadline
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-yellow-400 rounded-sm"></span> Leaves
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#058CBF] text-white font-bold px-5 py-2 rounded-lg drop-shadow-lg hover:bg-[#D9D9D9] transition"
        >
          <TbCalendarPlus className="h-5 w-5 text-black" />
          CREATE
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-red-600"
            >
              &times;
            </button>

            <div className="flex justify-around mb-4 shadow-md">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-4 font-medium ${activeTab === tab.key ? "border-b-4 border-[#018ABE]" : "text-black-500"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">{tabs.find((tab) => tab.key === activeTab)?.content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
