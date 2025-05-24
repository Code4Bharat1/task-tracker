'use client';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoPersonSharp } from 'react-icons/io5'
import { IoMdArrowDropdown } from 'react-icons/io';
import { FiClock } from 'react-icons/fi';


export default function MeetingForm({ initialDate, closeModal }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Added description state
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [participant, setParticipant] = useState('');
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [isParticipantOpen, setIsParticipantOpen] = useState(false);




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
        type: "Meeting", // Added type
        category: "Meeting", // Added category
        title,
        description, // Added description
        date: selectedDate,
        startTime,
        endTime,
        participants: [participant],
        reminder: false,
        remindBefore: 15,
        calType: "Personal"
      };

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar`, {
          method: 'POST',
          credentials: 'include',
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
    <div className="w-full max-w-md ">
      {/* Date Picker - Removed Icon */}
      <div className="mb-4">
        <label htmlFor='date' className="block mb-2 text-sm font-medium text-gray-700">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      {/* Time Pickers - Modern Style with Icons */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <button
            onClick={() => setIsStartOpen(!isStartOpen)}
            className="w-full p-2 flex items-center justify-between bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 transition-colors"
          >
            <FiClock className="text-gray-400 mr-2" />
            <span className="flex-grow text-left">{startTime || 'Start Time'}</span>
            <IoMdArrowDropdown className="text-gray-500 ml-2" />
          </button>

          {isStartOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {times.map((time) => (
                <button
                  key={`start-${time}`}
                  onClick={() => {
                    setStartTime(time);
                    setIsStartOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${startTime === time ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-black">to</span>

        <div className="relative flex-1">
          <button
            onClick={() => setIsEndOpen(!isEndOpen)}
            className="w-full p-2 flex items-center justify-between bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 transition-colors"
          >
            <FiClock className="text-gray-400 mr-2" />
            <span className="flex-grow text-left">{endTime || 'End Time'}</span>
            <IoMdArrowDropdown className="text-gray-500 ml-2" />
          </button>

          {isEndOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {times.map((time) => (
                <button
                  key={`end-${time}`}
                  onClick={() => {
                    setEndTime(time);
                    setIsEndOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${endTime === time ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Participants - Modern Dropdown */}
      {/* Participants - Custom Dropdown with Icon */}
      <div className="mb-4 relative">
        <button
          onClick={() => setIsParticipantOpen((open) => !open)}
          className="w-full p-2 pl-10 flex items-center justify-between bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 transition-colors"
        >
          <IoPersonSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          <span className="flex-1 text-left">{participant || 'Select Participant'}</span>
          <IoMdArrowDropdown className="text-gray-500 ml-2" />
        </button>
        {isParticipantOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {['alice@example.com', 'bob@example.com', 'user1@example.com', 'user2@example.com'].map((email) => (
              <button
                key={email}
                onClick={() => {
                  setParticipant(email);
                  setIsParticipantOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm ${participant === email ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
              >
                {email}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Title & Description - Enhanced Inputs */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Meeting Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-medium placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Meeting Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none placeholder-gray-400"
        />
      </div>

      {/* Action Buttons - Red Schedule & Left-aligned Cancel */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleCancel}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSchedule}
          className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
        >
          Schedule Meeting
        </button>
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