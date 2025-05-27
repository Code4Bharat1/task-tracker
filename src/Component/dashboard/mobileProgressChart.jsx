"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";

// Data for different time periods
const demoDataMap = {
  "This Year": [
    { name: "Jan", red: 20, green: 30, blue: 40 },
    { name: "Feb", red: 35, green: 50, blue: 70 },
    { name: "Mar", red: 15, green: 20, blue: 10 },
    { name: "Apr", red: 30, green: 45, blue: 60 },
    { name: "May", red: 25, green: 35, blue: 50 },
    { name: "Jun", red: 50, green: 60, blue: 80 },
    { name: "Jul", red: 40, green: 55, blue: 65 },
    { name: "Aug", red: 30, green: 40, blue: 60 },
    { name: "Sep", red: 20, green: 35, blue: 55 },
    { name: "Oct", red: 45, green: 50, blue: 70 },
    { name: "Nov", red: 35, green: 45, blue: 65 },
    { name: "Dec", red: 40, green: 50, blue: 75 },
  ],
  "This Month": [
    { name: "Week 1", red: 10, green: 15, blue: 20 },
    { name: "Week 2", red: 20, green: 30, blue: 40 },
    { name: "Week 3", red: 15, green: 25, blue: 30 },
    { name: "Week 4", red: 25, green: 35, blue: 45 },
  ],
  "This Week": [
    { name: "Mon", red: 5, green: 10, blue: 15 },
    { name: "Tue", red: 10, green: 15, blue: 25 },
    { name: "Wed", red: 15, green: 20, blue: 35 },
    { name: "Thu", red: 20, green: 30, blue: 40 },
    { name: "Fri", red: 25, green: 35, blue: 45 },
    { name: "Sat", red: 30, green: 40, blue: 50 },
    { name: "Sun", red: 35, green: 45, blue: 55 },
  ],
};

const MobileProgressChart = ({ selected = "This Year" }) => {
  const data = demoDataMap[selected] || demoDataMap["This Year"];

  // Calculate total values for first and last data points
  const calculateTotal = (item) => {
    return item.red + item.green + item.blue;
  };

  const firstTotal = data.length > 0 ? calculateTotal(data[0]) : 0;
  const lastTotal = data.length > 0 ? calculateTotal(data[data.length - 1]) : 0;

  // Calculate progress percentage
  const progressPercent =
    firstTotal !== 0
      ? Math.round(((lastTotal - firstTotal) / firstTotal) * 100)
      : 0;

  const isPositive = progressPercent >= 0;

  return (
    <div className="rounded-[20px] bg-white shadow-[1px_4px_10px_lightgray] p-3 sm:p-5 w-full sm:max-w-[400px] font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-flex-start w-full mb-2 sm:mb-0">
        <h2 className="font-medium text-lg sm:text-xl mb-2 sm:mb-0">
          PROGRESS
        </h2>

        {/* Progress Indicator */}
        <span
          className="flex items-center text-sm sm:text-base font-bold"
          style={{
            color: isPositive ? "green" : "red",
          }}
        >
          {isPositive ? (
            <ArrowUp
              size={window.innerWidth < 640 ? 14 : 16}
              className="mr-1"
            />
          ) : (
            <ArrowDown
              size={window.innerWidth < 640 ? 14 : 16}
              className="mr-1"
            />
          )}
          <span className="whitespace-nowrap">
            {Math.abs(progressPercent)}% {isPositive ? "Increase" : "Decrease"}
          </span>
        </span>
      </div>

      {/* Main Percentage Display */}
      <h1 className="font-semibold text-xl sm:text-2xl my-2 sm:my-[10px] pl-2 sm:pl-[12px]">
        {Math.abs(progressPercent)}%
      </h1>

      {/* Chart Section */}
      <div className="w-full">
        <ResponsiveContainer
          width="100%"
          height={window.innerWidth < 640 ? 180 : 200}
        >
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: window.innerWidth < 640 ? 10 : 30,
              left: window.innerWidth < 640 ? 10 : 20,
              bottom: 5,
            }}
          >
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: window.innerWidth < 640 ? 11 : 12 }}
            />
            <YAxis hide />
            <Line
              type="monotone"
              dataKey="red"
              stroke="red"
              strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="green"
              stroke="limegreen"
              strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="blue"
              stroke="blue"
              strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MobileProgressChart;
