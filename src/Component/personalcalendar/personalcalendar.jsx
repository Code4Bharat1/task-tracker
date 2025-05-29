"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import EventForm from "./EventForm";
import TaskForm from "./TaskForm";
import MeetingForm from "./MettingForm";
// import ToDoList from "./TodoList";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PersonalCalendar() {
  // States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Event");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [events, setEvents] = useState([]);
  const [clickedDay, setClickedDay] = useState(null);
  const [todayKey, setTodayKey] = useState("");
  
  const [isLoading, setIsLoading] = useState(false); // Add calendar type state
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
        router.push("/calendar");
        break;
      case "year":
        router.push("/yearcalendar");
        break;
      default:
        break;
    }
  };
  const underlineRef = useRef(null);

 // Configurations - Using "Meeting" as the display name
const categoryConfig = {
  Reminder: {
    color: "#059669",       // Deeper green
    bg: "#D1FAE5",         // Softer green
    border: "#6EE7B7",     // Medium green
    icon: Bell,
  },
  Deadline: {
    color: "#7C3AED",      // Royal purple
    bg: "#EDE9FE",         // Light purple
    border: "#A78BFA",     // Medium purple
    icon: AlertTriangle,
  },
  Leaves: { 
    color: "#D97706",      // Amber
    bg: "#FEF3C7",         // Light amber
    border: "#FCD34D",     // Medium amber
    icon: Plane 
  },
  Meeting: {
    color: "#DC2626",      // Rich red
    bg: "#FEE2E2",         // Light red
    border: "#FCA5A5",     // Medium red
    icon: Users,
  },
  "Daily Task": {
    color: "#2563EB",      // Deep blue
    bg: "#DBEAFE",         // Light blue
    border: "#93C5FD",     // Medium blue
    icon: CheckSquare,
  },
};

