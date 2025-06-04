"use client";
import { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoPersonSharp, IoClose } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import { FiClock } from "react-icons/fi";

export default function MeetingForm({ initialDate, closeModal }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [isParticipantOpen, setIsParticipantOpen] = useState(false);
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const times = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? "AM" : "PM";
    return `${hour.toString().padStart(2, "0")}:00 ${ampm}`;
  });

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
    fetchParticipants();
  }, [initialDate]);

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/admin/email`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();

      if (data.success) {
        setAllParticipants(
          data.data.map((employee) => ({
            id: employee.id,
            email: employee.email,
            name: employee.name,
          }))
        );
      } else {
        throw new Error(data.message || "Failed to fetch participants");
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("Failed to load participants");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return allParticipants;
    const term = searchTerm.toLowerCase();
    return allParticipants.filter(
      (p) =>
        p.email.toLowerCase().includes(term) ||
        (p.name && p.name.toLowerCase().includes(term))
    );
  }, [allParticipants, searchTerm]);

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setSelectedParticipants([]);
    setSearchTerm("");
    setIsStartOpen(false);
    setIsEndOpen(false);
    setIsParticipantOpen(false);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      selectedDate &&
      title.trim() &&
      description.trim() &&
      times.includes(startTime) &&
      times.includes(endTime) &&
      parseTime(startTime) < parseTime(endTime) &&
      selectedParticipants.length > 0
    ) {
      const meeting = {
        type: "Meeting",
        category: "Meeting",
        title,
        description,
        date: selectedDate,
        startTime,
        endTime,
        participants: selectedParticipants.map(p => p.email),
        reminder: false,
        remindBefore: 15,
        calType: "Personal",
      };

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/user/calendar`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(meeting),
          }
        );

        if (res.ok) {
          toast.success("Meeting scheduled successfully!");
          resetForm();
          setTimeout(() => {
            if (closeModal && typeof closeModal === "function") {
              closeModal();
            }
          }, 500);
        } else {
          toast.error("Failed to schedule meeting.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error connecting to server.");
      }
    } else {
      toast.error("Please fill all the fields correctly.");
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Reset the form first
    resetForm();

    // Then close the modal if the function exists
    if (closeModal && typeof closeModal === "function") {
      closeModal();
    }
  };

  const toggleParticipant = (participant) => {
    setSelectedParticipants((prev) =>
      prev.some((p) => p.id === participant.id)
        ? prev.filter((p) => p.id !== participant.id)
        : [...prev, participant]
    );
  };

  const removeParticipant = (id) => {
    setSelectedParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="w-full max-w-md">
      {/* Date Picker */}
      <div className="mb-4">
        <label
          htmlFor="date"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Select Date:
        </label>
        <input
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      {/* Time Pickers */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <button
            onClick={() => setIsStartOpen(!isStartOpen)}
            type="button"
            className="w-full p-2 flex items-center justify-between bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 transition-colors"
          >
            <FiClock className="text-gray-400 mr-2" />
            <span className="flex-grow text-left">
              {startTime || "Start Time"}
            </span>
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
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm ${startTime === time
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
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
            type="button"
            className="w-full p-2 flex items-center justify-between bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 transition-colors"
          >
            <FiClock className="text-gray-400 mr-2" />
            <span className="flex-grow text-left">{endTime || "End Time"}</span>
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
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm ${endTime === time
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                    }`}
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
        <div className="relative">
          <button
            onClick={() => setIsParticipantOpen(!isParticipantOpen)}
            type="button"
            className="w-full p-2 pl-10 flex items-center justify-between bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 transition-colors"
          >
            <IoPersonSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />

            <div className="flex-1 text-left flex flex-wrap gap-1 min-h-[24px]">
              {selectedParticipants.length === 0 ? (
                <span className="text-gray-400">Select Participants</span>
              ) : (
                selectedParticipants.map((p) => (
                  <span
                    key={p.id}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1"
                  >
                    {p.name || p.email}
                    <IoClose
                      className="cursor-pointer hover:text-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeParticipant(p.id);
                      }}
                    />
                  </span>
                ))
              )}
            </div>
            <IoMdArrowDropdown className="text-gray-500 ml-2" />
          </button>

          {isParticipantOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {/* Search input */}
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search participants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="px-4 py-2 text-center text-sm text-gray-500">
                  Loading participants...
                </div>
              )}

              {/* Empty state */}
              {!isLoading && filteredParticipants.length === 0 && (
                <div className="px-4 py-2 text-center text-sm text-gray-500">
                  No participants found
                </div>
              )}

              {/* Participants list */}
              {!isLoading && filteredParticipants.length > 0 && (
                <div className="max-h-40 overflow-y-auto">
                  {filteredParticipants.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => toggleParticipant(p)}
                      className={`flex items-center px-4 py-2 cursor-pointer ${selectedParticipants.some(sp => sp.id === p.id)
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedParticipants.some(
                          (sp) => sp.id === p.id
                        )}
                        onChange={() => toggleParticipant(p)}
                        className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium">
                          {p.name || p.email.split("@")[0]}
                        </div>
                        <div className="text-xs text-gray-500">{p.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-1 text-xs text-gray-500">
          {selectedParticipants.length} participant(s) selected
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Meeting Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-medium placeholder-gray-400"
        />
        <textarea
          placeholder="Meeting Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none placeholder-gray-400 min-h-[60px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleCancel}
          type="button"
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSchedule}
          type="button"
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