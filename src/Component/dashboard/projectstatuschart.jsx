'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['blue', 'orange', 'green'];
const RADIAN = Math.PI / 180;

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

const getStartDateByPeriod = (today, period) => {
  const start = new Date(today);
  switch (period) {
    case 'This Week':
      start.setDate(start.getDate() - start.getDay());
      break;
    case 'This Month':
      start.setDate(1);
      break;
    case 'This Year':
    default:
      start.setMonth(0);
      start.setDate(1);
      break;
  }
  return start;
};

const filterTasksByPeriod = (tasks, period) => {
  if (!tasks || tasks.length === 0) return [];
  
  const today = new Date();
  const startDate = getStartDateByPeriod(today, period);

  return tasks.filter(task => {
    const taskDate = task.createdAt ? new Date(task.createdAt) : 
                     task.created_at ? new Date(task.created_at) : null;
    if (!taskDate) return true;
    return taskDate >= startDate && taskDate <= today;
  });
};

const ProjectStatusChart = ({ selected = 'This Year', tasks = [] }) => {
  const filteredTasks = filterTasksByPeriod(tasks, selected);

  const statusCount = {
    Open: 0,
    'In Progress': 0,
    Completed: 0,
  };

  filteredTasks.forEach(task => {
    if (statusCount[task.status] !== undefined) {
      statusCount[task.status]++;
    }
  });

  const chartData = [
    { name: 'Open', value: statusCount.Open },
    { name: 'In Progress', value: statusCount['In Progress'] },
    { name: 'Completed', value: statusCount.Completed },
  ];

  const total = filteredTasks.length;

  return (
    <div className="w-auto h-[390px] bg-white rounded-2xl shadow-[1px_4px_10px_lightgray] p-4 font-sans relative">
      <div className="flex justify-between items-start w-full">
        <h2 className="font-medium text-xl">PROJECTS</h2>
        <div className="text-xs space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-700 mr-2" />
            Open
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-400 mr-2" />
            In Progress
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#127f2c] mr-2" />
            Completed
          </div>
        </div>
      </div>

      <div className="w-full h-56 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={100}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute text-center">
          <p className="text-sm font-semibold">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-gray-500">{selected}</p>
      </div>
    </div>
  );
};

export default ProjectStatusChart;