// Using "Meeting" as the display name
const categoryDotColors = {
  "Daily Task": "bg-[#2563EB]",    // Matching blue
  Deadline: "bg-[#7C3AED]",        // Matching purple
  Meeting: "bg-[#DC2626]",         // Matching red
  Leaves: "bg-[#D97706]",          // Matching amber
  Reminder: "bg-[#059669]",        // Matching green
};

  const priorityOrder = [
    "Daily Task",
    "Meeting",
    "Reminder",
    "Deadline",
    "Leaves",
  ];

  // API Functions
  const fetchCalendarData = async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar/user`,
        {
          withCredentials: true,
        }
      );

      console.log(response);

      if (response.status === 200) {
        processCalendarData(response.data);
      }
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      showToast("Failed to fetch calendar data");
      
      // Fallback to localStorage if API fails
      const storedEvents = localStorage.getItem("calendarEvents");
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  const processCalendarData = (data) => {
    // Process the API response data and format it for the calendar
    // Adjust this function based on your API response structure
    if (data && Array.isArray(data)) {
      const formattedEvents = data.map(event => ({
        id: event.id || Date.now(),
        title: event.title || "",
        date: formatDate(new Date(event.date)) || formatDate(new Date()),
        category: event.category || "Reminder",
        time: event.time || "",
        endTime: event.endTime || "",
        description: event.description || "",
        email: event.email || "",
        reminderTime: event.reminderTime || "15",
        type: event.type || "Event",
      }));
      
      setEvents(formattedEvents);
      
      // Also save to localStorage as backup
      localStorage.setItem("calendarEvents", JSON.stringify(formattedEvents));
    } else {
      setEvents([]);
    }
  };

  const createEventAPI = async (eventData) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar/user`,
        eventData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Refresh calendar data after successful creation
        await fetchCalendarData(false);
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error("Error creating event:", err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Animations
  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  // Effects
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
    setTodayKey(key);
  }, []);

  // Fetch calendar data on component mount and when calType changes
  useEffect(() => {
    fetchCalendarData();
  }, []);

  useEffect(() => {
    // Only save to localStorage when events are updated locally
    if (events.length > 0) {
      localStorage.setItem("calendarEvents", JSON.stringify(events));
    }
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

  const handleCreateEvent = async () => {
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

    // Normalize category names for consistent display
    let eventCategory;
    if (activeTab === "Event") {
      eventCategory = formData.category;
    } else if (activeTab === "Schedule Meeting") {
      eventCategory = "Meeting"; // Convert to "Meeting" for display
    } 
    else if( activeTab === "Task") {
      eventCategory = "Task"; // Convert to "Daily Task" for display
    }
      else {
      eventCategory = activeTab;
    }

    const newEvent = {
      id: Date.now(),
      ...formData,
      title: eventTitle,
      type: activeTab,
      category: eventCategory,
    };

    // Try to create event via API first
    const result = await createEventAPI(newEvent);
    
    if (result.success) {
      showToast(`${activeTab} created successfully!`);
    } else {
      // Fallback to local storage if API fails
      setEvents([...events, newEvent]);
      showToast(`${activeTab} created locally (API unavailable)`);
    }

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

  const handleMonthChange = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction)
    );
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const endOffset = (7 - ((firstDay + daysInMonth) % 7)) % 7;

    return { firstDay, daysInMonth, endOffset };
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

  const getEventsForDay = (day) => {
    if (!day) return [];
    const formattedDate = formatDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    return events.filter((event) => event.date === formattedDate);
  };

  // Fixed function to get unique categories with counts and limit to 5 dots
  const getUniqueEventsForDay = (day) => {
    const dayEvents = getEventsForDay(day);

    if (dayEvents.length === 0) return [];

    // Group events by category and count them
    const categoryMap = {};
    dayEvents.forEach((event) => {
      const category = event.category || event.type;
      if (categoryMap[category]) {
        categoryMap[category].count++;
      } else {
        categoryMap[category] = { count: 1, category };
      }
    });

    // Get unique categories and sort by priority
    const uniqueCategories = Object.values(categoryMap).sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.category);
      const bIndex = priorityOrder.indexOf(b.category);
      const aPriority = aIndex === -1 ? Infinity : aIndex;
      const bPriority = bIndex === -1 ? Infinity : bIndex;
      return aPriority - bPriority;
    });

    // Return only the first 5 categories (no more indicators)
    return uniqueCategories.slice(0, 5);
  };

  // Keep the old function for backward compatibility in the modal
  const getGroupedEventsForDay = (day) => {
    const dayEvents = getEventsForDay(day);

    // Group events by category
    const grouped = dayEvents.reduce((acc, event) => {
      const category = event.category || event.type;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(event);
      return acc;
    }, {});

    // Convert to array with category and count, then sort by priority
    const result = Object.entries(grouped)
      .map(([category, events]) => ({
        category,
        count: events.length,
        events,
      }))
      .sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.category);
        const bIndex = priorityOrder.indexOf(b.category);
        const aPriority = aIndex === -1 ? Infinity : aIndex;
        const bPriority = bIndex === -1 ? Infinity : bIndex;
        return aPriority - bPriority;
      });

    return result;
  };

  const getDayBackgroundColor = (day) => {
    if (!day) return "bg-[#f2f4ff] text-gray-400";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const weekday = (generateCalendarDays().firstDay + day - 1) % 7;
    const isSunday = weekday === 0;
    const isToday = dateKey === todayKey;

    if (isToday) return "bg-black text-white";
    if (isSunday) return "bg-sky-400 text-white";
    return "bg-[#f2f4ff] text-black";
  };

  const { firstDay, daysInMonth, endOffset } = generateCalendarDays();

  return (
    <div className="min-h-screen  bg-white p-4">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#018ABE] mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto overflow-y-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold relative inline-block text-gray-800">
            <span className="relative inline-block">
              Personal Calendar
              <span
                ref={underlineRef}
                className="absolute left-0 bottom-0 h-[2px] bg-[#058CBF] w-full"
              ></span>
            </span>
          </h2>

          <select
            className="border border-gray-300 shadow-md bg-white rounded-lg px-2 py-2"
            value={selectedOption}
            onChange={handleChange}
          >
            <option value="personal">Personal Calendar</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-bold text-gray-800">
                  {currentDate.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
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
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div
                    key={`start-${i}`}
                    className="h-16 rounded-lg bg-[#f2f4ff] shadow-sm text-xs text-gray-400 flex items-center justify-center"
                  >
                    <span className="invisible">0</span>
                  </div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const uniqueEvents = getUniqueEventsForDay(day);

                  return (
                    <div
                      key={day}
                      className={`group relative h-16 rounded-lg flex flex-col justify-center items-center text-[10px] font-medium shadow-sm hover:bg-blue-200 transition duration-200 cursor-pointer ${getDayBackgroundColor(
                        day
                      )}`}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className="text-lg font-bold">{day}</span>

                      {/* Display only up to 5 category dots */}
                      <div className="flex gap-[2px] mt-[2px] flex-wrap justify-center">
                        {uniqueEvents.map(({ category, count }) => (
                          <span
                            key={category}
                            className={`w-3 h-3 rounded-full ${
                              categoryDotColors[category] || "bg-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Empty cells for days after month ends */}
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

          {/* Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 h-full">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {Object.entries(categoryDotColors).map(([category, color]) => (
                  <div key={category} className="flex items-center">
                    <div className={`w-4 h-4 ${color} mr-2`}></div>
                    <span className="text-sm">{category}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full bg-[#018ABE] py-2 px-4 rounded-md hover:bg-teal-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "CREATE"}
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
{/* 
        <ToDoList selectedDate={selectedDate} /> */}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 p-8 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex border-b  pb-2 mb-4">
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
                  onCancel={() => setModalOpen(false)}
                  onSubmit={handleCreateEvent}
                />
              )}
              {activeTab === "Daily Task" && (
                <TaskForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  categoryDotColors={categoryDotColors}
                  onCancel={() => setModalOpen(false)}
                  onSubmit={handleCreateEvent}
                />
              )}
              {activeTab === "Schedule Meeting" && (
                <MeetingForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  categoryDotColors={categoryDotColors}
                  onCancel={() => setModalOpen(false)}
                  onSubmit={handleCreateEvent}
                />
              )}
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