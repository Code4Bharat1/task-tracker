"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { AiFillDelete } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import { FiChevronDown } from "react-icons/fi";
import * as XLSX from "xlsx";
import { axiosInstance } from "@/lib/axiosInstance";
import { useGSAP } from "@gsap/react";

export default function MobileEditTimeSheet() {
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

    useEffect(() => {
        if (date) {
            fetchTimesheetData(date);
        }
    }, [date]);

    useGSAP(() => {
        gsap.fromTo(
            underlineRef.current,
            { width: "0%" },
            { width: "100%", duration: 1, ease: "power2.out" }
        );
    }, []);
   
    const fetchTimesheetData = async (selectedDate) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/timesheet/${selectedDate}`);
            if (response.status === 200 && response.data.message === 'Timesheet found') {
                const timesheetData = response.data.timesheet;
                setProjectName(timesheetData.projectName || "");
                setSelectedManagers(timesheetData.notifiedManagers || []);

                const formattedItems = timesheetData.items.map(item => ({
                    bucket: item.bucket || item.type,
                    task: item.task || "",
                    time: item.timeRange,
                    duration: item.duration,
                }));

                setItems(formattedItems);

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

    const resetForm = () => {
        setProjectName("");
        setSelectedManagers([]);
        setItems([]);
        setTodayHours([]);
        setTotalTime("00:00");
    };

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
        let numericValue = duration.replace(/\D/g, "").slice(0, 4);
        if (numericValue.length === 4) {
            return `${numericValue.slice(0, 2)}:${numericValue.slice(2, 4)}`;
        }
        return "00:00";
    };

    const getNextTimeRange = () => {
        if (items.length === 0) return "09:00 AM - 10:00 AM";
        const lastTime = items[items.length - 1].timeRange?.split(" - ")[1] ||
            items[items.length - 1].time?.split(" to ")[1] || "6:00 PM";
        const [time, period] = lastTime.split(" ");
        let [hour, minute] = time.split(":").map(Number);

        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;

        const start = new Date(0, 0, 0, hour, minute);
        const end = new Date(start.getTime() + 60 * 60000);
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

        setItems((prev) => [...prev, newItem]);

        const newDuration = "0100";
        setTodayHours((prev) => {
            const updatedHours = [...prev, newDuration];
            setTimeout(() => {
                setTotalTime(calculateTotalTime(updatedHours));
            }, 0);
            return updatedHours;
        });

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
        const formattedDuration = formatDuration(value);
        updateItem(index, "duration", formattedDuration);

        const numericValue = value.replace(/\D/g, "").slice(0, 4).padStart(4, '0');

        setTodayHours(prev => {
            const updated = [...prev];
            updated[index] = numericValue;

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

            setTimeout(() => {
                setTotalTime(calculateTotalTime(updated));
            }, 0);

            return updated;
        });
    };

    const handleSubmit = async () => {
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

        const emptyTaskIndex = items.findIndex(item => !item.task || !item.task.trim());
        if (emptyTaskIndex !== -1) {
            toast.error(`Please fill in the task description for entry #${emptyTaskIndex + 1}`);
            return;
        }

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
        <div className="mx-4 bg-white p-4 rounded-xl">
            <Toaster />
            <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold relative inline-block text-gray-800">
                    <span
                        ref={underlineRef}
                        className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
                    ></span>
                    Edit Time
                </h2>
                <span className="text-2xl font-bold text-gray-800 ml-1">sheet</span>
            </div>

            {/* Date and Project Name */}
            <div className="space-y-4 mb-4">
                <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-700">Project Name</label>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Manager Selection */}
            <div className="mb-4">
                <label className="mb-1 font-medium text-gray-700">Select Manager</label>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`w-full border border-gray-300 rounded-md px-4 py-2 flex items-center justify-between ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                >
                    <span className="text-sm text-gray-800">{`Selected (${selectedManagers.length})`}</span>
                    <FiChevronDown className="text-gray-600 text-lg" />
                </button>
                {showDropdown && (
                    <div className="mt-1 bg-white border border-gray-200 rounded-md w-full z-10">
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

            {/* Add Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => addTimelineItem("meeting")}
                    className={`flex-1 bg-[#018ABE] text-white px-4 py-2 rounded-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                >
                    Add Meeting
                </button>
                <button
                    onClick={() => addTimelineItem("miscellaneous")}
                    className={`flex-1 bg-[#018ABE] text-white px-4 py-2 rounded-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                >
                    Add Misc
                </button>
            </div>

            {/* Timeline Display - Mobile Cards */}
            <div className="space-y-3 mb-4">
                {isLoading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-4">No timesheet entries available. Select a date or add new entries.</div>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={index}
                            ref={(el) => (rowRefs.current[index] = el)}
                            className="border border-gray-300 rounded-lg p-3 shadow-sm"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-medium">{item.bucket}</div>
                                <button
                                    onClick={() => deleteItem(index)}
                                    aria-label="Delete item"
                                    disabled={isLoading}
                                    className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                    <AiFillDelete className="text-lg hover:text-red-700 transition-all" />
                                </button>
                            </div>
                            
                            <div className="mb-2">
                                <label className="text-sm text-gray-600">Task</label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={item.task}
                                    onChange={(e) => updateItem(index, "task", e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            
                            <div className="mb-2">
                                <label className="text-sm text-gray-600">Time</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    readOnly
                                    value={item.time || item.timeRange}
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-600">Duration</label>
                                <input
                                    type="text"
                                    value={item.duration}
                                    onChange={(e) => handleDurationChange(index, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Total Hours */}
            {items.length > 0 && (
                <div className="bg-gray-100 p-3 rounded-lg mb-4 flex justify-between items-center">
                    <span className="font-semibold">Total Hours</span>
                    <span
                        className={`px-3 py-1 rounded ${isLessThanEightHours ? "bg-[#fc6a5d]" : "bg-[#61c973]"}`}
                    >
                        {totalTime}
                    </span>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={exportToExcel}
                    className={`flex-1 bg-[#018ABE] text-white px-4 py-2 rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                >
                    Export
                </button>
                <button
                    onClick={handleSubmit}
                    className={`flex-1 bg-[#018ABE] text-white px-4 py-2 rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Updating...' : 'Update'}
                </button>
            </div>
        </div>
    );
}