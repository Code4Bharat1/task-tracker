"use client";
import { useEffect, useState, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { Trash2 } from "lucide-react";

export default function MobileLeaveTable() {
  const [leaves, setLeaves] = useState([]);
  const [approvalTo, setApprovalTo] = useState("");
  const [approvers, setApprovers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const fileInputRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  const isDateOverlap = (start1, end1, start2, end2) => {
    return !(
      new Date(end1) < new Date(start2) || new Date(start1) > new Date(end2)
    );
  };

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/leave/approvers`,
          { withCredentials: true }
        );
        setApprovers(res.data.data || []);
      } catch (error) {
        console.error("Failed to load approvers", error);
      }
    };
    fetchApprovers();
  }, []);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/leave/userLeave`,
          { withCredentials: true }
        );
        setLeaves(response.data.leaves || []);
      } catch (error) {
        console.error("Error fetching leaves:", error);
        toast.error("Failed to fetch leave data.");
      }
    };
    fetchLeaves();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", showModal);
    return () => document.body.classList.remove("overflow-hidden");
  }, [showModal]);

  useEffect(() => {
    if (showModal) {
      const currentDate = new Date().toISOString().split("T")[0];
      setFromDate(currentDate);
      setToDate(currentDate);
    }
  }, [showModal]);

  useEffect(() => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      setToDate(fromDate);
    }
  }, [fromDate]);

  const approverMap = Object.fromEntries(approvers.map((a) => [a.id, a.name]));

  const submitLeave = async () => {
    if (
      !leaveType ||
      leaveType === "Select" ||
      !approvalTo ||
      approvalTo === "Select" ||
      !fromDate ||
      !toDate ||
      !reason.trim()
    ) {
      toast.error("Please fill out all fields before submitting.");
      return;
    }

    if (reason.trim().split(/\s+/).filter(Boolean).length < 24) {
      toast.error("Reason for Leave must be at least 24 words long.");
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      toast.error("To Date cannot be before From Date.");
      return;
    }

    const hasOverlap = leaves.some((leave) =>
      isDateOverlap(fromDate, toDate, leave.fromDate, leave.toDate)
    );

    if (hasOverlap) {
      toast("You already have leave applied during these dates.", {
        icon: "📅",
        duration: 5000,
        style: {
          border: "1px solid #3182ce",
          padding: "12px 16px",
          color: "#2b6cb0",
          background: "#ebf8ff",
          fontWeight: "500",
        },
      });
      return;
    }

    let managerId = approvalTo;
    if (!approvers.some((a) => a.id === approvalTo)) {
      const selectedApprover = approvers.find((a) => a.name === approvalTo);
      if (selectedApprover) {
        managerId = selectedApprover.id;
      } else {
        const approverNameToId = {
          "Ayaan Raje": "ayaan_id",
          "Prashant Patil": "prashant_id",
          "Shams Ali Shaikh": "shams_id",
          "Awab Fakih": "awab_id",
        };
        managerId = approverNameToId[approvalTo] || approvalTo;
      }
    }

    const formData = new FormData();
    formData.append("fromDate", fromDate);
    formData.append("toDate", toDate);
    formData.append("leaveType", leaveType);
    formData.append("reason", reason);
    formData.append("managerId", managerId);

    if (fileInputRef.current?.files[0]) {
      formData.append("attachment", fileInputRef.current.files[0]);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/leave/apply`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        toast.success("Leave Submitted Successfully!");
        setShowModal(false);
        setLeaveType("");
        setApprovalTo("");
        setFromDate("");
        setToDate("");
        setReason("");
        setWordCount(0);

        const updatedLeaves = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/leave/userLeave`,
          { withCredentials: true }
        );
        setLeaves(updatedLeaves.data.leaves || []);
      } else {
        toast.error("Failed to submit leave.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error submitting leave. Try again later.");
    }
  };

  const handleReasonChange = (e) => {
    const val = e.target.value;
    setReason(val);
    setWordCount(val.trim().split(/\s+/).filter(Boolean).length);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Toaster />
      <h1 className="text-xl font-bold mb-2">My Leave</h1>
      <div className="w-16 h-1 bg-red-500 mb-4"></div>

      <button
        onClick={() => setShowModal(true)}
        className="mb-4 px-4 py-2 bg-[#018ABE] text-white rounded-full cursor-pointer hover:bg-[#017ba9] text-sm"
      >
        Leave Application
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm flex justify-center items-start pt-4 pb-8 z-50 overflow-y-auto">
          <div className="bg-white shadow-xl rounded-lg p-4 w-[95%] max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-center mb-6">
              <h2 className="text-lg font-bold inline-block border-b-2 border-[#018ABE] pb-1">
                Leave Application
              </h2>
            </div>

            <div className="space-y-4">
              {/* From Date */}
              <div className="flex flex-col">
                <label className="font-bold mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  min={today}
                  className="w-full rounded px-3 py-2 border border-gray-300 shadow-sm"
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col">
                <label className="font-bold mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || today}
                  className="w-full rounded px-3 py-2 border border-gray-300 shadow-sm"
                />
              </div>

              {/* Leave Type */}
              <div className="flex flex-col">
                <label className="font-bold mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded px-3 py-2 border border-gray-300 shadow-sm"
                >
                  <option value="">Select</option>
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                </select>
              </div>

              {/* Select for Approval */}
              <div className="flex flex-col">
                <label className="font-bold mb-1">Select for Approval</label>
                <select
                  value={approvalTo}
                  onChange={(e) => setApprovalTo(e.target.value)}
                  className="w-full rounded px-3 py-2 border border-gray-300 shadow-sm"
                >
                  <option value="">Select</option>
                  {approvers.length > 0 ? (
                    approvers.map((approver) => (
                      <option key={approver.id} value={approver.name}>
                        {approver.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Ayaan Raje">Ayaan Raje</option>
                      <option value="Prashant Patil">Prashant Patil</option>
                      <option value="Shams Ali Shaikh">Shams Ali Shaikh</option>
                      <option value="Awab Fakih">Awab Fakih</option>
                    </>
                  )}
                </select>
              </div>

              {/* Attachment */}
              <div className="flex flex-col">
                <label className="font-bold mb-1">Attachment</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    name="attachment"
                    ref={fileInputRef}
                    className="block w-full text-sm border border-gray-300 shadow-sm rounded-md bg-gray-200 text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:rounded-md file:bg-blue-50 file:text-[#018ABE] hover:file:bg-blue-100 file:text-sm"
                  />
                  <button
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-black p-1.5 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reason For Leave */}
              <div className="flex flex-col">
                <label className="font-bold mb-1">Reason For Leave</label>
                <textarea
                  value={reason}
                  onChange={handleReasonChange}
                  className="w-full h-32 rounded px-3 py-2 bg-white border border-gray-300 shadow-sm resize-none"
                />
                <div className="text-right text-sm text-gray-600 mt-1">
                  {wordCount}/ Min. 24
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 border border-[#018ABE] text-[#018ABE] cursor-pointer rounded hover:bg-blue-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={submitLeave}
                  className="px-4 py-1.5 bg-[#018ABE] text-white rounded cursor-pointer hover:bg-[#017ba9] text-sm"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Leave List */}
      <div className="space-y-3 mt-4">
        {leaves.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No leave applications found
          </div>
        ) : (
          leaves.map((leave, index) => (
            <div key={leave._id || index} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{approverMap[leave.managerId] || "N/A"}</div>
                  <div className="text-sm text-gray-600 mt-1">{leave.reason}</div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-white text-xs ${
                    leave.status === "Accepted"
                      ? "bg-green-500"
                      : leave.status === "Rejected"
                      ? "bg-red-500"
                      : leave.status === "Pending"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                >
                  {leave.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div>
                  <div className="text-gray-500">From</div>
                  <div>{new Date(leave.fromDate).toLocaleDateString("en-GB")}</div>
                </div>
                <div>
                  <div className="text-gray-500">To</div>
                  <div>{new Date(leave.toDate).toLocaleDateString("en-GB")}</div>
                </div>
                <div>
                  <div className="text-gray-500">Days</div>
                  <div>{leave.days || "1"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Applied</div>
                  <div>{leave.createdAt?.split("T")[0]}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}