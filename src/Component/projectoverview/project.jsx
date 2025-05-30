"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Filter, ChevronDown, AlertCircle, CheckCircle, Play, Grid3X3, List } from 'lucide-react';

const ProjectOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint is 768px
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
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

  // Filter tasks by selected project
  const filteredTasks = selectedProject === 'all'
    ? tasks
    : tasks.filter(task => task.bucketName === selectedProject);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
      case 'Closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-4 h-4" />;
      case 'In Progress': return <Play className="w-4 h-4" />;
      case 'Completed':
      case 'Closed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getDisplayStatus = (status) => {
    return (status === 'Completed' || status === 'Closed') ? 'Closed' : status;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-red-500';
      case 'Medium': return 'border-l-yellow-500';
      case 'Low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Error</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Dashboard</h1>
          <p className="text-gray-600">Manage and track your project tasks</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-500">{stats.open}</div>
            <div className="text-sm text-gray-600">Open</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-500">{stats.closed}</div>
            <div className="text-sm text-gray-600">Closed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              {/* Project Filter */}
              <div className="relative">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Projects</option>
                  {uniqueProjects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Time Filter */}
              <div className="relative">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Closed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={fetchTasks}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* View Mode Toggle - Hide list option on mobile */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Grid</span>
              </button>
              {!isMobile && (
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <List className="w-4 h-4" />
                  <span>List</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tasks Display */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your filters or create a new task.</p>
          </div>
        ) : viewMode === 'grid' || isMobile ? (
          /* Grid View - Always show grid on mobile */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(task.priority)} hover:shadow-md transition-shadow`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {task.bucketName}
                      </h3>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span>{getDisplayStatus(task.status)}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div className="font-medium">{task.priority}</div>
                      <div>Priority</div>
                    </div>
                  </div>

                  {/* Task Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {task.taskDescription}
                  </p>

                  {/* Assigned To */}
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Assigned: {formatDate(task.assignDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span className={isOverdue(task.deadline, task.status) ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          Due: {formatDate(task.deadline)}
                        </span>
                      </div>
                      {task.dueTime && (
                        <span className="text-gray-500">{task.dueTime}</span>
                      )}
                    </div>
                    {isOverdue(task.deadline, task.status) && (
                      <div className="text-xs text-red-600 font-medium">
                        Overdue
                      </div>
                    )}
                  </div>

                  {/* Tagged Members */}
                  {task.tagMembers && task.tagMembers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Tagged Members:</div>
                      <div className="flex flex-wrap gap-1">
                        {task.tagMembers.slice(0, 3).map((member, index) => (
                          <span
                            key={member._id}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                          >
                            {member.firstName} {member.lastName}
                          </span>
                        ))}
                        {task.tagMembers.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            +{task.tagMembers.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachment Required Indicator */}
                  {task.attachmentRequired && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs text-amber-600 font-medium">
                        📎 Attachment Required
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View - Only show on desktop */
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Task</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Assigned To</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-2">Tagged Members</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
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
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
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
                        <Clock className="w-3 h-3 text-gray-400" />
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
                      <span className={`text-sm font-medium ${task.priority === 'High' ? 'text-red-600' :
                          task.priority === 'Medium' ? 'text-yellow-600' :
                            task.priority === 'Low' ? 'text-green-600' : 'text-gray-600'
                        }`}>
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
                              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                            >
                              {member.firstName} {member.lastName}
                            </span>
                          ))}
                          {task.tagMembers.length > 2 && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              +{task.tagMembers.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                      {task.attachmentRequired && (
                        <div className="text-xs text-amber-600 font-medium mt-1">📎 Attachment Required</div>
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