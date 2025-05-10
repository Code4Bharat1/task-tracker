'use client';

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ArrowUp } from "lucide-react";

// Demo data for different time periods
const demoDataMap = {
  'This Year': [
    { name: "Complete", value: 75, color: "#00FF00" },
    { name: "Incomplete", value: 25, color: "#FF0000" }
  ],
  'This Month': [
    { name: "Complete", value: 60, color: "#00FF00" },
    { name: "Incomplete", value: 40, color: "#FF0000" }
  ],
  'This Week': [
    { name: "Complete", value: 45, color: "#00FF00" },
    { name: "Incomplete", value: 55, color: "#FF0000" }
  ]
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const completeData = payload.find(p => p.name === "Complete");
    const incompleteData = payload.find(p => p.name === "Incomplete");
    
    return (
      <div className="bg-white p-2 shadow-md rounded border border-gray-200">
        {completeData && (
          <p className="text-green-500 font-medium">{`${completeData.value}% Completed`}</p>
        )}
        {incompleteData && (
          <p className="text-red-500 font-medium">{`${incompleteData.value}% Incomplete`}</p>
        )}
      </div>
    );
  }
  return null;
};

const TaskCompletedChart = ({ selected = 'This Year' }) => {
  const data = demoDataMap[selected] || demoDataMap['This Year'];
  const completeValue = data.find(d => d.name === 'Complete')?.value || 0;

  return (
    <div className="w-auto h-[350px] rounded-[20px] bg-white p-5 shadow-[1px_4px_10px_lightgray] font-sans">
      <div className="flex justify-between items-start w-full">
        <h2 className="text-xl font-medium">TASK COMPLETED</h2>
        <div className="flex flex-col">
          <div className="flex items-center text-green-500 font-bold">
            <ArrowUp size={19} />
            <span className="ml-1">{completeValue}% Increase</span>
          </div>  
          
          <div className="pl-5 mt-1 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-green-500">Complete</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="text-red-500">Incomplete</span>
            </div>
          </div>
        </div>
      </div>

      <h1 className="font-semibold text-2xl ">{completeValue}%</h1>

      <div className="relative w-full h-[200px] flex justify-center items-center">
        {/* Percentage display behind the chart */}
        <div className="absolute inset-0 flex items-center justify-center mt-1 ml-2 text-[24px] font-bold text-black z-0">
          {completeValue}%
        </div>
        
        {/* Chart on top with transparent background to show the percentage */}
        <div className="z-10">
          <PieChart width={300} height={200}>
            <Pie
              data={data}
              cx={150}
              cy={100}
              innerRadius={30}
              outerRadius={80}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} position={{ y: 0 }} />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default TaskCompletedChart;