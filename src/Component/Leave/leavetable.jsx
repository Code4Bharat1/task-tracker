'use client';
import { useEffect, useState, useRef } from "react";
import { Toaster, toast } from 'react-hot-toast';
import { axiosInstance } from "@/lib/axiosInstance";
import axios from "axios";

export default function LeaveTable() {
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [leaveType, setLeaveType] = useState('');
  const [approvalTo, setApprovalTo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  const [wordCount, setWordCount] = useState(0);
  const fileInputRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  const approvers = [
    { name: 'Ayaan Raje', id: 'Ayaan Raje' },
    { name: 'Prashant Patil', id: 'Prashant Patil' },
    { name: 'Shams Ali Shaikh', id: 'Shams Ali Shaikh' },
    { name: 'Awab Fakih', id: 'Awab Fakih' },
  ];

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/leave/userLeave`, {
          withCredentials: true,
        });
        setLeaves(response.data?.leaves || []);
      } catch (error) {
        console.error("Error fetching leaves:", error);
        toast.error('Failed to fetch leave data.');
      }
    };
    fetchLeaves();
  }, []);

  const refreshLeaves = () => {
    const updatedLeaves = JSON.parse(localStorage.getItem("leaves") || "[]");
    setLeaves(updatedLeaves);
  };

  const submitLeave = async () => {  // Made this function async
    if (
      !leaveType || leaveType === 'Select' ||
      !approvalTo || approvalTo === 'Select' ||
      !fromDate || !toDate || !reason.trim()
    ) {
      toast.error('Please fill out all fields before submitting.', { duration: 3000 });
      return;
    }

    // Check if Reason For Leave has at least 24 words
    if (wordCount < 24) {
      toast.error('Reason for Leave must be at least 24 words long.', { duration: 3000 });
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      toast.error('To Date cannot be before From Date.', { duration: 3000 });
      return;
    }

    if (leaveType === 'Sick Leave' && !fileInputRef.current?.files[0]) {
      toast.error('Attachment is required for Sick Leave.');
      return;
    }

    const selectedApprover = approvers.find(a => a.name === approvalTo);
    if (!selectedApprover) {
      toast.error('Invalid approver selected.');
      return;
    }

    const formData = new FormData();
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);
    formData.append('leaveType', leaveType);
    formData.append('reason', reason);
    formData.append('managerId', selectedApprover.id);

    if (fileInputRef.current?.files[0]) {
      formData.append('attachment', fileInputRef.current.files[0]);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/leave/apply`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        toast.success('Leave Submitted Successfully!');
        setShowModal(false);
        setLeaveType('');
        setApprovalTo('');
        setFromDate('');
        setToDate('');
        setReason('');
        setWordCount(0);

        // Refresh leaves data
        try {
          const updatedResponse = await axiosInstance.get("/leave/userLeave");
          setLeaves(updatedResponse.data.leaves || []);
        } catch (error) {
          console.error("Error refreshing leaves:", error);
          toast.error('Failed to refresh leave data.');
        }
      } else {
        toast.error('Failed to submit leave.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Error submitting leave. Try again later.');
    }
  };

  const handleReasonChange = (e) => {
    const updatedReason = e.target.value;
    setReason(updatedReason);
    const words = updatedReason.trim().split(/\s+/);
    setWordCount(words.filter(word => word).length);
  };

  return (
    <div className="p-6 bg-white min-h-screen relative">
      <Toaster />
      <h1 className="text-2xl font-bold mb-2">My Leave</h1>
      <div className="w-24 h-1 bg-red-500 mb-6"></div>

      <button
        onClick={() => setShowModal(true)}
        className="mb-6 px-5 py-2 bg-[#018ABE] text-white rounded-full hover:bg-[#017ba9] transition"
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
                  {approvers.map(approver => (
                    <option key={approver.id} value={approver.name}>{approver.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="font-bold block mb-1">
                Attachment {leaveType === 'Sick Leave' ? '(required)' : '(optional)'}
              </label>
              <input
                type="file"
                name="attachment"
                ref={fileInputRef}
                className="block w-full text-sm bg-gray-50 text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="mb-6 mt-6 flex items-start space-x-4">
              <label htmlFor="reason" className="font-bold mt-2 whitespace-nowrap">Reason For Leave</label>
              <div className="flex flex-col">
                <textarea
                  id="reason"
                  value={reason}
                  onChange={handleReasonChange}
                  className="rounded px-4 py-2 w-[750px] h-[130px] resize-none shadow-lg"
                ></textarea>
                <div className="text-right text-gray-600 text-sm">{wordCount}/24 words</div>
              </div>
            </div>

            <div className="text-center space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="border border-blue-500 text-blue-500 bg-white px-8 py-3 shadow-md hover:bg-blue-50 font-bold self-start mt-6 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={submitLeave}
                className="bg-[#018ABE] font-bold text-white px-8 py-3 hover:bg-[#017ba9] self-start mt-3 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg shadow-lg overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-separate border-spacing-0">
            <thead style={{ backgroundColor: '#018ABE' }} className="text-white">
              <tr>
                <th className="p-3 border-r border-white rounded-tl-lg">Sr No.</th>
                <th className="p-3 border-r border-white">Request To</th>
                <th className="p-3 border-r border-white">Reason</th>
                <th className="p-3 border-r border-white">Apply Date</th>
                <th className="p-3 border-r border-white">From</th>
                <th className="p-3 border-r border-white">To</th>
                <th className="p-3 border-r border-white">Days</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-gray-500 py-4">
                    No leave applications found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave, index) => (
                  <tr key={leave._id || index} className="hover:bg-gray-50">
                    <td className="p-3 border-t">{index + 1}</td>
                    <td className="p-3 border-t">{leave.managerId || 'N/A'}</td>
                    <td className="p-3 border-t">{leave.reason}</td>
                    <td className="p-3 border-t">{leave.createdAt?.split('T')[0]}</td>
                    <td className="p-3 border-t">{new Date(leave.fromDate).toLocaleDateString('en-GB')}</td>
                    <td className="p-3 border-t">{new Date(leave.toDate).toLocaleDateString('en-GB')}</td>
                    <td className="p-3 border-t">{leave.days || '-'}</td>
                    <td className="p-3 border-t">
                      <span
                        className={`px-2 py-1 rounded-full text-white ${leave.status === 'Accepted' ? 'bg-green-500' :
                            leave.status === 'Rejected' ? 'bg-red-500' :
                              leave.status === 'Pending' ? 'bg-yellow-500' :
                                'bg-gray-500'
                          }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}