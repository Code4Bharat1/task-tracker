"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AiFillDelete } from "react-icons/ai";

export default function AddTask() {
  const underlineRef = useRef(null);
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [assignDate, setAssignDate] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDelete = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAssignDateChange = (e) => {
    const date = e.target.value;
    setAssignDate(date);

    if (deadline && deadline < date) {
      setDeadline("");
    }
  };
  const [priority, setPriority] = useState("low");
  return (
    <div className="h-auto p-8">
      {/* Heading */}
      <div className="flex justify-start items-center">
        <h1 className="text-2xl font-bold text-center mb-8 relative text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full"
          ></span>
         Add Task 
        </h1>
        <span className="text-2xl font-bold text-center mb-8 ml-1 relative text-gray-800">
          Details
        </span>
      </div>

      <div className="mx-auto max-w-6xl bg-white border border-gray-400 rounded-xl shadow-[0px_2px_0px_rgba(0,0,0,0.2)] p-6">
        {/* Bucket Name */}
        <div className="flex items-center gap-4 mb-4">
  <label
    htmlFor="bucket-name"
    className="text-md font-medium text-black min-w-[120px]"
  >
    Bucket Name
  </label>

  <div className="relative w-60">
    <select
      id="bucket-name"
      className="w-full appearance-none px-4 py-2 text-gray-500 bg-white border border-gray-300 rounded shadow-[0px_2px_0px_rgba(0,0,0,0.2)] focus:outline-none"
    >
      <option value="" disabled selected hidden>
        Team Name
      </option>
      <option value="IT - Code4bharat">IT - Code4bharat</option>
      <option value="IT - Gkcc">IT - Gkcc</option>
      <option value="IT - Isrc">IT - Isrc</option>
      <option value="IT - Nexcore Alliance">IT - Nexcore Alliance</option>
    </select>

    {/* Custom arrow icon */}
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-600">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</div>


        {/* Assignment Table */}
        <div className="grid grid-cols-3 gap-6 mx-auto mt-10 mb-10">
          {/* Assigned To */}
          <div className="flex flex-col">
            <label htmlFor="assigned-to" className="mb-1 text-lg font-medium text-gray-700">
              Assigned to
            </label>
            <input
              type="text"
              id="assigned-to"
              placeholder="Enter name"
              className="border border-gray-400 rounded-md px-3 w-60 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
            />
          </div>

          {/* Assign Date */}
          <div className="flex flex-col">
            <label htmlFor="assign-date" className="mb-1 text-lg font-medium text-gray-700">
              Assign Date
            </label>
            <input
              type="date"
              id="assign-date"
              value={assignDate}
              onChange={handleAssignDateChange}
              className="border border-gray-400 w-60 rounded-md px-3 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
            />
          </div>

          {/* Deadline */}
          <div className="flex flex-col">
            <label htmlFor="deadline" className="mb-1 text-lg font-medium text-gray-700">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={assignDate}
              className="border border-gray-400 w-60 rounded-md px-3 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
            />
          </div>
        </div>

        <hr />

        {/* Priority & Time */}
        <div className="grid grid-cols-3 mx-auto mt-10 mb-10 gap-0">
          <div className="flex flex-col">
            <label htmlFor="priority" className="text-lg font-medium text-gray-700">
              Priority
            </label>
            <select
  value={priority}
  onChange={(e) => setPriority(e.target.value)}
  className="border border-gray-400 w-60 rounded-md px-3 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
  <option value="urgent">Urgent</option> {/* corrected spelling */}
</select>

          </div>

          <div className="flex flex-col">
            <label htmlFor="due-time" className="text-lg font-medium text-gray-700">
              Due Time
            </label>
            <input
              type="time"
              id="due-time"
              className="border border-gray-400 rounded-md px-3 w-60 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
            />
          </div>
        </div>

        {/* More Fields */}
        <div className="grid grid-cols-3 gap-6 mx-auto mt-10 mb-10">
          <div className="flex flex-col">
            <label htmlFor="assigned-by" className="mb-1 text-lg font-medium text-gray-700">
              Assigned by
            </label>
            <input
              type="text"
              id="assigned-by"
              placeholder="Name"
              className="border border-gray-400 rounded-md px-3 w-60 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="status" className="mb-1 text-lg font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              className="border border-gray-400 rounded-md px-3 py-2 w-60 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Deferred</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="tag-member" className="mb-1 text-lg font-medium text-gray-700">
              Tag Member
            </label>
            <select
              id="tag-member"
              className="border border-gray-400 rounded-md px-3 w-60 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
            >
              <option value="">Select All</option>
              <option value="IT - Code4bharat">IT - Code4bharat</option>
              <option value="IT - Gkcc">IT - Gkcc</option>
              <option value="IT - Isrc">IT - Isrc</option>
              <option value="IT - Nexcore Alliance">IT - Nexcore Alliance</option>
            </select>
          </div>
        </div>

        <hr />

        {/* Attachment Section */}
        <div className="max-w-6xl mt-10 p-4">
          <div className="grid grid-cols-2 items-start gap-6 mb-6">
            <div className="mb-6">
              <label htmlFor="attachment-required" className="mb-1 text-lg font-medium text-gray-700 block">
                Attachment is required for closing task?
              </label>
              <select
                id="attachment-required"
                className="border border-gray-400 text-gray-700 rounded px-3 py-2 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] w-40"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="attachment-file" className="mb-1 text-lg font-medium text-gray-700">
                Attachment
              </label>
              <div className="flex items-center gap-2 w-80 bg-gray-300 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] px-2 py-1 rounded">
                <input
                  id="attachment-file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="text-md file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-white file:shadow-[0px_2px_0px_rgba(0,0,0,0.2)] file:rounded file:cursor-pointer"
                />
                {file && (
                  <button type="button" onClick={handleDelete} className="text-black hover:text-red-600">
                    <AiFillDelete size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recurring */}
          <div className="mb-6">
            <label htmlFor="recurring" className="block mb-1 font-medium text-gray-700">
              Recurring
            </label>
            <select
              id="recurring"
              className="border border-gray-400 text-gray-700 rounded px-3 py-2 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] w-40"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
        <div className="mb-6">
        <label className="block mb-1 font-medium">Task Description</label>
        <input
          type="text"
          className="border border-gray-400 rounded px-3 py-2 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] w-full"
        />
      </div>
     

      {/* Remark */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Remark</label>
        <input
          type="text"
          className="border border-gray-400 rounded px-3 py-2 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] w-full"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-[#018ABE] hover:bg-[#0173a1] text-white font-medium text-lg px-6 py-2 rounded shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
        >
          Close Task
        </button>
      </div>
    </div>
      </div>
   
  );
}
