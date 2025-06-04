"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { AiFillDelete } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import { FiChevronDown } from "react-icons/fi";
import * as XLSX from "xlsx";
import { axiosInstance } from "@/lib/axiosInstance";
import { useGSAP } from "@gsap/react";

export default function EditTimeSheet() {
    const [items, setItems] = useState([]);
    const [date, setDate] = useState("");
    const [projectName, setProjectName] = useState("");
    const [selectedManagers, setSelectedManagers] = useState([]);
    const [availableManagers, setAvailableManagers] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [todayHours, setTodayHours] = useState([]);
    const [totalTime, setTotalTime] = useState("00:00");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingManagers, setLoadingManagers] = useState(false);

    const underlineRef = useRef(null);
    const rowRefs = useRef([]);

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setDate(formattedDate);
        fetchApprovers();
    }, []);

    const fetchApprovers = async () => {
        setLoadingManagers(true);
        try {
            const response = await axiosInstance.get('/timesheet/user/approvers');
            if (response.status === 200 && response.data.success) {
                setAvailableManagers(response.data.data);
            } else {
                toast.error("Failed to load managers");
                // Fallback to default managers if API fails
                setAvailableManagers([
                    { id: 1, name: "Awab Fakih", role: "admin" },
                    { id: 2, name: "Ayaan Raje", role: "admin" },
                    { id: 3, name: "Prashant Patil", role: "admin" }
                ]);
            }
        } catch (error) {
            console.error("Error fetching approvers:", error);
            toast.error("Failed to load managers");
            // Fallback to default managers if API fails
            setAvailableManagers([
                { id: 1, name: "Awab Fakih", role: "admin" },
                { id: 2, name: "Ayaan Raje", role: "admin" },
                { id: 3, name: "Prashant Patil", role: "admin" }
            ]);
        } finally {
            setLoadingManagers(false);
        }
    };

    // Initialize managers on component mount
    useEffect(() => {
        fetchApprovers();
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

                let managers = [];
                if (timesheetData.notifiedManagers && timesheetData.notifiedManagers.length > 0) {
                    if (typeof timesheetData.notifiedManagers[0] === 'string') {
                        managers = timesheetData.notifiedManagers;
                    } else {
                        managers = timesheetData.notifiedManagers.map(m => m.name || m);
                    }
                }

                setProjectName(timesheetData.projectName || "");
                setSelectedManagers(managers);

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
        let formattedDuration = formatDuration(value);
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
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl">
            <Toaster />
            <h2 className="text-2xl font-bold mb-1 relative inline-block text-gray-800">
                <span
                    ref={underlineRef}
                    className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
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
                        onClick={() => !isLoading && setShowDropdown(!showDropdown)}
                        className={`border border-gray-300 rounded-md px-4 py-2 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] flex items-center justify-between ${isLoading || loadingManagers ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        disabled={isLoading || loadingManagers}
                    >
                        <span className="text-sm text-gray-800">
                            {loadingManagers
                                ? 'Loading...'
                                : `Selected (${selectedManagers.length})`
                            }
                        </span>
                        <FiChevronDown className="text-gray-600 text-lg" />
                    </button>
                    {showDropdown && !isLoading && !loadingManagers && (
                        <div className="absolute top-full mt-1 bg-white border border-gray-200 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded-md w-full z-10 max-h-48 overflow-y-auto">
                            {availableManagers.length > 0 ? (
                                availableManagers.map((manager) => (
                                    <label
                                        key={manager.id}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <input
                                            className="w-5 h-5 text-blue-600"
                                            type="checkbox"
                                            checked={selectedManagers.includes(manager.name)}
                                            onChange={() => {
                                                setSelectedManagers(prev =>
                                                    prev.includes(manager.name)
                                                        ? prev.filter(name => name !== manager.name)
                                                        : [...prev, manager.name]
                                                );
                                            }}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{manager.name}</span>
                                            <span className="text-xs text-gray-500 capitalize">{manager.role}</span>
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-gray-500 text-sm">No managers available</div>
                            )}
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