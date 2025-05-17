'use client';

import { useState, forwardRef, useCallback, useRef, useEffect } from 'react';
import { LuCalendarClock } from 'react-icons/lu';
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
    className="text-[#717171] px-2 py-1 rounded-md bg-white w-full text-left"
  >
    {value || 'DD/MM/YYYY'}
  </button>
));
CustomDateInput.displayName = 'CustomDateInput';

const CustomTimeInput = forwardRef(({ value, onClick }, ref) => {
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  // Add the missing formatDisplayTime function
  const formatDisplayTime = () => {
    if (!selectedTime) return 'Select time';
    const [hours, minutes] = selectedTime.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  const timeButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const userId = "64b81234567890abcdef1234"; // Replace with dynamic user ID

  // ... Keep existing useEffect hooks and time options generator

  const handleCancel = useCallback((e) => {
    e?.preventDefault();
    setTitle('');
    setDescription('');
    setSelectedDate(new Date());
    setSelectedTime('09:00');
  }, []);

  const handleCreate = useCallback(async (e) => {
    e?.preventDefault();

    if (!title.trim() || !description.trim() || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const [hours, minutes] = selectedTime.split(':');
      const formattedTime = `${parseInt(hours, 10) % 12 || 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;

      const taskData = {
        userId,
        type: "Task",
        title,
        description,
        date: formattedDate,
        time: formattedTime
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar`, {
        method: 'POST',
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

  // ... Keep existing time formatting and JSX structure

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
            onChange={setSelectedDate}
            dateFormat="dd/MM/yyyy"
            customInput={<CustomDateInput />}
            minDate={new Date()}
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
            
            {/* Time dropdown remains same */}
          </div>
        </div>

        <hr className="border-gray-600 mb-5" />

        {/* Description Input */}
        <div className="mb-6">
          <textarea
            placeholder="Add Description"
            className="w-full bg-[#F1F8FB] px-4 py-2 rounded-lg shadow-md text-gray-700 placeholder-[#717171] border border-[#877575]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-6 items-center text-base font-semibold">
          <button onClick={handleCancel} className="text-black hover:underline">
            Cancel
          </button>
          <button onClick={handleCreate} className="text-[#058CBF] hover:underline">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}