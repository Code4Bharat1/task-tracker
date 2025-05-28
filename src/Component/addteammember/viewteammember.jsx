'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, Search, Filter, Mail, Phone, Briefcase, Building,
    User, Calendar, Edit, Trash2, Eye, ChevronDown, X,
    MapPin, Clock, Award, UserCheck, UserPlus, Plus, FolderOpen
} from 'lucide-react';

export default function ViewTeamMember() {
    const router = useRouter();
    const navigateToAddMember = () => {
        router.push('/dashboard/addteammembers')
    };

    // Updated team member data to match your add member form fields
    const [teamMembers] = useState([
        {
            id: 'EMP001',
            fullName: 'Paras Varankar',
            emailAddress: 'parasvarankar235@gmail.com',
            phoneNumber: '9309940782',
            position: 'Senior Software Engineer',
            projectName: 'E-commerce Platform',
            department: 'Engineering',
            reportingManager: 'Sarah Johnson',
            joiningDate: '2023-01-15',
            status: 'Active',
            location: 'Mumbai',
            avatar: null
        },
        {
            id: 'EMP002',
            fullName: 'Rahul Sharma',
            emailAddress: 'rahul.sharma@company.com',
            phoneNumber: '9876543210',
            position: 'Marketing Specialist',
            projectName: 'Digital Marketing Campaign',
            department: 'Marketing',
            reportingManager: 'Michael Brown',
            joiningDate: '2023-03-20',
            status: 'Active',
            location: 'Delhi',
            avatar: null
        },
        {
            id: 'EMP003',
            fullName: 'Priya Patel',
            emailAddress: 'priya.patel@company.com',
            phoneNumber: '8765432109',
            position: 'Sales Representative',
            projectName: 'Client Acquisition',
            department: 'Sales',
            reportingManager: 'Lisa Anderson',
            joiningDate: '2022-11-10',
            status: 'Active',
            location: 'Pune',
            avatar: null
        },
        {
            id: 'EMP004',
            fullName: 'Amit Kumar',
            emailAddress: 'amit.kumar@company.com',
            phoneNumber: '7654321098',
            position: 'HR Specialist',
            projectName: 'Employee Onboarding',
            department: 'HR',
            reportingManager: 'David Wilson',
            joiningDate: '2023-05-08',
            status: 'On Leave',
            location: 'Bangalore',
            avatar: null
        },
        {
            id: 'EMP005',
            fullName: 'Sneha Gupta',
            emailAddress: 'sneha.gupta@company.com',
            phoneNumber: '6543210987',
            position: 'Finance Analyst',
            projectName: 'Budget Planning',
            department: 'Finance',
            reportingManager: 'Jennifer Martinez',
            joiningDate: '2022-08-22',
            status: 'Active',
            location: 'Chennai',
            avatar: null
        },
        {
            id: 'EMP006',
            fullName: 'Arjun Singh',
            emailAddress: 'arjun.singh@company.com',
            phoneNumber: '5432109876',
            position: 'Operations Manager',
            projectName: 'Process Optimization',
            department: 'Operations',
            reportingManager: 'Robert Taylor',
            joiningDate: '2021-12-05',
            status: 'Active',
            location: 'Hyderabad',
            avatar: null
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        position: '',
        status: '',
        projectName: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    // Filter options
    const departments = [...new Set(teamMembers.map(member => member.department))];
    const positions = [...new Set(teamMembers.map(member => member.position))];
    const statuses = [...new Set(teamMembers.map(member => member.status))];
    const projects = [...new Set(teamMembers.map(member => member.projectName))];

    // Filtered team members
    const filteredMembers = useMemo(() => {
        return teamMembers.filter(member => {
            const matchesSearch =
                member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.projectName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDepartment = !filters.department || member.department === filters.department;
            const matchesPosition = !filters.position || member.position === filters.position;
            const matchesStatus = !filters.status || member.status === filters.status;
            const matchesProject = !filters.projectName || member.projectName === filters.projectName;

            return matchesSearch && matchesDepartment && matchesPosition && matchesStatus && matchesProject;
        });
    }, [teamMembers, searchTerm, filters]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const clearFilters = () => {
        setFilters({
            department: '',
            position: '',
            status: '',
            projectName: ''
        });
        setSearchTerm('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'On Leave': return 'bg-yellow-100 text-yellow-800';
            case 'Inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const MemberCard = ({ member }) => (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0179a4] rounded-full flex items-center justify-center">
                            <User className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-800">
                                {member.fullName}
                            </h3>
                            <p className="text-sm text-gray-500">{member.id}</p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                    </span>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
                        <span>{member.emailAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{member.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase size={14} />
                        <span>{member.position}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FolderOpen size={14} />
                        <span>{member.projectName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building size={14} />
                        <span>{member.department}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedMember(member)}
                        className="flex-1 bg-[#0179a4] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#016a8a] transition-colors flex items-center justify-center gap-1"
                    >
                        <Eye size={14} />
                        View
                    </button>
                    <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        <Edit size={14} />
                    </button>
                    <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );

    const MemberRow = ({ member }) => (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0179a4] rounded-full flex items-center justify-center">
                        <User className="text-white" size={14} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{member.fullName}</p>
                        <p className="text-sm text-gray-500">{member.id}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">{member.emailAddress}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{member.position}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{member.projectName}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {member.status}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedMember(member)}
                        className="p-1 text-[#0179a4] hover:bg-blue-50 rounded"
                    >
                        <Eye size={16} />
                    </button>
                    <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                        <Edit size={16} />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );

    // Member Detail Modal
    if (selectedMember) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="bg-[#0179a4] p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Employee Details</h2>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="text-white hover:bg-[#016a8a] p-1 rounded"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-[#0179a4] rounded-full flex items-center justify-center">
                                <User className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {selectedMember.fullName}
                                </h3>
                                <p className="text-gray-600">{selectedMember.position}</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(selectedMember.status)}`}>
                                    {selectedMember.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <User size={16} />
                                    Personal Information
                                </h4>
                                <div className="space-y-3 pl-6">
                                    <div>
                                        <label className="text-sm text-gray-500">Employee ID</label>
                                        <p className="font-medium">{selectedMember.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Full Name</label>
                                        <p className="font-medium">{selectedMember.fullName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Email Address</label>
                                        <p className="font-medium">{selectedMember.emailAddress}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Phone Number</label>
                                        <p className="font-medium">{selectedMember.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Location</label>
                                        <p className="font-medium">{selectedMember.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Briefcase size={16} />
                                    Work Information
                                </h4>
                                <div className="space-y-3 pl-6">
                                    <div>
                                        <label className="text-sm text-gray-500">Position</label>
                                        <p className="font-medium">{selectedMember.position}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Project Name</label>
                                        <p className="font-medium">{selectedMember.projectName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Department</label>
                                        <p className="font-medium">{selectedMember.department}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Reporting Manager</label>
                                        <p className="font-medium">{selectedMember.reportingManager}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Joining Date</label>
                                        <p className="font-medium">{formatDate(selectedMember.joiningDate)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button className="flex-1 bg-[#0179a4] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#016a8a] transition-colors flex items-center justify-center gap-2">
                                <Edit size={16} />
                                Edit Profile
                            </button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                Send Email
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                            <Users className="text-[#0179a4]" size={36} />
                            Team Members
                        </h1>
                        <div className="w-32 h-1 bg-[#0179a4] rounded-full"></div>
                        <p className="text-gray-600 mt-3">
                            Manage and view all team members in your organization
                        </p>
                    </div>

                    {/* Team Members Icons & Add Button */}
                    <div className="flex flex-col items-end gap-4">
                        {/* Team Member Avatars */}
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {teamMembers.slice(0, 5).map((member, index) => (
                                    <div
                                        key={member.id}
                                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer"
                                        title={member.fullName}
                                    >
                                        <span className="text-white text-sm font-semibold">
                                            {member.fullName.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                ))}
                                {teamMembers.length > 5 && (
                                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                        <span className="text-white text-xs font-semibold">
                                            +{teamMembers.length - 5}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                                {teamMembers.length} Members
                            </span>
                        </div>

                        {/* Add Team Member Button */}
                        <button
                            onClick={navigateToAddMember}
                            className="bg-[#0179a4] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#016a8a] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                        >
                            <UserPlus size={20} />
                            Add Member
                        </button>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, project, or employee ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-3 bg-[#0179a4] text-white rounded-lg font-medium hover:bg-[#016a8a] transition-colors flex items-center gap-2"
                        >
                            <Filter size={16} />
                            Filters
                            <ChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} size={16} />
                        </button>

                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-3 font-medium transition-colors ${viewMode === 'grid' ? 'bg-[#0179a4] text-white' : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-3 font-medium transition-colors ${viewMode === 'list' ? 'bg-[#0179a4] text-white' : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                List
                            </button>
                        </div>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <select
                                    value={filters.department}
                                    onChange={(e) => handleFilterChange('department', e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.position}
                                    onChange={(e) => handleFilterChange('position', e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">All Positions</option>
                                    {positions.map(position => (
                                        <option key={position} value={position}>{position}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">All Status</option>
                                    {statuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.projectName}
                                    onChange={(e) => handleFilterChange('projectName', e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">All Projects</option>
                                    {projects.map(project => (
                                        <option key={project} value={project}>{project}</option>
                                    ))}
                                </select>
                            </div>

                            {(searchTerm || Object.values(filters).some(filter => filter)) && (
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Active filters:</span>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-[#0179a4] hover:text-[#016a8a] font-medium"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Summary */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600">
                        Showing <span className="font-medium">{filteredMembers.length}</span> of{' '}
                        <span className="font-medium">{teamMembers.length}</span> team members
                    </p>
                </div>

                {/* Team Members Display */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMembers.map(member => (
                            <MemberCard key={member.id} member={member} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Employee</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email Address</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Position</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Project Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredMembers.map(member => (
                                    <MemberRow key={member.id} member={member} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* No Results */}
                {filteredMembers.length === 0 && (
                    <div className="text-center py-12">
                        <UserCheck className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No team members found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}