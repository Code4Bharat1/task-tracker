'use client';
import { useGSAP } from "@gsap/react";
import { useEffect, useState, useRef } from "react";
import { Toaster, toast } from 'react-hot-toast';
import gsap from "gsap";

export default function LeaveTable() {
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [leaveType, setLeaveType] = useState('');
  const [approvalTo, setApprovalTo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  const [wordCount, setWordCount] = useState(0); // For word count tracking

  const fileInputRef = useRef(null); // Reference for the file input

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const storedLeaves = JSON.parse(localStorage.getItem("leaves") || "[]");
    setLeaves(storedLeaves);
  }, []);

  const refreshLeaves = () => {
    const updatedLeaves = JSON.parse(localStorage.getItem("leaves") || "[]");
    setLeaves(updatedLeaves);
  };

  const submitLeave = () => {
    if (
      !leaveType || leaveType === 'Select' ||
      !approvalTo || approvalTo === 'Select' ||
      !fromDate || !toDate || !reason.trim()
    ) {
      toast.error('Please fill out all fields before submitting.', { duration: 3000 });
      return;
    }

  
  

    // Check if Reason For Leave has at least 24 characters
    if (reason.split(/\s+/).length < 24) {
      toast.error('Reason for Leave must be at least 24 words long.', { duration: 3000 });
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      toast.error('To Date cannot be before From Date.', { duration: 3000 });
      return;
    }

    const newLeave = {
      leaveType,
      approvalTo,
      fromDate,
      toDate,
      reason,
      applyDate: today,
      totalDays: calculateDays(fromDate, toDate),
      status: 'Pending',
    };

    const existingLeaves = JSON.parse(localStorage.getItem('leaves') || '[]');
    existingLeaves.push(newLeave);
    localStorage.setItem('leaves', JSON.stringify(existingLeaves));

    toast.success('Leave Submitted Successfully!', { duration: 3000 });
    setShowModal(false);

    // Reset form
    setLeaveType('');
    setApprovalTo('');
    setFromDate('');
    setToDate('');
    setReason('');

    refreshLeaves();
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
    return diff || 0;
  };

  const handleDeleteFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  // Update word count whenever the reason text area changes
  const handleReasonChange = (e) => {
    const updatedReason = e.target.value;
    setReason(updatedReason);

    // Split by spaces to count words
    const words = updatedReason.trim().split(/\s+/);
    setWordCount(words.filter(word => word).length);
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
    <div className="p-6 bg-white min-h-screen relative">
      <Toaster />
      <h1 className="text-2xl font-bold mb-2 relative inline-block text-gray-800">
                <span
                    ref={underlineRef}
                    className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full"
                ></span>
              My Leave
            </h1>
      <div className="w-190 h-1 bg-white mb-6"></div>

      <button
        onClick={() => setShowModal(true)}
        className="mb-6 px-5 py-2 bg-[#018ABE] cursor-pointer text-white rounded-full hover:bg-[#017ba9] transition"
      >
        Leave Application
      </button>

      {/* LEAVE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800/50 backdrop-blur-[3px] flex justify-center items-center z-50">
          <div className="bg-white shadow-[0_0_20px_rgba(0,0,0,0.2)] rounded-lg p-10 w-[1000px] h-[600px] relative">
            <div className="flex justify-center">
              <h2 className="text-3xl font-bold mb-8 border-b-2 border-black inline-block pb-1">
                Leave Application
              </h2>
            </div>

            <div className="flex space-x-10 mb-4 gap-45">
              <div className="flex items-center space-x-2">
                <label htmlFor="fromDate" className="font-bold px-2 whitespace-nowrap">From Date</label>
                <input
                  type="date"
                  id="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  min={today}
                  className="rounded px-4 py-2 w-[250px] shadow-md outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor="toDate" className="font-bold whitespace-nowrap">To Date</label>
                <input
                  type="date"
                  id="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || today}
                  className="rounded px-4 py-2 w-[250px] shadow-md outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            <div className="mb-4 flex items-center space-x-10 gap-20">
              <div className="flex items-center space-x-2">
                <label htmlFor="leaveType" className="font-bold px-1 whitespace-nowrap">Leave Type</label>
                <select
                  id="leaveType"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="rounded px-4 py-2 w-[250px] shadow-lg outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option>Select</option>
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <label htmlFor="approvalTo" className="font-bold px-1.5 whitespace-nowrap">Select for Approval</label>
                <select
                  id="approvalTo"
                  value={approvalTo}
                  onChange={(e) => setApprovalTo(e.target.value)}
                  className="rounded px-4 py-2 w-[250px] shadow-lg outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option>Select</option>
                  <option>Ayaan Raje</option>
                  <option>Prashant Patil</option>
                  <option>Shams Ali Shaikh</option>
                  <option>Awab Fakih</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label htmlFor="fileInput" className="font-semibold text-lg">Attachment</label>

              <div className="flex items-center space-x-2">
                {leaveType === 'Sick Leave' && (
                  <div className="flex items-center border rounded-md bg-[#877575] px-2 py-2 w-[300px] shadow-md">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="fileInput"
                      className="text-black file:mr-4 file:py-1 file:px-3
                                file:rounded file:border file:border-gray-300
                                file:text-sm file:font-medium
                                file:bg-white file:text-black
                                hover:file:bg-gray-200"
                    />
                  </div>
                )}
                {leaveType === 'Casual Leave' && (
                  <p className="text-gray-500">No file required for Casual Leave</p>
                )}

                <button type="button" onClick={handleDeleteFile} className="text-black hover:text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12.5a1 1 0 01-1 .5H7.5a1 1 0 01-1-.5L5 9zm5 2v8h2v-8H10zm4 0v8h2v-8h-2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6 mt-6 flex items-start space-x-4">
  <label htmlFor="reason" className="font-bold mt-2 whitespace-nowrap">Reason For Leave</label>
  <div className="flex flex-col">
    <textarea
      id="reason"
      value={reason}
      onChange={handleReasonChange}
      className="rounded px-4 py-2 w-[750px] h-[130px] resize-none shadow-lg"></textarea>

    <div className="text-right text-gray-600 text-sm">{wordCount}/ 24</div>
  </div>
</div>


            <div className="text-center space-x-6">
              <button
                onClick={() => setShowModal(false)}
                className="border border-blue-500 text-blue-500 bg-white px-8 py-3  shadow-md hover:bg-blue-50 font-bold self-start mt-6 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={submitLeave}
                className="bg-[#018ABE] font-bold text-white px-8 py-3  hover:bg-#018ABE self-start mt-3 rounded-lg"
              >
                Submit
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LEAVE TABLE */}
      <div className="rounded-lg shadow-lg overflow-hidden">
      <table className="table-fixed w-full border-collapse">
  <thead className="bg-[#018ABE] text-white">
    <tr>
      <th className="w-[5%] py-2 px-2">Sr No.</th>
      <th className="w-[10%] py-2 px-2">Request to</th>
      <th className="w-[30%] py-2 px-2">Reason for Leave</th>
      <th className="w-[10%] py-2 px-2">Apply Date</th>
      <th className="w-[10%] py-2 px-2">From Date</th>
      <th className="w-[10%] py-2 px-2">To Date</th>
      <th className="w-[10%] py-2 px-2">Total Days</th>
      <th className="w-[10%] py-2 px-2">Status</th>
    </tr>
  </thead>
  <tbody className="text-sm">
    {leaves.map((leave, index) => (
      <tr key={index} className="">
        <td className="relative py-2 text-center px-2">{index + 1}</td>
        <td className="relative py-2  text-center px-2 break-words"><span className="custom-border-left"></span>{leave.approvalTo}</td>
        <td className="relative py-2 px-2 break-words"><span className="custom-border-left"></span>{leave.reason}</td>
        <td className="relative py-2  text-center px-2"><span className="custom-border-left"></span>{leave.applyDate}</td>
        <td className="relative py-2 text-center px-2"><span className="custom-border-left"></span>{leave.fromDate}</td>
        <td className="relative py-2  text-center  px-2"><span className="custom-border-left"></span>{leave.toDate}</td>
        <td className="relative py-2  text-center px-2"><span className="custom-border-left"></span>{leave.totalDays}</td>
        <td className="relative py-2  text-center px-2"><span className="custom-border-left"></span>{leave.status}</td>
      </tr>
    ))}
  </tbody>
</table>


      </div>
    </div>
  );
}
