"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PRIORITY_COLORS = {
  High: "red",
  Medium: "orange",
  Low: "green",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 px-2 py-1 rounded shadow text-xs">
        <strong>{name}:</strong> {value} task{value > 1 ? "s" : ""}
      </div>
    );
  }
  return null;
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
      start.setMonth(0);
      start.setDate(1);
      break;
    default:
      start.setMonth(0);
      start.setDate(1);
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

const MobileTaskPriorityChart = ({ selected = "This Year", tasks = [] }) => {
  const filteredTasks = filterTasksByPeriod(tasks, selected);

  const priorityCounts = filteredTasks.reduce((acc, task) => {
    const rawPriority = task.priority;
    const priority = ["High", "Medium", "Low"].includes(rawPriority)
      ? rawPriority
      : "";
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const priorityOrder = ["High", "Medium", "Low"];

  // Ensure all priorities are present even if count is 0
  const priorityData = priorityOrder.map((priority) => ({
    name: priority,
    value: priorityCounts[priority] || 0,
    color: PRIORITY_COLORS[priority],
  }));

  const total = priorityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full min-h-[320px] sm:h-[390px] bg-white rounded-2xl shadow-[1px_4px_10px_lightgray] p-3 sm:p-4 font-sans relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start w-full mb-4 sm:mb-0">
        <h2 className="font-medium text-lg sm:text-xl mb-3 sm:mb-0">
          TASK PRIORITY
        </h2>

        {/* Legend - Mobile: horizontal, Desktop: vertical */}
        <div className="flex sm:block space-x-4 sm:space-x-0 sm:space-y-1 text-xs">
          {priorityData.map((item) => (
            <div key={item.name} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="whitespace-nowrap">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full h-48 sm:h-56 flex items-center justify-center relative mt-2 sm:mt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={priorityData}
            margin={{
              top: 20,
              right: window.innerWidth < 640 ? 15 : 30,
              left: window.innerWidth < 640 ? 15 : 20,
              bottom: 5,
            }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: window.innerWidth < 640 ? 12 : 14 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: window.innerWidth < 640 ? 12 : 14 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8884d8">
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Total Display */}
        <div className="absolute text-center top-2 sm:top-4 right-2 sm:right-6 bg-white bg-opacity-90 rounded px-2 py-1 sm:bg-transparent sm:px-0 sm:py-0">
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

export default MobileTaskPriorityChart;
