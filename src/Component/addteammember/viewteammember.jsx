"use client"
import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, Clock, AlertCircle, FileText, User, Trash2, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ViewTeamMember = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [removing, setRemoving] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const router = useRouter();

    // Fetch tasks from API
    useEffect(() => {
        fetchTasks();
    }, []);

    // Filter tasks when category filter changes
    useEffect(() => {
        filterTasks();
    }, [tasks, categoryFilter]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch('${process.env.NEXT_PUBLIC_BACKEND_API}/tasks/getTasks', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Include cookies for authentication
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

    const filterTasks = () => {
        if (categoryFilter === 'All') {
            setFilteredTasks(tasks);
        } else {
            setFilteredTasks(tasks.filter(task => task.projectCategory === categoryFilter));
        }
    };

    const handleCategoryFilterChange = (category) => {
        setCategoryFilter(category);
    };

    const handleRemoveMember = async () => {
        if (!selectedTask || !selectedMember) return;

        try {
            setRemoving(true);

            // API call to remove member from task
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/tasks/${selectedTask._id}/removeMember`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    memberId: selectedMember._id
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove member');
            }

            // Update local state
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task._id === selectedTask._id
                        ? {
                            ...task,
                            tagMembers: task.tagMembers.filter(member => member._id !== selectedMember._id)
                        }
                        : task
                )
            );

            setShowRemoveModal(false);
            setSelectedTask(null);
            setSelectedMember(null);
        } catch (err) {
            alert('Error removing member: ' + err.message);
        } finally {
            setRemoving(false);
        }
    };

    const openRemoveModal = (task, member) => {
        setSelectedTask(task);
        setSelectedMember(member);
        setShowRemoveModal(true);
    };

    const closeRemoveModal = () => {
        setShowRemoveModal(false);
        setSelectedTask(null);
        setSelectedMember(null);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Self': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Client': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleTeamMemberClick = () => {
        router.push('/dashboard/addteammembers');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'In Progress': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Deferred': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get unique categories from tasks
    const getAvailableCategories = () => {
        const categories = [...new Set(tasks.map(task => task.projectCategory).filter(Boolean))];
        return ['All', ...categories];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">Error: {error}</span>
                </div>
                <button
                    onClick={fetchTasks}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">Task Management</h1>
                    <p className="text-gray-600 truncate">Manage your tasks and team members</p>
                </div>
                <div className="w-full sm:w-auto">
                    <button
                        className="w-full sm:w-auto bg-[#018ABE] hover:bg-[#018ABE] text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                        onClick={handleTeamMemberClick}
                    >
                        Add Team Members
                    </button>
                </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-700">Filter by Category</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {getAvailableCategories().map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryFilterChange(category)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === category
                                    ? 'bg-[#018ABE] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {category}
                            {category !== 'All' && (
                                <span className="ml-1 text-xs opacity-75">
                                    ({tasks.filter(task => task.projectCategory === category).length})
                                </span>
                            )}
                            {category === 'All' && (
                                <span className="ml-1 text-xs opacity-75">
                                    ({tasks.length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tasks Results Summary */}
            <div className="mb-4 text-sm text-gray-600">
                Showing {filteredTasks.length} of {tasks.length} tasks
                {categoryFilter !== 'All' && (
                    <span className="ml-1">in "{categoryFilter}" category</span>
                )}
            </div>

            <div className="grid gap-6">
                {filteredTasks.map((task) => (
                    <div key={task._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6">
                            {/* Task Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{task.bucketName}</h3>
                                    <p className="text-gray-600 mt-1">{task.taskDescription}</p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(task.projectCategory)}`}>
                                        {task.projectCategory || 'N/A'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                            {/* Task Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <User className="h-4 w-4 mr-2" />
                                    <span>Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>Due Time: {task.dueTime}</span>
                                </div>
                            </div>

                            {task.projectCategory === 'Client' && task.clientId && (
                                <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <div className="text-sm">
                                        <span className="font-medium text-indigo-700">Client: </span>
                                        <span className="text-indigo-600">{task.clientId.name}</span>
                                        {task.clientId.email && (
                                            <span className="text-indigo-500 ml-2">({task.clientId.email})</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Assigned By */}
                            <div className="mb-4">
                                <span className="text-sm text-gray-600">
                                    Assigned by: {task.assignedBy.fullName} ({task.assignedBy.email})
                                </span>
                            </div>

                            {/* Documents */}
                            {task.documents && task.documents.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <FileText className="h-4 w-4 mr-2" />
                                        <span>Documents:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {task.documents.map((doc, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                {doc.fileName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tag Members */}
                            {task.tagMembers && task.tagMembers.length > 0 && (
                                <div>
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <Users className="h-4 w-4 mr-2" />
                                        <span>Team Members ({task.tagMembers.length}):</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {task.tagMembers.map((member) => (
                                            <div key={member._id} className="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-blue-900">
                                                        {member.firstName} {member.lastName}
                                                    </div>
                                                    <div className="text-xs text-blue-600">{member.email}</div>
                                                </div>
                                                <button
                                                    onClick={() => openRemoveModal(task, member)}
                                                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Remarks */}
                            {(task.remark || task.remarkDescription) && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    {task.remark && (
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-700">Remark: </span>
                                            <span className="text-gray-600">{task.remark}</span>
                                        </div>
                                    )}
                                    {task.remarkDescription && (
                                        <div className="text-sm mt-1">
                                            <span className="font-medium text-gray-700">Description: </span>
                                            <span className="text-gray-600">{task.remarkDescription}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredTasks.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {categoryFilter === 'All' ? 'No tasks found' : `No ${categoryFilter} tasks found`}
                    </h3>
                    <p className="text-gray-600">
                        {categoryFilter === 'All'
                            ? 'There are no tasks to display at the moment.'
                            : `There are no tasks in the "${categoryFilter}" category.`
                        }
                    </p>
                    {categoryFilter !== 'All' && (
                        <button
                            onClick={() => setCategoryFilter('All')}
                            className="mt-2 text-[#018ABE] hover:text-blue-700 text-sm font-medium"
                        >
                            View all tasks
                        </button>
                    )}
                </div>
            )}

            {/* Remove Member Modal */}
            {showRemoveModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Remove Team Member</h2>
                            <button
                                onClick={closeRemoveModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to remove the following member from this project?
                            </p>

                            {selectedMember && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="font-medium text-gray-900">
                                        {selectedMember.firstName} {selectedMember.lastName}
                                    </div>
                                    <div className="text-sm text-gray-600">{selectedMember.email}</div>
                                </div>
                            )}

                            {selectedTask && (
                                <div className="mt-3 text-sm text-gray-600">
                                    <span className="font-medium">Project:</span> {selectedTask.bucketName}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeRemoveModal}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                disabled={removing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemoveMember}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                disabled={removing}
                            >
                                {removing ? 'Removing...' : 'Remove Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewTeamMember;