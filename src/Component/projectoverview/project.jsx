"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";

// Chart Data
const demoDataMap = {
  "This Year": [
    { name: "Incomplete", value: 25, color: "#37FEBF" },
    { name: "Complete", value: 75, color: "#26788A" },
  ],
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const completeData = payload.find((p) => p.name === "Complete");
    const incompleteData = payload.find((p) => p.name === "Incomplete");
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
        {completeData && (
          <p className="text-[#26788A] font-semibold">{`${completeData.value}% Completed`}</p>
        )}
        {incompleteData && (
          <p className="text-[#37FEBF] font-semibold">{`${incompleteData.value}% Incomplete`}</p>
        )}
      </div>
    );
  }
  return null;
};

// Chart Component
const TaskCompletedChart = ({ selected = "This Year" }) => {
  const data = demoDataMap[selected] || demoDataMap["This Year"];
  const completeValue = data.find((d) => d.name === "Complete")?.value || 0;

  return (
    <div className="w-full h-full rounded-xl bg-white p-6 shadow-md font-sans">
      <div className="flex justify-between items-start w-full">
        <h2 className="text-xl font-bold text-gray-800">TASK COMPLETED</h2>
        <div className="flex flex-col">
          <div className="mt-1 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-[#26788A] rounded-full mr-2"></span>
              <span className="font-medium text-gray-700">Complete</span>
            </div>
            <div className="flex items-center mt-2">
              <span className="w-3 h-3 bg-[#37FEBF] rounded-full mr-2"></span>
              <span className="font-medium text-gray-700">Incomplete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[250px] flex justify-center items-center">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-4xl font-bold text-gray-800">{completeValue}%</div>
        </div>

        <PieChart width={300} height={300}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            startAngle={180}
            endAngle={-180}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </div>
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ name, role, imageIndex }) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <img
        src={`/team-${imageIndex}.jpg`}
        alt={name}
        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
      />
      <div>
        <p className="font-semibold text-gray-800">{name}</p>
        {role && <p className="text-sm text-gray-600">{role}</p>}
      </div>
    </div>
  );
};

// Project Status Button Component
const ProjectStatusButton = ({ icon, color, label }) => {
  return (
    <button 
      className={`flex items-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all hover:shadow-md w-full`}
    >
      <div className={`flex-shrink-0 text-${color}-500`}>
        {icon}
      </div>
      <span className="font-medium text-gray-800">{label}</span>
    </button>
  );
};

// Main Component
export default function ProjectOverview() {
  return (
    <div className="bg-gray-50 p-8 rounded-xl max-w-6xl mx-auto shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 border-b-4 border-orange-500 inline-block pb-1">
            Project Overview
          </h1>
          <p className="text-xl font-semibold text-gray-700 mt-2">GKCC Website</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-lg font-bold text-gray-800 mb-4">Project Assigned By</p>
          <TeamMemberCard 
            name="Shubham Prajapati" 
            role="Project Manager" 
            imageIndex={1} 
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-lg font-bold text-gray-800 mb-4">Project Timeline</p>
          <div className="flex items-center justify-between text-center py-2">
            <div className="text-center">
              <p className="text-gray-600 mb-1">05 May 2025</p>
              <p className="text-xl font-bold text-gray-800">Start</p>
            </div>
            
            <div className="flex-1 px-4 flex justify-center">
              <div className="flex items-center">
                <div className="h-1 w-16 bg-blue-500"></div>
                <ArrowRight size={24} className="text-blue-500 mx-1" />
                <div className="h-1 w-16 bg-blue-500"></div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-1">16 May 2025</p>
              <p className="text-xl font-bold text-gray-800">End</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <TaskCompletedChart />

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Team Members</h2>
          <div className="space-y-4">
            <TeamMemberCard name="Shubham Prajapati" imageIndex={1} />
            <TeamMemberCard name="Rohan Pawar" imageIndex={2} />
            <TeamMemberCard name="Harsh Singh" imageIndex={3} />
            <TeamMemberCard name="Shubham Thakare" imageIndex={4} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ProjectStatusButton 
            icon={<CheckCircle size={22} />} 
            color="green" 
            label="Past Projects" 
          />
          <ProjectStatusButton 
            icon={<Circle size={22} className="fill-blue-500" />} 
            color="blue" 
            label="Current Projects" 
          />
          <ProjectStatusButton 
            icon={<Circle size={22} className="fill-orange-500" />} 
            color="orange" 
            label="Upcoming Projects" 
          />
        </div>
      </div>
    </div>
  );
}