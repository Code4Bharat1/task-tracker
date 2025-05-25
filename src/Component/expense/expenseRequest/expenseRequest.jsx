"use client"
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Eye, MoreHorizontal, Check, X, FileText, Trash2, Filter } from 'lucide-react';
import axios from 'axios';

export default function ExpenseRequest() {
  // State for expenses data
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // State for dropdowns
  const [showMoreOptions, setShowMoreOptions] = useState({});

  // State for filters
  const [filters, setFilters] = useState({
    timeFrame: 'all',
    status: 'all'
  });

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-dropdown]')) {
        setShowMoreOptions({});
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Fetch expenses on component mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/expense/getAllExpense`,
          {
            withCredentials: true
          }
        );

        setExpenses(response.data.data);
        setFilteredExpenses(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [filters, expenses]);

  // Function to apply filters
  const applyFilters = () => {
    let result = [...expenses];

    // Apply time frame filter
    if (filters.timeFrame !== 'all') {
      const now = new Date();
      const startDate = new Date();

      if (filters.timeFrame === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (filters.timeFrame === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (filters.timeFrame === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      result = result.filter(expense => new Date(expense.date) >= startDate);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(expense => expense.status === filters.status);
    }

    setFilteredExpenses(result);
  };

  // Function to handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Function to handle document view
  const handleViewDocument = (expense, document) => {
    setSelectedExpense(expense);
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  // Function to handle more details view
  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
    // Close the dropdown if it was open
    setShowMoreOptions(prev => ({ ...prev, [expense._id]: false }));
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = (expense) => {
    setSelectedExpense(expense);
    setShowDeleteConfirmModal(true);
    // Close the dropdown if it was open
    setShowMoreOptions(prev => ({ ...prev, [expense._id]: false }));
  };

  // Function to handle rejection modal
  const handleReject = (expense) => {
    setSelectedExpense(expense);
    setShowRejectModal(true);
  };

  // Function to submit rejection
  const handleSubmitRejection = async () => {
    if (!selectedExpense || !rejectionReason.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/expense/${selectedExpense._id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to reject expense');

      setExpenses(expenses.map(exp =>
        exp._id === selectedExpense._id
          ? { ...exp, status: 'rejected', rejectionReason }
          : exp
      ));

      setRejectionReason('');
      setShowRejectModal(false);
    } catch (err) {
      console.error('Error rejecting expense:', err);
      setError(err.message);
    }
  };

  // Function to delete expense
  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/expense/${selectedExpense._id}/delete`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete expense');

      // Remove the deleted expense from the state
      setExpenses(expenses.filter(exp => exp._id !== selectedExpense._id));
      setShowDeleteConfirmModal(false);
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError(err.message);
    }
  };

  const handleApprove = async (expense) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/expense/${expense._id}/approve`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to approve expense');

      setExpenses(expenses.map(exp =>
        exp._id === expense._id
          ? { ...exp, status: 'approved', rejectionReason: '' }
          : exp
      ));
    } catch (err) {
      console.error('Error approving expense:', err);
      setError(err.message);
    }
  };

  // Handle more options toggle
  const toggleMoreOptions = (event, expenseId) => {
    event.stopPropagation(); // Prevent the event from bubbling up
    setShowMoreOptions(prev => {
      const newState = { ...prev };
      // Close all other dropdowns
      Object.keys(newState).forEach(key => {
        if (key !== expenseId) newState[key] = false;
      });
      // Toggle the current dropdown
      newState[expenseId] = !prev[expenseId];
      return newState;
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <X className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Expense Management</h1>

      {/* Filter controls */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <div className="flex items-center">
          <Filter size={16} className="mr-2 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div>
            <label htmlFor="timeFrame" className="block text-xs font-medium text-gray-500 mb-1">Time Period</label>
            <select
              id="timeFrame"
              value={filters.timeFrame}
              onChange={(e) => handleFilterChange('timeFrame', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No expenses found</p>
        </div>
      ) : (
        <div className="w-full">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">More</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {expense.userId.firstName} {expense.userId.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{expense.userId.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{expense.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(expense.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                          expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.documents.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewDocument(expense, expense.documents[0])}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            <Eye size={14} className="mr-1" /> View
                          </button>
                          {expense.documents.length > 1 && (
                            <span className="text-xs text-gray-500">+{expense.documents.length - 1} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No documents</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {expense.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(expense)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                          >
                            <Check size={14} className="mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(expense)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            <X size={14} className="mr-1" /> Reject
                          </button>
                        </div>
                      )}
                      {expense.status !== 'pending' && (
                        <span className="text-xs text-gray-500">
                          {expense.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                      <div className="relative inline-block" data-dropdown>
                        <button
                          onClick={(e) => toggleMoreOptions(e, expense._id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {/* More options dropdown */}
                        {showMoreOptions[expense._id] && (
                          <div
                            className="fixed z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                            style={{
                              right: 'auto',
                              left: 'auto',
                              // Calculate position based on viewport
                              position: 'fixed',
                              top: `${event?.clientY + window.scrollY + 20}px`,
                              left: `${event?.clientX - 100}px`
                            }}
                          >
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              <button
                                onClick={() => handleViewDetails(expense)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                              >
                                <Eye size={14} className="inline mr-2" /> View Details
                              </button>
                              <button
                                onClick={() => handleDeleteConfirm(expense)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                role="menuitem"
                              >
                                <Trash2 size={14} className="inline mr-2" /> Delete Expense
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Document View Modal */}
          {showDocumentModal && selectedDocument && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-150">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedDocument.fileName}
                  </h3>
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 flex justify-center">
                  {selectedDocument.fileUrl.endsWith('.pdf') ? (
                    <iframe
                      src={selectedDocument.fileUrl}
                      className="w-full h-96"
                      title="PDF Document"
                    />
                  ) : (
                    <img
                      src={selectedDocument.fileUrl}
                      alt="Document"
                      className="max-h-96 object-contain"
                    />
                  )}
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-end">
                  <a
                    href={selectedDocument.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText size={16} className="mr-2" />
                    Open Original
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Details Modal */}
          {showDetailsModal && selectedExpense && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Expense Details
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Employee</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedExpense.userId.firstName} {selectedExpense.userId.lastName}</p>
                      <p className="mt-1 text-xs text-gray-500">{selectedExpense.userId.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Category</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedExpense.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedExpense.amount)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Date</h4>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedExpense.date)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${selectedExpense.status === 'approved' ? 'bg-green-100 text-green-800' :
                            selectedExpense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                          {selectedExpense.status.charAt(0).toUpperCase() + selectedExpense.status.slice(1)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedExpense.paymentMethod}</p>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Description</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedExpense.description}</p>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Documents</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedExpense.documents.map((doc, index) => (
                          <button
                            key={index}
                            onClick={() => handleViewDocument(selectedExpense, doc)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye size={14} className="mr-1" />
                            {doc.fileName.length > 20 ? doc.fileName.substring(0, 20) + '...' : doc.fileName}
                          </button>
                        ))}
                      </div>
                    </div>
                    {selectedExpense.status === 'rejected' && selectedExpense.rejectionReason && (
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Rejection Reason</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedExpense.rejectionReason}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Additional Information</h4>
                      <p className="mt-1 text-xs text-gray-500">Created: {format(new Date(selectedExpense.createdAt), 'dd MMM yyyy HH:mm')}</p>
                      <p className="mt-1 text-xs text-gray-500">Last Updated: {format(new Date(selectedExpense.updatedAt), 'dd MMM yyyy HH:mm')}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Modal */}
          {showRejectModal && selectedExpense && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Reject Expense
                  </h3>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6">
                  <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
                    Reason for Rejection
                  </label>
                  <textarea
                    id="rejection-reason"
                    rows={4}
                    className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Please provide a reason for rejecting this expense..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRejection}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                  >
                    Reject Expense
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirmModal && selectedExpense && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs  bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Confirm Deletion
                  </h3>
                  <button
                    onClick={() => setShowDeleteConfirmModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this expense? This action cannot be undone.
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700">
                      {selectedExpense.category} - {formatCurrency(selectedExpense.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted by: {selectedExpense.userId.firstName} {selectedExpense.userId.lastName} on {formatDate(selectedExpense.date)}
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowDeleteConfirmModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteExpense}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete Expense
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}