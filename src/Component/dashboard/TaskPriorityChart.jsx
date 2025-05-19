'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PRIORITY_COLORS = {
  High: "red",
  Medium: "orange",
  Low: "green",
  Unknown: "#cbd5e1",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 px-3 py-1 rounded shadow text-sm">
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

const TaskPriorityChart = ({ selected = "This Year", tasks = [] }) => {
  const filteredTasks = filterTasksByPeriod(tasks, selected);

  const priorityCounts = filteredTasks.reduce((acc, task) => {
    const priority = task.priority || "Unknown";
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const priorityOrder = ["High", "Medium", "Low", "Unknown"];
  const priorityData = Object.entries(priorityCounts)
    .map(([name, value]) => ({
      name,
      value,
      color: PRIORITY_COLORS[name] || PRIORITY_COLORS.Unknown,
    }))
    .sort((a, b) => priorityOrder.indexOf(a.name) - priorityOrder.indexOf(b.name));

  const total = priorityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-auto h-[390px] bg-white rounded-2xl shadow-[1px_4px_10px_lightgray] p-4 font-sans relative">
      <div className="flex justify-between items-start w-full">
        <h2 className="font-medium text-xl">TASK PRIORITY</h2>
        <div className="text-xs space-y-1">
          {priorityData.map((item) => (
            <div key={item.name} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              {item.name}: {item.value}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-56 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={priorityData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8884d8" >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="absolute text-center top-4 right-6">
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

export default TaskPriorityChart;