'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

// Dummy data for different time periods
const performanceDataMap = {
  'This Year': [
    { name: 'Jan', project1: 85, project2: 75, project3: 65 },
    { name: 'Feb', project1: 70, project2: 80, project3: 60 },
    { name: 'Mar', project1: 90, project2: 85, project3: 70 },
    { name: 'Apr', project1: 95, project2: 80, project3: 75 },
    { name: 'May', project1: 80, project2: 90, project3: 65 },
    { name: 'Jun', project1: 85, project2: 88, project3: 78 },
    { name: 'Jul', project1: 75, project2: 70, project3: 68 },
    { name: 'Aug', project1: 88, project2: 85, project3: 72 },
    { name: 'Sep', project1: 90, project2: 92, project3: 80 },
    { name: 'Oct', project1: 80, project2: 75, project3: 70 },
    { name: 'Nov', project1: 85, project2: 80, project3: 77 },
    { name: 'Dec', project1: 90, project2: 88, project3: 82 },
  ],
  'This Month': [
    { name: 'Week 1', project1: 85, project2: 75, project3: 60 },
    { name: 'Week 2', project1: 80, project2: 78, project3: 70 },
    { name: 'Week 3', project1: 90, project2: 82, project3: 75 },
    { name: 'Week 4', project1: 88, project2: 85, project3: 78 },
  ],
  'This Week': [
    { name: 'Mon', project1: 75, project2: 80, project3: 70 },
    { name: 'Tue', project1: 85, project2: 90, project3: 75 },
    { name: 'Wed', project1: 80, project2: 88, project3: 72 },
    { name: 'Thu', project1: 95, project2: 85, project3: 78 },
    { name: 'Fri', project1: 90, project2: 80, project3: 76 },
    { name: 'Sat', project1: 85, project2: 78, project3: 70 },
    { name: 'Sun', project1: 80, project2: 82, project3: 74 },
  ],
};

// You can pass `selected` prop to switch between time periods
const PerformanceSummary = ({ selected = 'This Year' }) => {
  const data = performanceDataMap[selected] || performanceDataMap['This Year'];

  return (
    <div className="w-auto h-[390px] bg-white rounded-2xl shadow-[1px_4px_10px_lightgray] p-4 font-sans">
      <h2 className="text-xl font-medium mb-4">PERFORMANCE SUMMARY</h2>

      <div className="flex items-center space-x-4 mb-2 ml-2">
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-lime-500 mr-1" />
          1st PROJECT
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1" />
          2nd PROJECT
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-600 mr-1" />
          3rd PROJECT
        </div>
      </div>

      <div className="w-full mt-10 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#000" strokeWidth={0.2} />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Bar
              dataKey="project1"
              fill="limegreen"
              barSize={10}
              radius={[10, 10, 0, 0]}
            />
            <Bar
              dataKey="project2"
              fill="red"
              barSize={10}
              radius={[10, 10, 0, 0]}
            />
            <Bar
              dataKey="project3"
              fill="blue"
              barSize={10}
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceSummary;
