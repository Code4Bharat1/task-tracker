"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AiFillDelete } from "react-icons/ai";
import axios from "axios";
import { axiosInstance } from "@/lib/axiosInstance";

export default function TaskDetails() {
  const underlineRef = useRef(null);
  const fileInputRef = useRef(null);

  // Task state
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [remark, setRemark] = useState("");

  const selectedTask = tasks.find(task => task._id === selectedTaskId);

  useEffect(() => {
    // Animation for the underline
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );

    // Fetch task data
    fetchTaskData();
  }, []);

  // Function to fetch all tasks
  const fetchTaskData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/tasks/getTasks')

      if (response.data.count > 0) {
        const tasksData = response.data.data.map(task => ({
          ...task,
          assignedToName: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
          assignedBy: task.assignedBy.fullName,
          taggedTeam: task.bucketName,
          description: task.taskDescription
        }));

        setTasks(tasksData);
        // Select the first task by default if available
        if (tasksData.length > 0) {
          setSelectedTaskId(tasksData[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDelete = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  //TODO: Update logic
  const handleCloseTask = async () => {
    if (!selectedTask) return;

    // Validate if attachment is required but not provided
    if (selectedTask.attachmentRequired && !file) {
      alert("Attachment is required to close this task");
      return;
    }

    try {
      // Prepare the form data
      const formData = new FormData();
      formData.append('status', 'Completed');
      formData.append('remark', remark);
      if (file) formData.append('attachment', file);


      const response = await axiosInstance.post(
        `/api/tasks/${selectedTask._id}/close`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );


      if (response.data.success) {
        alert("Task closed successfully!");
        // Refresh the task list
        await fetchTaskData();
        // Clear the form
        setRemark("");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(response.data.message || "Failed to close task");
      }
    } catch (error) {
      console.error("Error closing task:", error);
      alert(error.response?.data?.message || error.message || "Failed to close task");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading task details...</div>;
  }

  if (tasks.length === 0) {
    return <div className="flex justify-center items-center h-screen">No tasks found</div>;
  }

  return (
    <div className="h-auto p-8 bg-gray-50">
      {/* Heading */}
      <div className="flex justify-start items-center">
        <h1 className="text-2xl font-bold text-center mb-8 relative text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
          ></span>
          Task
        </h1>
        <span className="text-2xl font-bold text-center mb-8 ml-1 relative text-gray-800">
          Details
        </span>
      </div>

      {/* Task Selection Dropdown */}
      <div className="mx-auto max-w-6xl bg-white border border-gray-400 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-2">Select Task</label>
          <select
            value={selectedTaskId || ""}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {tasks.map(task => (
              <option key={task._id} value={task._id}>
                {task.bucketName} - {task.status} (Due: {new Date(task.deadline).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTask && (
        <div className="mx-auto max-w-6xl bg-white border border-gray-400 rounded-xl shadow-lg p-6">
          {/* Status Indicator */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className={`px-4 py-1 rounded-full text-white font-medium ${selectedTask.status === "Completed" ? "bg-green-500" :
                selectedTask.status === "In Progress" ? "bg-blue-500" : selectedTask.status === "Open" ? "bg-yellow-500" :
                  "bg-gray-500"
                }`}>
                {selectedTask.status}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 text-center">{selectedTask.bucketName}</h2>
            </div>
            <div className={`px-4 py-1 rounded-full text-white font-medium ${selectedTask.priority === "High" ? "bg-red-600" :
              selectedTask.priority === "Medium" ? "bg-orange-500" :
                selectedTask.priority === "Low" ? "bg-yellow-700" : "bg-green-500"
              }`}>
              {selectedTask.priority} Priority
            </div>
          </div>

          {/* Task Title */}


          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="text-sm text-gray-500">Assigned To</label>
              <input
                type="text"
                value={selectedTask.assignedToName}
                disabled
                className="border border-gray-300 bg-gray-100 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-500">Assigned By</label>
              <input
                type="text"
                value={selectedTask.assignedBy}
                disabled
                className="border border-gray-300 bg-gray-100 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-500">Tagged Team</label>
              <input
                type="text"
                value={selectedTask.taggedTeam}
                disabled
                className="border border-gray-300 bg-gray-100 rounded-md px-3 py-2 text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="text-sm text-gray-500">Assign Date</label>
              <input
                type="text"
                value={new Date(selectedTask.assignDate).toLocaleDateString()}
                disabled
                className="border border-gray-300 bg-gray-100 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-500">Deadline</label>
              <input
                type="text"
                value={new Date(selectedTask.deadline).toLocaleDateString()}
                disabled
                className="border border-gray-300 bg-gray-100 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-500">Due Time</label>
              <input
                type="text"
                value={selectedTask.dueTime}
                disabled
                className="border border-gray-300 bg-gray-100 rounded-md px-3 py-2 text-gray-700"
              />
            </div>
          </div>

          {/* Task Description */}
          <div className="mb-8">
            <label className="text-sm text-gray-500">Description</label>
            <textarea
              value={selectedTask.description}
              disabled
              rows={3}
              className="w-full border border-gray-300 bg-gray-100 rounded-md px-3 py-2 text-gray-700 resize-none"
            />
          </div>

          {/* Tagged Members */}
          <div className="mb-8">
            <label className="text-sm text-gray-500">Tagged Members</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTask.tagMembers.map((member) => (
                <span
                  key={member._id}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {member.firstName} {member.lastName}
                </span>
              ))}
            </div>
          </div>

          <hr className="my-8" />

          {/* Close Task Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Close Task</h3>

            {/* Attachment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">
                  Attachment Required: <span className="font-medium">{selectedTask.attachmentRequired ? "Yes" : "No"}</span>
                </label>
                {selectedTask.attachmentRequired && (
                  <p className="text-xs text-red-500 mb-2">* You must upload an attachment to close this task</p>
                )}
                {selectedTask.attachmentRequired && (
                  <div className="flex items-center gap-2 bg-white border border-gray-300 shadow px-2 py-1 rounded">
                    <input
                      id="attachment-file"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-blue-500 file:text-white file:rounded file:cursor-pointer"
                    />
                    {file && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="text-gray-700 hover:text-red-600"
                      >
                        <AiFillDelete size={20} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Closing Remark</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Add your comments about task completion"
                  rows={3}
                  className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleCloseTask}
                className="bg-[#018ABE] hover:bg-[#0173a1] text-white font-medium text-lg px-6 py-2 rounded shadow transition duration-200"
              >
                Close Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}