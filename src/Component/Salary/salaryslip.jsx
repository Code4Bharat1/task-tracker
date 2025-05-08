'use client';
import React, { useRef, useEffect } from 'react';
import gsap from "gsap";
import jsPDF from 'jspdf';
import { useGSAP } from "@gsap/react";

export default function SalarySlipPage() {
    const pdfRef = useRef();
    const underlineRef = useRef(null);
    
    useGSAP(() => {
        gsap.fromTo(
          underlineRef.current,
          { width: "0%" },
          { width: "100%", duration: 1, ease: "power2.out" }
        );
    }, []);

    const handleDownloadPdf = () => {
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
            
            // Added more spacing at the top - moved title position down
            const titleTopMargin = 35; // Changed from 25 to give more space at top
            
            // Title (centered with underline effect)
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text("Salary Payslip", pdfWidth / 2, titleTopMargin, { align: "center" });
            pdf.setDrawColor(255, 193, 7); // Yellow color for underline
            pdf.line(pdfWidth / 2 - 20, titleTopMargin + 2, pdfWidth / 2 + 20, titleTopMargin + 2);
            
            // Company info - Adjusted positions to match the new title position
            pdf.setFontSize(11);
            pdf.text("Nextcore Alliance", 20, titleTopMargin + 10);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text("Kurla, Mumbai", 20, titleTopMargin + 15);
            pdf.text("iscr.orgin.com | 8976104646", 20, titleTopMargin + 20);
            
            // Month line - Adjusted position
            const monthLineY = titleTopMargin + 30;
            pdf.text("PaySlip for the Month of September 2025", pdfWidth / 2, monthLineY, { align: "center" });
            pdf.line(20, monthLineY + 3, pdfWidth - 20, monthLineY + 3);
            
            // Table headers (Blue background) - Adjusted position
            const tableStartY = monthLineY + 10;
            const blueColor = [1, 138, 190]; // #018ABE
            pdf.setFillColor(...blueColor);
            pdf.rect(20, tableStartY, pdfWidth - 40, 8, "F");
            pdf.setTextColor(255, 255, 255); // White text
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            
            // Table column setup
            const col1Width = (pdfWidth - 40) / 4;
            
            // Headers
            pdf.text("EARNINGS", 20 + col1Width/2, tableStartY + 5, { align: "center" });
            pdf.text("AMOUNT", 20 + col1Width + col1Width/2, tableStartY + 5, { align: "center" });
            pdf.text("DEDUCTIONS", 20 + col1Width*2 + col1Width/2, tableStartY + 5, { align: "center" });
            pdf.text("AMOUNT", 20 + col1Width*3 + col1Width/2, tableStartY + 5, { align: "center" });
            
            // Reset text color to black for content
            pdf.setTextColor(0, 0, 0);
            
            // Table borders - Main Content Table
            pdf.setDrawColor(200, 200, 200); // Light gray for borders
            
            // Create exact table grid - Horizontal lines
            const rowsCount = 7; // 6 content rows + 1 total row
            const startY = tableStartY;
            const rowHeight = 8;
            const tableHeight = rowHeight * rowsCount;
            
            // Draw outer border
            pdf.rect(20, startY, pdfWidth - 40, tableHeight);
            
            // Draw all horizontal lines
            for (let i = 1; i < rowsCount; i++) {
                pdf.line(20, startY + (rowHeight * i), pdfWidth - 20, startY + (rowHeight * i));
            }
            
            // Draw all vertical lines
            pdf.line(20 + col1Width, startY, 20 + col1Width, startY + tableHeight); // Vertical line 1
            pdf.line(20 + col1Width*2, startY, 20 + col1Width*2, startY + tableHeight); // Vertical line 2
            pdf.line(20 + col1Width*3, startY, 20 + col1Width*3, startY + tableHeight); // Vertical line 3
            
            // Earnings and deductions content
            pdf.setFont("helvetica", "normal");
            
            // Function to properly format currency with Rs
            const formatCurrency = (amount) => {
                return "Rs. " + amount;
            };
            
            // Center text vertically in each cell
            const cellPadding = 4;
            let negativeOffset = -5; // Example negative value
            let yPos = startY + rowHeight - negativeOffset; 
            
            
            // Table data rows
            pdf.text("Basic Salary", 22, yPos);
            pdf.text(formatCurrency("50,600.00"), 20 + col1Width + 2, yPos);
            pdf.text("EPF", 20 + col1Width*2 + 2, yPos);
            pdf.text(formatCurrency("800.00"), 20 + col1Width*3 + 2, yPos);
            yPos += rowHeight;
            
            pdf.text("House Rent Allowance", 22, yPos);
            pdf.text(formatCurrency("200.00"), 20 + col1Width + 2, yPos);
            pdf.text("Health Insurance", 20 + col1Width*2 + 2, yPos);
            pdf.text(formatCurrency("356.36"), 20 + col1Width*3 + 2, yPos);
            yPos += rowHeight;
            
            pdf.text("Conveyance", 22, yPos);
            pdf.text(formatCurrency("150.00"), 20 + col1Width + 2, yPos);
            pdf.text("Professional Tax", 20 + col1Width*2 + 2, yPos);
            pdf.text(formatCurrency("62.55"), 20 + col1Width*3 + 2, yPos);
            yPos += rowHeight;
            
            pdf.text("Medical", 22, yPos);
            pdf.text(formatCurrency("150.00"), 20 + col1Width + 2, yPos);
            pdf.text("TDS", 20 + col1Width*2 + 2, yPos);
            pdf.text(formatCurrency("0.00"), 20 + col1Width*3 + 2, yPos);
            yPos += rowHeight;
            
            pdf.text("Special Allowance", 22, yPos);
            pdf.text(formatCurrency("300.00"), 20 + col1Width + 2, yPos);
            pdf.text("", 20 + col1Width*2 + 2, yPos);
            pdf.text("", 20 + col1Width*3 + 2, yPos);
            yPos += rowHeight;
            
            pdf.text("Other", 22, yPos);
            pdf.text(formatCurrency("10.00"), 20 + col1Width + 2, yPos);
            pdf.text("", 20 + col1Width*2 + 2, yPos);
            pdf.text("", 20 + col1Width*3 + 2, yPos);
            
            // Total row with blue background
            const totalRowY = startY + (rowHeight * 7);
            pdf.setFillColor(...blueColor);
            pdf.rect(20, totalRowY, pdfWidth - 40, rowHeight, "F");
            pdf.setTextColor(255, 255, 255); // White text
            pdf.setFont("helvetica", "bold");
            pdf.text("Gross Salary", 22, totalRowY + 5.5);
            pdf.text(formatCurrency("51,410.00"), 20 + col1Width + 2, totalRowY + 5.5);
            pdf.text("Total Deductions", 20 + col1Width*2 + 2, totalRowY + 5.5);
            pdf.text(formatCurrency("1,218.55"), 20 + col1Width*3 + 2, totalRowY + 5.5);
            
            // Reset text color
            pdf.setTextColor(0, 0, 0);
            
            // Reimbursements section - Adjusted position
            const reimbRowY = totalRowY + rowHeight + 10;
            pdf.setFillColor(...blueColor); // Blue color 
            pdf.rect(20, reimbRowY, pdfWidth - 40, rowHeight, "F");
            pdf.setTextColor(255, 255, 255); // White text
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.text("REIMBURSEMENTS", 20 + col1Width/2, reimbRowY + 5.5, { align: "center" });
            pdf.text("AMOUNT", 20 + col1Width + col1Width/2, reimbRowY + 5.5, { align: "center" });
            pdf.text("", 20 + col1Width*2 + col1Width/2, reimbRowY + 5.5, { align: "center" });
            pdf.text("", 20 + col1Width*3 + col1Width/2, reimbRowY + 5.5, { align: "center" });
            
            // Reset text color
            pdf.setTextColor(0, 0, 0);
            
            // Add borders for reimbursement section
            const reimbTableRows = 4; // 3 items + 1 total row
            const reimbTableHeight = rowHeight * reimbTableRows;
            
            pdf.setDrawColor(200, 200, 200);
            // Outer border
            pdf.rect(20, reimbRowY + rowHeight, col1Width * 2, reimbTableHeight);
            // Vertical line
            pdf.line(20 + col1Width, reimbRowY + rowHeight, 20 + col1Width, reimbRowY + rowHeight + reimbTableHeight);
            
            // Add horizontal lines for reimbursement rows
            for (let i = 1; i < reimbTableRows; i++) {
                pdf.line(20, reimbRowY + rowHeight + (i * rowHeight), 20 + (col1Width * 2), reimbRowY + rowHeight + (i * rowHeight));
            }
            
            // Reimbursement items
            let reimbY = reimbRowY + rowHeight + 6.5;
            pdf.setFont("helvetica", "normal");
            
            pdf.text("Mobile Bill", 22, reimbY);
            pdf.text(formatCurrency("50.00"), 20 + col1Width + 2, reimbY);
            reimbY += rowHeight;
            
            pdf.text("Travel", 22, reimbY);
            pdf.text(formatCurrency("30.00"), 20 + col1Width + 2, reimbY);
            reimbY += rowHeight;
            
            pdf.text("Food", 22, reimbY);
            pdf.text(formatCurrency("20.00"), 20 + col1Width + 2, reimbY);
            reimbY += rowHeight;
            
            pdf.setFont("helvetica", "bold");
            pdf.text("Total Reimbursements", 22, reimbY);
            pdf.text(formatCurrency("100.00"), 20 + col1Width + 2, reimbY);
            
            // Total Net Payable
            const netPayableY = reimbRowY + rowHeight + reimbTableHeight + 10;
            pdf.setFillColor(...blueColor); // Blue background
            pdf.rect(20, netPayableY, pdfWidth - 40, 18, "F");
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255); // White text
            pdf.text("TOTAL NET PAYABLE: " + formatCurrency("50,313.95"), pdfWidth/2, netPayableY + 7, { align: "center" });
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "italic");
            pdf.text("(Fifty Thousand Three Hundred and Thirteen Rupees & 95/100)", pdfWidth/2, netPayableY + 14, { align: "center" });
            
            // Save the PDF
            pdf.save('salary-slip.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please check console for details.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white">
            {/* Download Button */}
            <div className="text-right mb-4">
                <button 
                    onClick={handleDownloadPdf}
                    className="bg-[#058CBF] hover:bg-orange-600 text-white font-bold cursor-pointer py-2 px-4 rounded"
                >
                    Download PDF
                </button>
            </div>

            {/* PDF Content Starts Here */}
            <div ref={pdfRef} className="max-w-4xl mx-auto p-8 bg-white shadow-lg border rounded-lg mt-10 font-sans text-sm">
                <div className="mb-6">
                <h2 className="text-center font-semibold text-gray-800  text-2xl mb-6">
                    <span className="relative inline-block">
                        Salary Payslip
                        <span
                            ref={underlineRef}
                            className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full"
                        ></span>
                    </span>
                </h2>
                <div className="mt-2">
                    <p className="font-semibold">Nextcore Alliance</p>
                    <p>Kurla, Mumbai</p>
                    <p>iscr.orgin.com | 8976104646</p>
                </div>
                </div>

                <div className="flex justify-center items-center pb-4">
                    <p>PaySlip for the Month of September 2025</p>
                </div>

                {/* Table Head */}
                <div className="grid grid-cols-4 bg-[#018ABE] text-white text-center font-semibold py-2 border border-gray-300">
                    <div className="px-2">EARNINGS</div>
                    <div className="px-2">AMOUNT</div>
                    <div className="px-2">DEDUCTIONS</div>
                    <div className="px-2">AMOUNT</div>
                </div>

                {/* Table Body - Main data table with consistent borders */}
                <div className="border-x border-b border-gray-300">
                    <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 text-left">Basic Salary</div>
                        <div className="px-4 py-2 border-r border-gray-300">Rs. 50,600.00</div>
                        <div className="px-4 py-2 border-r border-gray-300 text-left">EPF</div>
                        <div className="px-4 py-2">Rs. 800.00</div>
                    </div>

                    <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 text-left">House Rent Allowance</div>
                        <div className="px-4 py-2 border-r border-gray-300">Rs. 200.00</div>
                        <div className="px-4 py-2 border-r border-gray-300 text-left">Health Insurance</div>
                        <div className="px-4 py-2">Rs. 356.36</div>
                    </div>

                    <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 text-left">Conveyance</div>
                        <div className="px-4 py-2 border-r border-gray-300">Rs. 150.00</div>
                        <div className="px-4 py-2 border-r border-gray-300 text-left">Professional Tax</div>
                        <div className="px-4 py-2">Rs. 62.55</div>
                    </div>

                    <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 text-left">Medical</div>
                        <div className="px-4 py-2 border-r border-gray-300">Rs. 150.00</div>
                        <div className="px-4 py-2 border-r border-gray-300 text-left">TDS</div>
                        <div className="px-4 py-2">Rs. 0.00</div>
                    </div>

                    <div className="grid grid-cols-4 text-sm border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 text-left">Special Allowance</div>
                        <div className="px-4 py-2 border-r border-gray-300">Rs. 300.00</div>
                        <div className="px-4 py-2 border-r border-gray-300"></div>
                        <div className="px-4 py-2"></div>
                    </div>

                    <div className="grid grid-cols-4 text-sm">
                        <div className="px-4 py-2 border-r border-gray-300 text-left">Other</div>
                        <div className="px-4 py-2 border-r border-gray-300">Rs. 10.00</div>
                        <div className="px-4 py-2 border-r border-gray-300"></div>
                        <div className="px-4 py-2"></div>
                    </div>
                </div>

                {/* Final Total Row */}
                <div className="grid grid-cols-4 text-center font-bold text-sm bg-[#018ABE] text-white">
                    <div className="px-4 py-2">Gross Salary</div>
                    <div className="px-4 py-2">Rs. 51,410.00</div>
                    <div className="px-4 py-2">Total Deductions</div>
                    <div className="px-4 py-2">Rs. 1,218.55</div>
                </div>

                <div className="grid grid-cols-4 py-2 bg-[#018ABE] text-white font-semibold text-center mt-6">
                    <div className="px-4">REIMBURSEMENTS</div>
                    <div className="px-4">AMOUNT</div>
                    <div></div>
                    <div></div>
                </div>

                {/* Reimbursements table with proper borders */}
                <div className="border border-gray-300">
                    <div className="grid grid-cols-2 text-sm border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 text-left">Mobile Bill</div>
                        <div className="px-4 py-2">Rs. 50.00</div>
                    </div>
                    
                    <div className="grid grid-cols-2 text-sm border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 text-left">Travel</div>
                        <div className="px-4 py-2">Rs. 30.00</div>
                    </div>
                    
                    <div className="grid grid-cols-2 text-sm border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 text-left">Food</div>
                        <div className="px-4 py-2">Rs. 20.00</div>
                    </div>
                    
                    <div className="grid grid-cols-2 text-sm">
                        <div className="px-4 py-2 border-r border-gray-300 font-semibold text-left">Total Reimbursements</div>
                        <div className="px-4 py-2 font-semibold">Rs. 100.00</div>
                    </div>
                </div>

                <div className="bg-[#018ABE] text-white mt-6 p-4 rounded-lg text-center">
                    <p className="text-xl font-bold">TOTAL NET PAYABLE: Rs. 50,313.95</p>
                    <p className="text-sm italic">(Fifty Thousand Three Hundred and Thirteen Rupees & 95/100)</p>
                </div>
            </div>
        </div>
    );
}