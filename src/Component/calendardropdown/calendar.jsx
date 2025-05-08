"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const categoryColors = {
  "Daily Task": "bg-blue-600",
  Meeting: "bg-red-500",
  Reminder: "bg-green-500",
  Deadline: "bg-purple-600",
  Leaves: "bg-yellow-400",
  Other: "bg-orange-400",
};

const eventDates = {
  "2025-05-01": ["Daily Task"],
  "2025-05-03": ["Daily Task", "Meeting"],
  "2025-05-05": ["Deadline"],
};

export default function Calendar() {
  const initialDate = new Date(2025, 4); // May 2025
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
    setTodayKey(key);
  }, []);

  const underlineRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
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
    <div className="w-[700px] p-2">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-left font-semibold text-gray-800 text-2xl mb-6">
          <span className="relative inline-block">
            MyCalendar
            <span
              ref={underlineRef}
              className="absolute left-0 bottom-0 h-[2px] bg-red-500 w-full"
            ></span>
          </span>
        </h1>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-bold text-gray-800">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-1 rounded hover:bg-gray-200 transition"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-1 rounded hover:bg-gray-200 transition"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="py-2">
          <div className="h-1 w-full rounded-md mb-2 bg-[#D9D9D9]"></div>
          <div className="grid grid-cols-7 text-center font-semibold text-sm">
            {days.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mt-2">
          {/* Empty cells at start */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`start-${i}`}
              className="h-16 rounded-lg bg-[#f2f4ff] shadow-sm text-xs text-gray-400 flex items-center justify-center"
            >
              <span className="invisible">0</span>
            </div>
          ))}

          {/* Actual days */}
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
  className={`h-16 rounded-lg flex flex-col justify-center items-center text-[10px] font-medium shadow-sm ${bgClass} hover:bg-blue-200 transition duration-200 cursor-pointer`}
>

                <span className="text-lg font-bold">{day}</span>
                <div className="flex gap-[2px] mt-[2px]">
                  {events.map((event, idx) => (
                    <span
                      key={idx}
                      className={`w-3 h-3 ${categoryColors[event] || ""}`}
                    ></span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty cells at end */}
          {Array.from({ length: endOffset }).map((_, i) => (
            <div
              key={`end-${i}`}
              className="h-16 rounded-lg bg-[#f2f4ff] shadow-sm text-xs text-gray-400 flex items-center justify-center"
            >
              <span className="invisible">0</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
