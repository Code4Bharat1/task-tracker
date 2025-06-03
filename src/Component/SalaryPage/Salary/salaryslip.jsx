'use client';
import React, { useRef, useEffect, useState } from 'react';
import gsap from "gsap";
import jsPDF from 'jspdf';
import { useGSAP } from "@gsap/react";

export default function SalarySlipPage() {
    const pdfRef = useRef();
    const underlineRef = useRef(null);

    // State management
    const [salaryData, setSalaryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [month, setMonth] = useState('05');
    const [year, setYear] = useState('2025');

    useGSAP(() => {
        gsap.fromTo(
            underlineRef.current,
            { width: "0%" },
            { width: "100%", duration: 1, ease: "power2.out" }
        );
    }, []);

    // API function to fetch salary data using the provided endpoint
    const fetchSalaryData = async () => {
        if (!month || !year) {
            setError('Please select both month and year');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log(`Fetching data for month: ${month}, year: ${year}`);

            // API call using your provided endpoint
            const response = await fetch(
                `http://localhost:4110/api/salary/getSalaryDetails?month=${month}&year=${year}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data.data && data.data.length > 0) {
                // Use the first record from the data array
                const salaryRecord = data.data[0];
                setSalaryData(salaryRecord);
                setError(null);
            } else {
                setError('No salary data found for this month');
                setSalaryData(null);
            }
        } catch (err) {
            console.error('API Error:', err);
            setError('Failed to fetch salary data. Please check your connection and try again.');
            setSalaryData(null);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        return `Rs. ${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    // Helper function to convert number to words (simplified version)
    const numberToWords = (amount) => {
        const num = Math.floor(amount);
        const decimals = Math.round((amount % 1) * 100);
        return `(${num.toLocaleString('en-IN')} Rupees${decimals > 0 ? ` and ${decimals} Paise` : ''} only)`;
    };

    // Helper function to format month display
    const getMonthName = (monthNum) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[parseInt(monthNum) - 1] || '';
    };

    const handleDownloadPdf = () => {
        if (!salaryData) {
            alert('Please fetch salary data first');
            return;
        }

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();

            pdf.setFont("helvetica", "normal");

            const titleTopMargin = 35;

            // Title
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text("Salary Payslip", pdfWidth / 2, titleTopMargin, { align: "center" });
            pdf.setDrawColor(255, 193, 7);
            pdf.line(pdfWidth / 2 - 20, titleTopMargin + 2, pdfWidth / 2 + 20, titleTopMargin + 2);

            // Company info
            pdf.setFontSize(11);
            pdf.text("Nextcore Alliance", 20, titleTopMargin + 10);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text("Kurla, Mumbai", 20, titleTopMargin + 15);
            pdf.text("iscr.orgin.com | 8976104646", 20, titleTopMargin + 20);

            // Month line
            const monthLineY = titleTopMargin + 30;
            const displayDate = `${getMonthName(month)}, ${year}`;
            pdf.text(`PaySlip for the Month of ${displayDate}`, pdfWidth / 2, monthLineY, { align: "center" });
            pdf.line(20, monthLineY + 3, pdfWidth - 20, monthLineY + 3);

            // Employee details
            pdf.setFontSize(9);
            pdf.text(`Employee: ${salaryData.userId.firstName} ${salaryData.userId.lastName}`, 20, monthLineY + 8);
            pdf.text(`Email: ${salaryData.userId.email}`, 20, monthLineY + 12);
            pdf.text(`Employee ID: ${salaryData.userId._id}`, 120, monthLineY + 8);
            pdf.text(`Status: ${salaryData.status}`, 120, monthLineY + 12);

            // Table setup
            const tableStartY = monthLineY + 20;
            const blueColor = [1, 138, 190];
            pdf.setFillColor(...blueColor);
            pdf.rect(20, tableStartY, pdfWidth - 40, 8, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");

            const col1Width = (pdfWidth - 40) / 4;

            // Headers
            pdf.text("EARNINGS", 20 + col1Width / 2, tableStartY + 5, { align: "center" });
            pdf.text("AMOUNT", 20 + col1Width + col1Width / 2, tableStartY + 5, { align: "center" });
            pdf.text("DEDUCTIONS", 20 + col1Width * 2 + col1Width / 2, tableStartY + 5, { align: "center" });
            pdf.text("AMOUNT", 20 + col1Width * 3 + col1Width / 2, tableStartY + 5, { align: "center" });

            pdf.setTextColor(0, 0, 0);

            // Table structure
            pdf.setDrawColor(200, 200, 200);
            const rowsCount = 7;
            const startY = tableStartY;
            const rowHeight = 8;
            const tableHeight = rowHeight * rowsCount;

            pdf.rect(20, startY, pdfWidth - 40, tableHeight);

            for (let i = 1; i < rowsCount; i++) {
                pdf.line(20, startY + (rowHeight * i), pdfWidth - 20, startY + (rowHeight * i));
            }

            pdf.line(20 + col1Width, startY, 20 + col1Width, startY + tableHeight);
            pdf.line(20 + col1Width * 2, startY, 20 + col1Width * 2, startY + tableHeight);
            pdf.line(20 + col1Width * 3, startY, 20 + col1Width * 3, startY + tableHeight);

            pdf.setFont("helvetica", "normal");

            let yPos = startY + rowHeight + 3;

            // Table data with actual API data
            pdf.text("Basic Salary", 22, yPos);
            pdf.text(formatCurrency(salaryData.basicSalary), 20 + col1Width + 2, yPos);
            pdf.text("EPF", 20 + col1Width * 2 + 2, yPos);
            pdf.text(formatCurrency(salaryData.epf), 20 + col1Width * 3 + 2, yPos);
            yPos += rowHeight;

            pdf.text("House Rent Allowance", 22, yPos);
            pdf.text(formatCurrency(salaryData.houseRentAllowance), 20 + col1Width + 2, yPos);
            pdf.text("Health Insurance", 20 + col1Width * 2 + 2, yPos);
            pdf.text(formatCurrency(salaryData.healthInsurance), 20 + col1Width * 3 + 2, yPos);
            yPos += rowHeight;

            pdf.text("Conveyance", 22, yPos);
            pdf.text(formatCurrency(salaryData.conveyance), 20 + col1Width + 2, yPos);
            pdf.text("Professional Tax", 20 + col1Width * 2 + 2, yPos);
            pdf.text(formatCurrency(salaryData.professionalTax), 20 + col1Width * 3 + 2, yPos);
            yPos += rowHeight;

            pdf.text("Medical", 22, yPos);
            pdf.text(formatCurrency(salaryData.medical), 20 + col1Width + 2, yPos);
            pdf.text("TDS", 20 + col1Width * 2 + 2, yPos);
            pdf.text(formatCurrency(salaryData.tds), 20 + col1Width * 3 + 2, yPos);
            yPos += rowHeight;

            pdf.text("Special Allowance", 22, yPos);
            pdf.text(formatCurrency(salaryData.specialAllowance), 20 + col1Width + 2, yPos);
            pdf.text("Absent Deduction", 20 + col1Width * 2 + 2, yPos);
            pdf.text(formatCurrency(salaryData.absentDeduction), 20 + col1Width * 3 + 2, yPos);
            yPos += rowHeight;

            pdf.text("Reimbursements", 22, yPos);
            pdf.text(formatCurrency(salaryData.reimbursements), 20 + col1Width + 2, yPos);
            pdf.text("", 20 + col1Width * 2 + 2, yPos);
            pdf.text("", 20 + col1Width * 3 + 2, yPos);

            // Total row
            const totalRowY = startY + (rowHeight * 7);
            pdf.setFillColor(...blueColor);
            pdf.rect(20, totalRowY, pdfWidth - 40, rowHeight, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.text("Total Earnings", 22, totalRowY + 5.5);
            pdf.text(formatCurrency(salaryData.totalEarnings), 20 + col1Width + 2, totalRowY + 5.5);
            pdf.text("Total Deductions", 20 + col1Width * 2 + 2, totalRowY + 5.5);
            pdf.text(formatCurrency(salaryData.totalDeductions), 20 + col1Width * 3 + 2, totalRowY + 5.5);

            pdf.setTextColor(0, 0, 0);

            // Net Salary
            const netSalaryY = totalRowY + rowHeight + 10;
            pdf.setFillColor(...blueColor);
            pdf.rect(20, netSalaryY, pdfWidth - 40, 18, "F");
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);
            pdf.text("NET SALARY: " + formatCurrency(salaryData.netSalary), pdfWidth / 2, netSalaryY + 7, { align: "center" });
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "italic");
            pdf.text(numberToWords(salaryData.netSalary), pdfWidth / 2, netSalaryY + 14, { align: "center" });

            const fileName = `salary-slip-${salaryData.userId.firstName}-${salaryData.userId.lastName}-${getMonthName(month)}-${year}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please check console for details.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white">
            {/* Fetch Data Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Fetch Salary Slip</h3>

                <div className="flex gap-4 items-center mb-4">
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="border border-gray-300 p-2 rounded"
                        disabled={loading}
                    >
                        <option value="">Select Month</option>
                        <option value="01">January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>

                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="border border-gray-300 p-2 rounded"
                        disabled={loading}
                    >
                        <option value="">Select Year</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>

                    <button
                        onClick={fetchSalaryData}
                        disabled={loading || !month || !year}
                        className="bg-[#018ABE] hover:bg-[#016a95] text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Fetch Slip'}
                    </button>
                </div>

                {month && year && (
                    <div className="text-sm text-gray-600">
                        Will fetch data for: {getMonthName(month)} {year}
                    </div>
                )}

                {error && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {salaryData && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                        Salary slip loaded for {salaryData.userId.firstName} {salaryData.userId.lastName} - {getMonthName(month)} {year}
                    </div>
                )}
            </div>

            {/* Download Button */}
            {salaryData && (
                <div className="text-right mb-4">
                    <button
                        onClick={handleDownloadPdf}
                        className="bg-[#058CBF] hover:bg-[#81c9e4] text-white font-bold cursor-pointer py-2 px-4 rounded"
                    >
                        Download PDF
                    </button>
                </div>
            )}

            {/* PDF Content Preview */}
            {salaryData && (
                <div ref={pdfRef} className="max-w-4xl mx-auto p-8 bg-white shadow-lg border rounded-lg mt-10 font-sans text-sm">
                    <div className="mb-6">
                        <h2 className="text-center font-semibold text-gray-800 text-2xl mb-6">
                            <span className="relative inline-block">
                                Salary Payslip
                                <span
                                    ref={underlineRef}
                                    className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
                                ></span>
                            </span>
                        </h2>
                        <div className="mt-2">
                            <p className="font-semibold">Nextcore Alliance</p>
                            <p>Kurla, Mumbai</p>
                            <p>iscr.orgin.com | 8976104646</p>
                        </div>
                    </div>

                    {/* Employee Details */}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <p><strong>Employee:</strong> {salaryData.userId.firstName} {salaryData.userId.lastName}</p>
                            <p><strong>Email:</strong> {salaryData.userId.email}</p>
                        </div>
                        <div>
                            <p><strong>Employee ID:</strong> {salaryData.userId._id}</p>
                            <p><strong>Status:</strong> <span className="capitalize">{salaryData.status}</span></p>
                        </div>
                    </div>

                    <div className="flex justify-center items-center pb-4">
                        <p>PaySlip for the Month of {getMonthName(month)} {year}</p>
                    </div>

                    {/* Table Head */}
                    <div className="grid grid-cols-4 bg-[#018ABE] text-white text-center font-semibold py-2 border border-gray-300">
                        <div className="px-2">EARNINGS</div>
                        <div className="px-2">AMOUNT</div>
                        <div className="px-2">DEDUCTIONS</div>
                        <div className="px-2">AMOUNT</div>
                    </div>

                    {/* Table Body */}
                    <div className="border-x border-b border-gray-300">
                        <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Basic Salary</div>
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.basicSalary)}</div>
                            <div className="px-4 py-2 border-r border-gray-300 text-left">EPF</div>
                            <div className="px-4 py-2">{formatCurrency(salaryData.epf)}</div>
                        </div>

                        <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">House Rent Allowance</div>
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.houseRentAllowance)}</div>
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Health Insurance</div>
                            <div className="px-4 py-2">{formatCurrency(salaryData.healthInsurance)}</div>
                        </div>

                        <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Conveyance</div>
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.conveyance)}</div>
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Professional Tax</div>
                            <div className="px-4 py-2">{formatCurrency(salaryData.professionalTax)}</div>
                        </div>

                        <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Medical</div>
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.medical)}</div>
                            <div className="px-4 py-2 border-r border-gray-300 text-left">TDS</div>
                            <div className="px-4 py-2">{formatCurrency(salaryData.tds)}</div>
                        </div>

                        <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Special Allowance</div>
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.specialAllowance)}</div>
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Absent Deduction</div>
                            <div className="px-4 py-2">{formatCurrency(salaryData.absentDeduction)}</div>
                        </div>

                        <div className="grid grid-cols-4 text-sm">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Reimbursements</div>
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.reimbursements)}</div>
                            <div className="px-4 py-2 border-r border-gray-300"></div>
                            <div className="px-4 py-2"></div>
                        </div>
                    </div>

                    {/* Final Total Row */}
                    <div className="grid grid-cols-4 text-center font-bold text-sm bg-[#018ABE] text-white">
                        <div className="px-4 py-2">Total Earnings</div>
                        <div className="px-4 py-2">{formatCurrency(salaryData.totalEarnings)}</div>
                        <div className="px-4 py-2">Total Deductions</div>
                        <div className="px-4 py-2">{formatCurrency(salaryData.totalDeductions)}</div>
                    </div>

                    {/* Net Salary */}
                    <div className="bg-[#018ABE] text-white mt-6 p-4 rounded-lg text-center">
                        <p className="text-xl font-bold">NET SALARY: {formatCurrency(salaryData.netSalary)}</p>
                        <p className="text-sm italic">{numberToWords(salaryData.netSalary)}</p>
                    </div>

                    {/* Created Date */}
                    <div className="mt-4 text-right text-sm text-gray-600">
                        <p>Generated on: {new Date(salaryData.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            )}

            {!salaryData && !loading && (
                <div className="text-center py-8 text-gray-500">
                    Please select a month and year, then fetch data to view the salary slip.
                </div>
            )}
        </div>
    );
}