"use client";

import React, { useState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  CalendarIcon,
  Clock,
  X,
  User,
  Info,
  Mail,
  FileText,
  Bell,
  Calendar,
  Briefcase,
  Users,
  CheckSquare,
  Gift,
  Heart,
  AlertTriangle,
  Plane,
} from "lucide-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import EventForm from "./EventForm";
import TaskForm from "./TaskForm";
import MeetingForm from "./MettingForm";
import ToDoList from "./TodoList";

export default function PersonalCalendar() {
  // States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Event");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [events, setEvents] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [clickedDay, setClickedDay] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: formatDate(new Date()),
    category: "Reminder",
    time: "",
    endTime: "",
    description: "",
    email: "",
    reminderTime: "15",
  });
  const [selectedOption, setSelectedOption] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    switch (value) {
      case "personal":
        router.push("/personalcalendar");
        break;
      case "month":
        router.push("/monthlycalendar");
        break;
      case "year":
        router.push("/yearcalendar");
        break;
      default:
        break;
    }
  };
  const underlineRef = useRef(null);
  const hoverCloseTimer = useRef(null);

  // Configurations
  const categoryConfig = {
    Reminder: {
      color: "#10B981",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      icon: Bell,
    },
    Deadline: {
      color: "#8B5CF6",
      bg: "#F3E8FF",
      border: "#C4B5FD",
      icon: AlertTriangle,
    },
    Leaves: { color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", icon: Plane },
    "Schedule Meeting": {
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
      icon: Users,
    },
    "Daily Task": {
      color: "#3B82F6",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      icon: CheckSquare,
    },
    Birthday: {
      color: "#EC4899",
      bg: "#FDF2F8",
      border: "#FBCFE8",
      icon: Gift,
    },
  };

  const categoryDotColors = {
    Reminder: "bg-green-500",
    Deadline: "bg-purple-500",
    Leaves: "bg-red-500",
    "Schedule Meeting": "bg-red-600",
    "Daily Task": "bg-blue-500",
    Birthday: "bg-pink-500",
    default: "bg-gray-500",
  };

  // Animations
  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  // Auto-close hover functionality
  const startHoverAutoClose = () => {
    clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = setTimeout(() => setHoveredDay(null), 3000);
  };

  const clearHoverAutoClose = () => clearTimeout(hoverCloseTimer.current);

  // Effects
  useEffect(() => {
    const storedEvents = localStorage.getItem("calendarEvents");
    if (storedEvents) setEvents(JSON.parse(storedEvents));
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (hoveredDay) startHoverAutoClose();
    else clearHoverAutoClose();
    return clearHoverAutoClose;
  }, [hoveredDay]);

  // Helper functions
  function formatDate(date) {
    const d = new Date(date);
    return [
      d.getDate().toString().padStart(2, "0"),
      (d.getMonth() + 1).toString().padStart(2, "0"),
      d.getFullYear(),
    ].join("-");
  }

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    if (name === "date" && type === "date") {
      const [year, month, day] = value.split("-");
      processedValue = `${day}-${month}-${year}`;
    }
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleCreateEvent = () => {
    // Validation
    if (
      (activeTab === "Event" || activeTab === "Daily Task") &&
      (!formData.title || !formData.date)
    ) {
      return showToast("Please fill in required fields");
    }
    if (
      activeTab === "Schedule Meeting" &&
      (!formData.date || !formData.time || !formData.endTime || !formData.email)
    ) {
      return showToast("Please fill in all meeting fields");
    }

    const eventTitle =
      formData.title ||
      (activeTab === "Schedule Meeting"
        ? `Meeting with ${formData.email}`
        : "");
    const eventCategory = activeTab === "Event" ? formData.category : activeTab;

    const newEvent = {
      id: Date.now(),
      ...formData,
      title: eventTitle,
      type: activeTab,
      category: eventCategory,
    };
    setEvents([...events, newEvent]);
    showToast(`${activeTab} created successfully!`);
    setModalOpen(false);
    setFormData({
      title: "",
      date: formatDate(new Date()),
      category: "Reminder",
      time: "",
      endTime: "",
      description: "",
      email: "",
      reminderTime: "15",
    });
  };

  const handleDayClick = (day) => {
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    if (hasEvents(day)) {
      setClickedDay(day);
    }
  };

  const handleDayHover = (day) => {
    clearHoverAutoClose();
    setHoveredDay(day);
  };

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const isSameDay = (date1, date2) =>
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();

  const hasEvents = (day) => {
    if (!day) return false;
    const formattedDate = formatDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    return events.some((event) => event.date === formattedDate);
  };

  const getUniqueEventCategoriesForDay = (day) => {
    if (!day) return [];
    const formattedDate = formatDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    const dayEvents = events.filter(
      (event) => event.date === formattedDate && event.type !== "To-Do"
    );
    const uniqueCategories = [
      ...new Set(dayEvents.map((item) => item.category || item.type)),
    ];
    return uniqueCategories.slice(0, 5);
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const formattedDate = formatDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    return events.filter((event) => event.date === formattedDate);
  };

  const getDayBackgroundColor = (day) => {
    if (!day) return "";
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    if (isSameDay(date, selectedDate)) return "bg-blue-100";
    if (
      day === new Date().getDate() &&
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear()
    )
      return "bg-[#02587b] text-white";
    if (date.getDay() === 0) return "bg-[#67B2CF] text-white";
    return "bg-[#ECEEFD]";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold relative inline-block text-gray-800">
            <span className="absolute left-0 bottom-0 h-[2px] bg-[#02587b] w-full"></span>
            My calendar
          </h2>

          <select
            className="border border-gray-300 bg-white rounded px-4 py-2"
            value={selectedOption}
            onChange={handleChange}
          >
            <option value="personal">Personal Calendar</option>
            <option value="month">Month Calendar</option>
            <option value="year">Year Calendar</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-full hover:bg-gray-100 text-xl text-[#058CBF]"
                  >
                    <IoIosArrowBack />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-gray-100 text-xl text-[#058CBF]"
                  >
                    <IoIosArrowForward />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="text-center font-medium py-2">
                      {day}
                    </div>
                  )
                )}

                {generateCalendarDays().map((day, index) => (
                  <div
                    key={index}
                    className={`relative h-12 rounded p-1 text-center cursor-pointer transition-colors group
                      ${day ? "hover:bg-gray-100" : ""} ${getDayBackgroundColor(
                      day
                    )}`}
                    onClick={() => day && handleDayClick(day)}
                    onMouseEnter={() => day && handleDayHover(day)}
                    onMouseLeave={startHoverAutoClose}
                  >
                    {day && (
                      <>
                        <span>{day}</span>
                        {hasEvents(day) && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                            {getUniqueEventCategoriesForDay(day).map(
                              (category, idx) => (
                                <div
                                  key={idx}
                                  className={`h-1.5 w-1.5 ${
                                    categoryDotColors[category] ||
                                    categoryDotColors.default
                                  } rounded-full`}
                                ></div>
                              )
                            )}
                          </div>
                        )}

                        {hoveredDay === day && hasEvents(day) && (
                          <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-72">
                            <div
                              className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                              onMouseEnter={clearHoverAutoClose}
                              onMouseLeave={startHoverAutoClose}
                            >
                              <div className="p-4">
                                <div className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                                  <Calendar size={14} className="mr-2" />
                                  {`${day} ${currentDate.toLocaleDateString(
                                    "en-US",
                                    { month: "long" }
                                  )}`}
                                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {getEventsForDay(day).map((event, idx) => {
                                    const config =
                                      categoryConfig[event.category] ||
                                      categoryConfig[event.type];
                                    const IconComponent =
                                      config?.icon || Calendar;

                                    return (
                                      <div
                                        key={idx}
                                        className="group/item hover:scale-105 transition-transform duration-200"
                                        style={{
                                          backgroundColor:
                                            config?.bg || "#F9FAFB",
                                          borderLeft: `4px solid ${
                                            config?.color || "#6B7280"
                                          }`,
                                        }}
                                      >
                                        <div className="p-3 rounded-r-lg">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center mb-2">
                                                <div
                                                  className="p-1.5 rounded-full mr-3"
                                                  style={{
                                                    backgroundColor:
                                                      (config?.color ||
                                                        "#6B7280") + "20",
                                                  }}
                                                >
                                                  <IconComponent
                                                    size={14}
                                                    style={{
                                                      color:
                                                        config?.color ||
                                                        "#6B7280",
                                                    }}
                                                  />
                                                </div>
                                                <div
                                                  className="font-semibold text-sm"
                                                  style={{
                                                    color:
                                                      config?.color ||
                                                      "#6B7280",
                                                  }}
                                                >
                                                  {event.title}
                                                </div>
                                              </div>

                                              <div className="space-y-1">
                                                {(event.time ||
                                                  event.endTime) && (
                                                  <div className="flex items-center text-xs text-gray-600">
                                                    <Clock
                                                      size={12}
                                                      className="mr-2"
                                                    />
                                                    {event.time && event.endTime
                                                      ? `${event.time} - ${event.endTime}`
                                                      : event.time || "All day"}
                                                  </div>
                                                )}

                                                {event.email && (
                                                  <div className="flex items-center text-xs text-gray-600">
                                                    <Mail
                                                      size={12}
                                                      className="mr-2"
                                                    />
                                                    {event.email}
                                                  </div>
                                                )}

                                                <div
                                                  className="flex items-center text-xs font-medium"
                                                  style={{
                                                    color:
                                                      config?.color ||
                                                      "#6B7280",
                                                  }}
                                                >
                                                  <div
                                                    className="w-2 h-2 rounded-full mr-2"
                                                    style={{
                                                      backgroundColor:
                                                        config?.color ||
                                                        "#6B7280",
                                                    }}
                                                  ></div>
                                                  {event.category || event.type}
                                                </div>
                                              </div>
                                            </div>

                                            {event.description && (
                                              <div className="ml-2">
                                                <div className="group/tooltip relative">
                                                  <FileText
                                                    size={14}
                                                    className="text-gray-400 hover:text-gray-600 cursor-help"
                                                  />
                                                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                                                    {event.description}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 h-full">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-3">
                {Object.entries(categoryDotColors).map(([category, color]) => (
                  <div key={category} className="flex items-center">
                    <div className={`w-4 h-4 ${color} mr-2`}></div>
                    <span>{category}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full bg-[#018ABE] py-2 px-4 rounded-md hover:bg-teal-600 mt-8 text-white"
              >
                CREATE
              </button>
            </div>
          </div>
        </div>

        {/* Day Click Popup Modal */}
        {clickedDay && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      clickedDay
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getEventsForDay(clickedDay).length} events scheduled
                  </p>
                </div>
                <button
                  onClick={() => setClickedDay(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Events List */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {getEventsForDay(clickedDay).map((event, idx) => {
                    const config =
                      categoryConfig[event.category] ||
                      categoryConfig[event.type];
                    const IconComponent = config?.icon || Calendar;

                    return (
                      <div
                        key={idx}
                        className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {/* Event Header */}
                        <div className="flex items-center mb-3">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{
                              backgroundColor: config?.color || "#6B7280",
                            }}
                          ></div>
                          <h4 className="font-semibold text-gray-800 flex-1">
                            {event.title}
                          </h4>
                        </div>

                        {/* Event Details */}
                        {event.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {event.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 w-20">
                              Category:
                            </span>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: config?.bg || "#F9FAFB",
                                color: config?.color || "#6B7280",
                              }}
                            >
                              {event.category || event.type}
                            </span>
                          </div>

                          {(event.time || event.endTime) && (
                            <div className="flex items-center text-sm">
                              <Clock size={16} className="text-gray-500 mr-2" />
                              <span className="text-gray-500 w-16">Time:</span>
                              <span className="text-gray-800">
                                {event.time && event.endTime
                                  ? `${event.time} - ${event.endTime}`
                                  : event.time || "All day"}
                              </span>
                            </div>
                          )}

                          {event.email && (
                            <div className="flex items-center text-sm">
                              <Mail size={16} className="text-gray-500 mr-2" />
                              <span className="text-gray-500 w-16">Email:</span>
                              <span className="text-gray-800">
                                {event.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setClickedDay(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setClickedDay(null);
                    setModalOpen(true);
                  }}
                  className="bg-[#018ABE] text-white px-4 py-2 rounded-md hover:bg-[#016a94] transition-colors flex items-center"
                >
                  <span className="mr-2">+</span>
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}

        <ToDoList selectedDate={selectedDate} />

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex border-b pb-2 mb-4">
                {["Event", "Daily Task", "Schedule Meeting"].map((tab) => (
                  <button
                    key={tab}
                    className={`mr-6 pb-2 ${
                      activeTab === tab
                        ? "border-b-2 border-[#018ABE]"
                        : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "Event" && (
                <EventForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  categoryDotColors={categoryDotColors}
                />
              )}
              {activeTab === "Daily Task" && (
                <TaskForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  categoryDotColors={categoryDotColors}
                />
              )}
              {activeTab === "Schedule Meeting" && (
                <MeetingForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  categoryDotColors={categoryDotColors}
                />
              )}

              <div className="flex justify-end">
                <button
                  className="mr-2 px-4 py-1"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-[#018ABE] text-white px-4 py-1 rounded-md"
                  onClick={handleCreateEvent}
                >
                  {activeTab === "Schedule Meeting" ? "Schedule" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast.show && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center z-50">
            <Info size={20} className="mr-2" />
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
