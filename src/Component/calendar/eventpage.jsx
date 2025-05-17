'use client';

import { useState } from 'react';
import { LuCalendarClock } from 'react-icons/lu';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EventPage() {
  const [activeTab, setActiveTab] = useState('Schedule Meeting');
  const [selectedDate, setSelectedDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('10:00');
  const [category, setCategory] = useState('Reminder');
  const [reminder, setReminder] = useState(true);
  const [remindBefore, setRemindBefore] = useState(60);
  const userId = "64b81234567890abcdef1234"; // Replace with dynamic user ID

  const handleSave = async () => {
    if (!selectedDate || !title.trim() || !time || !category) {
      toast.error('Please fill all required fields');
      return;
    }

    const eventData = {
      userId,
      type: "Event",
      title,
      description,
      date: selectedDate,
      time: `${time} AM`, // Adjust based on time format
      category,
      reminder,
      remindBefore
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        toast.success(`${activeTab} saved successfully`);
        // Clear form
        setSelectedDate('');
        setTitle('');
        setDescription('');
        setTime('10:00');
        setCategory('Reminder');
      } else {
        toast.error('Failed to save event');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to server');
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md w-full max-w-md p-6 mx-auto">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        {['EVENT', 'Task', 'Schedule Meeting'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 font-semibold text-sm ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-black'
                : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Date Picker */}
      <div className="mb-4">
        <label className="flex items-center text-sm text-gray-600 font-medium gap-2 mb-1">
          <LuCalendarClock className="text-xl" />
          <span>Date</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="ml-2 w-full max-w-[180px] focus:outline-none py-1 text-sm text-gray-700 rounded px-2 appearance-none cursor-pointer border border-gray-300"
          />
        </label>
      </div>

      {/* Time Picker */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          Time
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
        />
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          Title
        </label>
        <input
          type="text"
          placeholder={`Add ${activeTab} Title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
        >
          <option value="Reminder">Reminder</option>
          <option value="Meeting">Meeting</option>
          <option value="Personal">Personal</option>
        </select>
      </div>

      {/* Reminder Settings */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
            className="form-checkbox h-4 w-4"
          />
          Set Reminder
        </label>
        
        {reminder && (
          <div className="mt-2">
            <label className="text-sm text-gray-600 block mb-1">
              Remind Before (minutes)
            </label>
            <input
              type="number"
              value={remindBefore}
              onChange={(e) => setRemindBefore(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          Description (optional)
        </label>
        <textarea
          placeholder={`Add ${activeTab} Description`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => {
            setTitle('');
            setDescription('');
            setSelectedDate('');
          }}
          className="text-sm text-black hover:underline"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="text-sm text-blue-600 font-semibold hover:underline"
        >
          Save {activeTab}
        </button>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}