"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TbCalendarPlus } from "react-icons/tb";
import { FiX } from "react-icons/fi";
import TaskForm from "./createtask";
import TaskPage from "./event";
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

const priorityOrder = [
    "Daily Task",
    "Meeting",
    "Reminder",
    "Deadline",
    "Leaves",
    "Other",
];

const tabs = [
    {
        label: "Event",
        key: "Event",
        content: (
            <div>
                <TaskForm />
            </div>
        ),
    },
    {
        label: "Task",
        key: "Task",
        content: (
            <div>
                <TaskPage />
            </div>
        ),
    },
    {
        label: "Schedule Meeting",
        key: "Schedule",
        content: (
            <div>
                <SchedualPage />
            </div>
        ),
    },
];

export default function CalendarPage() {
    const initialDate = new Date(2025, 4); // May 2025
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [todayKey, setTodayKey] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDayModal, setShowDayModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [activeTab, setActiveTab] = useState("Task");
    const [eventDates, setEventDates] = useState({});
    const dropdownRef = useRef(null);
    // Replace with actual user ID

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
            today.getDate()
        ).padStart(2, "0")}`;
        setTodayKey(key);
    }, []);

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_API}/admin/calendar/user/`, {
                    method: "GET",
                    credentials: "include",
                }
                );
                const data = await res.json();

                const groupedEvents = data.reduce((acc, item) => {
                    const eventDate = new Date(item.date);
                    const dateKey = `${eventDate.getUTCFullYear()}-${String(eventDate.getUTCMonth() + 1).padStart(2, "0")}-${String(
                        eventDate.getUTCDate()
                    ).padStart(2, "0")}`;

                    const eventData = {
                        title: item.title,
                        description: item.description,
                        participants: item.participants || [],
                        time: item.time ? formatTime(item.time) : null,
                        startTime: item.startTime ? formatTime(item.startTime) : null,
                        endTime: item.endTime ? formatTime(item.endTime) : null,
                        category: item.category || item.type // Support both category and type fields
                    };

                    return {
                        ...acc,
                        [dateKey]: [...(acc[dateKey] || []), eventData]
                    };
                }, {});

                setEventDates(groupedEvents);
            } catch (err) {
                console.error("Error fetching calendar data:", err);
            }
        };

        fetchCalendarData();
    }, [currentDate]);

    const formatTime = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.includes(" ")
            ? timeString.split(" ")[0].split(":")
            : timeString.split(":");
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? "PM" : "AM";
        const twelveHour = hour % 12 || 12;
        return `${twelveHour}:${minutes} ${period}`;
    };

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

    const handleDateClick = (dateKey, events) => {
        setSelectedDate(dateKey);
        setSelectedDateEvents(events);
        setShowDayModal(true);
    };

    const formatDateForDisplay = (dateKey) => {
        const date = new Date(dateKey);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                        className="px-5 py-2 rounded-lg border border-[#877575] bg-white text-black font-medium transition duration-200 ease-in-out hover:bg-gray-100 hover:shadow ml-auto"
                    >
                        Month
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
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-bold text-gray-800">
                        {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleMonthChange(-1)}
                            className="p-2 rounded hover:bg-gray-200 transition"
                        >
                            <FiChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => handleMonthChange(1)}
                            className="p-2 rounded hover:bg-gray-200 transition"
                        >
                            <FiChevronRight size={20} />
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
                        <div key={`start-${i}`} className="h-20 rounded-xl bg-[#f2f4ff] shadow-sm text-sm text-gray-400 flex items-center justify-center">
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

                        // Group events by category
                        const groupedEvents = events.reduce((acc, event) => {
                            acc[event.category] = (acc[event.category] || 0) + 1;
                            return acc;
                        }, {});

                        // Sort by priority
                        const sortedEvents = Object.entries(groupedEvents)
                            .map(([category, count]) => ({ category, count }))
                            .sort((a, b) => {
                                const aIndex = priorityOrder.indexOf(a.category);
                                const bIndex = priorityOrder.indexOf(b.category);
                                const aPriority = aIndex === -1 ? Infinity : aIndex;
                                const bPriority = bIndex === -1 ? Infinity : bIndex;
                                return aPriority - bPriority;
                            });

                        const displayedEvents = sortedEvents.slice(0, 5);
                        const remainingTypes = Math.max(sortedEvents.length - 5, 0);

                        let bgClass = "bg-[#f2f4ff] text-black";
                        if (isSunday) bgClass = "bg-sky-400 text-white";
                        if (isToday) bgClass = "bg-black text-white";

                        return (
                            <div
                                key={day}
                                onClick={() => handleDateClick(dateKey, events)}
                                className={`group relative h-20 rounded-xl flex flex-col justify-center items-center text-sm font-medium shadow-sm cursor-pointer hover:bg-sky-400 transition ${bgClass}`}
                            >
                                <span className="text-lg font-bold">{day}</span>
                                <div className="flex gap-1 mt-1">
                                    {displayedEvents.map(({ category, count }) => (
                                        <div key={category} className="flex items-center gap-0.5">
                                            <span
                                                className={`w-4 h-4 rounded-sm ${categoryColors[category] || ""}`}
                                                title={`${category}: ${count} event(s)`}
                                            />
                                            {count > 1 && (
                                                <span className="text-xs font-medium text-gray-200">
                                                    +{count - 1}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {remainingTypes > 0 && (
                                        <span className="text-xs font-medium text-gray-200 ml-0.5">
                                            +{remainingTypes}
                                        </span>
                                    )}
                                </div>

                                {/* Hover Tooltip */}
                                {events.length > 0 && (
                                    <div className="absolute z-50 bottom-full mb-2 w-64 bg-white text-gray-700 text-sm shadow-xl rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none left-1/2 transform -translate-x-1/2">
                                        <div className="text-lg font-bold mb-2 text-gray-800">
                                            {formatDateForDisplay(dateKey)}
                                        </div>
                                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                                            {events.slice(0, 3).map((event, index) => (
                                                <li key={index} className="border-b pb-2 last:border-b-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`inline-block w-3 h-3 rounded-sm ${categoryColors[event.category] || ""}`}></span>
                                                        <span className="font-semibold truncate">{event.title}</span>
                                                    </div>
                                                    {event.time && (
                                                        <div className="text-xs text-blue-600">
                                                            🕒 {event.time}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                            {events.length > 3 && (
                                                <div className="text-xs text-gray-500 text-center pt-1">
                                                    +{events.length - 3} more events. Click to view all.
                                                </div>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {Array.from({ length: endOffset }).map((_, i) => (
                        <div key={`end-${i}`} className="h-20 rounded-xl bg-[#f2f4ff] shadow-sm text-sm text-gray-400 flex items-center justify-center">
                            <span className="invisible">0</span>
                        </div>
                    ))}
                </div>
            </div>


            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-red-600"
                        >
                            &times;
                        </button>

                        {/* Tabs */}
                        <div className="flex justify-around mb-4 shadow-md">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-2 px-4 font-medium ${activeTab === tab.key ? "border-b-4 border-[#018ABE] " : "text-black-500"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-3">
                            {tabs.find((tab) => tab.key === activeTab)?.content}
                        </div>
                    </div>
                </div>
            )}

            {/* Day Detail Modal */}
            {showDayModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowDayModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
                        >
                            <FiX size={20} className="text-gray-500" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {formatDateForDisplay(selectedDate)}
                            </h2>
                            <p className="text-gray-600">
                                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'} scheduled
                            </p>
                        </div>

                        {selectedDateEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-400 text-lg mb-2">No events scheduled</div>
                                <p className="text-gray-500">This day is free from any scheduled events.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedDateEvents.map((event, index) => (
                                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                                        <div className="flex items-start gap-3">
                                            <span className={`inline-block w-4 h-4 rounded-sm mt-1 ${categoryColors[event.category] || ""}`}></span>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                                                    {event.title}
                                                </h3>

                                                {event.description && (
                                                    <p className="text-gray-600 mb-2">
                                                        {event.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-medium">Category:</span>
                                                        <span className={`px-2 py-1 rounded-full text-white text-xs ${categoryColors[event.category] || "bg-gray-400"}`}>
                                                            {event.category}
                                                        </span>
                                                    </div>

                                                    {event.category === "Meeting" ? (
                                                        <>
                                                            {event.startTime && event.endTime && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-medium">Time:</span>
                                                                    <span>{event.startTime} - {event.endTime}</span>
                                                                </div>
                                                            )}
                                                            {event.participants?.length > 0 && (
                                                                <div className="w-full mt-2">
                                                                    <span className="font-medium text-gray-700">Participants:</span>
                                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                                        {event.participants.map((participant, pIdx) => (
                                                                            <span
                                                                                key={pIdx}
                                                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                                                                            >
                                                                                {participant}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        event.time && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-medium">Time:</span>
                                                                <span>{event.time}</span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setShowDayModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowDayModal(false);
                                    setShowModal(true);
                                }}
                                className="px-4 py-2 bg-[#058CBF] text-white rounded-lg hover:bg-[#0b7bab] transition"
                            >
                                Add Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}