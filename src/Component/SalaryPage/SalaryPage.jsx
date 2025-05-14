
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Import for app router

export default function SalaryPage() {
  const [filter, setFilter] = useState('Filter');
  const router = useRouter(); // ✅ Initialize router

  const salaryData = [
    { sr: 1, month: '05/11/25', salary: '₹20,000', time: '10:00AM' },
    { sr: 2, month: '05/12/25', salary: '₹20,000', time: '11:00AM' },
    { sr: 3, month: '05/01/26', salary: '₹22,000', time: '10:10AM' },
    { sr: 4, month: '05/02/26', salary: '₹20,000', time: '11:00AM' },
    { sr: 5, month: '05/03/26', salary: '₹20,000', time: '09:00AM' },
    { sr: 6, month: '05/04/26', salary: '₹20,000', time: '11:00AM' },
  ];

  const filteredData =
    filter === 'Filter'
      ? salaryData
      : salaryData.filter((row) => {
          const year = `20${row.month.split('/')[2]}`;
          return year === filter;
        });

  return (
    <div className="pt-12 p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-extrabold text-black mb-6">
          <span className="relative inline-block">
            Salary
            <span className="absolute left-5 -bottom-1 w-19 h-[2px] bg-yellow-400 mt-2"></span>
          </span>
        </h1>

        <div className="flex justify-between items-start mb-4">
        <button 
        className=" cursor-pointer flex items-center gap-2 bg-[#018ABE] hover:bg-blue-600 text-white px-7 py-2.5 rounded-md shadow-md font-medium"
        onClick={() => router.push('/bankinformation')} // ✅ Routing on click
        >
  <img src="/bankinformation.png" alt="Bank Icon" className="w-6 h-6" />
  Bank Information
</button>



          <div className="flex flex-col items-end gap-2 relative">
          <button className=" cursor-pointer flex items-center gap-2 bg-[#018ABE] hover:bg-blue-600 text-white px-12 py-2.5 rounded-md shadow-md font-medium mr-9"
            onClick={() => router.push('/salary')} // ✅ Routing on click
          >
  <img src="/salaryslip.png" alt="Salary Slip Icon" className="w-6 h-6" />
  See salary slip
</button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className=" rounded shadow-md px-16 py-2 text-md mt-12 mr-17 appearance-none relative z-10"
            >
              <option>Filter</option>
              <option>2023</option>
              <option>2024</option>
              <option>2025</option>
              <option>2026</option>
            </select>
            <div className="absolute right-19 top-[113px] pointer-events-none z-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-12">
        {/* min-w-full  */}
          <table className="  border border-black text-center rounded-xl border-collapse min-w-full "> 
            <thead className="bg-[#018ABE] text-white">
              <tr>
                <th className="border border-black px-4 py-2">Sr.No</th>
                <th className="border border-black px-4 py-2">Months</th>
                <th className="border border-black px-4 py-2">Salary</th>
                <th className="border border-black px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border border-black px-4 py-2">{row.sr}</td>
                    <td className="border border-black px-4 py-2">{row.month}</td>
                    <td
                      className={`border border-black px-4 py-2 text-green-600 font-medium ${
                        row.salary === '₹22,000' ? 'border-purple-500 border-2 rounded' : ''
                      }`}
                    >
                      Paid {row.salary}
                    </td>
                    <td className="border border-black px-4 py-2">{row.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-gray-500 font-medium">
                    No salary records found for {filter}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        
      </div>
    </div>
  );
}