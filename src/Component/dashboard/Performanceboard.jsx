"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, Calendar, Filter, Search, TrendingUp, TrendingDown, Award, Clock, Users, BarChart3, AlertCircle } from 'lucide-react';

const PerformanceBoard = () => {
    
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    period: 'monthly',
    date: new Date().toISOString().split('T')[0],
    sortBy: 'totalScore',
    sortOrder: 'desc',
    searchTerm: ''
  });

  // Fetch performance data from API
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        filter: filters.period,
        ...(filters.date && { date: filters.date })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/performance/getPerformanceScore?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Include cookies if using session-based auth
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPerformanceData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [filters.period, filters.date]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = performanceData.filter(item => {
      // Filter out entries without userId or with null userId
      if (!item.userId) return false;
      
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const email = item.userId.email?.toLowerCase() || '';
        const name = item.userId.name?.toLowerCase() || '';
        return email.includes(searchLower) || name.includes(searchLower);
      }
      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'totalScore':
          aValue = a.score[0]?.totalScore || 0;
          bValue = b.score[0]?.totalScore || 0;
          break;
        case 'timesheetScore':
          aValue = a.score[0]?.timesheetScore || 0;
          bValue = b.score[0]?.timesheetScore || 0;
          break;
        case 'attendanceScore':
          aValue = a.score[0]?.attendanceScore || 0;
          bValue = b.score[0]?.attendanceScore || 0;
          break;
        case 'behaviourScore':
          aValue = a.score[0]?.behaviourScore || 0;
          bValue = b.score[0]?.behaviourScore || 0;
          break;
        case 'email':
          aValue = a.userId?.email || '';
          bValue = b.userId?.email || '';
          break;
        case 'date':
          aValue = new Date(a.weekStart);
          bValue = new Date(b.weekStart);
          break;
        default:
          aValue = a.score[0]?.totalScore || 0;
          bValue = b.score[0]?.totalScore || 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [performanceData, filters.sortBy, filters.sortOrder, filters.searchTerm]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (processedData.length === 0) return { avg: 0, highest: 0, lowest: 0, total: 0 };
    
    const scores = processedData.map(item => item.score[0]?.totalScore || 0);
    const total = scores.reduce((sum, score) => sum + score, 0);
    const avg = total / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    return { avg: avg.toFixed(2), highest, lowest, total: processedData.length };
  }, [processedData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const SortIcon = ({ column }) => {
    if (filters.sortBy !== column) return <ChevronUp className="w-4 h-4 opacity-30" />;
    return filters.sortOrder === 'desc' ? 
      <ChevronDown className="w-4 h-4 text-blue-600" /> : 
      <ChevronUp className="w-4 h-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPerformanceData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen shadow-lg p-6 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Board</h1>
          <p className="text-gray-600">Track and analyze employee performance scores</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.avg}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Highest Score</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.highest}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lowest Score</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.lowest}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600"
                    >
                      Employee
                      <SortIcon column="email" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600"
                    >
                      Period
                      <SortIcon column="date" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleSort('timesheetScore')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 mx-auto"
                    >
                      <Clock className="w-4 h-4" />
                      Timesheet
                      <SortIcon column="timesheetScore" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleSort('attendanceScore')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 mx-auto"
                    >
                      <Users className="w-4 h-4" />
                      Attendance
                      <SortIcon column="attendanceScore" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleSort('behaviourScore')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 mx-auto"
                    >
                      <Award className="w-4 h-4" />
                      Behaviour
                      <SortIcon column="behaviourScore" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleSort('totalScore')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 mx-auto"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Total Score
                      <SortIcon column="totalScore" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {processedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No performance data found</p>
                        <p className="text-sm">Try adjusting your filters or date range</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.userId?.firstName || 'Unknown User'}&nbsp;
                            {item.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{item.userId?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {formatDate(item.weekStart)}
                          </div>
                          <div className="text-gray-500">to {formatDate(item.weekEnd)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreColor(item.score[0]?.timesheetScore || 0)}`}>
                          {item.score[0]?.timesheetScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreColor(item.score[0]?.attendanceScore || 0)}`}>
                          {item.score[0]?.attendanceScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreColor(item.score[0]?.behaviourScore || 0)}`}>
                          {item.score[0]?.behaviourScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(item.score[0]?.totalScore || 0)}`}>
                          {item.score[0]?.totalScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {item.remark || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {processedData.length > 0 && (
          <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
            <p>Showing {processedData.length} employees</p>
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceBoard;
