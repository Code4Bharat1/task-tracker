import React from "react";
import { CalendarIcon, Mail, FileText } from "lucide-react";

const MeetingForm = ({ formData, handleInputChange }) => {
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
        <CalendarIcon className="mr-2 text-gray-500" size={20} />
        <input
          type="date"
          name="date"
          className="border-b border-gray-300 py-2 focus:outline-none"
          value={formData.date.split("-").reverse().join("-")}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex items-center mb-4">
        <select
          name="time"
          className="border rounded-md py-1 px-2 mr-2"
          value={formData.time}
          onChange={handleInputChange}
        >
          <option value="">Start</option>
          {Array.from({ length: 96 }).map((_, i) => {
            const hours = Math.floor(i / 4);
            const minutes = (i % 4) * 15;
            return (
              <option
                key={i}
                value={`${String(hours).padStart(2, "0")}:${String(
                  minutes
                ).padStart(2, "0")}`}
              >
                {`${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${
                  hours < 12 ? "AM" : "PM"
                }`}
              </option>
            );
          })}
        </select>
        <span className="mx-2">-</span>
        <select
          name="endTime"
          className="border rounded-md py-1 px-2"
          value={formData.endTime}
          onChange={handleInputChange}
        >
          <option value="">End</option>
          {Array.from({ length: 96 }).map((_, i) => {
            const hours = Math.floor(i / 4);
            const minutes = (i % 4) * 15;
            return (
              <option
                key={i}
                value={`${String(hours).padStart(2, "0")}:${String(
                  minutes
                ).padStart(2, "0")}`}
              >
                {`${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${
                  hours < 12 ? "AM" : "PM"
                }`}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex items-center mb-4">
        <Mail className="mr-2 text-gray-500" size={20} />
        <select
          name="email"
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none"
          value={formData.email}
          onChange={handleInputChange}
        >
          <option value="">Select an email</option>
          <option value="alice@example.com">alice@example.com</option>
          <option value="bob@example.com">bob@example.com</option>
          <option value="carol@example.com">carol@example.com</option>
          <option value="dave@example.com">dave@example.com</option>
        </select>
      </div>

      <div className="flex items-start mb-4">
        <FileText className="mr-2 mt-1 text-gray-500" size={20} />
        <textarea
          name="description"
          placeholder="Add Meeting Description"
          className="w-full h-24 border rounded-md p-2 bg-blue-50 focus:outline-none"
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
