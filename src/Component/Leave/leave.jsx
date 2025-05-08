'use client';
import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Leave() {
  // Toast message functions
  const handleApprove = () => {
    toast.success("Leave Approved");
  };

  const handleReject = () => {
    toast.error("Leave Rejected");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Leave Request Heading aligned with white box */}
      <h1 className="text-2xl font-bold mb-4 border-b-2 border-red-500 w-fit">Leave Request</h1>

      {/* White Box */}
      <div className="bg-white rounded-lg shadow p-8 border border-gray-300 h-[500px] w-[700px]">
        <div className="space-y-4">
          {/* Submitted On */}
          <div>
            <p className="font-semibold">Submitted On<span className="font-normal ml-7">: 01/05/2025</span></p>
          </div>

          {/* Employee Info */}
          <div>
            <p className="font-semibold">Emp Information :</p>
            <div className="ml-1 space-y-2 mt-4">
              <p>Emp Regn. No. <span className="ml-3">: 25306</span> <span className="ml-68">DOJ : 01/01/2025</span></p>
              <p>Emp Name <span className="ml-10">: Prashant P</span> <span className="ml-50">Department : IT Service</span></p>
              <p>Designation <span className="ml-9">: Graphic Designer</span></p>
            </div>
          </div>

          {/* Leave Period Table */}
          <div>
            <h2 className="text-lg font-bold underline mb-2">Leave Period</h2>
            <div className="rounded-lg overflow-hidden">
              <table className="w-full text-center border-collapse border-none">
                <thead>
                  <tr className="bg-cyan-700 text-black border-b border-gray-300">
                    <th className="py-2 px-4 border-r border-black">From</th>
                    <th className="py-2 px-4 border-r border-black">To</th>
                    <th className="py-2 px-4">Type of Leave</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-blue-100 border-b border-gray-300">
                    <td className="py-2 px-4 border-r border-black">05/05/2025</td>
                    <td className="py-2 px-4 border-r border-black">08/05/2025</td>
                    <td className="py-2 px-4">Sick Leave</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-7 mt-13">
            <button
              className="text-black font-semibold py-2 px-6 rounded hover:brightness-90"
              style={{ backgroundColor: "#08AF1C" }}
              onClick={handleApprove}  // Handle approve button click
            >
              Approve
            </button>

            <button
              className="text-white font-semibold py-2 px-6 rounded hover:brightness-90"
              style={{ backgroundColor: "#EF0D0D" }}
              onClick={handleReject}  // Handle reject button click
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* ToastContainer to display the toast notifications */}
      <ToastContainer />
    </div>
  );
}