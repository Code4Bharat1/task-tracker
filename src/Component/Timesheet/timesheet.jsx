"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { AiFillDelete } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import { FiChevronDown } from "react-icons/fi";
import { axiosInstance } from "@/lib/axiosInstance";

export default function Timeline() {
    const [isFilledTimesheet, setIsFilledTimesheet] = useState(false);
    const [items, setItems] = useState([]);
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });
    const [projectName, setProjectName] = useState("");
    const [selectedManagers, setSelectedManagers] = useState([]);
    const [availableManagers, setAvailableManagers] = useState([]); // New state for dynamic managers
    const [showDropdown, setShowDropdown] = useState(false);
    const [todayHours, setTodayHours] = useState([]);
    const [totalTime, setTotalTime] = useState("00:00");
    const [validationErrors, setValidationErrors] = useState({});
    const [loadingManagers, setLoadingManagers] = useState(false); // Loading state for managers
    
    // Define bucket options for dropdown
    const bucketOptions = ["Project", "Meeting", "Miscellaneous"];

    const router = useRouter();
    const underlineRef = useRef(null);
    const rowRefs = useRef([]);
    // Create refs for each input field
    const inputRefs = useRef({
        projectName: null,
        items: []
    });

    // Fetch approvers/managers from API
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

    const checkFilledOrNotTimesheet = async (date) => {
        try {
            const response = await axiosInstance.get(`/timesheet/${date}`);
            if (response.status === 200 && response.data.message === 'Timesheet found') {
                setIsFilledTimesheet(true);

                // Populate form with timesheet data
                const timesheetData = response.data.timesheet;
                setProjectName(timesheetData.projectName || "");
                
                // Handle manager selection - match by name for backward compatibility
                if (timesheetData.notifiedManagers && timesheetData.notifiedManagers.length > 0) {
                    // If the stored managers are names, keep them as is
                    if (typeof timesheetData.notifiedManagers[0] === 'string') {
                        setSelectedManagers(timesheetData.notifiedManagers);
                    } else {
                        // If they're objects with names, extract the names
                        setSelectedManagers(timesheetData.notifiedManagers.map(m => m.name || m));
                    }
                } else {
                    setSelectedManagers([]);
                }
                
                setItems(timesheetData.items || []);

                // Calculate and set total hours
                const durations = timesheetData.items.map(item => {
                    const [hours, minutes] = item.duration.split(":").map(Number);
                    return `${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}`;
                });
                setTodayHours(durations);
                setTotalTime(timesheetData.totalWorkHours || calculateTotalTime(durations));

                toast.success("Already filled timesheet loaded", {
                    duration: 3000,
                    position: "top-center"
                });
            } else {
                resetForm();
                setIsFilledTimesheet(false);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                resetForm();
                setIsFilledTimesheet(false);
            } else {
                console.error("Error checking timesheet:", error);
                toast.error("Error loading timesheet data");
                resetForm();
                setIsFilledTimesheet(false);
            }
        }
    };

    const resetForm = () => {
        const defaultTimes = Array.from({ length: 8 }, (_, i) => {
            const start = new Date(0, 0, 0, 9 + i, 0);
            const end = new Date(0, 0, 0, 10 + i, 0);
            return {
                timeRange: `${formatTime(start)} - ${formatTime(end)}`,
                task: "",
                type: "Work",
                duration: "01:00",
                bucket: "Project",
            };
        });

        const defaultDurations = defaultTimes.map(() => "0100");
        setProjectName("");
        setSelectedManagers([]);
        setItems(defaultTimes);
        setTodayHours(defaultDurations);
        setValidationErrors({});
        setTimeout(() => {
            setTotalTime(calculateTotalTime(defaultDurations));
        }, 0);
    };

    useEffect(() => {
        if (date) {
            checkFilledOrNotTimesheet(date);
        }
    }, [date]);

    // Initialize inputRefs when items change
    useEffect(() => {
        inputRefs.current.items = Array(items.length).fill().map(() => ({
            task: null,
            duration: null
        }));
    }, [items.length]);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
    };

    useEffect(() => {
        gsap.fromTo(
            underlineRef.current,
            { width: "0%" },
            { width: "100%", duration: 1, ease: "power2.out" }
        );

        if (!isFilledTimesheet && items.length === 0) {
            resetForm();
        }
    }, []);

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
        const lastTime = items[items.length - 1].timeRange.split(" - ")[1];
        const [time, period] = lastTime.split(" ");
        let [hour, minute] = time.split(":").map(Number);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        const start = new Date(0, 0, 0, hour, minute);
        const end = new Date(start.getTime() + 60 * 60000);
        return `${formatTime(start)} - ${formatTime(end)}`;
    };

    const addTimelineItem = () => {
        if (isFilledTimesheet) {
            toast.error("Cannot modify an already submitted timesheet");
            return;
        }

        const newItem = {
            timeRange: getNextTimeRange(),
            duration: "01:00",
            type: "Work",
            bucket: "Project",
            task: "",
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

        // Clear validation errors for this new item
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`task-${items.length}`];
            return newErrors;
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
        if (isFilledTimesheet) {
            toast.error("Cannot modify an already submitted timesheet");
            return;
        }

        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);

        // Clear validation error for this field when it's updated
        if (field === 'task' && value.trim() !== '') {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`task-${index}`];
                return newErrors;
            });
        }
    };

    const handleDurationChange = (index, value) => {
        if (isFilledTimesheet) {
            toast.error("Cannot modify an already submitted timesheet");
            return;
        }

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
        if (isFilledTimesheet) {
            toast.error("Cannot modify an already submitted timesheet");
            return;
        }

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

        // Update validation errors after deleting an item
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            
            // Remove the error for the deleted item
            delete newErrors[`task-${index}`];
            
            // Adjust error keys for items after the deleted one
            Object.keys(newErrors).forEach(key => {
                if (key.startsWith('task-')) {
                    const itemIndex = parseInt(key.split('-')[1]);
                    if (itemIndex > index) {
                        newErrors[`task-${itemIndex-1}`] = newErrors[key];
                        delete newErrors[key];
                    }
                }
            });
            
            return newErrors;
        });
    };

    const validateForm = () => {
        const errors = {};
        
        // Validate project name
        if (!projectName.trim()) {
            errors.projectName = "Project name is required";
        }
        
        // Validate managers selection
        if (selectedManagers.length === 0) {
            errors.managers = "At least one manager must be selected";
        }
        
        // Validate each task entry
        items.forEach((item, index) => {
            if (!item.task || !item.task.trim()) {
                errors[`task-${index}`] = "Task description is required";
            }
        });
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (isFilledTimesheet) {
            toast.error("This timesheet has already been submitted");
            return;
        }

        // Validate the form before submission
        if (!validateForm()) {
            // Focus on the first input with an error
            if (validationErrors.projectName) {
                inputRefs.current.projectName?.focus();
            } else {
                for (let i = 0; i < items.length; i++) {
                    if (validationErrors[`task-${i}`]) {
                        inputRefs.current.items[i]?.task?.focus();
                        break;
                    }
                }
            }
            
            toast.error("Please fill all required fields");
            return;
        }

        const payload = {
            date,
            projectName,
            items: items.map(item => ({
                timeRange: item.timeRange,
                task: item.task,
                type: item.type,
                duration: item.duration,
                bucket: item.bucket,
            })),
            notifiedManagers: selectedManagers,
        };

        try {
            const response = await axiosInstance.post("/timesheet/store", payload);
            toast.success("Timesheet submitted successfully!");

            // Switch to current date after submission
            const today = new Date();
            const todayDate = today.toISOString().split("T")[0];
            setDate(todayDate);

            // Check if there's a timesheet for the current date
            await checkFilledOrNotTimesheet(todayDate);

            if (response.status === 200) {
                toast.success("Timesheet submitted successfully!", 1000);
            }

        } catch (error) {
            console.error("Error submitting timesheet:", error);
            toast.error(error.response?.data?.message || "Failed to submit timesheet.");
        }
    };

    // Handle Enter key press to move to next input
    const handleKeyDown = (e, type, index, field) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent form submission or newline in textarea
            
            // Determine the next input to focus
            if (type === 'projectName') {
                // If project name, focus on the first task input
                if (items.length > 0 && inputRefs.current.items[0]?.task) {
                    inputRefs.current.items[0].task.focus();
                }
            } else if (type === 'task') {
                // If task, focus on the duration input in the same row
                if (inputRefs.current.items[index]?.duration) {
                    inputRefs.current.items[index].duration.focus();
                }
            } else if (type === 'duration') {
                // If duration, focus on the task input in the next row
                if (index < items.length - 1 && inputRefs.current.items[index + 1]?.task) {
                    inputRefs.current.items[index + 1].task.focus();
                } else {
                    // If it's the last row, focus on the submit button
                    document.getElementById('submit-button')?.focus();
                }
            }
        }
    };

    const handleEditTimesheet = () => router.push("/timesheet/edittimesheet");
    const handleAddTask = () => router.push("/task");

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
                Add Time
            </h2>
            <span className="text-2xl font-bold text-gray-800">sheet</span>

            <div className="flex justify-end gap-8 mb-4">
                <button onClick={handleEditTimesheet} className="bg-[#018ABE] cursor-pointer hover:bg-[#0177a6] text-white font-semibold px-4 py-2 rounded-md">
                    Edit Timesheet
                </button>
                <button onClick={handleAddTask} className="bg-[#018ABE] cursor-pointer hover:bg-[#0177a6] text-white font-semibold px-4 py-2 rounded-md">
                    Add Task
                </button>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
                <div className="flex flex-col w-[200px]">
                    <label className="mb-1 font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        className="rounded-md p-1.5 border cursor-pointer border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                </div>

                <div className="flex flex-col w-[260px] relative">
                    <label className="mb-1 font-medium text-gray-700">Select Manager</label>
                    <button
                        onClick={() => !isFilledTimesheet && setShowDropdown(!showDropdown)}
                        className={`border ${validationErrors.managers ? 'border-red-500' : 'border-gray-300'} cursor-pointer rounded-md px-4 py-2 flex items-center justify-between ${isFilledTimesheet ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={isFilledTimesheet || loadingManagers}
                    >
                        <span className="text-sm text-gray-800">
                            {loadingManagers ? 'Loading...' : `${selectedManagers.length > 0 ? 'Selected' : 'Select'} (${selectedManagers.length})`}
                        </span>
                        <FiChevronDown className="text-gray-600 text-lg" />
                    </button>
                    {validationErrors.managers && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.managers}</p>
                    )}
                    {showDropdown && !isFilledTimesheet && !loadingManagers && (
                        <div
                            className="absolute top-full mt-1 bg-white border border-gray-200 rounded-md w-full z-10 max-h-48 overflow-y-auto"
                            onMouseLeave={() => setShowDropdown(false)} // Close dropdown when mouse leaves
                        >
                            {availableManagers.length > 0 ? (
                                availableManagers.map((manager) => (
                                    <label key={manager.id} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                        <input
                                            className="w-5 h-5 text-blue-600"
                                            type="checkbox"
                                            checked={selectedManagers.includes(manager.name)}
                                            onChange={() =>
                                                setSelectedManagers((prev) => {
                                                    const updated = prev.includes(manager.name)
                                                        ? prev.filter((m) => m !== manager.name)
                                                        : [...prev, manager.name];
                                                        
                                                    // Clear validation error if managers are selected
                                                    if (updated.length > 0) {
                                                        setValidationErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.managers;
                                                            return newErrors;
                                                        });
                                                    }
                                                    
                                                    return updated;
                                                })
                                            }
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
                        onClick={addTimelineItem}
                        className={`px-4 py-2 cursor-pointer rounded-lg ${isFilledTimesheet ? 'bg-gray-400' : 'bg-[#018ABE] text-white'}`}
                        disabled={isFilledTimesheet}
                    >
                        Add Row
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-800">Project Name</label>
                <div className="w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Project name"
                        value={projectName}
                        onChange={(e) => {
                            if (!isFilledTimesheet) {
                                setProjectName(e.target.value);
                                
                                // Clear validation error if field is filled
                                if (e.target.value.trim() !== '') {
                                    setValidationErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.projectName;
                                        return newErrors;
                                    });
                                }
                            }
                        }}
                        onKeyDown={(e) => handleKeyDown(e, 'projectName')}
                        ref={el => inputRefs.current.projectName = el}
                        className={`border ${validationErrors.projectName ? 'border-red-500' : 'border-gray-400'} rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${isFilledTimesheet ? 'bg-gray-100' : ''}`}
                        readOnly={isFilledTimesheet}
                    />
                    {validationErrors.projectName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.projectName}</p>
                    )}
                </div>
            </div>

            <div className="rounded-md overflow-x-auto mb-4 border-t-2 border-[#018ABE]">
                <table className="w-full table-auto border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-[#018ABE] text-white text-center">
                            <th className="px-4 py-3 w-[14%] whitespace-nowrap rounded-tl-md">Bucket</th>
                            <th className="px-4 py-3 border-l border-white w-[40%] whitespace-nowrap">Task</th>
                            <th className="px-4 py-3 border-l border-white w-[20%] whitespace-nowrap">Time</th>
                            <th className="px-4 py-3 border-l border-white w-[10%] whitespace-nowrap">Duration</th>
                            <th className="px-4 py-3 border-l border-white w-[5%] whitespace-nowrap rounded-tr-md">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index} ref={(el) => (rowRefs.current[index] = el)} className="hover:bg-gray-100">
                                <td className="relative px-4 py-2 border-4 border-white">
                                    <select 
                                        className={`w-full h-10 border text-center border-gray-500 rounded p-1 ${isFilledTimesheet ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
                                        value={item.bucket}
                                        onChange={(e) => updateItem(index, "bucket", e.target.value)}
                                        disabled={isFilledTimesheet}
                                    >
                                        {bucketOptions.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="relative px-4 py-2 border-4 border-white">
                                    <span className="custom-border-left"></span>
                                    <div>
                                        <textarea
                                            className={`w-full h-10 border ${validationErrors[`task-${index}`] ? 'border-red-500' : 'border-gray-500'} rounded p-1 resize-none overflow-hidden ${isFilledTimesheet ? 'bg-gray-100' : ''}`}
                                            value={item.task}
                                            onChange={(e) => updateItem(index, "task", e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, 'task', index)}
                                            ref={(el) => {
                                                if (inputRefs.current.items[index]) {
                                                    inputRefs.current.items[index].task = el;
                                                }
                                            }}
                                            readOnly={isFilledTimesheet}
                                            placeholder="Enter task description"
                                        />
                                        {validationErrors[`task-${index}`] && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors[`task-${index}`]}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="relative px-4 py-2 border-4 border-white">
                                    <span className="custom-border-left"></span>
                                    <textarea
                                        className={`w-full h-10 text-center border border-gray-500 rounded p-1 resize-none overflow-hidden ${isFilledTimesheet ? 'bg-gray-100' : ''}`}
                                        readOnly
                                        value={item.timeRange}
                                    />
                                </td>
                                <td className="relative px-4 py-2 border-4 border-white">
                                    <span className="custom-border-left"></span>
                                    <input
                                        type="text"
                                        value={item.duration}
                                        onChange={(e) => handleDurationChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, 'duration', index)}
                                        ref={(el) => {
                                            if (inputRefs.current.items[index]) {
                                                inputRefs.current.items[index].duration = el;
                                            }
                                        }}
                                        className={`border border-black rounded px-2 py-1 w-20 text-center ${isFilledTimesheet ? 'bg-gray-100' : ''}`}
                                        readOnly={isFilledTimesheet}
                                    />
                                </td>
                                <td className="relative px-4 py-2 border-4 border-white text-black text-center">
                                    <span className="custom-border-left"></span>
                                    <button
                                        onClick={() => deleteItem(index)}
                                        aria-label="Delete item"
                                        className={isFilledTimesheet ? 'opacity-30 cursor-not-allowed' : ''}
                                        disabled={isFilledTimesheet}
                                    >
                                        <AiFillDelete className="text-lg hover:text-red-700" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100 font-semibold">
                            <td className="text-right relative right-0 px-16 py-2" colSpan={3}>
                                Total Hours
                            </td>
                            <td className="px-4 py-2 text-center border-l-2 border-r-2 border-white">
                                <span className={`px-2 py-1 rounded ${isLessThanEightHours ? "bg-[#fc6a5d] text-black" : "bg-[#61c973] text-black"}`}>
                                    {totalTime}
                                </span>
                            </td>
                            <td className="px-4 py-2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>


            <div className="flex justify-center items-center gap-4 mb-6">
                <button
                    id="submit-button"
                    onClick={handleSubmit}
                    className={`px-6 py-2 rounded-lg ${isFilledTimesheet ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#018ABE] text-white'}`}
                    disabled={isFilledTimesheet}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};