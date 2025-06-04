'use client';
import { useState, forwardRef, useCallback, useRef, useEffect } from 'react';
import { LuCalendarClock, LuClock } from 'react-icons/lu';
import { IoIosArrowDown } from 'react-icons/io';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    ref={ref}
    type="button"
    className="flex items-center justify-between w-full px-4 py-2 text-gray-600 bg-white border rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500 transition-colors"
  >
    <span>{value || 'Select date'}</span>
    <LuCalendarClock className="text-gray-400 ml-2" />
  </button>
));
CustomDateInput.displayName = 'CustomDateInput';

const TimeDropdown = ({ times, selectedTime, setSelectedTime, setShowTimeDropdown }) => {
  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
      {times.map((time) => (
        <button
          key={time}
          onClick={() => {
            setSelectedTime(time);
            setShowTimeDropdown(false);
          }}
          className={`w-full px-4 py-2 text-left text-sm ${selectedTime === time
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
            } transition-colors`}
        >
          {formatTime(time)}
        </button>
      ))}
    </div>
  );
};

export default function TaskForm({ closeModal }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of ['00', '15', '30', '45']) {
      times.push(`${hour.toString().padStart(2, '0')}:${minute}`);
    }
  }

  const formatDisplayTime = () => {
    if (!selectedTime) return 'Select time';
    const [hours, minutes] = selectedTime.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Fixed handleCancel function
  const handleCancel = useCallback((e) => {
    e && e.preventDefault(); // Handle both direct calls and event calls
    setTitle('');
    setDescription('');
    setSelectedDate(new Date());
    setSelectedTime('09:00');
    if (closeModal && typeof closeModal === "function") {
      closeModal();
    }
  }, []);

  const handleCreate = useCallback(async (e) => {
    e?.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const taskData = {
        type: "Task",
        title,
        description,
        date: formattedDate,
        time: formatDisplayTime(),
        calType: "Personal"
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error('Failed to create task');

      toast.success('Task created successfully!');
      handleCancel();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create task');
    }
  }, [title, description, selectedDate, selectedTime, handleCancel]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowTimeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      <ToastContainer position="top-center" autoClose={3000} />

      <input
        type="text"
        placeholder="Add Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-xl font-semibold text-gray-700 mb-4 bg-transparent focus:outline-none w-full placeholder-gray-400 border-b-2 border-gray-200 focus:border-blue-500 pb-2 transition-colors"
      />

      <div className="space-y-6">
        <div className="mb-4">
          <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-700">
            Select Date:
          </label>
          <input
            type="date"
            id="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label htmlFor="time" className="block mb-2 text-sm font-medium text-gray-700">Select Time:</label>
          <div className="flex items-center gap-3 relative">
            <LuClock className="text-xl text-gray-500" />
            <div className="relative w-full" ref={dropdownRef}>
              <button
                ref={timeButtonRef}
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className="flex items-center justify-between w-full px-4 py-2 text-gray-600 bg-white 
                      border rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500 
                      transition-colors"
              >
                <span>{formatDisplayTime() || 'Select time'}</span>
                <IoIosArrowDown className="text-gray-400 ml-2" />
              </button>
              {showTimeDropdown && (
                <TimeDropdown
                  times={times}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  setShowTimeDropdown={setShowTimeDropdown}
                />
              )}
            </div>
          </div>
        </div>

        <textarea
          placeholder="Add Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 
                   focus:ring-2 focus:ring-blue-200 placeholder-gray-400 text-gray-700 
                   transition-all resize-none"
          rows={3}
        />

        <div className="flex justify-end gap-4">
          {/* Added type="button" to prevent form submission */}
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 
                     transition-colors font-medium"
          >
            Cancel
          </button>
          {/* Added type="button" for consistency */}
          <button
            type="button"
            onClick={handleCreate}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 
                    transition-colors font-medium shadow-md"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}