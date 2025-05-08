'use client';

import { useState } from 'react';
import { LuCalendarClock } from 'react-icons/lu';

export default function EventPage() {
  const [activeTab, setActiveTab] = useState('Schedule Meeting');

  return (
    <div className="bg-white rounded-md shadow-md w-full max-w-md p-6">
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

      {/* Date and Time */}
      <div className="mb-4">
        <label className="flex items-center text-sm text-gray-600 font-medium gap-2 mb-2">
          <LuCalendarClock className="text-xl" />
          <span>Date</span>
        </label>
        <input
          type="text"
          placeholder="DD/MM/YYYY"
          className="w-full border-b border-gray-400 focus:outline-none py-1 text-sm placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-gray-600 font-medium min-w-[50px]">Time :</label>
        <input
          type="text"
          placeholder="9:00 a.m"
          className="flex-1 bg-gray-100 px-3 py-1 rounded-md text-sm text-center text-gray-600"
        />
        <span className="text-gray-600">-</span>
        <input
          type="text"
          placeholder="11:00 a.m"
          className="flex-1 bg-gray-100 px-3 py-1 rounded-md text-sm text-center text-gray-600"
        />
      </div>

      {/* Participants */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600 block mb-1">Add Participants:</label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 bg-white">
          <option>Email Address</option>
        </select>
      </div>

      {/* Meeting Title */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Add Meeting Title, e.g, Project Stand-up Meeting"
          className="w-full border-b border-gray-400 focus:outline-none py-1 text-sm placeholder:text-gray-400"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end items-center gap-6 text-sm font-semibold">
        <button className="text-black hover:underline">Cancel</button>
        <button className="text-[#058CBF] hover:underline">Schedule Meeting</button>
      </div>
    </div>
  );
}
