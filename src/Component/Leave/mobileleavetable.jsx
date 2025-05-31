"use client";
import React, { useEffect, useState, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios"; // Make sure axios is imported
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Trash2,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

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
  const [filterStatus, setFilterStatus] = useState("All");
  const fileInputRef = useRef(null);
  const underlineRef = useRef(null); // Added the missing ref
  const today = new Date().toISOString().split("T")[0];

  const isDateOverlap = (start1, end1, start2, end2) => {
    return !(
      new Date(end1) < new Date(start2) || new Date(start1) > new Date(end2)
    );
  };

  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  // Fetch approvers from backend
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
        // Fallback approvers if API fails
        setApprovers([
          { id: "ayaan_id", name: "Ayaan Raje" },
          { id: "prashant_id", name: "Prashant Patil" },
          { id: "shams_id", name: "Shams Ali Shaikh" },
          { id: "awab_id", name: "Awab Fakih" },
        ]);
      }
    };
    fetchApprovers();
  }, []);

  // Fetch leaves from backend
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/leave/userLeave`,
          {
            withCredentials: true,
          }
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

    // Check for overlapping leave dates
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

    // Get the selected approver ID
    let managerId = approvalTo;

    // If the approvalTo is a name, find the corresponding ID from approvers
    if (!approvers.some((a) => a.id === approvalTo)) {
      const selectedApprover = approvers.find((a) => a.name === approvalTo);
      if (selectedApprover) {
        managerId = selectedApprover.id;
      } else {
        // Fallback approach
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

        // Refresh leaves list
        const updatedLeaves = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/leave/userLeave`,
          {
            withCredentials: true,
          }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "Pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Filter leaves based on selected status
  const filteredLeaves = leaves.filter((leave) => {
    if (filterStatus === "All") return true;
    return leave.status === filterStatus;
  });

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Toaster />
     <h2 className="text-2xl font-bold mb-7 relative inline-block text-gray-800"> {/* Reduced mb-8 to mb-4 */}
      <span
        ref={underlineRef}
        className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
      ></span>
      My Leave
    </h2>
     

      <button
        onClick={() => setShowModal(true)}
        className="mb-4 px-4 py-2 bg-[#018ABE] text-white rounded-full text-sm hover:bg-[#017ba9] w-full sm:w-auto"
      >
        Leave Application
      </button>

      {/* Filter Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", "Pending", "Accepted", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterStatus === status
                ? "bg-[#018ABE] text-white"
                : "bg-white text-[#018ABE] border border-[#018ABE] hover:bg-blue-50"
            }`}
          >
            {status}{" "}
            {status !== "All" &&
              `(${leaves.filter((l) => l.status === status).length})`}
          </button>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white shadow-xl rounded-lg p-4 w-full max-w-lg my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center mb-6">
              <h2 className="text-lg font-bold border-b-2 border-[#018ABE] pb-1">
                Leave Application
              </h2>
            </div>

            <div className="space-y-4">
              {/* From Date */}
              <div>
                <label className="block font-bold mb-1 text-sm">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  min={today}
                  className="w-full rounded px-3 py-2 border border-gray-300 shadow-sm text-sm"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block font-bold mb-1 text-sm">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || today}
                  className="w-full rounded px-3 py-2 border border-gray-300 shadow-sm text-sm"
                />
              </div>

              {/* Leave Type */}
              <div>
                <label className="block font-bold mb-1 text-sm">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded px-3 py-2 border border-gray-300 shadow-sm text-sm"
                >
                  <option value="">Select</option>
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                </select>
              </div>

              {/* Select for Approval */}
              <div>
                <label className="block font-bold mb-1 text-sm">
                  Select for Approval
                </label>
                <select
                  value={approvalTo}
                  onChange={(e) => setApprovalTo(e.target.value)}
                  className="w-full rounded px-3 py-2 border border-gray-300 shadow-sm text-sm"
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
              <div>
                <label className="block font-bold mb-1 text-sm">
                  Attachment
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    name="attachment"
                    ref={fileInputRef}
                    className="flex-1 text-xs border border-gray-300 shadow-sm rounded-md bg-gray-200 text-gray-500 file:mr-2 file:py-1 file:px-2 file:border-0 file:rounded-md file:bg-blue-50 file:text-[#018ABE] file:text-xs hover:file:bg-blue-100"
                  />
                  <button
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-black p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reason For Leave */}
              <div>
                <label className="block font-bold mb-1 text-sm">
                  Reason For Leave
                </label>
                <textarea
                  value={reason}
                  onChange={handleReasonChange}
                  className="w-full h-20 rounded px-3 py-2 bg-white border border-gray-300 shadow-sm resize-none text-sm"
                  placeholder="Enter your reason for leave..."
                />
                <div className="text-right text-xs text-gray-600 mt-1">
                  {wordCount} / Min. 24 words
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-[#018ABE] text-[#018ABE] rounded text-sm hover:bg-blue-50"
              >
                Cancel
              </button>
              <button
                onClick={submitLeave}
                className="flex-1 py-2 bg-[#018ABE] text-white rounded text-sm hover:bg-[#017ba9]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cards View */}
      <div className="space-y-4">
        {filteredLeaves.map((leave, index) => (
          <div
            key={leave._id || index}
            className="bg-white rounded-lg shadow-md p-4 border"
          >
            {/* Header with status and serial number */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-600">
                  #{leaves.findIndex((l) => l._id === leave._id) + 1}
                </span>
                {getStatusIcon(leave.status)}
              </div>
              <span
                className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
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

            {/* Request To */}
            <div className="flex items-start space-x-2 mb-2">
              <User className="w-4 h-4 text-[#018ABE] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">Request To:</span>
                <p className="text-sm font-medium">
                  {approverMap[leave.managerId] || "N/A"}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-start space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-[#018ABE] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">Duration:</span>
                <p className="text-sm">
                  {new Date(leave.fromDate).toLocaleDateString("en-GB")} -{" "}
                  {new Date(leave.toDate).toLocaleDateString("en-GB")}
                  <span className="text-gray-500 ml-1">
                    ({leave.days || "1"} days)
                  </span>
                </p>
              </div>
            </div>

            {/* Apply Date */}
            <div className="flex items-start space-x-2 mb-2">
              <Clock className="w-4 h-4 text-[#018ABE] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">Applied On:</span>
                <p className="text-sm">{leave.createdAt?.split("T")[0]}</p>
              </div>
            </div>

            {/* Reason */}
            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-[#018ABE] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">Reason:</span>
                <p className="text-sm text-gray-700">{leave.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLeaves.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {filterStatus === "All"
              ? "No leave applications found."
              : `No ${filterStatus.toLowerCase()} leave applications found.`}
          </p>
        </div>
      )}
    </div>
  );
}