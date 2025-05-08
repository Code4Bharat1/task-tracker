"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { AiFillDelete } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import { FiChevronDown } from "react-icons/fi";
import * as XLSX from "xlsx";
import { axiosInstance } from "@/lib/axiosInstance";

export default function EditTimeSheet() {
    const [items, setItems] = useState([]);
    const [date, setDate] = useState("");
    const [projectName, setProjectName] = useState("");
    const [selectedManagers, setSelectedManagers] = useState([]);
    const [availableManagers, setAvailableManagers] = useState(["Awab Fakih", "Ayaan Raje", "Prashant Patil"]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [todayHours, setTodayHours] = useState([]);
    const [totalTime, setTotalTime] = useState("00:00");
    const [isLoading, setIsLoading] = useState(false);

    const underlineRef = useRef(null);
    const rowRefs = useRef([]);

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setDate(formattedDate);
    }, []);

    // Fetch timesheet data when date changes
    useEffect(() => {
        if (date) {
            fetchTimesheetData(date);
        }
    }, [date]);

    // Animation for underline
    useEffect(() => {
        gsap.fromTo(
            underlineRef.current,
            { width: "0%" },
            { width: "100%", duration: 1, ease: "power2.out" }
        );
    }, []);

    // Fetch timesheet data from the backend
    const fetchTimesheetData = async (selectedDate) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/timesheet/${selectedDate}`);
            if (response.status === 200 && response.data.message === 'Timesheet found') {
                const timesheetData = response.data.timesheet;

                // Set project name and managers
                setProjectName(timesheetData.projectName || "");
                setSelectedManagers(timesheetData.notifiedManagers || []);

                // Format items for our component
                const formattedItems = timesheetData.items.map(item => ({
                    bucket: item.bucket || item.type,
                    task: item.task || "",
                    time: item.timeRange,
                    duration: item.duration,
                }));

                setItems(formattedItems);

                // Calculate and set total hours
                const durations = formattedItems.map(item => {
                    const [hours, minutes] = item.duration.split(":").map(Number);
                    return `${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}`;
                });

                setTodayHours(durations);
                setTotalTime(calculateTotalTime(durations));

                toast.success("Timesheet loaded successfully");
            } else {
                resetForm();
                toast.error("No timesheet found for this date");
            }
        } catch (error) {
            console.error("Error fetching timesheet:", error);
            if (error.response && error.response.status === 404) {
                toast.error("No timesheet found for this date");
                resetForm();
            } else {
                toast.error("Error loading timesheet data");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form to empty state
    const resetForm = () => {
        setProjectName("");
        setSelectedManagers([]);
        setItems([]);
        setTodayHours([]);
        setTotalTime("00:00");
    };

    // Calculate total time from an array of time strings in format "HHMM"
    const calculateTotalTime = (timeArray) => {
        let totalMinutes = 0;

        for (const time of timeArray) {
            if (time && time.length === 4) {
                const h = parseInt(time.slice(0, 2), 10);
                const m = parseInt(time.slice(2, 4), 10);
                if (!isNaN(h) && !isNaN(m) && h < 24 && m < 60) {
                    totalMinutes += h * 60 + m;
                }
            }
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    const formatTime = (date) =>
        date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const formatDuration = (duration) => {
        let numericValue = duration.replace(/\D/g, "").slice(0, 4); // Get numeric part and limit to 4 digits
        if (numericValue.length === 4) {
            return `${numericValue.slice(0, 2)}:${numericValue.slice(2, 4)}`;  // Format as hh:mm
        }
        return "00:00"; // Default fallback
    };

    const getNextTimeRange = () => {
        if (items.length === 0) return "09:00 AM - 10:00 AM"; // Default if no items
        const lastTime = items[items.length - 1].timeRange?.split(" - ")[1] ||
            items[items.length - 1].time?.split(" to ")[1] || "6:00 PM";
        const [time, period] = lastTime.split(" ");
        let [hour, minute] = time.split(":").map(Number);

        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;

        // Increment the time by 1 hour (60 minutes)
        const start = new Date(0, 0, 0, hour, minute);
        const end = new Date(start.getTime() + 60 * 60000); // 60 minutes later

        return `${formatTime(start)} - ${formatTime(end)}`;
    };

    const addTimelineItem = (type) => {
        const newItem = {
            task: "",
            timeRange: getNextTimeRange(),
            time: getNextTimeRange(),
            duration: "01:00",
            type,
            bucket: type,
        };

        // Update items state with the new item
        setItems((prev) => [...prev, newItem]);

        // Update todayHours state with the new duration in numeric format
        const newDuration = "0100"; // Represents 01:00 in numeric format
        setTodayHours((prev) => {
            const updatedHours = [...prev, newDuration];
            // Update total time after adding new item
            setTimeout(() => {
                setTotalTime(calculateTotalTime(updatedHours));
            }, 0);
            return updatedHours;
        });

        // Animation effect for the new row
        setTimeout(() => {
            const newIndex = items.length;
            const lastRow = rowRefs.current[newIndex];
            if (lastRow) {
                gsap.fromTo(
                    lastRow,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
                );
            }
        }, 0);
    };

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const handleDurationChange = (index, value) => {
        // Format the duration for display
        let formattedDuration = formatDuration(value);

        // Update the item's duration display
        updateItem(index, "duration", formattedDuration);

        // Update the numeric duration values array
        const numericValue = value.replace(/\D/g, "").slice(0, 4).padStart(4, '0'); // Ensuring only numeric values and proper format

        setTodayHours(prev => {
            const updated = [...prev];
            updated[index] = numericValue;

            // Recalculate total time after changing a duration
            setTimeout(() => {
                setTotalTime(calculateTotalTime(updated));
            }, 0);

            return updated;
        });
    };

    const deleteItem = (index) => {
        setItems(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });

        setTodayHours(prev => {
            const updated = [...prev];
            updated.splice(index, 1);

            // Recalculate total time after removing an item
            setTimeout(() => {
                setTotalTime(calculateTotalTime(updated));
            }, 0);

            return updated;
        });
    };

    const handleSubmit = async () => {
        // Validate inputs
        if (!date) {
            toast.error("Please select a date");
            return;
        }

        if (items.length === 0) {
            toast.error("Please add at least one timesheet entry");
            return;
        }

        if (!projectName.trim()) {
            toast.error("Please enter a project name");
            return;
        }

        if (selectedManagers.length === 0) {
            toast.error("Please select at least one manager");
            return;
        }

        // Check for empty tasks
        const emptyTaskIndex = items.findIndex(item => !item.task || !item.task.trim());
        if (emptyTaskIndex !== -1) {
            toast.error(`Please fill in the task description for entry #${emptyTaskIndex + 1}`);
            return;
        }

        // Prepare payload for API
        const payload = {
            date,
            projectName,
            items: items.map(item => ({
                timeRange: item.time || item.timeRange,
                task: item.task,
                type: item.bucket,
                duration: item.duration,
                bucket: item.bucket,
            })),
            notifiedManagers: selectedManagers,
            totalWorkHours: totalTime
        };

        try {
            setIsLoading(true);
            const response = await axiosInstance.put(`/timesheet/${date}`, payload);

            if (response.status === 200) {
                toast.success("Timeline updated successfully!");
                // Optionally refresh data after update
                fetchTimesheetData(date);
            }
        } catch (error) {
            console.error("Error updating timesheet:", error);
            toast.error(error.response?.data?.message || "Failed to update timesheet");
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = () => {
        if (items.length === 0) {
            toast.error("No data to export");
            return;
        }

        const worksheetData = items.map((item) => ({
            Bucket: item.bucket,
            Task: item.task,
            Time: item.time || item.timeRange,
            Duration: item.duration,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");
        const fileName = `Timesheet_${date}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        toast.success(`Exported as ${fileName}`);
    };

    const totalMinutes = parseInt(totalTime.split(":")[0]) * 60 + parseInt(totalTime.split(":")[1]);
    const isLessThanEightHours = totalMinutes < 480;

    return (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl">
            <Toaster />
            <h2 className="text-2xl font-bold mb-1 relative inline-block text-gray-800">
                <span
                    ref={underlineRef}
                    className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full"
                ></span>
                Edit Time
            </h2>
            <span className="text-2xl font-bold text-gray-800">sheet</span>

            <div className="flex justify-end mt-4">
                <button
                    onClick={exportToExcel}
                    className={`bg-[#018ABE] text-white px-4 py-2 cursor-pointer  rounded-md hover:bg-[#83c7e1] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                >
                    Export
                </button>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
                <div className="flex flex-col w-[200px]">
                    <label className="mb-1 font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-md p-1.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
                        disabled={isLoading}
                    />
                </div>

              

                <div className="flex flex-col w-[260px] relative">
                    <label className="mb-1 font-medium text-gray-700">Select Manager</label>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`border border-gray-300 rounded-md px-4 py-2 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] flex items-center justify-between ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        <span className="text-sm text-gray-800">{`Selected (${selectedManagers.length})`}</span>
                        <FiChevronDown className="text-gray-600 text-lg" />
                    </button>
                    {showDropdown && (
                        <div className="absolute top-full mt-1 bg-white border border-gray-200 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded-md w-full z-10">
                            {availableManagers.map((managerName) => (
                                <label
                                    key={managerName}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    <input
                                        className="w-5 h-5 text-blue-600"
                                        type="checkbox"
                                        checked={selectedManagers.includes(managerName)}
                                        onChange={() =>
                                            setSelectedManagers((prev) =>
                                                prev.includes(managerName)
                                                    ? prev.filter((m) => m !== managerName)
                                                    : [...prev, managerName]
                                            )
                                        }
                                    />
                                    {managerName}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => addTimelineItem("meeting")}
                        className={`bg-[#018ABE] text-white px-4 py-2 rounded-lg cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        Add Meeting
                    </button>
                    <button
                        onClick={() => addTimelineItem("miscellaneous")}
                        className={`bg-[#018ABE] text-white px-4 py-2 rounded-lg cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        Add Miscellaneous
                    </button>
                </div>
            </div>
            <div className="flex flex-row  relative items-center mb-8 mt-4">
  <label className="mr-2 font-medium text-gray-700 whitespace-nowrap">Project Name</label>
  <input
    type="text"
    value={projectName}
    onChange={(e) => setProjectName(e.target.value)}
    className="rounded-md p-1.5 border w-[500px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
    disabled={isLoading}
  />
</div>

            {/* Timeline Display */}
            <div className="rounded-lg shadow-[0px_2px_0px_rgba(0,0,0,0.2)] border-t-2 border-[#018ABE] overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#018ABE] text-white text-left">
                            <th className="px-4 py-2 w-[12%]">Bucket</th>
                            <th className="px-4 py-2 border-l border-r w-[40%] border-white">Task</th>
                            <th className="px-4 py-2 border-l border-r w-[20%] border-white">Time</th>
                            <th className="px-4 py-2 border-l border-r w-[10%] border-white">Duration</th>
                            <th className="px-4 py-2 w-[5%]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">Loading...</td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No timesheet entries available. Select a date or add new entries.</td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr
                                    key={index}
                                    ref={(el) => (rowRefs.current[index] = el)}
                                    className="hover:bg-gray-100"
                                >
                                    <td className="px-4 py-2 border-4 border-white relative">
                                        <span></span>
                                        <textarea
                                            className="w-full h-10 pl-4 border border-gray-500 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded p-1 resize-none overflow-hidden"
                                            readOnly
                                            value={item.bucket}
                                        />
                                    </td>
                                    <td className="px-4 py-2 border-4 border-white relative">
                                        <span className="custom-border-left"></span>
                                        <textarea
                                            className="w-full h-10 pl-4 border border-gray-500 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded p-1 resize-none overflow-hidden"
                                            value={item.task}
                                            onChange={(e) => updateItem(index, "task", e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </td>
                                    <td className="px-4 py-2 border-4 border-white relative">
                                        <span className="custom-border-left"></span>
                                        <textarea
                                            className="w-full h-10 pl-4 border border-gray-500 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded p-1 resize-none overflow-hidden"
                                            readOnly
                                            value={item.time || item.timeRange}
                                        />
                                    </td>
                                    <td className="px-4 py-2 border-4 border-white relative">
                                        <span className="custom-border-left"></span>
                                        <input
                                            type="text"
                                            value={item.duration}
                                            onChange={(e) => handleDurationChange(index, e.target.value)}
                                            className="border border-black rounded shadow-[0px_2px_0px_rgba(0,0,0,0.2)] px-2 py-1 w-20 text-center"
                                            disabled={isLoading}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-black text-center relative">
                                        <span className="custom-border-left"></span>
                                        <button
                                            onClick={() => deleteItem(index)}
                                            aria-label="Delete item"
                                            disabled={isLoading}
                                            className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                        >
                                            <AiFillDelete className="text-lg hover:text-red-700 transition-all" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}

                        {items.length > 0 && (
                            <tr className="bg-gray-100 font-semibold">
                                <td className="px-4 py-2 text-center" colSpan={3}>
                                    Total Hours
                                </td>
                                <td className="px-4 py-2 text-center border-2 border-white shadow-md">
                                    <span
                                        className={`px-2 py-1 rounded ${isLessThanEightHours ? "bg-[#fc6a5d] text-black" : "bg-[#61c973] text-black"
                                            }`}
                                    >
                                        {totalTime}
                                    </span>
                                </td>
                                <td className="px-4 py-2"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-center items-center">
                <button
                    onClick={handleSubmit}
                    className={`bg-[#018ABE] text-white px-6 py-2 cursor-pointer rounded-lg hover:bg-[#83c7e1] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Updating...' : 'Update'}
                </button>
            </div>
        </div>
    );
}