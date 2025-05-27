"use client";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["blue", "orange", "green"];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={window.innerWidth < 640 ? 12 : 14}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const getStartDateByPeriod = (today, period) => {
  const start = new Date(today);
  switch (period) {
    case "This Week":
      start.setDate(start.getDate() - start.getDay());
      break;
    case "This Month":
      start.setDate(1);
      break;
    case "This Year":
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

  return tasks.filter((task) => {
    const taskDate = task.createdAt
      ? new Date(task.createdAt)
      : task.created_at
      ? new Date(task.created_at)
      : null;
    if (!taskDate) return true;
    return taskDate >= startDate && taskDate <= today;
  });
};

const MobileProjectStatusChart = ({ selected = "This Year", tasks = [] }) => {
  const filteredTasks = filterTasksByPeriod(tasks, selected);

  const statusCount = {
    Open: 0,
    "In Progress": 0,
    Completed: 0,
  };

  filteredTasks.forEach((task) => {
    if (statusCount[task.status] !== undefined) {
      statusCount[task.status]++;
    }
  });

  const chartData = [
    { name: "Open", value: statusCount.Open },
    { name: "In Progress", value: statusCount["In Progress"] },
    { name: "Completed", value: statusCount.Completed },
  ];

  const total = filteredTasks.length;

  return (
    <div className="w-full min-h-[320px] sm:h-full bg-white rounded-2xl shadow-[1px_4px_10px_lightgray] p-3 sm:p-4 font-sans relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full mb-4 sm:mb-0">
        <h2 className="font-medium text-lg sm:text-xl mb-3 sm:mb-0">
          PROJECTS
        </h2>

        {/* Legend - Mobile: horizontal, Desktop: vertical */}
        <div className="flex sm:block space-x-4 sm:space-x-0 sm:space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-700 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Open</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-400 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#127f2c] mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Completed</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full h-48 sm:h-56 flex items-center justify-center relative mt-2 sm:mt-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={window.innerWidth < 640 ? 30 : 40}
              outerRadius={window.innerWidth < 640 ? 80 : 100}
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

        {/* Total Display - Centered in pie chart */}
        <div className="absolute text-center bg-white bg-opacity-90 rounded px-2 py-1 sm:bg-transparent sm:px-0 sm:py-0">
          <p className="text-xs sm:text-sm font-semibold">Total</p>
          <p className="text-lg sm:text-2xl font-bold">{total}</p>
        </div>
      </div>

      {/* Period Display */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs sm:text-sm text-gray-500">{selected}</p>
      </div>
    </div>
  );
};

export default MobileProjectStatusChart;
