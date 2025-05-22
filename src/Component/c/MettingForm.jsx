import React, { useState, useEffect, useRef } from "react";
import { CalendarIcon, Mail, FileText, ChevronDown } from "lucide-react";

const MeetingForm = ({ formData, handleInputChange }) => {
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isEndTimeDropdownOpen, setIsEndTimeDropdownOpen] = useState(false);
  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);

  // Refs for auto-close timers
  const timeCloseTimer = useRef(null);
  const endTimeCloseTimer = useRef(null);
  const emailCloseTimer = useRef(null);

  // Generate time options from 6:00 AM to 12:00 AM (midnight)
  const timeOptions = Array.from({ length: 72 }).map((_, i) => {
    const totalMinutes = 6 * 60 + i * 15; // Start from 6:00 AM
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const period = hours < 12 ? "AM" : "PM";
    const label = `${displayHours}:${String(minutes).padStart(
      2,
      "0"
    )} ${period}`;
    return { value, label };
  });

  const emailOptions = [
    { value: "alice@example.com", label: "alice@example.com" },
    { value: "bob@example.com", label: "bob@example.com" },
    { value: "carol@example.com", label: "carol@example.com" },
    { value: "dave@example.com", label: "dave@example.com" },
    { value: "eve@example.com", label: "eve@example.com" },
    { value: "frank@example.com", label: "frank@example.com" },
    { value: "grace@example.com", label: "grace@example.com" },
    { value: "henry@example.com", label: "henry@example.com" },
  ];

  // Auto-close functions
  const startTimeAutoClose = () => {
    if (timeCloseTimer.current) {
      clearTimeout(timeCloseTimer.current);
    }
    timeCloseTimer.current = setTimeout(() => {
      setIsTimeDropdownOpen(false);
    }, 3000);
  };

  const startEndTimeAutoClose = () => {
    if (endTimeCloseTimer.current) {
      clearTimeout(endTimeCloseTimer.current);
    }
    endTimeCloseTimer.current = setTimeout(() => {
      setIsEndTimeDropdownOpen(false);
    }, 3000);
  };

  const startEmailAutoClose = () => {
    if (emailCloseTimer.current) {
      clearTimeout(emailCloseTimer.current);
    }
    emailCloseTimer.current = setTimeout(() => {
      setIsEmailDropdownOpen(false);
    }, 3000);
  };

  const clearTimeAutoClose = () => {
    if (timeCloseTimer.current) {
      clearTimeout(timeCloseTimer.current);
    }
  };

  const clearEndTimeAutoClose = () => {
    if (endTimeCloseTimer.current) {
      clearTimeout(endTimeCloseTimer.current);
    }
  };

  const clearEmailAutoClose = () => {
    if (emailCloseTimer.current) {
      clearTimeout(emailCloseTimer.current);
    }
  };

  // Effects to start auto-close when dropdowns open
  useEffect(() => {
    if (isTimeDropdownOpen) {
      startTimeAutoClose();
    } else {
      clearTimeAutoClose();
    }
    
    return () => clearTimeAutoClose();
  }, [isTimeDropdownOpen]);

  useEffect(() => {
    if (isEndTimeDropdownOpen) {
      startEndTimeAutoClose();
    } else {
      clearEndTimeAutoClose();
    }
    
    return () => clearEndTimeAutoClose();
  }, [isEndTimeDropdownOpen]);

  useEffect(() => {
    if (isEmailDropdownOpen) {
      startEmailAutoClose();
    } else {
      clearEmailAutoClose();
    }
    
    return () => clearEmailAutoClose();
  }, [isEmailDropdownOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeAutoClose();
      clearEndTimeAutoClose();
      clearEmailAutoClose();
    };
  }, []);

  const handleTimeSelect = (value) => {
    clearTimeAutoClose();
    handleInputChange({ target: { name: "time", value } });
    setIsTimeDropdownOpen(false);
  };

  const handleEndTimeSelect = (value) => {
    clearEndTimeAutoClose();
    handleInputChange({ target: { name: "endTime", value } });
    setIsEndTimeDropdownOpen(false);
  };

  const handleEmailSelect = (value) => {
    clearEmailAutoClose();
    let updatedEmails;
    if (selectedEmails.includes(value)) {
      // Remove email if already selected
      updatedEmails = selectedEmails.filter((email) => email !== value);
    } else {
      // Add email if not selected
      updatedEmails = [...selectedEmails, value];
    }
    setSelectedEmails(updatedEmails);
    handleInputChange({
      target: { name: "email", value: updatedEmails.join(", ") },
    });
  };

  const selectedTimeLabel = formData.time
    ? timeOptions.find((option) => option.value === formData.time)?.label ||
      "Start"
    : "Start";

  const selectedEndTimeLabel = formData.endTime
    ? timeOptions.find((option) => option.value === formData.endTime)?.label ||
      "End"
    : "End";

  const selectedEmailLabel =
    selectedEmails.length > 0
      ? selectedEmails.length === 1
        ? selectedEmails[0]
        : `${selectedEmails.length} emails selected`
      : "Select emails";

  return (
    <div>
      <input
        type="text"
        name="title"
        placeholder="Meeting Title (Optional)"
        className="w-full border-b border-gray-300 py-2 mb-4 focus:outline-none"
        value={formData.title}
        onChange={handleInputChange}
      />

      <div className="flex items-center mb-4">
        <input
          type="date"
          name="date"
          className="border-b border-gray-300 py-2 focus:outline-none"
          value={formData.date.split("-").reverse().join("-")}
          onChange={handleInputChange}
        />
      </div>

      {/* Time Selection Row */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time
        </label>
        <div className="flex items-center space-x-3">
          {/* Start Time Dropdown */}
          <div
            className="relative flex-1"
            onMouseEnter={clearTimeAutoClose}
            onMouseLeave={startTimeAutoClose}
          >
            <button
              type="button"
              className="w-full bg-gray-100 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#058CBF] transition duration-200 text-left flex items-center justify-between"
              onClick={() => {
                clearTimeAutoClose();
                setIsTimeDropdownOpen(!isTimeDropdownOpen);
              }}
            >
              <span className={formData.time ? "text-black" : "text-gray-500"}>
                {selectedTimeLabel}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isTimeDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isTimeDropdownOpen && (
              <div 
                className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1"
                onMouseEnter={clearTimeAutoClose}
                onMouseLeave={startTimeAutoClose}
              >
                <div className="max-h-32 overflow-y-auto">
                  {timeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-150 ${
                        formData.time === option.value
                          ? "bg-blue-50 text-[#058CBF]"
                          : "text-gray-700"
                      }`}
                      onClick={() => handleTimeSelect(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <span className="text-gray-500 font-medium">-</span>

          {/* End Time Dropdown */}
          <div
            className="relative flex-1"
            onMouseEnter={clearEndTimeAutoClose}
            onMouseLeave={startEndTimeAutoClose}
          >
            <button
              type="button"
              className="w-full bg-gray-100 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#058CBF] transition duration-200 text-left flex items-center justify-between"
              onClick={() => {
                clearEndTimeAutoClose();
                setIsEndTimeDropdownOpen(!isEndTimeDropdownOpen);
              }}
            >
              <span
                className={formData.endTime ? "text-black" : "text-gray-500"}
              >
                {selectedEndTimeLabel}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isEndTimeDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isEndTimeDropdownOpen && (
              <div 
                className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1"
                onMouseEnter={clearEndTimeAutoClose}
                onMouseLeave={startEndTimeAutoClose}
              >
                <div className="max-h-32 overflow-y-auto">
                  {timeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-150 ${
                        formData.endTime === option.value
                          ? "bg-blue-50 text-[#058CBF]"
                          : "text-gray-700"
                      }`}
                      onClick={() => handleEndTimeSelect(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Dropdown */}
      <div className="flex items-center mb-4">
        <Mail className="mr-2 text-gray-500" size={20} />
        <div
          className="relative w-full"
          onMouseEnter={clearEmailAutoClose}
          onMouseLeave={startEmailAutoClose}
        >
          <button
            type="button"
            className="w-full bg-gray-100 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#058CBF] transition duration-200 text-left flex items-center justify-between"
            onClick={() => {
              clearEmailAutoClose();
              setIsEmailDropdownOpen(!isEmailDropdownOpen);
            }}
          >
            <span
              className={
                selectedEmails.length > 0 ? "text-black" : "text-gray-500"
              }
            >
              {selectedEmailLabel}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isEmailDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isEmailDropdownOpen && (
            <div 
              className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1"
              onMouseEnter={clearEmailAutoClose}
              onMouseLeave={startEmailAutoClose}
            >
              <div className="max-h-32 overflow-y-auto">
                {emailOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-150 flex items-center justify-between ${
                      selectedEmails.includes(option.value)
                        ? "bg-blue-50 text-[#058CBF]"
                        : "text-gray-700"
                    }`}
                    onClick={() => handleEmailSelect(option.value)}
                  >
                 

        
                    <span>{option.label}</span>
                    {selectedEmails.includes(option.value) && (
                      <span className="text-[#058CBF] font-semibold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start mb-4">
        <FileText className="mr-2 mt-1 text-gray-500" size={20} />
        <textarea
          name="description"
          placeholder="Add Meeting Description"
          className="w-full h-16 border rounded-md p-2 bg-blue-50 focus:outline-none resize-none"
          value={formData.description}
          onChange={handleInputChange}
        ></textarea>
      </div>

      {/* Hidden field to ensure meetings are properly categorized */}
      <input type="hidden" name="category" value="Meeting" />
    </div>
  );
};

export default MeetingForm;
