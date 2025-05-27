"use client";

import { useState, useEffect, useRef } from "react";
import { FaTrashAlt } from "react-icons/fa";
import {
  Check,
  X,
  ChevronLeft,
  Filter,
  Calendar,
  CreditCard,
  DollarSign,
  Tag,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import gsap from "gsap";
import Link from "next/link";

export default function ExpenseHistory() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    expenseId: null,
  });

  const tableRef = useRef(null);
  const headerRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    fetchExpenses();

    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
    if (tableRef.current) {
      gsap.fromTo(
        tableRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" }
      );
    }
  }, []);

  useEffect(() => {
    if (deleteModal.show && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [deleteModal.show]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      console.log("Fetching expenses...");
      const response = await axiosInstance.get("/expense/getExpense");
      console.log("Expenses fetched:", response.data);
      setExpenses(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      console.error("Fetch error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError("Failed to load expense history");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    console.log("Opening delete modal for expense ID:", id);
    setDeleteModal({ show: true, expenseId: id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, expenseId: null });
  };

  const handleDelete = async () => {
    try {
      console.log("Attempting to delete expense ID:", deleteModal.expenseId);

      const response = await axiosInstance.delete(
        `/expense/${deleteModal.expenseId}/delete`
      );
      console.log("Delete response:", response);

      showToast("success", "Expense deleted successfully");
      await fetchExpenses(); // Wait for refetch to complete
    } catch (err) {
      console.error("Error deleting expense:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });

      // More specific error messages
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        "Failed to delete expense";
      showToast("error", errorMessage);
    } finally {
      closeDeleteModal();
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 4000);
  };

  const filterExpenses = () => {
    if (filter === "all") return expenses;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      expenseDate.setHours(0, 0, 0, 0);

      if (filter === "day") return expenseDate.getTime() === today.getTime();
      if (filter === "week") return expenseDate >= weekAgo;
      if (filter === "month") return expenseDate >= monthAgo;
      return true;
    });
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const filteredExpenses = filterExpenses();

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 left-4 right-4 sm:top-6 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:max-w-md p-4 rounded-md shadow-lg flex items-center gap-2 transition-all z-50 ${
            toast.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : "bg-red-100 text-red-800 border-l-4 border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="text-green-500 flex-shrink-0" size={20} />
          ) : (
            <X className="text-red-500 flex-shrink-0" size={20} />
          )}
          <p className="font-medium text-sm sm:text-base">{toast.message}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div ref={headerRef} className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Link
              href="/expense"
              className="flex items-center text-gray-600 hover:text-gray-900 w-fit"
            >
              <ChevronLeft size={20} />
              <span className="text-sm sm:text-base">Back to Expense Form</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Expense History
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-white shadow-sm rounded-lg p-2 border border-gray-200 w-full sm:w-auto">
            <Filter size={18} className="text-gray-500 flex-shrink-0" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-none text-sm focus:ring-0 focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Time</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div
          ref={tableRef}
          className="bg-white shadow-xl rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading expenses...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No expenses found for the selected filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          ₹{expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(
                              expense.status
                            )}`}
                          >
                            {expense.status.charAt(0).toUpperCase() +
                              expense.status.slice(1)}
                          </span>
                          {expense.status === "rejected" &&
                            expense.rejectionReason && (
                              <div className="text-xs text-red-500 mt-1">
                                {expense.rejectionReason}
                              </div>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              expense.status === "pending" ||
                              expense.status === "rejected"
                                ? openDeleteModal(expense._id)
                                : null
                            }
                            className={`transition-colors p-2 rounded-md ${
                              expense.status === "pending" ||
                              expense.status === "rejected"
                                ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                            title={
                              expense.status !== "pending" &&
                              expense.status !== "rejected"
                                ? "Only pending or rejected expenses can be deleted"
                                : "Delete"
                            }
                          >
                            <FaTrashAlt size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(
                            expense.status
                          )}`}
                        >
                          {expense.status.charAt(0).toUpperCase() +
                            expense.status.slice(1)}
                        </span>
                        <button
                          onClick={() =>
                            expense.status === "pending" ||
                            expense.status === "rejected"
                              ? openDeleteModal(expense._id)
                              : null
                          }
                          className={`transition-colors p-2 rounded-md ${
                            expense.status === "pending" ||
                            expense.status === "rejected"
                              ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            expense.status !== "pending" &&
                            expense.status !== "rejected"
                              ? "Only pending or rejected expenses can be deleted"
                              : "Delete"
                          }
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {expense.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={16} className="text-green-600" />
                          <span className="font-semibold text-lg text-gray-900">
                            ₹{expense.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {expense.paymentMethod}
                        </span>
                      </div>

                      {expense.status === "rejected" &&
                        expense.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 rounded-md border-l-2 border-red-200">
                            <p className="text-xs text-red-600 font-medium">
                              Rejection Reason:
                            </p>
                            <p className="text-xs text-red-500">
                              {expense.rejectionReason}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
