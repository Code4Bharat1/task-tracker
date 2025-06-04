'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { axiosInstance } from '@/lib/axiosInstance';

export default function SalaryPage() {
  const [filter, setFilter] = useState('Filter');
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Underline animation
  const underlineRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  // Fetch salary data from backend
  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        setLoading(true);
        
        const response = await axiosInstance.get('/salary/getSalaryDetails')
        const result = await response.data;

        
        // Transform backend data to match frontend format
        const transformedData = result.data.map((salary, index) => ({
          sr: index + 1,
          month: formatPayslipMonth(salary.payslipMonth),
          salary: `₹${salary.netSalary.toLocaleString()}`,
          time: formatTime(salary.createdAt),
          status: salary.status || 'paid',
          id: salary._id
        }));

        setSalaryData(transformedData);
      } catch (err) {
        console.error('Error fetching salary data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryData();
  }, []);

  // Helper function to format payslip month from YYYY-MM to MM/DD/YY
  const formatPayslipMonth = (payslipMonth) => {
    if (!payslipMonth) return '';
    const [year, month] = payslipMonth.split('-');
    const shortYear = year.slice(2);
    return `${month}/01/${shortYear}`;
  };

  // Helper function to format time from createdAt
  const formatTime = (createdAt) => {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Filter data based on selected year
  const filteredData = filter === 'Filter' 
    ? salaryData 
    : salaryData.filter((row) => {
        const year = `20${row.month.split('/')[2]}`;
        return year === filter;
      });

  // Get unique years from salary data for filter options
  const getAvailableYears = () => {
    const years = salaryData.map(row => `20${row.month.split('/')[2]}`);
    return [...new Set(years)].sort();
  };

  if (loading) {
    return (
      <div className="pt-12 p-6 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading salary data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-12 p-6 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <h2 className="text-4xl font-bold mb-1 relative inline-block text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
          ></span>
          Salary
        </h2>

        <div className="flex justify-between items-start mb-4 mt-7">
          <button
            className="cursor-pointer flex items-center gap-2 bg-[#018ABE] hover:bg-blue-400 text-white px-9 py-3 rounded-md shadow-md font-medium"
            onClick={() => router.push('/salarypage/bankinformation')}
          >
            <img src="/bankinformation.png" alt="Bank Icon" className="w-6 h-6" />
            Bank Information
          </button>

          <div className="flex flex-col items-end gap-2 relative">
            <button 
              className="cursor-pointer flex items-center gap-2 bg-[#018ABE] hover:bg-blue-400 text-white px-9 py-3 rounded-md shadow-md font-medium mr-9"
              onClick={() => router.push('/salarypage/salary')}
            >
              <img src="/salaryslip.png" alt="Salary Slip Icon" className="w-6 h-6" />
              See salary slip
            </button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded shadow-md px-16 py-2 text-md mt-12 mr-17 appearance-none relative z-10"
            >
              <option>Filter</option>
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
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

        <div className="overflow-x-auto mt-12 rounded-xl shadow-md shadow-gray-400">
          <table className="border-none text-center border-collapse min-w-full">
            <thead className="bg-[#018ABE] text-white">
              <tr className='border-t-2 z-23'>
                <th className="border-t-white border-r-black border-b-black border-l-[#018ABE] border px-4 py-2">Sr.No</th>
                <th className="border-t-white border-r-black border-b-black border-l-0 border px-4 py-2">Months</th>
                <th className="border-t-white border-r-black border-b-black border-l-0 border px-4 py-2">Salary</th>
                <th className="border-t-white border-b-black border-l-0 border px-4 py-2 border-r-[#018ABE]">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-gray-100 last:[&>td]:border-b-white">
                    <td className="border border-l-white px-4 py-2">{row.sr}</td>
                    <td className="border border-black px-4 py-2">{row.month}</td>
                    <td className="border border-black px-4 py-2 text-green-600 font-medium">
                      Paid {row.salary}
                    </td>
                    <td className="border border-r-white px-4 py-2">{row.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-gray-500 font-medium">
                    {filter === 'Filter' 
                      ? 'No salary records found' 
                      : `No salary records found for ${filter}`
                    }
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