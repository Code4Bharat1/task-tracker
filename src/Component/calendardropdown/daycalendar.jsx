"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function CalendarPage() {
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

  const handleMonthChange = (direction) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction));
  };

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const endOffset = (7 - (firstDay + daysInMonth) % 7) % 7;

  return (
    <div className="w-[500px] ml-4 p-2">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold underline underline-offset-4 decoration-red-500 font-[Poppins,sans-serif]">
          My Calendar
        </h1>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow p-2">
        <div className="text-lg font-bold text-gray-800 mb-2 text-center">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
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
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`start-${i}`}
              className="h-10 rounded-lg bg-[#f2f4ff] shadow-sm text-xs text-gray-400 flex items-center justify-center"
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
              <Link key={day} href={`/day-view?date=${dateKey}`}>
                <div
                  className={`h-10 rounded-lg flex flex-col justify-center items-center text-[10px] font-medium shadow-sm cursor-pointer hover:bg-sky-400 transition ${bgClass}`}
                >
                  <span>{day}</span>
                  <div className="flex gap-[2px] mt-[2px]">
                    {events.map((event, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-sm ${categoryColors[event] || ""}`}
                      ></span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}

          {Array.from({ length: endOffset }).map((_, i) => (
            <div
              key={`end-${i}`}
              className="h-10 rounded-lg bg-[#f2f4ff] shadow-sm text-xs text-gray-400 flex items-center justify-center"
            >
              <span className="invisible">0</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
