'use client';
import { useEffect, useState, useRef } from "react";
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

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
    { name: 'Ayaan Raje', id: '660c1234567890abcdef1234' },
    { name: 'Prashant Patil', id: '660c1234567890abcdef5678' },
    { name: 'Shams Ali Shaikh', id: '660c1234567890abcdef9012' },
    { name: 'Awab Fakih', id: '660c1234567890abcdef3456' },
  ];

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/leave/userLeave`, {
          withCredentials: true,
        });

        setLeaves(response.data.leaves || []);
      } catch (error) {
        console.error("Error fetching leaves:", error);
        toast.error('Failed to fetch leave data.');
      }
    };
    fetchLeaves();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', showModal);
    return () => document.body.classList.remove('overflow-hidden');
  }, [showModal]);

  const submitLeave = async () => {
    if (
      !leaveType || leaveType === 'Select' ||
      !approvalTo || approvalTo === 'Select' ||
      !fromDate || !toDate || !reason.trim()
    ) {
      toast.error('Please fill out all fields before submitting.');
      return;
    }

    if (reason.trim().split(/\s+/).length < 24) {
      toast.error('Reason for Leave must be at least 24 words long.');
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      toast.error('To Date cannot be before From Date.');
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/leave/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (response.status === 201) {
        toast.success('Leave Submitted Successfully!');
        setShowModal(false);
        setLeaveType('');
        setApprovalTo('');
        setFromDate('');
        setToDate('');
        setReason('');
        setWordCount(0);

        const updatedLeaves = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/leave/userLeave`, {
          withCredentials: true,
        });
        setLeaves(updatedLeaves.data.leaves || []);
      } else {
        toast.error('Failed to submit leave.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Error submitting leave. Try again later.');
    }
  };

  const handleReasonChange = (e) => {
    const val = e.target.value;
    setReason(val);
    setWordCount(val.trim().split(/\s+/).filter(Boolean).length);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster />
      <h1 className="text-2xl font-bold mb-2">My Leave</h1>
      <div className="w-24 h-1 bg-red-500 mb-6"></div>

      <button
        onClick={() => setShowModal(true)}
        className="mb-6 px-5 py-2 bg-[#018ABE] text-white rounded-full cursor-pointer hover:bg-[#017ba9]"
      >
        Leave Application
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white shadow-xl rounded-lg p-10   w-[900px] max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl font-bold mb-8 text-center border-b pb-1">Leave Application</h2>

            <div className="flex space-x-10 mb-4">
              <div>
                <label className="font-bold block mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  min={today}
                  className="w-full rounded px-3 py-2 shadow"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || today}
                  className="w-full rounded px-3 py-2 shadow"
                />
              </div>
            </div>

            <div className="flex space-x-10 mb-4">
              <div className="w-full">
                <label className="font-bold block mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded px-4 py-2 shadow"
                >
                  <option>Select</option>
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                </select>
              </div>

              <div className="w-full">
                <label className="font-bold block mb-1">Select for Approval</label>
                <select
                  value={approvalTo}
                  onChange={(e) => setApprovalTo(e.target.value)}
                  className="w-full rounded px-4 py-2 shadow"
                >
                  <option>Select</option>
                  {approvers.map((approver) => (
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

            <div className="mb-4">
              <label className="font-bold block mb-1">Reason For Leave</label>
              <textarea
                value={reason}
                onChange={handleReasonChange}
                className="w-full h-28 rounded px-4 py-2 bg-gray-100 border-1 shadow resize-none"
              />
              <div className="text-right text-sm  text-gray-600">{wordCount}/ Min. 24</div>
            </div>



            <div className="text-center space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-blue-500 text-blue-500 cursor-pointer rounded hover:bg-blue-50"
              >
                Cancel
              </button>
              <button
                onClick={submitLeave}
                className="px-6 py-2 bg-[#018ABE] text-white rounded cursor-pointer hover:bg-[#017ba9]"
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
              {leaves.map((leave, index) => (
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
                          leave.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}