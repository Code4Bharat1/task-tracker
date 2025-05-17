'use client';

import { useState, useEffect } from 'react';
import { LuCalendarClock } from 'react-icons/lu';
import { IoMdArrowDropdown } from 'react-icons/io';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SchedulePage({ initialDate, closeModal }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Added description state
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [participant, setParticipant] = useState('');
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  // Hardcoded user ID - replace with dynamic value from authentication
  const userId = "64b81234567890abcdef1234";

  const times = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    return `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
  });

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const handleSchedule = async () => {
    if (
      selectedDate &&
      title.trim() &&
      description.trim() && // Added description validation
      times.includes(startTime) &&
      times.includes(endTime) &&
      parseTime(startTime) < parseTime(endTime) &&
      participant
    ) {
      const meeting = {
        userId, // Added userId
        type: "Meeting", // Added type
        title,
        description, // Added description
        date: selectedDate,
        startTime,
        endTime,
        participants: [participant],
        reminder: false,
        remindBefore: 15,
      };

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meeting),
        });

        if (res.ok) {
          toast.success('Meeting scheduled successfully!');
          setTitle('');
          setDescription('');
          setStartTime('');
          setEndTime('');
          setParticipant('');
          setTimeout(() => closeModal?.(), 500);
        } else {
          toast.error('Failed to schedule meeting.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error connecting to server.');
      }
    } else {
      toast.error('Please fill all the fields correctly.');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setParticipant('');
    closeModal?.();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      {/* Date Picker */}
      <div className="mb-4">
        <label className="flex items-center text-sm text-gray-600 font-medium gap-2 mb-1">
          <LuCalendarClock className="text-xl" />
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="ml-2 w-full max-w-[180px] focus:outline-none py-1 text-sm text-gray-700 rounded px-2 cursor-pointer"
          />
        </label>
      </div>

      {/* Time Pickers */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-[#717171] font-medium min-w-[50px]">Time:</label>

        {/* Start Time */}
        <div className="relative">
          <button
            onClick={() => setIsStartOpen(!isStartOpen)}
            className="cursor-pointer flex items-center justify-between gap-1 -ml-5 px-4 py-[2px] text-sm rounded-full bg-[#F1F2F8] text-[#333] w-[120px] border border-gray-200"
          >
            <span className="truncate">{startTime || 'Start'}</span>
            <IoMdArrowDropdown className="text-gray-600 text-base" />
          </button>
          {isStartOpen && (
            <div className="absolute z-10 mt-2 w-[120px] bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto p-1">
              {times.map((time, index) => (
                <button
                  key={`start-${index}`}
                  onClick={() => {
                    setStartTime(time);
                    setIsStartOpen(false);
                  }}
                  className={`cursor-pointer w-full text-sm text-left px-2 py-[4px] rounded-full ${
                    startTime === time ? 'bg-blue-500 text-white' : 'text-gray-800'
                  } hover:bg-blue-100`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-[#717171] text-sm">-</span>

        {/* End Time */}
        <div className="relative">
          <button
            onClick={() => setIsEndOpen(!isEndOpen)}
            className="cursor-pointer flex items-center justify-between gap-1 px-4 py-[2px] text-sm rounded-full bg-[#F1F2F8] text-[#333] w-[120px] border border-gray-200"
          >
            <span className="truncate">{endTime || 'End'}</span>
            <IoMdArrowDropdown className="text-gray-600 text-base" />
          </button>
          {isEndOpen && (
            <div className="absolute z-10 mt-2 w-[120px] bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto p-1">
              {times.map((time, index) => (
                <button
                  key={`end-${index}`}
                  onClick={() => {
                    setEndTime(time);
                    setIsEndOpen(false);
                  }}
                  className={`cursor-pointer w-full text-sm text-left px-2 py-[4px] rounded-full ${
                    endTime === time ? 'bg-green-500 text-white' : 'text-gray-800'
                  } hover:bg-green-100`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="mb-4">
        <label className="text-sm font-medium text-[#717171] block mb-1">Add Participant:</label>
        <div className="relative">
          <select
            value={participant}
            onChange={(e) => setParticipant(e.target.value)}
            className="cursor-pointer w-full border border-[#877575] rounded-lg px-2 py-2 text-sm text-[#717171] bg-[#F8FDFF] appearance-none"
          >
            <option value="" disabled>
              Select Email Address
            </option>
            <option value="alice@example.com">alice@example.com</option>
            <option value="bob@example.com">bob@example.com</option>
            <option value="user1@example.com">user1@example.com</option>
            <option value="user2@example.com">user2@example.com</option>
          </select>
          <IoMdArrowDropdown className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
        </div>
      </div>

      {/* Meeting Title */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Add Meeting Title, e.g., Project Stand-up Meeting"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b border-gray-900 focus:outline-none py-1 text-sm placeholder:text-[#717171]"
        />
      </div>

      {/* Meeting Description - New Field */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Meeting Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border-b border-gray-900 focus:outline-none py-1 text-sm placeholder:text-[#717171]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-6 text-sm font-semibold">
        <button onClick={handleCancel} className="text-black hover:underline cursor-pointer">
          Cancel
        </button>
        <button onClick={handleSchedule} className="text-[#058CBF] hover:underline cursor-pointer">
          Schedule Meeting
        </button>
      </div>

      {/* Toast Messages */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}