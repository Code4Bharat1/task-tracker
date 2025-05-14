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

export default function Calendar() {
  const initialDate = new Date(2025, 4); // May 2025
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [todayKey, setTodayKey] = useState("");
  const [eventDates, setEventDates] = useState({});

  // ✅ Set today key
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setTodayKey(key);
  }, []);

  // ✅ Load events from localStorage
  const loadEvents = () => {
    const stored = localStorage.getItem("calendarEvents");
    setEventDates(stored ? JSON.parse(stored) : {});
  };

  useEffect(() => {
    loadEvents();

    // Listen for changes in localStorage (e.g., from other tabs or components)
    const handleStorageChange = (event) => {
      if (event.key === "calendarEvents") {
        loadEvents();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Re-fetch events on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadEvents();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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
      <div className="mb-4">
        <h1 className="text-left font-semibold text-gray-800 text-2xl mb-6">
          <span className="relative inline-block">
            MyCalendar
            <span ref={underlineRef} className="absolute left-0 bottom-0 h-[2px] bg-red-500 w-full"></span>
          </span>
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-bold text-gray-800">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleMonthChange(-1)} className="p-1 rounded hover:bg-gray-200 transition">
              <FiChevronLeft size={20} />
            </button>
            <button onClick={() => handleMonthChange(1)} className="p-1 rounded hover:bg-gray-200 transition">
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
          {/* Empty placeholders for days before the 1st of the month */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`start-${i}`} className="h-16 rounded-lg bg-[#f2f4ff] shadow-sm text-xs text-gray-400 flex items-center justify-center">
              <span className="invisible">0</span>
            </div>
          ))}

          {/* Calendar day cells */}
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
                className={`group relative h-16 rounded-lg flex flex-col justify-center items-center text-[10px] font-medium shadow-sm ${bgClass} hover:bg-blue-200 transition duration-200 cursor-pointer`}
              >
                <span className="text-lg font-bold">{day}</span>
                <div className="flex gap-[2px] mt-[2px]">
                  {events.map((event, idx) => (
                    <span
                      key={idx}
                      className={`w-3 h-3 rounded-full ${categoryColors[event.type] || ""}`}
                      title={event.title || event.type}
                    ></span>
                  ))}
                </div>

                {events.length > 0 && (
                  <div className="absolute z-10 bottom-full mb-2 w-52 bg-white text-gray-700 text-[12px] shadow-lg rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <ul className="space-y-2">
                      {events.map((event, index) => (
                        <li key={index}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block w-2 h-2 rounded-full ${categoryColors[event.type] || ""}`}></span>
                            <span className="font-semibold truncate">{event.title || event.type}</span>
                          </div>
                          {event.email && (
                            <div className="text-[11px] text-gray-600 truncate">
                              📧 {event.email}
                            </div>
                          )}
                          {event.description && (
                            <div className="text-[11px] text-gray-500 truncate">
                              📝 {event.description}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty placeholders after the last day of the month */}
          {Array.from({ length: endOffset }).map((_, i) => (
            <div key={`end-${i}`} className="h-16 rounded-lg bg-[#f2f4ff] shadow-sm text-xs text-gray-400 flex items-center justify-center">
              <span className="invisible">0</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
