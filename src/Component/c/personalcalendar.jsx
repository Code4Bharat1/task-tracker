"use client";
import React, { useState, useEffect, useRef } from "react";
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

  // Refs and animations
  const underlineRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const storedEvents = localStorage.getItem("calendarEvents");
    if (storedEvents) setEvents(JSON.parse(storedEvents));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  // Helper functions
  function formatDate(date) {
    const d = new Date(date);
    return [
      d.getDate().toString().padStart(2, "0"),
      (d.getMonth() + 1).toString().padStart(2, "0"),
      d.getFullYear(),
    ].join("-");
  }

  function displayDate(date) {
    const d = new Date(date);
    return [
      d.getDate().toString().padStart(2, "0"),
      (d.getMonth() + 1).toString().padStart(2, "0"),
      d.getFullYear(),
    ].join("/");
  }

  function calculateDuration(start, end) {
    if (!start || !end) return "";
    const startParts = start.split(":");
    const endParts = end.split(":");

    const startDate = new Date();
    startDate.setHours(
      parseInt(startParts[0], 10),
      parseInt(startParts[1], 10),
      0
    );

    const endDate = new Date();
    endDate.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0);

    if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);

    const diffMs = endDate - startDate;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}h ${diffMins}m`;
  }

  // Toast notification
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // Form handling
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;

    if (name === "date" && type === "date") {
      const [year, month, day] = value.split("-");
      processedValue = `${day}-${month}-${year}`;
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  // Event creation
  const handleCreateEvent = () => {
    // Validate required fields based on tab
    if (
      (activeTab === "Event" || activeTab === "Daily Task") &&
      (!formData.title || !formData.date)
    ) {
      showToast("Please fill in required fields");
      return;
    }

    if (
      activeTab === "Schedule Meeting" &&
      (!formData.date || !formData.time || !formData.endTime || !formData.email)
    ) {
      showToast("Please fill in all meeting fields");
      return;
    }

    let eventTitle = formData.title;
    if (activeTab === "Schedule Meeting" && !eventTitle) {
      eventTitle = `Meeting with ${formData.email}`;
    }

    const newEvent = {
      id: Date.now(),
      ...formData,
      title: eventTitle,
      type: activeTab,
      category: activeTab,
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

  // Calendar navigation
  const handleDayClick = (day) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
  };

  const handleDayHover = (day) => setHoveredDay(day);
  const handleDayLeave = () => setHoveredDay(null);

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  // Calendar utils
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
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const formattedDate = formatDate(date);

    // Only check events, not todos (as requested)
    return events.some((event) => event.date === formattedDate);
  };

  const getUniqueEventCategoriesForDay = (day) => {
    if (!day) return [];
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const formattedDate = formatDate(date);

    // Filter only events (exclude To-Do items)
    const dayEvents = events.filter(
      (event) => event.date === formattedDate && event.type !== "To-Do"
    );

    // Get unique categories
    const uniqueCategories = [];
    const seen = new Set();

    dayEvents.forEach((item) => {
      const category = item.category || item.type;
      if (!seen.has(category)) {
        seen.add(category);
        uniqueCategories.push(category);
      }
    });

    return uniqueCategories.slice(0, 5); // Show up to 5 dots
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const formattedDate = formatDate(date);
    return events.filter((event) => event.date === formattedDate);
  };

  // Category colors
  const categoryDotColors = {
    Reminder: "bg-green-500",
    Deadline: "bg-purple-500",
    Leaves: "bg-red-500",
    "Schedule Meeting": "bg-red-600",
    "Daily Task": "bg-blue-500",
  };

  // Day styling
  const getDayBackgroundColor = (day) => {
    if (!day) return "";

    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    if (isSameDay(date, selectedDate)) {
      return "bg-blue-100";
    }

    if (
      day === new Date().getDate() &&
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear()
    ) {
      return "bg-[#02587b] text-white ";
    }

    if (date.getDay() === 0) {
      return "bg-[#67B2CF] text-white"; // Sunday
    }

    return "bg-[#ECEEFD]";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 relative inline-block text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-[#02587b] w-full"
          ></span>
          My calendar
        </h2>

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
                      ${day ? "hover:bg-gray-100" : ""}
                      ${getDayBackgroundColor(day)}
                    `}
                    onClick={() => day && handleDayClick(day)}
                    onMouseEnter={() => day && handleDayHover(day)}
                    onMouseLeave={handleDayLeave}
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
                                    categoryDotColors[category] || "bg-blue-500"
                                  } rounded-full`}
                                ></div>
                              )
                            )}
                          </div>
                        )}

                        {hoveredDay === day && hasEvents(day) && (
                          <div className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg w-48 text-left">
                            {getEventsForDay(day).map((event, idx) => (
                              <div
                                key={idx}
                                className="mb-2 border-b pb-1 last:border-b-0 last:pb-0"
                              >
                                <div className="font-bold text-blue-600">
                                  {event.title}
                                </div>
                                <div className="text-xs text-gray-600 flex items-center">
                                  <Clock size={12} className="mr-1" />
                                  {event.startTime && event.endTime
                                    ? `${event.startTime} - ${event.endTime}`
                                    : event.time || "All day"}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {event.category || event.type}
                                </div>
                              </div>
                            ))}
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
                className="w-full bg-[#018ABE] py-2 px-4 rounded-md hover:bg-teal-600 mt-8"
              >
                CREATE
              </button>
            </div>
          </div>
        </div>

        {/* Todo List Section - Imported as a component */}
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
                  className="bg-[#018ABE]  text-white px-4 py-1 rounded-md"
                  onClick={handleCreateEvent}
                >
                  {activeTab === "Schedule Meeting" ? "Schedule" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast notification */}
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
