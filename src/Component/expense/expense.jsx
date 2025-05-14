'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Calendar, Clock, Trash2 } from 'lucide-react';

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
    ];

    return (
        <div className="p-6">
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
                                ></textarea>
                            </div>

                            {/* Right: Date, Time & File */}
                            <div className="flex flex-col gap-4">
                                {/* Date & Time */}
                                <div className="flex flex-wrap gap-4 mt-10">
                                    {/* Travel Date */}
                                    <div className="flex items-center w-44 border border-gray-400 rounded-md px-2 py-2">
                                        <input
                                            type="text"
                                            className="w-full text-sm focus:outline-none border-none"
                                            placeholder="Travel Date"
                                        />
                                        <Calendar className="text-gray-600 ml-2" size={18} />
                                    </div>

                                    {/* Travel Time (if applicable) */}
                                    {section.showTime && (
                                        <div className="flex items-center w-44 border border-gray-400 rounded-md px-2 py-1">
                                            <input
                                                type="text"
                                                className="w-full text-sm focus:outline-none border-none"
                                                placeholder="Travel Time"
                                            />
                                            <Clock className="text-gray-600 ml-2" size={18} />
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
                                                <input type="file" className="hidden" />
                                            </label>
                                            <span className="text-sm text-gray-700">No File chosen</span>
                                        </div>
                                        <Trash2 className="text-black cursor-pointer ml-2" size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Submit Button */}
                <div className="text-center pt-4">
                    <button className="bg-cyan-600 text-white font-semibold px-6 py-2 rounded-md shadow-md hover:bg-cyan-700 transition">
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
