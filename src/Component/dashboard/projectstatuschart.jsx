'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Dummy backend-like data for different time periods
const projectDataMap = {
  'This Year': {
    total: 10,
    data: [
      { name: 'Completed', value: 5 },
      { name: 'Pursuing', value: 2 },
      { name: 'Incomplete', value: 3 },
    ],
  },
  'This Month': {
    total: 8,
    data: [
      { name: 'Completed', value: 4 },
      { name: 'Pursuing', value: 3 },
      { name: 'Incomplete', value: 1 },
    ],
  },
  'This Week': {
    total: 5,
    data: [
      { name: 'Completed', value: 2 },
      { name: 'Pursuing', value: 2 },
      { name: 'Incomplete', value: 1 },
    ],
  },
};

const COLORS = ['#0000FF', '#FFA500', '#FF0000']; // Blue, Orange, Red
const RADIAN = Math.PI / 180;

// Label inside pie slices
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={14}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ProjectStatusChart = ({ selected = 'This Year' }) => {
  const selectedData = projectDataMap[selected] || projectDataMap['This Year'];
  const { data, total } = selectedData;

  return (
    <div className="w-auto h-[390px] bg-white rounded-2xl shadow-[1px_4px_10px_lightgray] p-4 font-sans relative">
      {/* Header with legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
      <h2 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginTop: '0.5rem' }}>PROJECTS</h2>
        <div className="text-xs space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-600 mr-2" />
            Completed
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
            Pursuing
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            Incomplete
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-56 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={100}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Label */}
        <div className="absolute text-center">
          <p className="text-sm font-semibold">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusChart;
