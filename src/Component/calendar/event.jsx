'use client';

import { useState, forwardRef, useCallback, useRef, useEffect } from 'react';
import { LuCalendarClock } from 'react-icons/lu';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom input for the date picker
const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    ref={ref}
    type="button"
    className="text-[#717171] px-2 py-1 rounded-md bg-white w-full text-left"
  >
    {value || 'DD/MM/YYYY'}
  </button>
));
CustomDateInput.displayName = 'CustomDateInput';

// Custom time input component
const CustomTimeInput = forwardRef(({ value, onClick }, ref) => {
  // Convert 24-hour format to 12-hour with AM/PM
  const formatTimeWithAmPm = (timeValue) => {
    if (!timeValue) return '';
    const [hours, minutes] = timeValue.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      ref={ref}
      type="button"
      className="bg-[#F1F2F8] px-4 py-1 rounded-md shadow-md text-sm text-gray-700 w-full text-left"
    >
      {formatTimeWithAmPm(value) || 'Select time'}
    </button>
  );
});
CustomTimeInput.displayName = 'CustomTimeInput';

export default function TaskPage() {
  const [repeat, setRepeat] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [task, setTask] = useState('');
  const [title, setTitle] = useState('');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  
  // References
  const timeButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update dropdown width when the component mounts and on window resize
  useEffect(() => {
    const updateDropdownWidth = () => {
      if (timeButtonRef.current) {
        const buttonWidth = timeButtonRef.current.offsetWidth;
        setDropdownWidth(buttonWidth);
      }
    };

    // Initial width calculation
    updateDropdownWidth();
    
    // Add resize listener
    window.addEventListener('resize', updateDropdownWidth);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDropdownWidth);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showTimeDropdown &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        timeButtonRef.current && 
        !timeButtonRef.current.contains(event.target)
      ) {
        setShowTimeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimeDropdown]);

  // Generate time options with AM options first, then PM options
  const generateTimeOptions = () => {
    const timeOptions = [];
    
    // AM times (12 AM to 11 AM)
    timeOptions.push({ value: '00:00', label: '12:00 AM' });
    for (let i = 1; i < 12; i++) {
      const hour = i.toString().padStart(2, '0');
      timeOptions.push({ value: `${hour}:00`, label: `${i}:00 AM` });
      timeOptions.push({ value: `${hour}:30`, label: `${i}:30 AM` });
    }
    
    // PM times (12 PM to 11 PM)
    timeOptions.push({ value: '12:00', label: '12:00 PM' });
    timeOptions.push({ value: '12:30', label: '12:30 PM' });
    for (let i = 13; i < 24; i++) {
      const hour12 = i - 12;
      const hour24 = i.toString().padStart(2, '0');
      timeOptions.push({ value: `${hour24}:00`, label: `${hour12}:00 PM` });
      timeOptions.push({ value: `${hour24}:30`, label: `${hour12}:30 PM` });
    }
    
    return timeOptions;
  };

  const timeOptions = generateTimeOptions();

  const handleCancel = useCallback((e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setTitle('');
    setDescription('');
    setTask('');
    setSelectedDate(new Date());
    setSelectedTime('09:00');
    setRepeat(false);
  }, []);

  const handleCreate = useCallback((e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    // Validation
    if (!title.trim() || !task.trim()) {
      toast.error(' Please fill in all required fields.')

      return;
    }

    try {
      // Build full DateTime
      const combinedDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      combinedDateTime.setHours(parseInt(hours, 10));
      combinedDateTime.setMinutes(parseInt(minutes, 10));

      const newEvent = {
        title,
        description,
        task,
        dateTime: combinedDateTime.toISOString(),
        repeat,
      };

      if (typeof window !== 'undefined') {
        // Load existing events (object keyed by YYYY-MM-DD)
        let existingEvents = {};
        try {
          const stored = localStorage.getItem('calendarEvents');
          if (stored) existingEvents = JSON.parse(stored);
        } catch {
          console.error('Error reading calendarEvents; clearing storage');
          localStorage.removeItem('calendarEvents');
        }

        // Determine date key
        const eventDateKey = combinedDateTime.toISOString().split('T')[0];
        if (!existingEvents[eventDateKey]) {
          existingEvents[eventDateKey] = [];
        }
        existingEvents[eventDateKey].push(newEvent);

        // Save back to localStorage
        localStorage.setItem('calendarEvents', JSON.stringify(existingEvents));

        toast.success(' Event created successfully!');
        handleCancel();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(' Failed to save task.');
    }
  }, [title, description, task, selectedDate, selectedTime, repeat, handleCancel]);

  // Format selected time for display
  const formatDisplayTime = () => {
    if (!selectedTime) return 'Select time';
    const [hours, minutes] = selectedTime.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-[900px] h-[350px] max-w-full p-6">
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Title Input */}
      <input
        type="text"
        placeholder="Add Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-1xl font-semibold text-[#717171] mb-2 bg-transparent focus:outline-none w-full"
      />
      <hr className="border-gray-700 mb-4" />

      <div>
        {/* Date Picker */}
        <div className="flex items-center gap-3 mb-5">
          <LuCalendarClock className="text-2xl text-gray-600" />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            customInput={<CustomDateInput />}
            minDate={new Date()} // Only allow current date and future dates
          />
        </div>

        {/* Time Input */}
        <div className="flex items-center mb-6 relative">
          <span className="text-[#717171] font-medium w-16">Time :</span>
          <div className="relative w-25">
            <button
              ref={timeButtonRef}
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="bg-[#F1F2F8] px-4 py-1 rounded-md shadow-md text-sm text-gray-700 w-full text-left"
            >
              {formatDisplayTime()}
            </button>
            
            {showTimeDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 mt-1 bg-white shadow-lg border border-gray-200 rounded-md z-10 max-h-48 overflow-y-auto"
                style={{ width: `${dropdownWidth}px` }}
              >
                {timeOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap"
                    onClick={() => {
                      setSelectedTime(option.value);
                      setShowTimeDropdown(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-600 mb-5" />

        {/* Description Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Add Description"
            className="w-75 bg-[#F1F8FB] px-4 py-1 rounded-lg shadow-md text-gray-700 placeholder-[#717171] border border-[#877575]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Task Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="My Task"
            className="w-75 bg-[#F1F8FB] px-4 py-1 rounded-lg shadow-md text-gray-700 placeholder-[#717171] border border-[#877575]"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-6 items-center text-base font-semibold">
          <button
            type="button"
            onClick={handleCancel}
            className="text-black hover:underline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="text-[#058CBF] hover:underline"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}