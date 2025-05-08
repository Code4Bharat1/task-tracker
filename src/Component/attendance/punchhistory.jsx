"use client";
import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import gsap from "gsap";
import { axiosInstance } from "@/lib/axiosInstance";
import toast from "react-hot-toast";

export default function PunchHistory() {
  const [selectedDate, setSelectedDate] = useState("");
  const [remarkFilter, setRemarkFilter] = useState("");
  const underlineRef = useRef(null);
  const [punchData, setPunchData] = useState([
    {
      date: "",
      punchInLocation: "",
      punchIn: "",
      punchOutLocation: "",
      punchOut: "",
      remark: ""
    }
  ]);

  useEffect(() => {
    const fetchPunchData = async () => {
      try {
        const response = await axiosInstance("/attendance/punchHistory");
        setPunchData(response?.data || []);
        console.log(punchData.punchOut);
      } catch (error) {
        console.error("Failed to fetch punch data:", error);
        toast.error("Failed to fetch punch data.", { duration: 2000 });
      }
    };
    fetchPunchData();
  }, []);

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  const filteredData = punchData.filter((item) =>
    (selectedDate ? item.date === selectedDate : true) &&
    (remarkFilter ? item.remark === remarkFilter : true)
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-IN");
  };


  const formatTime = (dateStr) => {
    if (!dateStr) return ""; // check for null, undefined, or 0
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "" : date.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
  };


  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(worksheet, [["Date", "In Location", "In Time", "Out Location", "Out Time", "Remark"]], { origin: "A1" });
    XLSX.utils.book_append_sheet(workbook, worksheet, "PunchHistory");
    XLSX.writeFile(workbook, "punch_history.xlsx");
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold text-center mb-8 relative text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full"
          ></span>
          Punch History
        </h1>
      </div>

      <div className="bg-white rounded-xl w-full max-w-5xl p-6 border-2 border-gray-300 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="date"
            value={selectedDate ? selectedDate.split("/").reverse().join("-") : ""}
            onChange={(e) => {
              const [year, month, day] = e.target.value.split("-");
              setSelectedDate(`${day}/${month}/${year}`);
            }}
            className="shadow-md p-2 rounded w-48"
          />

          <select
            value={remarkFilter}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setSelectedDate("");
                setRemarkFilter("");
              } else {
                setRemarkFilter(value);
              }
            }}
            className="shadow-md p-2 rounded w-48"
          >
            <option value="">Remark Type</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="all">Reset Filters</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border-t-2 border-[#018ABE] shadow-md">
          <table className="min-w-full text-center">
            <thead className="bg-[#058CBF] text-white">
              <tr>
                <th className="px-4 py-2 ">Date</th>
                <th className="px-4 py-2 border-l border-r border-gray-300 ">In Location</th>
                <th className="px-4 py-2 border-l border-r border-gray-300">In Time</th>
                <th className="px-4 py-2 border-l border-r border-gray-300">Out Location</th>
                <th className="px-4 py-2 border-l border-r border-gray-300">Out Time</th>
                <th className="px-4 py-2 ">Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="px-4 py-2 border border-gray-300">{formatDate(item.date)}</td>
                    <td className="px-4 py-2 border border-gray-300">{item.punchInLocation}</td>
                    <td className="px-4 py-2 border border-gray-300">{formatTime(item.punchIn)}</td>
                    <td className="px-4 py-2 border border-gray-300">{item.punchOutLocation}</td>
                    <td className="px-4 py-2 border border-gray-300">{formatTime(item.punchOut)}</td>
                    <td
                      className={`px-4 py-2 font-semibold border border-gray-300 ${item.remark === "Present"
                        ? "text-green-600"
                        : item.remark === "Late"
                          ? "text-orange-500"
                          : "text-red-600"
                        }`}
                    >
                      {item.remark}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4 mr-10">
          <button
            onClick={exportToExcel}
            className="bg-[#058CBF] text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
