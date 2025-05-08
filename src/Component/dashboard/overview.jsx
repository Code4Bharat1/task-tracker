'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRouter } from 'next/navigation';

export default function OverviewHeader({ selected, setSelected }) {
  const timeOptions = ['This Year', 'This Month', 'This Week'];
  const [localSelected, setLocalSelected] = useState('This Year');
  const [isOpen, setIsOpen] = useState(false);
  const underlineRef = useRef(null);
  
  const router = useRouter();

  const handleClick = () => {
    router.push('/task'); // change '/task' to the correct route for your task file
  };

  // Initialize GSAP animation
  useGSAP(() => {
    gsap.from(underlineRef.current, {
      scaleX: 0,
      duration: 0.8,
      ease: "power3.out",
      transformOrigin: "left center",
    });
  }, []);

  // Sync with parent if selected is passed
  useEffect(() => {
    if (selected) {
      setLocalSelected(selected);
    }
  }, [selected]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectOption = (option) => {
    setLocalSelected(option);
    setIsOpen(false);
    if (setSelected) setSelected(option);
  };

  return (
    <div className="w-full flex justify-between items-center py-6 px-9">
      <div className="relative">
      <h2 className="text-center font-semibold text-gray-800  text-2xl mb-6">
          <span className="relative inline-block">
          Overview
            <span
              ref={underlineRef}
              className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full"
            ></span>
          </span>
        </h2>
        </div>

      <div className="flex items-center gap-2">
        <div className="relative">
        <button 
  onClick={toggleDropdown}
  className="flex items-center gap-1 px-3 py-1 text-gray-700 bg-white border border-gray-300 rounded-md shadow-[1px_1px_10px_lightgray] hover:bg-gray-50 transition-colors"
>
  <span>{localSelected}</span>
  <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
</button>


          {isOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10 animate-in fade-in-50">
              {timeOptions.map((option) => (
                <div 
                  key={option}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors ${
                    localSelected === option ? 'bg-gray-100 font-semibold' : ''
                  }`}
                  onClick={() => selectOption(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider Line */}
        <div className="h-9 w-[1px] mx-4 bg-gray-300"></div>

        {/* Plus Button */} 
        <button
      onClick={handleClick}
      className="bg-blue-500 rounded-full p-2 text-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
    >
      <Plus size={26} />
    </button>
      </div>    
    </div>
  );
}