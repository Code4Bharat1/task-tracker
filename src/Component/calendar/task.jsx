'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { LuCalendarDays, LuClock } from 'react-icons/lu';
import { ToastContainer, toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';

export default function TaskPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskName, setTaskName] = useState('');
  const [activeTab, setActiveTab] = useState('task');
  const userId = "64b81234567890abcdef1234"; // Replace with dynamic user ID

  const tabs = [
    { label: 'EVENT', value: 'event' },
    { label: 'Task', value: 'task' },
    { label: 'Schedule Meeting', value: 'meeting' },
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setTaskName('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setActiveTab('task');
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    const taskData = {
      userId,
      type: "Task",
      title,
      description,
      date: selectedDate.toISOString().split('T')[0],
      time: formatTime(selectedTime),
      taskName
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        toast.success('Task created successfully!');
        setTimeout(() => {
          window.location.href = '/next-page';
        }, 1500);
      } else {
        toast.error('Failed to create task');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to server');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="bg-white rounded-lg shadow-2xl w-[500px] max-w-full p-6">
        {/* Tabs */}
        <div className="flex mb-4 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.2)] bg-white rounded-t-lg">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-2 font-bold text-sm ${
                activeTab === tab.value
                  ? 'border-b-4 border-[#018ABE]'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Add Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-semibold mb-4 bg-transparent border-b border-gray-400 focus:outline-none placeholder:text-[#717171]"
        />

        {/* Date Picker */}
        <div className="flex items-center gap-3 mb-4">
          <LuCalendarDays className="text-xl text-gray-700" />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            className="bg-white px-3 py-1 w-40 text-sm focus:outline-none"
          />
        </div>

        {/* Time Picker */}
        <div className="flex items-center gap-3 mb-4">
          <LuClock className="text-xl text-gray-700" />
          <DatePicker
            selected={selectedTime}
            onChange={(time) => setSelectedTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            className="bg-[#F1F2F8] border-gray-300 rounded-md px-3 py-1 w-22 shadow-lg text-sm focus:outline-none"
          />
        </div>

        <hr className="mb-4 border-gray-300" />

        {/* Description */}
        <input
          type="text"
          placeholder="Add Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-98 bg-[#F8FDFF] border border-[#877575] rounded-lg px-3 py-2 mb-3 text-sm shadow-lg focus:outline-none font-Poppins"
        />

        {/* Task Name */}
        <input
          type="text"
          placeholder="My Task"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="w-98 bg-[#F8FDFF] border border-[#877575] rounded-lg px-3 py-2 mb-6 text-sm shadow-lg focus:outline-none"
        />

        {/* Buttons */}
        <div className="flex justify-end items-center gap-6 text-sm font-semibold">
          <button className="text-black" onClick={handleCancel}>
            Cancel
          </button>
          <button onClick={handleCreate} className="text-[#058CBF] hover:underline">
            Create
          </button>
        </div>
      </div>

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