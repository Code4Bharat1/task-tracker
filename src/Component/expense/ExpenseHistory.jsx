'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTrashAlt } from "react-icons/fa";
import { Check, X, ChevronLeft, Filter } from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';
import gsap from 'gsap';
import Link from 'next/link';

export default function ExpenseHistory() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [deleteModal, setDeleteModal] = useState({ show: false, expenseId: null });

    const tableRef = useRef(null);
    const headerRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        fetchExpenses();

        if (headerRef.current) {
            gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
        }
        if (tableRef.current) {
            gsap.fromTo(tableRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" });
        }
    }, []);

    useEffect(() => {
        if (deleteModal.show && modalRef.current) {
            gsap.fromTo(modalRef.current, 
                { opacity: 0, scale: 0.9 }, 
                { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    }, [deleteModal.show]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/expense/getExpense');
            setExpenses(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching expenses:', err);
            setError('Failed to load expense history');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (id) => {
        setDeleteModal({ show: true, expenseId: id });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, expenseId: null });
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/expense/${deleteModal.expenseId}/delete`);
            showToast('success', 'Expense deleted successfully');
            fetchExpenses();
        } catch (err) {
            console.error('Error deleting expense:', err);
            showToast('error', 'Failed to delete expense');
        } finally {
            closeDeleteModal();
        }
    };

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => {
            setToast({ show: false, type: '', message: '' });
        }, 4000);
    };

    const filterExpenses = () => {
        if (filter === 'all') return expenses;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);

        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            expenseDate.setHours(0, 0, 0, 0);

            if (filter === 'day') return expenseDate.getTime() === today.getTime();
            if (filter === 'week') return expenseDate >= weekAgo;
            if (filter === 'month') return expenseDate >= monthAgo;
            return true;
        });
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const filteredExpenses = filterExpenses();

    return (
        <div className="min-h-screen p-6">
            {/* Toast */}
            {toast.show && (
                <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg flex items-center gap-2 transition-all z-50 ${toast.type === 'success'
                    ? 'bg-green-100 text-green-800 border-l-4 border-green-500'
                    : 'bg-red-100 text-red-800 border-l-4 border-red-500'
                    }`}>
                    {toast.type === 'success' ? <Check className="text-green-500" size={20} /> : <X className="text-red-500" size={20} />}
                    <p className="font-medium">{toast.message}</p>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
                    <div 
                        ref={modalRef}
                        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
                    >
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this expense? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div ref={headerRef} className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/expense" className="flex items-center text-gray-600 hover:text-gray-900">
                            <ChevronLeft size={20} />
                            <span>Back to Expense Form</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">Expense History</h1>
                    </div>
                    <div className="flex items-center gap-2 bg-white shadow-sm rounded-lg p-2 border border-gray-200">
                        <Filter size={18} className="text-gray-500" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="border-none text-sm focus:ring-0 focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Time</option>
                            <option value="day">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div ref={tableRef} className="bg-white shadow-xl rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading expenses...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">{error}</div>
                    ) : filteredExpenses.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">No expenses found for the selected filter.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredExpenses.map((expense) => (
                                        <tr key={expense._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(expense.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{expense.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold">₹{expense.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{expense.paymentMethod}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(expense.status)}`}>
                                                    {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                                                </span>
                                                {expense.status === 'rejected' && expense.rejectionReason && (
                                                    <div className="text-xs text-red-500 mt-1">{expense.rejectionReason}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => (expense.status === 'pending' || expense.status === 'rejected') ? openDeleteModal(expense._id) : null}
                                                    className={`transition-colors ${expense.status === 'pending' || expense.status === 'rejected' ? 'text-red-600 hover:text-red-800' : 'text-gray-400 cursor-not-allowed'}`}
                                                    title={expense.status !== 'pending' && expense.status !== 'rejected' ? 'Only pending or rejected expenses can be deleted' : 'Delete'}
                                                >
                                                    <FaTrashAlt size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}