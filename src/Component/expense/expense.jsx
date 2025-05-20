'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { CheckCircle, AlertCircle, Plus, History } from 'lucide-react';
import { FaTrashAlt, FaRegCalendarAlt, FaPaperclip } from "react-icons/fa";
import { axiosInstance } from '@/lib/axiosInstance';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';

export default function Expense() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const underlineRef = useRef(null);
    const formRef = useRef(null);
    const historyBtnRef = useRef(null);

    useGSAP(() => {
        if (underlineRef.current) {
            gsap.fromTo(
                underlineRef.current,
                { scaleX: 0, transformOrigin: 'left' },
                { scaleX: 1, duration: 1, ease: 'power3.out' }
            );
        }

        if (formRef.current) {
            gsap.from(formRef.current, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: 0.3,
                ease: "power3.out"
            });
        }
        
        if (historyBtnRef.current) {
            gsap.from(historyBtnRef.current, {
                opacity: 0,
                y: -10,
                duration: 0.5,
                delay: 0.5,
                ease: "power3.out"
            });
        }
    }, []);

    const categories = ['Travel', 'Food Expense', 'Hotel Expense', 'Misc'];
    const paymentMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'];

    const [expenses, setExpenses] = useState([{
        id: Date.now(),
        category: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        paymentMethod: '',
        file: null,
        fileName: 'No file chosen'
    }]);

    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => {
            setToast({ show: false, type: '', message: '' });
        }, 4000);
    };

    const addExpense = () => {
        setExpenses([...expenses, {
            id: Date.now(),
            category: '',
            date: new Date().toISOString().split('T')[0],
            amount: '',
            description: '',
            paymentMethod: '',
            file: null,
            fileName: 'No file chosen'
        }]);

        // Animate the new form entry
        gsap.from(`.expense-item:last-child`, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: "power2.out"
        });
    };

    const removeExpense = (id) => {
        if (expenses.length > 1) {
            const item = document.getElementById(`expense-${id}`);
            if (item) {
                gsap.to(item, {
                    opacity: 0,
                    x: -20,
                    duration: 0.3,
                    onComplete: () => {
                        setExpenses(expenses.filter(exp => exp.id !== id));
                    }
                });
            }
        } else {
            showToast('error', 'You need at least one expense entry');
        }
    };

    const handleChange = (id, field, value) => {
        setExpenses(expenses.map(exp =>
            exp.id === id ? { ...exp, [field]: value } : exp
        ));
    };

    const handleFileChange = (id, e) => {
        const file = e.target.files[0];
        if (file) {
            setExpenses(expenses.map(exp =>
                exp.id === id ? {
                    ...exp,
                    file: file,
                    fileName: file.name
                } : exp
            ));
        }
    };

    const removeFile = (id) => {
        setExpenses(expenses.map(exp =>
            exp.id === id ? {
                ...exp,
                file: null,
                fileName: 'No file chosen'
            } : exp
        ));
        // Reset file input
        const fileInput = document.getElementById(`file-input-${id}`);
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all expenses
        const isValid = expenses.every(exp =>
            exp.category &&
            exp.date &&
            exp.amount &&
            exp.paymentMethod
        );

        if (!isValid) {
            showToast('error', 'Please fill all required fields for each expense');
            return;
        }

        try {
            // Start loading state
            setIsSubmitting(true);

            // First, upload any files to Cloudinary and get their URLs
            const expensesWithDocs = await Promise.all(
                expenses.map(async (exp) => {
                    let documents = [];

                    if (exp.file) {
                        // Create form data for Cloudinary upload
                        const formData = new FormData();
                        formData.append('file', exp.file);

                        // Upload the file to Cloudinary through our backend
                        const uploadResponse = await axiosInstance.post('/upload', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });

                        // If successful, add the Cloudinary file info to documents
                        if (uploadResponse.data && uploadResponse.data.fileUrl) {
                            documents.push({
                                fileName: uploadResponse.data.fileName,
                                fileUrl: uploadResponse.data.fileUrl,
                                publicId: uploadResponse.data.publicId, // Store Cloudinary public ID
                                format: uploadResponse.data.format,
                                resourceType: uploadResponse.data.resourceType
                            });
                        }
                    }

                    // Return expense data in the format expected by backend
                    return {
                        category: exp.category,
                        amount: parseFloat(exp.amount),
                        date: exp.date,
                        paymentMethod: exp.paymentMethod,
                        description: exp.description,
                        documents: documents
                    };
                })
            );

            // Now submit all expenses to the backend
            const response = await axiosInstance.post('/expense/createExpense', {
                expenses: expensesWithDocs
            });

            if (response.status === 201) {
                // Show success message
                showToast('success', 'Expenses submitted successfully!');

                // Reset the form after successful submission
                setExpenses([{
                    id: Date.now(),
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                    amount: '',
                    description: '',
                    paymentMethod: '',
                    file: null,
                    fileName: 'No file chosen'
                }]);

                // Animation on submit
                gsap.to(formRef.current, {
                    y: -10,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut"
                });
            }
        } catch (error) {
            console.error('Error submitting expenses:', error);

            // Show appropriate error message
            const errorMessage = error.response?.data?.message || 'Failed to submit expenses. Please try again.';
            showToast('error', errorMessage);
        } finally {
            // End loading state
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-6">
            {/* Toast Notifications */}
            {toast.show && (
                <div
                    className={`fixed top-6 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg flex items-center gap-2 transition-all z-50 ${toast.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
                        'bg-red-100 text-red-800 border-l-4 border-red-500'
                        }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle className="text-green-500" size={20} />
                    ) : (
                        <AlertCircle className="text-red-500" size={20} />
                    )}
                    <p className="font-medium">{toast.message}</p>
                </div>
            )}

            {/* Header Section with Title and History Button */}
            <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center">
                <div className="relative ml-4 mt-4 w-max">
                    <h2 className="text-3xl font-bold text-gray-800">Expense Form</h2>
                    <span
                        ref={underlineRef}
                        className="absolute left-0 bottom-0 h-[3px] bg-cyan-500 w-full scale-x-0"
                    ></span>
                </div>
                
                {/* History Button */}
                <Link href="/expense/expenseHistory">
                    <div 
                        ref={historyBtnRef}
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm border border-blue-200"
                    >
                        <History size={18} />
                        <span className="font-medium">Expense History</span>
                    </div>
                </Link>
            </div>

            {/* Expense Form */}
            <div
                ref={formRef}
                className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200 max-w-2xl mx-auto"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {expenses.map((expense, index) => (
                        <div
                            key={expense.id}
                            id={`expense-${expense.id}`}
                            className="expense-item bg-gray-50 p-6 rounded-xl border border-gray-200 relative"
                        >
                            {expenses.length > 1 && (
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium text-gray-700">Expense #{index + 1}</h3>
                                    <button
                                        type="button"
                                        onClick={() => removeExpense(expense.id)}
                                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                                    >
                                        <FaTrashAlt size={12} />
                                        Remove
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Category Dropdown */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={expense.category}
                                            onChange={(e) => handleChange(expense.id, 'category', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={expense.date || ''}
                                                placeholder="Select date"
                                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                onFocus={() =>
                                                    document.getElementById(`real-date-${expense.id}`)?.showPicker?.()
                                                }
                                                onChange={(e) => handleChange(expense.id, 'date', e.target.value)}
                                                required
                                            />
                                            <input
                                                type="date"
                                                id={`real-date-${expense.id}`}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleChange(expense.id, 'date', e.target.value)}
                                            />
                                            <FaRegCalendarAlt
                                                onClick={() =>
                                                    document.getElementById(`real-date-${expense.id}`)?.showPicker?.()
                                                }
                                                className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                                                size={16}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                value={expense.amount}
                                                onChange={(e) => handleChange(expense.id, 'amount', e.target.value)}
                                                className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Payment Method <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={expense.paymentMethod}
                                            onChange={(e) => handleChange(expense.id, 'paymentMethod', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                            required
                                        >
                                            <option value="">Select payment method</option>
                                            {paymentMethods.map((method) => (
                                                <option key={method} value={method}>{method}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Description (full width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={expense.description}
                                        onChange={(e) => handleChange(expense.id, 'description', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                        placeholder="Enter expense details..."
                                        rows={2}
                                    />
                                </div>

                                {/* File Upload (full width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Receipt/Attachment
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <label
                                            htmlFor={`file-input-${expense.id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <FaPaperclip className="text-gray-500" />
                                            <span className="text-sm">Choose File</span>
                                            <input
                                                type="file"
                                                accept="image/*" // ← Only allow image files
                                                id={`file-input-${expense.id}`}
                                                className="hidden"
                                                onChange={(e) => handleFileChange(expense.id, e)}
                                            />

                                        </label>
                                        <div className="flex-1 flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                                            <span className="text-sm text-gray-700 truncate max-w-xs">
                                                {expense.fileName}
                                            </span>
                                            {expense.file && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(expense.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FaTrashAlt size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Upload receipt or supporting document (optional)
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={addExpense}
                            className="flex items-center justify-center px-6 py-2 border border-dashed border-gray-400 rounded-lg text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Another Expense
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Expenses"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}