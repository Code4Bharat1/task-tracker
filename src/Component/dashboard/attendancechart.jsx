'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Dummy data for different time periods
const attendanceDataMap = {
  'This Year': { present: 65, absent: 35 },
  'This Month': { present: 75, absent: 25 },
  'This Week': { present: 85, absent: 15 },
};

const COLORS = ['#0000FF', '#FF0000'];

const AttendanceChart = ({ selected = 'This Year' }) => {
  const { present, absent } = attendanceDataMap[selected] || attendanceDataMap['This Year'];
  const data = [
    { name: 'Present', value: present },
    { name: 'Absent', value: absent },
  ];

  return (
    <div className="w-auto h-auto bg-white rounded-2xl shadow-[1px_4px_10px_lightgray] p-4 flex flex-col items-center justify-between relative">
      <div className="flex justify-between items-start w-full ">
        <div>
          <h2 className="text-xl mt-2 font-bold">ATTENDANCE</h2>
          <p className="text-2xl ml-4 mt-7 font-bold">{present}%</p>
        </div>
        <div className="text-sm space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-700 mr-2"></div>
            Present
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
            Absent
          </div>
        </div>
      </div>

      <div className="relative w-full h-48 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute text-xl font-bold">
          {present}%
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;
