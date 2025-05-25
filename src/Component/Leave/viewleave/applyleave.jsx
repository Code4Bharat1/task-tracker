'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

export default function Leave() {
    const router = useRouter();

    const [leaveType, setLeaveType] = useState('');
    const [approvalTo, setApprovalTo] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reason, setReason] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(true); // Modal is open by default

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    const submitLeave = () => {
        if (
            !leaveType ||
            leaveType === 'Select' ||
            !approvalTo ||
            approvalTo === 'Select' ||
            !fromDate ||
            !toDate ||
            !reason.trim()
        ) {
            toast.error('Please fill out all fields before submitting.', {
                duration: 3000,
                position: 'top-right',
            });
            return;
        }

        if (new Date(toDate) < new Date(fromDate)) {
            toast.error('To Date cannot be before From Date.', {
                duration: 3000,
                position: 'top-right',
            });
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

        toast.success('Leave Submitted Successfully!', {
            duration: 3000,
            position: 'top-right',
        });

        setTimeout(() => {
            router.push('/leavetable');
        }, 1500);
    };

    const calculateDays = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diff = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
        return diff || 0;
    };

    return (
        <div className="flex justify-start">
            <Toaster />
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white shadow-[0_0_20px_rgba(0,0,0,0.2)] rounded-lg p-10 w-[1000px] h-[500px]">
                        <h2 className="text-xl font-bold mb-4 border-b-3 border-[#FC1F1F] inline-block pb-1">MY LEAVE</h2>
                        <div className="mb-4 flex items-center space-x-10 gap-20">
                            <div className="flex items-center space-x-2">
                                <label className="font-bold whitespace-nowrap">Leave Type</label>
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    className="border border-black-200 rounded px-4 py-2 w-[250px] shadow-lg"
                                    required
                                >
                                    <option>Select</option>
                                    <option>Sick Leave</option>
                                    <option>Casual Leave</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <label className="font-bold whitespace-nowrap">Select for Approval</label>
                                <select
                                    value={approvalTo}
                                    onChange={(e) => setApprovalTo(e.target.value)}
                                    className="border border-black-200 rounded px-4 py-2 w-[250px] shadow-lg"
                                    required
                                >
                                    <option>Select</option>
                                    <option>Ayaan Raje</option>
                                    <option>Prashant Patil</option>
                                    <option>Shams Ali Shaikh</option>
                                    <option>Awab Fakih</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-10 mb-4 gap-45">
                            <div className="flex items-center space-x-2">
                                <label className="font-bold whitespace-nowrap">From Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    min={today}
                                    className="border border-black-200 rounded px-2 py-2 shadow-md"
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="font-bold whitespace-nowrap">To Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    min={fromDate || today}
                                    className="border border-black-200 rounded px-2 py-2 shadow-md"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6 flex items-start mt-6">
                            <label className="font-bold mt-4 w-40">Reason For Leave</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="border border-black rounded px-4 py-2 w-[780px] h-[130px] resize-none shadow-lg mt-4"
                                required
                            ></textarea>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={submitLeave}
                                className="bg-[#018ABE] font-bold text-white px-6 py-2 rounded hover:bg-[#0177a4] self-start mt-18">
                                Submit
                            </button>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(false)} // Close modal
                            className="absolute top-0 right-0 mt-2 mr-2 text-red-500 font-bold text-xl">
                            X
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
