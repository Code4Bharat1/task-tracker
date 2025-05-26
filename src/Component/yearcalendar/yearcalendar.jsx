'use client';
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import axios from "axios";

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const daysShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

const Yearcalendar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [baseYear, setBaseYear] = useState(2025);
  const [taskAssignments, setTaskAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const today = new Date();
  const underlineRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch calendar data from backend
  const fetchCalendarData = async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/tasks/projectsuser`,
        {
          withCredentials: true,
        }
      );
      
      setTaskAssignments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      setTaskAssignments([]);
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  // Get tasks for a specific date (fix timezone issue)
  const getTasksForDate = (year, month, day) => {
    const targetDate = new Date(year, month, day);
    const dateString = targetDate.getFullYear() + '-' + 
                      String(targetDate.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(targetDate.getDate()).padStart(2, '0');
    
    const assignTasks = taskAssignments.filter(task => {
      const taskDate = new Date(task.assignDate);
      const taskDateString = taskDate.getFullYear() + '-' + 
                            String(taskDate.getMonth() + 1).padStart(2, '0') + '-' + 
                            String(taskDate.getDate()).padStart(2, '0');
      return taskDateString === dateString;
    });
    
    const deadlineTasks = taskAssignments.filter(task => {
      const taskDate = new Date(task.deadline);
      const taskDateString = taskDate.getFullYear() + '-' + 
                            String(taskDate.getMonth() + 1).padStart(2, '0') + '-' + 
                            String(taskDate.getDate()).padStart(2, '0');
      return taskDateString === dateString;
    });
    
    return { assignTasks, deadlineTasks };
  };

  // Handle date click - show only relevant tasks for that date type
  const handleDateClick = (year, month, day) => {
    const { assignTasks, deadlineTasks } = getTasksForDate(year, month, day);
    
    // If it's a start date (blue), show only start tasks
    if (assignTasks.length > 0) {
      setSelectedDateInfo({
        date: new Date(year, month, day).toLocaleDateString(),
        assignTasks,
        deadlineTasks: [], // Don't show deadline tasks on start date
        type: 'start'
      });
      setShowModal(true);
    }
    // If it's a deadline date (red), show only deadline tasks  
    else if (deadlineTasks.length > 0) {
      setSelectedDateInfo({
        date: new Date(year, month, day).toLocaleDateString(),
        assignTasks: [], // Don't show start tasks on deadline date
        deadlineTasks,
        type: 'deadline'
      });
      setShowModal(true);
    }
  };

  // Get the styling for a specific date
  const getDateStyling = (year, month, day) => {
    if (!day) return '';
    
    const { assignTasks, deadlineTasks } = getTasksForDate(year, month, day);
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isSunday = new Date(year, month, day).getDay() === 0;
    
    let classes = 'rounded h-8 text-[10px] flex items-center justify-center font-bold transition-all duration-200 ';
    
    if (day === null) {
      return classes;
    }
    
    // Today gets priority
    if (isToday) {
      classes += 'bg-black text-white shadow-lg cursor-pointer hover:scale-110 ';
      return classes;
    }
    
    // Task assignments (blue background) - Start dates
    if (assignTasks.length > 0) {
      classes += 'bg-blue-500 text-white shadow-lg cursor-pointer hover:scale-110 ';
      return classes;
    }
    
    // Deadlines (red background) - End dates  
    if (deadlineTasks.length > 0) {
      classes += 'bg-red-500 text-white shadow-lg cursor-pointer hover:scale-110 ';
      return classes;
    }
    
    // First day of month
    if (day === 1) {
      classes += 'bg-cyan-400 text-white shadow-lg ';
      return classes;
    }
    
    // Sunday
    if (isSunday) {
      classes += 'bg-red-300 text-white ';
      return classes;
    }
    
    // Default styling
    classes += 'bg-[#ECEEFD] shadow-md ';
    
    return classes;
  };

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data when component mounts or year changes
  useEffect(() => {
    fetchCalendarData();
  }, [baseYear]);

  return (
    <div className="p-4 text-black max-w-screen-xl mx-auto overflow-x-hidden">
      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading calendar data...</p>
        </div>
      )}

      {/* Header with Year & Arrows */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 relative">
        <h2 className="text-right font-bold text-gray-800 text-3xl mb-4 md:mb-0 ml-15">
          <span className="relative inline-block">
          Project Calendar {baseYear}
            <span
              ref={underlineRef}
              className="absolute left-0 bottom-[-2px] h-[3px] bg-blue-500 w-[30%]"
            ></span>
          </span>
        </h2>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          {/* Left: Year Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="px-5 py-2 rounded-lg border border-[#877575] bg-white text-black font-medium transition duration-200 ease-in-out hover:bg-gray-100 hover:shadow flex items-center gap-2"
            >
              Year <FiChevronDown className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow z-10 w-40">
                {[{ label: "Personal calendar", href: "/personalcalendar" }, { label: "Month Calendar", href: "/monthcalendar" }, { label: "Year Calendar ", href: "/yearcalendar" }].map((item) => (
                  <Link key={item.label} href={item.href}>
                    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700">
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBaseYear((prev) => prev - 1)}
              className="p-2 rounded hover:bg-gray-200 transition"
            >
              <FiChevronLeft size={22} />
            </button>
            <button
              onClick={() => setBaseYear((prev) => prev + 1)}
              className="p-2 rounded hover:bg-gray-200 transition"
            >
              <FiChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Project Start Date</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Project Deadline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-black rounded"></div>
          <span>Today</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs mx-auto w-full max-w-[1100px]">
        {months.map((month, monthIndex) => {
          const daysInMonth = getDaysInMonth(baseYear, monthIndex);
          const firstDay = getFirstDay(baseYear, monthIndex);
          const daysArray = Array(firstDay).fill(null).concat(
            Array.from({ length: daysInMonth }, (_, i) => i + 1)
          );

          return (
            <div
              key={month}
              className="rounded shadow-xl p-2 bg-white w-full max-w-[250px] mx-auto text-[11px] transition-transform duration-300 hover:scale-105"
            >
              <h2 className="text-center font-semibold mb-1 text-sm">{month.toUpperCase()}</h2>
              <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-700 mb-1">
                {daysShort.map((day) => (
                  <div key={day} className="shadow-sm rounded py-1 font-bold">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {daysArray.map((day, i) => (
                  <div
                    key={i}
                    className={getDateStyling(baseYear, monthIndex, day)}
                    onClick={() => day && handleDateClick(baseYear, monthIndex, day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for displaying task information */}
      {showModal && selectedDateInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDateInfo.type === 'start' ? 'Projects Starting' : 'Projects Ending'} on {selectedDateInfo.date}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            {selectedDateInfo.assignTasks.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-600 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  Project Start Date
                </h4>
                <div className="space-y-3">
                  {selectedDateInfo.assignTasks.map((task, index) => (
                    <div key={task._id} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="font-semibold text-blue-800 text-lg">{task.bucketName}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        <div><span className="font-medium">Started:</span> {new Date(task.assignDate).toLocaleDateString()}</div>
                        <div><span className="font-medium">Deadline:</span> {new Date(task.deadline).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedDateInfo.deadlineTasks.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  Project Deadline
                </h4>
                <div className="space-y-3">
                  {selectedDateInfo.deadlineTasks.map((task, index) => (
                    <div key={task._id} className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                      <div className="font-semibold text-red-800 text-lg">{task.bucketName}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        <div><span className="font-medium">Started:</span> {new Date(task.assignDate).toLocaleDateString()}</div>
                        <div><span className="font-medium">Deadline:</span> {new Date(task.deadline).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Yearcalendar;