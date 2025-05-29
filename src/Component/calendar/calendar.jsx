"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Users, 
  X,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";

// API configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Constants
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_COLORS = {
  meeting: "bg-blue-500 border-blue-600 text-blue-50",
  task: "bg-green-500 border-green-600 text-green-50",
  reminder: "bg-yellow-500 border-yellow-600 text-yellow-50",
  deadline: "bg-red-500 border-red-600 text-red-50",
  personal: "bg-purple-500 border-purple-600 text-purple-50",
  default: "bg-gray-500 border-gray-600 text-gray-50"
};

const VIEW_OPTIONS = [
  { label: "Personal Calendar", href: "/personalcalendar", icon: Clock },
  // { label: "Week", href: "/calendar/week", icon: Calendar },
  { label: "Month", href: "/calendar", icon: Calendar },
  { label: "Year", href: "/yearcalendar", icon: Calendar },
];

export default function EnhancedCalendar() {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [participants, setParticipants] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Utility functions
  const formatDateKey = useCallback((date) => {
    return date.toISOString().split('T')[0];
  }, []);

  const formatTime = useCallback((timeString) => {
    if (!timeString) return "";
    if (timeString.includes("AM") || timeString.includes("PM")) return timeString;
    
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const twelveHour = hour % 12 || 12;
    return `${twelveHour}:${minutes || "00"} ${period}`;
  }, []);

  const isToday = useCallback((dateKey) => {
    return dateKey === formatDateKey(new Date());
  }, [formatDateKey]);

  // API calls
  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/user/calendar/user/monthly');
      const data = response.data?.data || response.data || [];
      
      const groupedEvents = data.reduce((acc, event) => {
        const dateKey = formatDateKey(new Date(event.date));
        
        if (!acc[dateKey]) acc[dateKey] = [];
        
        acc[dateKey].push({
          id: event._id,
          title: event.title,
          description: event.description,
          category: event.category?.toLowerCase() || 'default',
          time: formatTime(event.time || event.startTime),
          endTime: formatTime(event.endTime),
          participants: event.participants || [],
          reminder: event.reminder,
          remindBefore: event.remindBefore
        });
        
        return acc;
      }, {});
      
      setEvents(groupedEvents);
    } catch (err) {
      setError('Failed to load calendar data');
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [formatDateKey, formatTime]);

  const fetchParticipants = useCallback(async () => {
    try {
      const response = await api.get('/admin/email');
      if (response.data?.success) {
        setParticipants(response.data.data.map(emp => ({
          id: emp.id,
          name: emp.name,
          email: emp.email
        })));
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchCalendarData();
    fetchParticipants();
  }, [fetchCalendarData, fetchParticipants, currentDate]);

  // Calendar calculations
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return {
      year,
      month,
      firstDay,
      daysInMonth,
      monthName: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  }, [currentDate]);

  // Event handlers
  const handleMonthChange = useCallback((direction) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction));
  }, []);

  const handleDateClick = useCallback((dateKey, dayEvents) => {
    setSelectedDate(dateKey);
    setSelectedEvents(dayEvents);
    setShowEventModal(true);
  }, []);

  const getParticipantName = useCallback((participantId) => {
    return participants.find(p => p.id === participantId)?.name || 'Unknown';
  }, [participants]);

  // Render functions
  const renderCalendarDay = useCallback((day, dateKey, dayEvents) => {
    const isCurrentDay = isToday(dateKey);
    const isSunday = new Date(calendarData.year, calendarData.month, day).getDay() === 0;
    
    let dayClasses = "relative h-32 border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-50 group";
    
    if (isCurrentDay) {
      dayClasses += " bg-blue-50 border-blue-200";
    } else if (isSunday) {
      dayClasses += " bg-red-50";
    }

    return (
      <div
        key={day}
        className={dayClasses}
        onClick={() => handleDateClick(dateKey, dayEvents)}
      >
        <div className="p-2">
          <div className={`text-sm font-medium mb-1 ${
            isCurrentDay 
              ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center" 
              : isSunday 
                ? "text-red-600" 
                : "text-gray-700"
          }`}>
            {isCurrentDay ? day : day}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className={`text-xs px-2 py-1 rounded text-left truncate border-l-2 ${
                  EVENT_COLORS[event.category] || EVENT_COLORS.default
                }`}
              >
                {event.time && <span className="mr-1">{event.time}</span>}
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 px-2">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [isToday, calendarData, handleDateClick]);

  const renderEventModal = () => {
    if (!showEventModal || !selectedDate) return null;

    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{formattedDate}</h2>
            <button
              onClick={() => setShowEventModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-96">
            {selectedEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No events scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedEvents.map((event, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        EVENT_COLORS[event.category] || EVENT_COLORS.default
                      }`}>
                        {event.category}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>
                            {event.endTime ? `${event.time} - ${event.endTime}` : event.time}
                          </span>
                        </div>
                      )}
                      
                      {event.participants.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{event.participants.length} participants</span>
                        </div>
                      )}
                    </div>
                    
                    {event.participants.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {event.participants.map((participantId, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {getParticipantName(participantId)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && Object.keys(events).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={24} />
              <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
            </div>
            
            {error && (
              <div className="px-3 py-1 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            
            
            <div className="relative">
              <button
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Month
                <ChevronRight 
                  size={16} 
                  className={`transform transition-transform ${showViewDropdown ? 'rotate-90' : ''}`} 
                />
              </button>
              
              {showViewDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {VIEW_OPTIONS.map((option) => (
                    <Link key={option.label} href={option.href}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <option.icon size={16} className="text-gray-500" />
                        <span className="text-gray-700">{option.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">
          {calendarData.monthName}
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            Today
          </button>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for previous month */}
          {Array.from({ length: calendarData.firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-32 border border-gray-200 bg-gray-50"></div>
          ))}

          {/* Current month days */}
          {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = formatDateKey(new Date(calendarData.year, calendarData.month, day));
            const dayEvents = events[dateKey] || [];
            
            return renderCalendarDay(day, dateKey, dayEvents);
          })}
        </div>
      </div>

      {/* Event Modal */}
      {renderEventModal()}
    </div>
  );
}