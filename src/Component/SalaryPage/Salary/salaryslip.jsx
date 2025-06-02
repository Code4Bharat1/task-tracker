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
    const [payPeriod, setPayPeriod] = useState('');
    const [user, setUser] = useState(null);
    
    // Helper function to get cookie value
    const getCookie = (name) => {
        if (typeof document === 'undefined') return null;
        
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            const cookieValue = parts.pop().split(';').shift();
            return cookieValue ? decodeURIComponent(cookieValue) : null;
        }
        return null;
    };

    // Helper function to parse user data from cookie
    const getUserFromCookie = () => {
        try {
            // Try different possible cookie names
            const possibleCookieNames = ['user', 'userData', 'authUser', 'userInfo', 'token'];
            
            console.log('All cookies:', document.cookie); // Debug log
            
            for (const cookieName of possibleCookieNames) {
                const userCookie = getCookie(cookieName);
                console.log(`Cookie ${cookieName}:`, userCookie); // Debug log
                
                if (userCookie) {
                    try {
                        // Try to parse as JSON
                        const userData = JSON.parse(userCookie);
                        if (userData && userData.employeeId) {
                            console.log('Found user data:', userData);
                            return userData;
                        }
                    } catch (parseError) {
                        // If it's not JSON, maybe it's a token - try to decode if it looks like JWT
                        if (userCookie.includes('.')) {
                            try {
                                const payload = JSON.parse(atob(userCookie.split('.')[1]));
                                if (payload && payload.employeeId) {
                                    console.log('Found JWT payload:', payload);
                                    return payload;
                                }
                            } catch (jwtError) {
                                console.log('Not a valid JWT');
                            }
                        }
                        console.log(`Cookie ${cookieName} is not valid JSON:`, parseError);
                    }
                }
            }
            
            // If no user data found, try localStorage as fallback
            if (typeof window !== 'undefined' && window.localStorage) {
                const localStorageUser = localStorage.getItem('user');
                if (localStorageUser) {
                    console.log('Found user in localStorage:', localStorageUser);
                    return JSON.parse(localStorageUser);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    };

    // Helper function to format date for API (convert from YYYY-MM to "Month, YYYY")
    const formatDateForAPI = (dateString) => {
        if (!dateString) return '';
        const [year, month] = dateString.split('-');
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthName = monthNames[parseInt(month) - 1];
        return `${monthName}, ${year}`;
    };
    
    // Get logged-in user on component mount
    useEffect(() => {
        const userData = getUserFromCookie();
        if (userData) {
            setUser(userData);
        } else {
            setError('User not logged in. Please login first.');
        }
    }, []);

    useGSAP(() => {
        gsap.fromTo(
          underlineRef.current,
          { width: "0%" },
          { width: "100%", duration: 1, ease: "power2.out" }
        );
    }, []);

    // API function to fetch salary data
    const fetchSalaryData = async () => {
        if (!user) {
            setError('User not logged in');
            return;
        }

        if (!payPeriod) {
            setError('Please select a month');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Format the date for the API
            const formattedDate = formatDateForAPI(payPeriod);
            
            // Prepare request body
            const requestBody = {
                employeeId: user.employeeId,
                date: formattedDate
            };
            
            console.log('Sending request:', requestBody); // Debug log
            
            // API call with cookies and credentials
            const response = await fetch(
                'http://localhost:4110/api/salary/fetchSalary',
                {
                    method: 'POST', // Changed to POST since you're sending a body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include cookies in the request
                    body: JSON.stringify(requestBody)
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data); // Debug log
            
            if (data.success) {
                setSalaryData(data.data);
                setError(null);
            } else {
                setError(data.message || 'Salary not generated for this month');
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
        // This is a simplified version - you might want to use a proper library
        return `(${Math.floor(amount)} Rupees & ${Math.round((amount % 1) * 100)}/100)`;
    };

    const handleDownloadPdf = () => {
        if (!salaryData) {
            alert('Please fetch salary data first');
            return;
        }

        try {
            // Create PDF directly
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
    
            // PDF dimensions
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Set fonts
            pdf.setFont("helvetica", "normal");
            
            const titleTopMargin = 35;
            
            // Title (centered with underline effect)
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text("Salary Payslip", pdfWidth / 2, titleTopMargin, { align: "center" });
            pdf.setDrawColor(255, 193, 7);
            pdf.line(pdfWidth / 2 - 20, titleTopMargin + 2, pdfWidth / 2 + 20, titleTopMargin + 2);
            
            // Company info
            pdf.setFontSize(11);
            pdf.text(salaryData.companyName || "Nextcore Alliance", 20, titleTopMargin + 10);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text("Kurla, Mumbai", 20, titleTopMargin + 15);
            pdf.text("iscr.orgin.com | 8976104646", 20, titleTopMargin + 20);
            
            // Month line
            const monthLineY = titleTopMargin + 30;
            const displayDate = formatDateForAPI(payPeriod);
            pdf.text(`PaySlip for the Month of ${displayDate}`, pdfWidth / 2, monthLineY, { align: "center" });
            pdf.line(20, monthLineY + 3, pdfWidth - 20, monthLineY + 3);
            
            // Employee details
            pdf.setFontSize(9);
            pdf.text(`Employee: ${salaryData.employeeName || salaryData.name || 'N/A'}`, 20, monthLineY + 8);
            pdf.text(`ID: ${salaryData.employeeId || 'N/A'}`, 20, monthLineY + 12);
            pdf.text(`Department: ${salaryData.department || 'N/A'}`, 120, monthLineY + 8);
            pdf.text(`Designation: ${salaryData.designation || 'N/A'}`, 120, monthLineY + 12);
            
            // Table headers
            const tableStartY = monthLineY + 20;
            const blueColor = [1, 138, 190];
            pdf.setFillColor(...blueColor);
            pdf.rect(20, tableStartY, pdfWidth - 40, 8, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            
            const col1Width = (pdfWidth - 40) / 4;
            
            // Headers
            pdf.text("EARNINGS", 20 + col1Width/2, tableStartY + 5, { align: "center" });
            pdf.text("AMOUNT", 20 + col1Width + col1Width/2, tableStartY + 5, { align: "center" });
            pdf.text("DEDUCTIONS", 20 + col1Width*2 + col1Width/2, tableStartY + 5, { align: "center" });
            pdf.text("AMOUNT", 20 + col1Width*3 + col1Width/2, tableStartY + 5, { align: "center" });
            
            pdf.setTextColor(0, 0, 0);
            
            // Table borders
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
            pdf.line(20 + col1Width*2, startY, 20 + col1Width*2, startY + tableHeight);
            pdf.line(20 + col1Width*3, startY, 20 + col1Width*3, startY + tableHeight);
            
            pdf.setFont("helvetica", "normal");
            
            let yPos = startY + rowHeight - (-5);
            
            // Table data rows with dynamic data
            pdf.text("Basic Salary", 22, yPos);
            pdf.text(formatCurrency(salaryData.basicSalary), 20 + col1Width + 2, yPos);
            pdf.text("EPF", 20 + col1Width*2 + 2, yPos);
            pdf.text(formatCurrency(salaryData.epf), 20 + col1Width*3 + 2, yPos);
            yPos += rowHeight;
            
            pdf.text("House Rent Allowance", 22, yPos);
            pdf.text(formatCurrency(salaryData.hra), 20 + col1Width + 2, yPos);
            pdf.text("Health Insurance", 20 + col1Width*2 + 2, yPos);
            pdf.text(formatCurrency(salaryData.healthInsurance), 20 + col1Width*3 + 2, yPos);
            yPos += rowHeight;
            
            pdf.text("Conveyance", 22, yPos);
            pdf.text(formatCurrency(salaryData.conveyance), 20 + col1Width + 2, yPos);
            pdf.text("Professional Tax", 20 + col1Width*2 + 2, yPos);
            pdf.text(formatCurrency(salaryData.professionalTax), 20 + col1Width*3 + 2, yPos);
            yPos += rowHeight;
            
            pdf.text("Medical", 22, yPos);
            pdf.text(formatCurrency(salaryData.medical), 20 + col1Width + 2, yPos);
            pdf.text("TDS", 20 + col1Width*2 + 2, yPos);
            pdf.text("Rs. 0.00", 20 + col1Width*3 + 2, yPos);
            yPos += rowHeight;
            
            pdf.text("Special Allowance", 22, yPos);
            pdf.text(formatCurrency(salaryData.specialAllowance), 20 + col1Width + 2, yPos);
            pdf.text("", 20 + col1Width*2 + 2, yPos);
            pdf.text("", 20 + col1Width*3 + 2, yPos);
            yPos += rowHeight;
            
            pdf.text("Other", 22, yPos);
            pdf.text(formatCurrency(salaryData.other), 20 + col1Width + 2, yPos);
            pdf.text("", 20 + col1Width*2 + 2, yPos);
            pdf.text("", 20 + col1Width*3 + 2, yPos);
            
            // Total row
            const totalRowY = startY + (rowHeight * 7);
            pdf.setFillColor(...blueColor);
            pdf.rect(20, totalRowY, pdfWidth - 40, rowHeight, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.text("Gross Salary", 22, totalRowY + 5.5);
            pdf.text(formatCurrency(salaryData.grossSalary), 20 + col1Width + 2, totalRowY + 5.5);
            pdf.text("Total Deductions", 20 + col1Width*2 + 2, totalRowY + 5.5);
            pdf.text(formatCurrency(salaryData.totalDeductions), 20 + col1Width*3 + 2, totalRowY + 5.5);
            
            pdf.setTextColor(0, 0, 0);
            
            // Reimbursements section
            const reimbRowY = totalRowY + rowHeight + 10;
            pdf.setFillColor(...blueColor);
            pdf.rect(20, reimbRowY, pdfWidth - 40, rowHeight, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.text("REIMBURSEMENTS", 20 + col1Width/2, reimbRowY + 5.5, { align: "center" });
            pdf.text("AMOUNT", 20 + col1Width + col1Width/2, reimbRowY + 5.5, { align: "center" });
            
            pdf.setTextColor(0, 0, 0);
            
            const reimbTableRows = 4;
            const reimbTableHeight = rowHeight * reimbTableRows;
            
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(20, reimbRowY + rowHeight, col1Width * 2, reimbTableHeight);
            pdf.line(20 + col1Width, reimbRowY + rowHeight, 20 + col1Width, reimbRowY + rowHeight + reimbTableHeight);
            
            for (let i = 1; i < reimbTableRows; i++) {
                pdf.line(20, reimbRowY + rowHeight + (i * rowHeight), 20 + (col1Width * 2), reimbRowY + rowHeight + (i * rowHeight));
            }
            
            let reimbY = reimbRowY + rowHeight + 6.5;
            pdf.setFont("helvetica", "normal");
            
            pdf.text("Mobile Bill", 22, reimbY);
            pdf.text(formatCurrency(salaryData.mobileBill), 20 + col1Width + 2, reimbY);
            reimbY += rowHeight;
            
            pdf.text("Travel", 22, reimbY);
            pdf.text(formatCurrency(salaryData.travel), 20 + col1Width + 2, reimbY);
            reimbY += rowHeight;
            
            pdf.text("Food", 22, reimbY);
            pdf.text(formatCurrency(salaryData.food), 20 + col1Width + 2, reimbY);
            reimbY += rowHeight;
            
            pdf.setFont("helvetica", "bold");
            pdf.text("Total Reimbursements", 22, reimbY);
            pdf.text(formatCurrency(salaryData.totalReimbursements), 20 + col1Width + 2, reimbY);
            
            // Total Net Payable
            const netPayableY = reimbRowY + rowHeight + reimbTableHeight + 10;
            pdf.setFillColor(...blueColor);
            pdf.rect(20, netPayableY, pdfWidth - 40, 18, "F");
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);
            pdf.text("TOTAL NET PAYABLE: " + formatCurrency(salaryData.netPayable), pdfWidth/2, netPayableY + 7, { align: "center" });
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "italic");
            pdf.text(numberToWords(salaryData.netPayable), pdfWidth/2, netPayableY + 14, { align: "center" });
            
            const fileName = `salary-slip-${salaryData.employeeId}-${formatDateForAPI(payPeriod).replace(', ', '-')}.pdf`;
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
                
                {!user ? (
                    <div className="p-3 bg-red-100 text-red-700 rounded">
                        Please login to view salary slips
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="font-medium">Logged in as: {user.name} ({user.employeeId})</p>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                            <input 
                                type="month"
                                value={payPeriod}
                                onChange={(e) => setPayPeriod(e.target.value)}
                                className="border border-gray-300 p-2 rounded flex-1"
                                disabled={loading}
                                placeholder="Select month (YYYY-MM)"
                            />
                            <button 
                                onClick={fetchSalaryData}
                                disabled={loading || !payPeriod}
                                className="bg-[#018ABE] hover:bg-[#016a95] text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : 'Fetch Slip'}
                            </button>
                        </div>
                        
                        {payPeriod && (
                            <div className="mt-2 text-sm text-gray-600">
                                Will fetch data for: {formatDateForAPI(payPeriod)}
                            </div>
                        )}
                    </>
                )}
                
                {error && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                
                {salaryData && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                        Salary slip loaded for {formatDateForAPI(payPeriod)}
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
                            <p className="font-semibold">{salaryData.companyName || "Nextcore Alliance"}</p>
                            <p>Kurla, Mumbai</p>
                            <p>iscr.orgin.com | 8976104646</p>
                        </div>
                    </div>

                    {/* Employee Details */}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <p><strong>Employee:</strong> {salaryData.employeeName || salaryData.name}</p>
                            <p><strong>Employee ID:</strong> {salaryData.employeeId}</p>
                        </div>
                        <div>
                            <p><strong>Department:</strong> {salaryData.department}</p>
                            <p><strong>Designation:</strong> {salaryData.designation}</p>
                        </div>
                    </div>

                    <div className="flex justify-center items-center pb-4">
                        <p>PaySlip for the Month of {formatDateForAPI(payPeriod)}</p>
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
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.hra)}</div>
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Health Insurance</div>
                            <div className="px-4 py-2">{formatCurrency(salaryData.healthInsurance)}</div>
                        </div>

                        <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Conveyance</div>
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.conveyance)}</div>
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Professional Tax</div>
                            <div className="px-4 py-2">{formatCurrency(salaryData.professionalTax)}</div>
                        </div>

                        <div className="grid grid-cols-4 text-sm border-border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Medical</div>
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.medical)}</div>
                            <div className="px-4 py-2 border-r border-gray-300 text-left">TDS</div>
                            <div className="px-4 py-2">Rs. 0.00</div>
                        </div>

                        <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Special Allowance</div>
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.specialAllowance)}</div>
                            <div className="px-4 py-2 border-r border-gray-300"></div>
                            <div className="px-4 py-2"></div>
                        </div>

                        <div className="grid grid-cols-4 text-sm">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Other</div>
                            <div className="px-4 py-2 border-r border-gray-300">{formatCurrency(salaryData.other)}</div>
                            <div className="px-4 py-2 border-r border-gray-300"></div>
                            <div className="px-4 py-2"></div>
                        </div>
                    </div>

                    {/* Final Total Row */}
                    <div className="grid grid-cols-4 text-center font-bold text-sm bg-[#018ABE] text-white">
                        <div className="px-4 py-2">Gross Salary</div>
                        <div className="px-4 py-2">{formatCurrency(salaryData.grossSalary)}</div>
                        <div className="px-4 py-2">Total Deductions</div>
                        <div className="px-4 py-2">{formatCurrency(salaryData.totalDeductions)}</div>
                    </div>

                    <div className="grid grid-cols-4 py-2 bg-[#018ABE] text-white font-semibold text-center mt-6">
                        <div className="px-4">REIMBURSEMENTS</div>
                        <div className="px-4">AMOUNT</div>
                        <div></div>
                        <div></div>
                    </div>

                    {/* Reimbursements table */}
                    <div className="border border-gray-300">
                        <div className="grid grid-cols-2 text-sm border-b border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Mobile Bill</div>
                            <div className="px-4 py-2">{formatCurrency(salaryData.mobileBill)}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 text-sm border-b border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Travel</div>
                            <div className="px-4 py-2">{formatCurrency(salaryData.travel)}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 text-sm border-b border-gray-300">
                            <div className="px-4 py-2 border-r border-gray-300 text-left">Food</div>
                            <div className="px-4 py-2">{formatCurrency(salaryData.food)}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 text-sm">
                            <div className="px-4 py-2 border-r border-gray-300 font-semibold text-left">Total Reimbursements</div>
                            <div className="px-4 py-2 font-semibold">{formatCurrency(salaryData.totalReimbursements)}</div>
                        </div>
                    </div>

                    <div className="bg-[#018ABE] text-white mt-6 p-4 rounded-lg text-center">
                        <p className="text-xl font-bold">TOTAL NET PAYABLE: {formatCurrency(salaryData.netPayable)}</p>
                        <p className="text-sm italic">{numberToWords(salaryData.netPayable)}</p>
                    </div>
                </div>
            )}

            {!salaryData && !loading && (
                <div className="text-center py-8 text-gray-500">
                    Please select a month and fetch data to view the salary slip.
                </div>
            )}
        </div>
    );
}