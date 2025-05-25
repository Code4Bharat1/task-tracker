"use client";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { XCircle, CheckCircle, AlertCircle, ChevronLeft, Calendar, Clock, FileText, User, Briefcase } from "lucide-react";

export default function LeaveRequest() {
  const { leaveId } = useParams(); // Get leaveId from route params
  const router = useRouter();
  const underlineRef = useRef(null);
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Animation
  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  // Fetch leave by ID
  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/leave/admin/single-leave/${leaveId}`,
          { withCredentials: true }
        );
        setLeave(data.data);
        setLoading(false);
      } catch (err) {
        toast.error("Failed to load leave details");
        setLoading(false);
      }
    };

    fetchLeave();
  }, [leaveId]);

  // Calculate if buttons should be disabled
  const isActionDisabled = isUpdating || (leave && (leave.status === "Approved" || leave.status === "Rejected"));

  // Handle approve/reject
  const initiateStatusUpdate = (status) => {
    setPendingAction(status);
    setShowConfirmation(true);
  };

  const confirmStatusUpdate = async () => {
    if (!pendingAction) return;
    
    setIsUpdating(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/leave/admin/update-status/${leaveId}`,
        { status: pendingAction },
        { withCredentials: true }
      );
      
      // Update local state
      setLeave(prev => ({
        ...prev,
        status: pendingAction
      }));
      
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
      setShowConfirmation(false);
      setPendingAction(null);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate the leave duration in a readable format
  const getLeaveDisplayDuration = () => {
    if (!leave) return '';
    
    const days = leave.days;
    if (days === 1 || days === 0) return '1 day';
    if (days < 7) return `${days} days`;
    
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    if (remainingDays === 0) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} and ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
  };

  // Get status badge styling
  const getStatusBadgeStyles = () => {
    if (!leave) return {};
    
    switch (leave.status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#018ABE]"></div>
      </div>
    );
  }
  
  if (!leave) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Leave Request Not Found</h2>
        <p className="text-gray-600 mb-6">The leave request you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => router.push('/leavetable')}
          className="flex items-center bg-[#018ABE] text-white px-6 py-2 rounded-lg hover:bg-[#016d94] transition-colors"
        >
          <ChevronLeft size={18} className="mr-2" />
          Back to Leave Table
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/leavetable')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold mb-1 relative inline-block text-gray-800">
            <span
              ref={underlineRef}
              className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
            ></span>
            Leave Request Details
          </h2>
          <p className="text-sm text-gray-500">
            Submitted on {formatDate(leave.createdAt)}
          </p>
        </div>
      </div>

      {/* Success message */}
      {updateSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm animate-fadeIn">
          <div className="flex items-center">
            <CheckCircle size={20} className="mr-2" />
            <p className="font-medium">Leave request has been {leave.status.toLowerCase()} successfully.</p>
          </div>
        </div>
      )}

      {/* Main content card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Status header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyles()} border`}>
              {leave.status}
            </span>
            <span className="ml-3 text-sm text-gray-600">
              {leave.leaveType}
            </span>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {getLeaveDisplayDuration() || '1'}
          </div>
        </div>
        
        {/* Content grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Employee Information */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4 border-b pb-2">
              <User size={18} className="mr-2 text-[#018ABE]" />
              Employee Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Full Name</span>
                <span className="font-medium">{leave.userId.firstName} {leave.userId.lastName}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Email Address</span>
                <span className="font-medium">{leave.userId.email}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Position</span>
                <span className="font-medium">{leave.userId.position || "Not specified"}</span>
              </div>
            </div>
          </div>
          
          {/* Leave Details */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4 border-b pb-2">
              <Calendar size={18} className="mr-2 text-[#018ABE]" />
              Leave Details
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">From Date</span>
                  <span className="font-medium">{formatDate(leave.fromDate)}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">To Date</span>
                  <span className="font-medium">{formatDate(leave.toDate)}</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Reason for Leave</span>
                <div className="p-3 bg-gray-50 rounded-lg mt-1 text-gray-700 border border-gray-200">
                  {leave.reason || "No reason provided"}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            {leave.status === "Pending" ? (
              <>
                <button
                  disabled={isActionDisabled}
                  className={`flex items-center justify-center px-5 py-2 rounded-lg font-medium border transition-colors ${
                    isActionDisabled 
                      ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed" 
                      : "bg-white text-red-600 border-red-300 hover:bg-red-50"
                  }`}
                  onClick={() => initiateStatusUpdate("Rejected")}
                >
                  <XCircle size={18} className="mr-2" />
                  Reject
                </button>
                <button
                  disabled={isActionDisabled}
                  className={`flex items-center justify-center px-5 py-2 rounded-lg font-medium transition-colors ${
                    isActionDisabled 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  onClick={() => initiateStatusUpdate("Approved")}
                >
                  <CheckCircle size={18} className="mr-2" />
                  Approve
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center px-5 py-2 bg-gray-100 rounded-lg text-gray-700">
                <Clock size={18} className="mr-2" />
                {leave.status === "Approved" ? "Approved  " : "Rejected  "}
                {/* {formatDate(leave.updatedAt)} */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl p-6 animate-scaleIn">
            <div className="text-center mb-6">
              {pendingAction === "Approved" ? (
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              ) : (
                <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <XCircle size={32} className="text-red-600" />
                </div>
              )}
              
              <h3 className="text-xl font-bold text-gray-800">
                {pendingAction === "Approved" ? "Approve Leave Request?" : "Reject Leave Request?"}
              </h3>
              <p className="text-gray-600 mt-2">
                {pendingAction === "Approved" 
                  ? "Are you sure you want to approve this leave request? This action cannot be undone."
                  : "Are you sure you want to reject this leave request? This action cannot be undone."}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-white ${
                  pendingAction === "Approved" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                } transition-colors`}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Confirm ${pendingAction}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Additional animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}