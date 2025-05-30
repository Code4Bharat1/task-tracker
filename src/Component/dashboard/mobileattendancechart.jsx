"use client";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const ATTENDANCE_COLORS = {
  Present: "blue",
  Late: "orange",
  Absent: "red",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white border border-gray-200 px-2 py-1 rounded shadow text-xs">
        <strong>{name}:</strong> {value} day{value !== 1 ? "s" : ""}
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const RADIAN = Math.PI / 180;
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
      start.setMonth(0);
      start.setDate(1);
      break;
    default:
      start.setMonth(0);
      start.setDate(1);
  }
  return start;
};

const calculateWorkingDays = (start, end) => {
  let count = 0;
  const date = new Date(start);
  while (date <= end) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) count++;
    date.setDate(date.getDate() + 1);
  }
  return count;
};

const MobileAttendanceChart = ({
  selected = "This Year",
  attendanceRecords = [],
}) => {
  const calculateAttendanceStats = () => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return { present: 0, late: 0, absent: 0, percentage: 0 };
    }

    const today = new Date();
    const startDate = getStartDateByPeriod(today, selected);

    const filteredRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= today;
    });

    const dateRemarks = new Map();

    filteredRecords.forEach((record) => {
      const dateStr = new Date(record.date).toDateString();
      if (!dateRemarks.has(dateStr)) {
        dateRemarks.set(dateStr, record.remark);
      }
    });

    let present = 0,
      late = 0;

    for (const remark of dateRemarks.values()) {
      if (remark === "Present") present++;
      else if (remark === "Late") late++;
    }

    const userStartDate = new Date(
      Math.min(...attendanceRecords.map((r) => new Date(r.date).getTime()))
    );
    const effectiveStart =
      userStartDate > startDate ? userStartDate : startDate;

    const totalWorkingDays = calculateWorkingDays(effectiveStart, today);
    const absent = Math.max(0, totalWorkingDays - present - late);

    const percentage =
      totalWorkingDays > 0
        ? Math.round(((present + late) / totalWorkingDays) * 100)
        : 0;

    return { present, late, absent, percentage };
  };

  const attendanceData = calculateAttendanceStats();
  const data = [
    {
      name: "Present",
      value: attendanceData.present,
      color: ATTENDANCE_COLORS.Present,
    },
    { name: "Late", value: attendanceData.late, color: ATTENDANCE_COLORS.Late },
    {
      name: "Absent",
      value: attendanceData.absent,
      color: ATTENDANCE_COLORS.Absent,
    },
  ].filter((item) => item.value > 0);

  const totalDays =
    attendanceData.present + attendanceData.late + attendanceData.absent;

  return (
    <div className="w-full min-h-[320px] sm:h-[390px] bg-white rounded-2xl shadow-[1px_4px_10px_lightgray] p-3 sm:p-4 font-sans relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start w-full mb-4 sm:mb-0">
        <h2 className="font-medium text-lg sm:text-xl mb-3 sm:mb-0">
          ATTENDANCE
        </h2>

        {/* Legend - Mobile: horizontal, Desktop: vertical */}
        <div className="flex sm:block space-x-4 sm:space-x-0 sm:space-y-1 text-xs">
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0"
              style={{ backgroundColor: ATTENDANCE_COLORS.Present }}
            ></div>
            <span className="whitespace-nowrap">
              Present: {attendanceData.present}
            </span>
          </div>
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0"
              style={{ backgroundColor: ATTENDANCE_COLORS.Late }}
            ></div>
            <span className="whitespace-nowrap">
              Late: {attendanceData.late}
            </span>
          </div>
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0"
              style={{ backgroundColor: ATTENDANCE_COLORS.Absent }}
            ></div>
            <span className="whitespace-nowrap">
              Absent: {attendanceData.absent}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full h-60 sm:h-56 flex items-center justify-center relative mt-2 sm:mt-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={window.innerWidth < 640 ? 30 : 40}
              outerRadius={window.innerWidth < 640 ? 80 : 100}
              dataKey="value"
              nameKey="name"
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Total Display - Centered in pie chart */}
        <div className="absolute text-center bg-white bg-opacity-90 rounded-full px-2 py-1 sm:bg-transparent sm:px-0 sm:py-0">
          <p className="text-xs sm:text-sm font-semibold">Total</p>
          <p className="text-lg sm:text-2xl font-bold">{totalDays}</p>
        </div>
      </div>

      {/* Period Display */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs sm:text-sm text-gray-500">{selected}</p>
      </div>
    </div>
  );
};

export default MobileAttendanceChart;
