
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "../calendar/craetetask";
import TaskPage from "../calendar/event";
import SchedualPage from "../calendar/schedual";



export default function Categories() {
  const [showTabs, setShowTabs] = useState(false);
  const [activeTab, setActiveTab] = useState("Event");
  const router = useRouter();

  const tabs = [
    { label: "Event", key: "Event", content: <TaskForm /> },
    { label: "Task", key: "Task", content: <TaskPage/> },
    { label: "Schedule Meeting", key: "Schedule", content: <SchedualPage/> },
  ];

  const handleRangeChange = (e) => {
    const value = e.target.value;
    router.push(value); // value is the route like "/daycalendar"
  };

  return (
    <div className="p-6 w-full max-w-sm mt-8 ml-20 bg-white rounded-lg relative">
      {/* Header Row with Title and Dropdown */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4">
        {/* Dropdown */}
        
        <div className="absolute top-0 left-40 w-full flex justify-start items-center p-4">
  <div className="relative w-32">
    <select
      onChange={handleRangeChange}
      className="block w-full appearance-none px-3 py-2 border border-gray-300 bg-white rounded-md shadow-lg text-sm cursor-pointer pr-8"
    >
      <option value="/personalcalendar">Personal calendar</option>
      <option value="/monthcalendar">Month</option>
      <option value="/yearcalendar">Year</option>
    </select>

    {/* Chevron Icon */}
    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
      <svg
        className="h-4 w-4 text-gray-600"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  </div>
</div>  
 </div>

      <h2 className="text-2xl mt-19 font-bold">Categories</h2>

      {/* Category Legend */}
      <div className="grid grid-cols-2 gap-y-4 text-1xl font-medium mt-3">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-[#018ABE] "></span>
          <span>Daily Task</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-[#9306FF] "></span>
          <span>Deadline</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-[#FF0B0B] "></span>
          <span>Meeting</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-[#FFB006] "></span>
          <span>Leaves</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-[#07D107] "></span>
          <span>Reminder</span>
        </div>
        <div></div>
      </div>

      {/* Create Button */}
      <button
        onClick={() => setShowTabs(!showTabs)}
        className="mt-8 bg-[#058CBF] hover:bg-[#058CBF] text-white font-bold py-2 px-4 rounded-lg shadow cursor-pointer w-32 text-center"
      >
        CREATE
      </button>

      {/* Tabs */}
      {showTabs && (
        <div className="mt-6">
          <div className="flex justify-around mb-4 shadow-md">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-4 font-medium ${
                  activeTab === tab.key
                    ? "border-b-4 border-[#018ABE]"
                    : "text-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>{tabs.find((tab) => tab.key === activeTab)?.content}</div>
        </div>
      )}
    </div>
  );
}