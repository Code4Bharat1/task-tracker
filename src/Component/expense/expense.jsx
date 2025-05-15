'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { FaTrashAlt, FaRegCalendarAlt } from "react-icons/fa";
import { FaClock } from "react-icons/fa6";

export default function Expense() {
    const underlineRef = useRef(null);

    useEffect(() => {
        if (underlineRef.current) {
            gsap.fromTo(
                underlineRef.current,
                { scaleX: 0, transformOrigin: 'left' },
                { scaleX: 1, duration: 1, ease: 'power3.out' }
            );
        }
    }, []);

    const sections = [
        { title: 'Travel Expense', showTime: true },
        { title: 'Food Expense', showTime: false },
        { title: 'Hotel Expense', showTime: true },
        { title: 'Others Expense', showTime: true },
    ];

    const [selectedDates, setSelectedDates] = useState(Array(sections.length).fill(''));
    const [selectedTimes, setSelectedTimes] = useState(Array(sections.length).fill(''));
    const [selectedFiles, setSelectedFiles] = useState(Array(sections.length).fill(null));
    const [fileNames, setFileNames] = useState(Array(sections.length).fill('No File chosen'));
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [textareaValues, setTextareaValues] = useState(Array(sections.length).fill(''));

    const handleDateChange = (value, index) => {
        const updated = [...selectedDates];
        updated[index] = value;
        setSelectedDates(updated);
    };

    const handleTimeChange = (value, index) => {
        const updated = [...selectedTimes];
        updated[index] = value;
        setSelectedTimes(updated);
    };

    const handleTextareaChange = (value, index) => {
        const updated = [...textareaValues];
        updated[index] = value;
        setTextareaValues(updated);
    };

    const handleFileChange = (event, index) => {
        const file = event.target.files[0];
        if (file) {
            const updatedFiles = [...selectedFiles];
            updatedFiles[index] = file;
            setSelectedFiles(updatedFiles);
            
            const updatedNames = [...fileNames];
            updatedNames[index] = file.name;
            setFileNames(updatedNames);
        }
    };

    const handleFileDelete = (index) => {
        const updatedFiles = [...selectedFiles];
        updatedFiles[index] = null;
        setSelectedFiles(updatedFiles);
        
        const updatedNames = [...fileNames];
        updatedNames[index] = 'No File chosen';
        setFileNames(updatedNames);
        
        // Reset the file input
        const fileInput = document.getElementById(`file-input-${index}`);
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        
        setTimeout(() => {
            setToast({ show: false, type: '', message: '' });
        }, 4000);
    };
    
    const handleSubmit = () => {
    let anySectionFilled = false;
    let allFilledSectionsValid = true;

    for (let i = 0; i < sections.length; i++) {
        const hasDetails = textareaValues[i].trim() !== '';
        const hasDate = selectedDates[i] !== '';
        const hasFile = selectedFiles[i] !== null;
        const needsTime = sections[i].showTime;
        const hasTime = selectedTimes[i] !== '';

        // If any one field of the section is filled, we consider this section active
        const sectionTouched = hasDetails || hasDate || hasFile || (needsTime && hasTime);

        if (sectionTouched) {
            anySectionFilled = true;

            // Validate all required fields in this filled section
            if (!hasDetails || !hasDate || !hasFile || (needsTime && !hasTime)) {
                allFilledSectionsValid = false;
                break; // Stop checking further, show error
            }
        }
    }

    if (!anySectionFilled) {
        showToast('error', 'Please fill at least one section completely to submit.');
    } else if (!allFilledSectionsValid) {
        showToast('error', 'Please complete all required fields in the filled section.');
    } else {
        showToast('success', 'Expense submitted successfully!');
    }
};

    return (
        <div className="p-6">
            {/* Toast Notifications */}
            {toast.show && (
                <div
                    className={`fixed top-6 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg flex items-center gap-2 transition-all z-50 ${
                        toast.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
                        'bg-red-100 text-red-800 border-l-4 border-red-500'
                    }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle className="text-green-500" size={20} />
                    ) : (
                        <AlertCircle className="text-red-500" size={20} />
                    )}
                    <p className="font-medium">{toast.message}</p>
                </div>
            )}
            
            {/* Animated Heading */}
            <div className="relative ml-4 mt-4 mb-6 w-max">
                <h2 className="text-2xl font-bold text-black">Expense Details</h2>
                <span
                    ref={underlineRef}
                    className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full scale-x-0"
                ></span>
            </div>

            {/* Expense Sections */}
            <div className="bg-white shadow-md rounded-md p-6 space-y-10 border border-gray-200 max-w-5xl mx-auto">
                {sections.map((section, index) => (
                    <div key={index} className="border-b border-gray-300 pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Title & Textarea */}
                            <div>
                                <h3 className="text-xl font-semibold text-black mb-3">{section.title}</h3>
                                <textarea
                                    placeholder="Describe in Details |"
                                    className="w-full border border-gray-300 rounded-md p-3 resize-none text-sm focus:outline-none shadow-lg"
                                    rows={5}
                                    value={textareaValues[index]}
                                    onChange={(e) => handleTextareaChange(e.target.value, index)}
                                ></textarea>
                            </div>

                            {/* Right: Date, Time & File */}
                            <div className="flex flex-col gap-4">
                                {/* Date & Time */}
                                <div className="flex flex-wrap gap-4 mt-10">
                                    {/* Travel Date */}
                                    <div className="flex items-center">
                                        <div className="relative w-44">
                                            <input
                                                type="text"
                                                value={selectedDates[index] || ''}
                                                placeholder="Travel Date"
                                                className="w-full text-sm focus:outline-none border border-gray-400 rounded-md px-2 py-2"
                                                onFocus={() =>
                                                    document.getElementById(`real-date-${index}`)?.showPicker?.()
                                                }
                                                onChange={(e) => handleDateChange(e.target.value, index)}
                                            />
                                            <input
                                                type="date"
                                                id={`real-date-${index}`}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleDateChange(e.target.value, index)}
                                            />
                                        </div>
                                        <FaRegCalendarAlt
                                            onClick={() =>
                                                document.getElementById(`real-date-${index}`)?.showPicker?.()
                                            }
                                            className="text-gray-600 cursor-pointer ml-2"
                                            size={16}
                                        />
                                    </div>

                                    {/* Travel Time (if applicable) */}
                                    {section.showTime && (
                                        <div className="flex items-center">
                                            <div className="relative w-44">
                                                <input
                                                    type="text"
                                                    value={selectedTimes[index] || ''}
                                                    placeholder="Travel Time"
                                                    className="w-full text-sm focus:outline-none border border-gray-400 rounded-md px-2 py-2"
                                                    onFocus={() =>
                                                        document.getElementById(`real-time-${index}`)?.showPicker?.()
                                                    }
                                                    onChange={(e) => handleTimeChange(e.target.value, index)}
                                                />
                                                <input
                                                    type="time"
                                                    id={`real-time-${index}`}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => handleTimeChange(e.target.value, index)}
                                                />
                                            </div>
                                            <FaClock
                                                onClick={() =>
                                                    document.getElementById(`real-time-${index}`)?.showPicker?.()
                                                }
                                                className="text-gray-600 cursor-pointer ml-2"
                                                size={16}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Attachment */}
                                <div>
                                    <label className="block mb-1 font-medium text-black">Attachment</label>
                                    <div className="flex items-center w-full max-w-md">
                                        <div className="flex-grow flex items-center bg-gray-200 border border-gray-400 rounded-md px-2 py-2 shadow-sm">
                                            <label className="cursor-pointer bg-white px-3 py-1 rounded shadow text-sm font-medium mr-2">
                                                Choose File
                                                <input 
                                                    type="file" 
                                                    id={`file-input-${index}`}
                                                    className="hidden" 
                                                    onChange={(e) => handleFileChange(e, index)}
                                                />
                                            </label>
                                            <span className="text-sm text-gray-700">{fileNames[index]}</span>
                                        </div>
                                        <FaTrashAlt 
                                            className="text-black cursor-pointer ml-2" 
                                            size={16} 
                                            onClick={() => handleFileDelete(index)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Submit Button */}
                <div className="text-center pt-4">
                    <button 
                        onClick={handleSubmit}
                        className="bg-cyan-600 text-white font-semibold px-6 py-2 rounded-md shadow-md hover:bg-cyan-700 transition"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}    