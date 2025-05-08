'use client';

import { useState, forwardRef } from 'react';
import { LuCalendarClock } from 'react-icons/lu';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Custom input for Date Picker
const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={onClick}
    ref={ref}
    className="text-[#717171] px-2 py-1 rounded-md bg-white w-full text-left"
  >
    {value || 'DD/MM/YYYY'}
  </button>
));

export default function TaskPage() {
  const [repeat, setRepeat] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [task, setTask] = useState('');

  const handleCancel = () => {
    setDescription('');
    setTask('');
    setSelectedDate(new Date());
    setSelectedTime('09:00');
    setRepeat(false);
  };

  const handleCreate = () => {
    const combinedDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    combinedDateTime.setHours(parseInt(hours));
    combinedDateTime.setMinutes(parseInt(minutes));

    console.log({
      description,
      task,
      dateTime: combinedDateTime,
      repeat,
    });

    window.location.href = '/next-page';
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-[900px] h-[350px] max-w-full p-6">
      {/* Title */}
      <h2 className="text-1xl font-semibold text-[#717171] mb-2">Add Title</h2>
      <hr className="border-gray-700 mb-4" />

      {/* Date Picker */}
      <div className="flex items-center gap-3 mb-5">
        <LuCalendarClock className="text-2xl text-gray-600" />
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          customInput={<CustomDateInput />}
        />
      </div>

      {/* Time Input */}
      <div className="flex items-center mb-6">
        <span className="text-[#717171] font-medium w-16">Time :</span>
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="bg-[#F1F2F8] px-4 py-1 rounded-md shadow-md text-sm text-gray-700"
        />
      </div>

      <hr className="border-gray-600 mb-5" />

     {/* Description */}
<div className="mb-4">
  <input 
    type="text"
    placeholder="Add Description"
    className="w-75 bg-[#F1F8FB] px-4 py-1 rounded-lg shadow-md text-gray-700 placeholder-[#717171] border border-[#877575]"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />
</div>

{/* Task */}
<div className="mb-6">
  <input
    type="text"
    placeholder="My Task"
    className="w-75 bg-[#F1F8FB] px-4 py-1 rounded-lg shadow-md text-gray-700 placeholder-[#717171] border border-[#877575]"
    value={task}
    onChange={(e) => setTask(e.target.value)}
  />
</div>


      {/* Action Buttons */}
      <div className="flex justify-end gap-6 items-center text-base font-semibold">
        <button
          onClick={handleCancel}
          className="text-black hover:underline"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          className="text-[#058CBF] hover:underline"
        >
          Create
        </button>
      </div>
    </div>
  );
}
