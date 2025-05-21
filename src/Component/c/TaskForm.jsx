import React from "react";
import { CalendarIcon } from "lucide-react";

const TaskForm = ({ formData, handleInputChange }) => {
  return (
    <div>
      <input
        type="text"
        name="title"
        placeholder="Add Task Title"
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
        <input
          type="time"
          name="time"
          className="border border-gray-300 rounded-md py-1 px-2"
          value={formData.time}
          onChange={handleInputChange}
        />
      </div>

      <textarea
        name="description"
        placeholder="Add Task Description"
        className="w-full h-24 border rounded-md p-2 mb-4 bg-blue-50 focus:outline-none"
        value={formData.description}
        onChange={handleInputChange}
      ></textarea>

      {/* Hidden field to ensure tasks are properly categorized */}
      <input type="hidden" name="category" value="Daily Task" />
    </div>
  );
};

export default TaskForm;
