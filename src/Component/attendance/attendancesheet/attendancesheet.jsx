"use client";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function AttendanceComponent({
  onDateChange,
  onRemarkChange,
  initialDate,
}) {
  const today = new Date().toISOString().split("T")[0];
  const [remarkType, setRemarkType] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialDate || today);

  useEffect(() => {
    onDateChange(initialDate || today);
  }, []);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    onDateChange(date || "");
  };

  const handleRemarkChange = (e) => {
    const remark = e.target.value;
    setRemarkType(remark);
    onRemarkChange(remark);
  };

  const underlineRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="container mx-auto px-4 mt-5 max-w-6xl">
      <div className="flex flex-col md:flex-row md:justify-evenly md:items-center gap-[500px]">
        <div className="relative mb-4 md:mb-0">
          <h2 className="text-2xl font-bold whitespace-nowrap mb-1 relative inline-block text-gray-800">
            <span
              ref={underlineRef}
              className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
            ></span>
            View Attendance
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border p-2 rounded-md shadow-sm focus:outline-none text-gray-500 w-full sm:w-auto"
          />

          <select
            value={remarkType}
            onChange={handleRemarkChange}
            className="border p-2 rounded-md shadow-sm focus:outline-none text-gray-500 w-full sm:w-auto"
          >
            <option value="">All Remarks</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>
      </div>
    </div>
  );
}
