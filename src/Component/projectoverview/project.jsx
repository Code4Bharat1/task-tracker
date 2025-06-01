"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Filter, ChevronDown, AlertCircle, CheckCircle, Play, Grid3X3, List, RefreshCw, Paperclip, Search, Plus } from 'lucide-react';

const ProjectOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Extract unique projects from tasks
  const uniqueProjects = [...new Set(tasks.map(task => task.bucketName))];

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (timeFilter !== 'all') params.append('timeFilter', timeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`http://localhost:4110/api/tasks/getTasks?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [timeFilter, statusFilter]);

  // Filter tasks by selected project and search query
  const filteredTasks = tasks
    .filter(task => selectedProject === 'all' || task.bucketName === selectedProject)
    .filter(task =>
      searchQuery === '' ||
      task.bucketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskDescription.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
      case 'Closed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'In Progress': return <Play className="w-3.5 h-3.5" />;
      case 'Completed':
      case 'Closed': return <CheckCircle className="w-3.5 h-3.5" />;
      default: return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getDisplayStatus = (status) => {
    return (status === 'Completed' || status === 'Closed') ? 'Closed' : status;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-red-400';
      case 'Medium': return 'border-l-amber-400';
      case 'Low': return 'border-l-emerald-400';
      default: return 'border-l-gray-300';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (deadline, status) => {
    if (status === 'Completed' || status === 'Closed') return false;
    return new Date(deadline) < new Date();
  };

  // Calculate statistics
  const stats = {
    total: filteredTasks.length,
    open: filteredTasks.filter(t => t.status === 'Open').length,
    inProgress: filteredTasks.filter(t => t.status === 'In Progress').length,
    closed: filteredTasks.filter(t => t.status === 'Completed' || t.status === 'Closed').length,
    overdue: filteredTasks.filter(t => isOverdue(t.deadline, t.status)).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full border border-red-100">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold">Something went wrong</h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button
            onClick={fetchTasks}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Task Dashboard</h1>
              <p className="text-gray-600 text-sm">Manage and track your project tasks</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Total Tasks</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.open}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Open</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-xl sm:text-2xl font-bold text-amber-600">{stats.inProgress}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.closed}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Overdue</div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 sm:p-6">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              {/* Left side - Filters */}
              <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Filters:</span>

                {/* Project Filter */}
                <div className="relative min-w-0 flex-1 sm:flex-initial sm:min-w-[140px]">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Projects</option>
                    {uniqueProjects.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Time Filter */}
                <div className="relative min-w-0 flex-1 sm:flex-initial sm:min-w-[120px]">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative min-w-0 flex-1 sm:flex-initial sm:min-w-[120px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={fetchTasks}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    <Grid3X3 className="w-4 h-4 mr-1.5" />
                    Grid
                  </button>
                  {!isMobile && (
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                      <List className="w-4 h-4 mr-1.5" />
                      List
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Display */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 text-sm">Try adjusting your filters or create a new task.</p>
          </div>
        ) : viewMode === 'grid' || isMobile ? (
          /* Grid View */
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${getPriorityColor(task.priority)} hover:shadow-md transition-shadow border-r border-t border-b border-gray-100`}
              >
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
                        {task.bucketName}
                      </h3>
                      <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span>{getDisplayStatus(task.status)}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ml-3 ${getPriorityBadgeColor(task.priority)}`}>
                      {task.priority}
                    </div>
                  </div>

                  {/* Task Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {task.taskDescription}
                  </p>

                  {/* Assigned To */}
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">
                      {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      <span>Assigned: {formatDate(task.assignDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                        <span className={isOverdue(task.deadline, task.status) ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          Due: {formatDate(task.deadline)}
                        </span>
                      </div>
                      {task.dueTime && (
                        <span className="text-gray-500 text-xs">{task.dueTime}</span>
                      )}
                    </div>
                    {isOverdue(task.deadline, task.status) && (
                      <div className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                        Overdue
                      </div>
                    )}
                  </div>

                  {/* Tagged Members */}
                  {task.tagMembers && task.tagMembers.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Tagged Members:</div>
                      <div className="flex flex-wrap gap-1">
                        {task.tagMembers.slice(0, 2).map((member) => (
                          <span
                            key={member._id}
                            className="inline-block bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded-full border"
                          >
                            {member.firstName} {member.lastName}
                          </span>
                        ))}
                        {task.tagMembers.length > 2 && (
                          <span className="inline-block bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded-full border">
                            +{task.tagMembers.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachment Required */}
                  {task.attachmentRequired && (
                    <div className="pt-3 mt-3 border-t border-gray-100">
                      <div className="inline-flex items-center text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                        <Paperclip className="w-3 h-3 mr-1" />
                        Attachment Required
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View - Desktop Only */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="col-span-3">Task</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Assigned To</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-2">Tagged Members</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className={`px-6 py-4 border-l-4 ${getPriorityColor(task.priority)} hover:bg-gray-50 transition-colors`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Task Info */}
                    <div className="col-span-3">
                      <div className="font-medium text-gray-900 mb-1">{task.bucketName}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{task.taskDescription}</div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span>{getDisplayStatus(task.status)}</span>
                      </div>
                    </div>

                    {/* Assigned To */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className={`text-sm ${isOverdue(task.deadline, task.status) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {formatDate(task.deadline)}
                        </span>
                      </div>
                      {task.dueTime && (
                        <div className="text-xs text-gray-500 mt-1">{task.dueTime}</div>
                      )}
                      {isOverdue(task.deadline, task.status) && (
                        <div className="text-xs text-red-600 font-medium mt-1">Overdue</div>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="col-span-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Tagged Members */}
                    <div className="col-span-2">
                      {task.tagMembers && task.tagMembers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {task.tagMembers.slice(0, 2).map((member) => (
                            <span
                              key={member._id}
                              className="inline-block bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded-full border"
                            >
                              {member.firstName} {member.lastName}
                            </span>
                          ))}
                          {task.tagMembers.length > 2 && (
                            <span className="inline-block bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded-full border">
                              +{task.tagMembers.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                      {task.attachmentRequired && (
                        <div className="inline-flex items-center text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 mt-1">
                          <Paperclip className="w-3 h-3 mr-1" />
                          Required
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectOverview;