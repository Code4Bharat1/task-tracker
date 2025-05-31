"use client";
import React, { useEffect, useState, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { Trash2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function LeaveTable() {
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
  const underlineRef = useRef(null);

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

  // Set default dates when opening modal
  useEffect(() => {
    if (showModal) {
      const currentDate = new Date().toISOString().split("T")[0];
      setFromDate(currentDate);
      setToDate(currentDate);
    }
  }, [showModal]);

  // Update toDate when fromDate changes to ensure it's not before fromDate
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

    // Get the selected approver name instead of ID
    let managerId = approvalTo;

    // If the approvalTo is a name, find the corresponding ID from approvers
    if (!approvers.some((a) => a.id === approvalTo)) {
      const selectedApprover = approvers.find((a) => a.name === approvalTo);
      if (selectedApprover) {
        managerId = selectedApprover.id;
      } else {
        // If no match in approvers array, create a fallback approach
        // This is a fallback in case the approvers API isn't working
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster />
      <div className="mb-6">
        {" "}
        {/* Added wrapper div */}
        <h2 className="text-2xl font-bold mb-4 relative inline-block text-gray-800">
          {" "}
          {/* Reduced mb-8 to mb-4 */}
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
          ></span>
          My Leave
        </h2>
      </div>

      <div className="mb-6">
        {" "}
        {/* Added wrapper div for the button */}
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-[#018ABE] text-white rounded-full cursor-pointer hover:bg-[#017ba9]"
        >
          Leave Application
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-center mb-10">
              <h2 className="text-xl font-bold inline-block border-b-3 border-[#018ABE] pb-1">
                Leave Application
              </h2>
            </div>

            <div className="flex">
              {/* Left Column */}
              <div className="w-1/2 pr-4 space-y-6">
                {/* From Date */}
                <div className="flex items-center">
                  <div className="w-1/3">
                    <label className="font-bold">From Date</label>
                  </div>
                  <div className="w-2/3">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      min={today}
                      className="w-full rounded px-3 py-2 border border-gray-300 shadow-[#cacaca] shadow-sm "
                    />
                  </div>
                </div>

                {/* Leave Type */}
                <div className="flex items-center">
                  <div className="w-1/3">
                    <label className="font-bold">Leave Type</label>
                  </div>
                  <div className="w-2/3">
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full rounded px-3 py-2 border border-gray-300 shadow-[#cacaca] shadow-sm"
                    >
                      <option value="">Select</option>
                      <option>Sick Leave</option>
                      <option>Casual Leave</option>
                    </select>
                  </div>
                </div>

                {/* Attachment */}
                <div className="flex items-center">
                  <div className="w-1/3">
                    <label className="font-bold">Attachment</label>
                  </div>
                  <div className="w-2/3 flex items-center space-x-2">
                    <input
                      type="file"
                      name="attachment"
                      ref={fileInputRef}
                      className="block w-full text-sm border border-gray-300 shadow-[#cacaca] shadow-sm rounded-md bg-gray-200 text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-blue-50 file:text-[#018ABE] hover:file:bg-blue-100"
                    />
                    <button
                      onClick={() => {
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="text-black p-2 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-1/2 pl-4 space-y-6">
                {/* To Date */}
                <div className="flex items-center">
                  <div className="w-1/3">
                    <label className="font-bold">To Date</label>
                  </div>
                  <div className="w-2/3">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      min={fromDate || today}
                      className="w-full rounded px-3 py-2 border border-gray-300 shadow-[#cacaca] shadow-sm"
                    />
                  </div>
                </div>

                {/* Select for Approval */}
                <div className="flex items-center">
                  <div className="w-1/3">
                    <label className="font-bold whitespace-nowrap">
                      Select for Approval
                    </label>
                  </div>
                  <div className="w-2/3">
                    <select
                      value={approvalTo}
                      onChange={(e) => setApprovalTo(e.target.value)}
                      className="w-full rounded px-3 py-2 border border-gray-300 shadow-[#cacaca] shadow-sm"
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
                          <option value="Shams Ali Shaikh">
                            Shams Ali Shaikh
                          </option>
                          <option value="Awab Fakih">Awab Fakih</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason For Leave - Full Width */}
            <div className="mt-6 flex items-start">
              <div className="w-40 whitespace-nowrap pt-2">
                <label className="font-bold">Reason For Leave</label>
              </div>
              <div className="w-[87%]">
                <textarea
                  value={reason}
                  onChange={handleReasonChange}
                  className="w-full h-28 rounded px-3 py-2 bg-white border border-gray-300 shadow-sm resize-none"
                />
                <div className="text-right text-sm text-gray-600">
                  {wordCount}/ Min. 24
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center space-x-4 mt-10 mb-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-[#018ABE] text-[#018ABE] cursor-pointer rounded hover:bg-blue-50"
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
            <thead
              style={{ backgroundColor: "#018ABE" }}
              className="text-white"
            >
              <tr>
                <th className="p-3 border-r border-white rounded-tl-lg">
                  Sr No.
                </th>
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
                  <td className="p-3 border-t">
                    {approverMap[leave.managerId] || "N/A"}
                  </td>
                  <td className="p-3 border-t">{leave.reason}</td>
                  <td className="p-3 border-t">
                    {leave.createdAt?.split("T")[0]}
                  </td>
                  <td className="p-3 border-t">
                    {new Date(leave.fromDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-3 border-t">
                    {new Date(leave.toDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-3 border-t">{leave.days || "1"}</td>
                  <td className="p-3 border-t">
                    <span
                      className={`px-2 py-1 rounded-full text-white ${
                        leave.status === "Approved"
                          ? "bg-green-600"
                          : leave.status === "Rejected"
                          ? "bg-red-500"
                          : leave.status === "Pending"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
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
