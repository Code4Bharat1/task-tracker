"use client"

import { AlertCircle, Bell, Calendar, CheckCircle, Clock, DollarSign, FileText, Users, XCircle, Video, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
// Import your axiosInstance
import { axiosInstance } from '@/lib/axiosInstance';

const NotificationDashboard = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [leaveNotifications, setLeaveNotifications] = useState([]);
    const [postNotifications, setPostNotifications] = useState([]);
    const [expenseNotifications, setExpenseNotifications] = useState([]);
    const [calendarNotifications, setCalendarNotifications] = useState([]);
    const [meetingNotifications, setMeetingNotifications] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [
                leaveRes,
                postRes,
                expenseRes,
                calendarRes,
                meetingRes
            ] = await Promise.all([
                axiosInstance.get('/user-leave'),
                axiosInstance.get('/post-notification'),
                axiosInstance.get('/expense-notification'),
                axiosInstance.get('/calendar-notification'),
                axiosInstance.get('/meeting-notification')
            ]);

            console.log(meetingRes);


            setLeaveNotifications(leaveRes.data.notifications || []);
            setPostNotifications(postRes.data.notifications || []);
            setExpenseNotifications(expenseRes.data.notifications || []);
            setCalendarNotifications(calendarRes.data.notifications || []);
            setMeetingNotifications(meetingRes.data.notifications || []);


        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to fetch notifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh meeting notifications every 30 seconds to update join button status
        const interval = setInterval(() => {
            fetchData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
            default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
            timeZone: 'Asia/Kolkata' // Set to Indian timezone since you're in Mumbai
        });
    };

    const formatDuration = (duration) => {
        if (typeof duration === 'number') {
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes}m`;
        }
        return duration;
    };

    // Check if join button should be active (2 minutes before meeting)
    const isJoinButtonActive = (meetingDate) => {
        if (!meetingDate) return false;
        
        const now = new Date();
        const meeting = new Date(meetingDate);
        
        // Check if the date is valid
        if (isNaN(meeting.getTime())) return false;
        
        const timeDiff = meeting.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        // Active 2 minutes before and during/after the meeting
        return minutesDiff <= 2;
    };

    const handleJoinMeeting = (meetingLink) => {
        if (meetingLink) {
            window.open(meetingLink, '_blank');
        }
    };

    const getAllNotifications = () => {
        return [
            ...leaveNotifications.map(n => ({ ...n, type: 'leave' })),
            ...postNotifications.map(n => ({ ...n, type: 'post' })),
            ...expenseNotifications.map(n => ({ ...n, type: 'expense' })),
            ...calendarNotifications.map(n => ({ ...n, type: 'calendar' })),
            ...meetingNotifications.map(n => ({ ...n, type: 'meeting' }))
        ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'leave': return <FileText className="w-5 h-5" />;
            case 'post': return <Bell className="w-5 h-5" />;
            case 'expense': return <DollarSign className="w-5 h-5" />;
            case 'calendar': return <Calendar className="w-5 h-5" />;
            case 'meeting': return <Video className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getNotificationTypeColor = (type) => {
        switch (type) {
            case 'leave': return 'from-blue-500 to-blue-600';
            case 'post': return 'from-purple-500 to-purple-600';
            case 'expense': return 'from-green-500 to-green-600';
            case 'calendar': return 'from-orange-500 to-orange-600';
            case 'meeting': return 'from-red-500 to-red-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const tabs = [
        { id: 'all', label: 'All', count: getAllNotifications().length, icon: Bell },
        { id: 'leave', label: 'Leave', count: leaveNotifications.length, icon: FileText },
        { id: 'post', label: 'Posts', count: postNotifications.length, icon: Bell },
        { id: 'expense', label: 'Expenses', count: expenseNotifications.length, icon: DollarSign },
        { id: 'calendar', label: 'Calendar', count: calendarNotifications.length, icon: Calendar },
        { id: 'meeting', label: 'Meetings', count: meetingNotifications.length, icon: Video }
    ];

    const renderMeetingNotificationCard = (notification) => {
        const isJoinActive = isJoinButtonActive(notification.meetingDate || notification.date);
        
        return (
            <div key={`meeting-${Math.random()}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between gap-4">
                    {/* Left side - Meeting details */}
                    <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${getNotificationTypeColor('meeting')} text-white flex-shrink-0`}>
                            <Video className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="mb-3">
                                <h3 className="text-gray-900 font-semibold text-lg mb-1">
                                    {notification.title || notification.message || 'Video Call'}
                                </h3>
                                {notification.hostname && (
                                    <p className="text-gray-600 text-sm flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        Host: <span className="font-medium">{notification.hostname}</span>
                                    </p>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {notification.duration && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">Duration:</span>
                                        <span className="text-gray-600">{formatDuration(notification.duration)}</span>
                                    </div>
                                )}
                                
                                {(notification.meetingDate || notification.date) && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">Date:</span>
                                        <span className="text-gray-600">{formatDate(notification.meetingDate || notification.date)}{notification.time}</span>
                                    </div>
                                )}
                            </div>
                            
                            {notification.description && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700 text-sm">{notification.description}</p>
                                </div>
                            )}
                            
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(notification.updatedAt || notification.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right side - Join button */}
                    <div className="flex-shrink-0 ml-4">
                        <button
                            onClick={() => isJoinActive && handleJoinMeeting(notification.meetingLink || notification.link)}
                            disabled={!isJoinActive}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                isJoinActive
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Phone className="w-4 h-4" />
                            {isJoinActive ? 'Join Meeting' : 'Not Available'}
                        </button>
                        {!isJoinActive && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Available 2min before
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderNotificationCard = (notification, type) => {
        if (type === 'meeting') {
            return renderMeetingNotificationCard(notification);
        }

        return (
            <div key={`${type}-${Math.random()}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${getNotificationTypeColor(type)} text-white flex-shrink-0`}>
                        {getNotificationIcon(type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <p className="text-gray-900 font-semibold text-base">{notification.message || notification.title}</p>
                            {notification.status && (
                                <div className="flex items-center gap-1">
                                    {getStatusIcon(notification.status)}
                                    <span className="text-sm font-medium text-gray-700">{notification.status}</span>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            {notification.category && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Category:</span>
                                    <span>{notification.category}</span>
                                </div>
                            )}
                            {notification.amount && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Amount:</span>
                                    <span className="font-semibold text-green-600">{notification.amount}</span>
                                </div>
                            )}
                            {notification.type && notification.type !== type && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Type:</span>
                                    <span>{notification.type}</span>
                                </div>
                            )}
                            {notification.date && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Date:</span>
                                    <span>{formatDate(notification.date)}</span>
                                </div>
                            )}
                        </div>
                        {notification.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">
                                    <span className="font-medium">Rejection Reason:</span> {notification.rejectionReason}
                                </p>
                            </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(notification.updatedAt || notification.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading notifications...</span>
                </div>
            );
        }

        let notifications = [];
        let emptyMessage = 'No notifications found';

        switch (activeTab) {
            case 'all':
                notifications = getAllNotifications();
                emptyMessage = 'No notifications available';
                break;
            case 'leave':
                notifications = leaveNotifications.map(n => ({ ...n, type: 'leave' }));
                emptyMessage = 'No leave notifications';
                break;
            case 'post':
                notifications = postNotifications.map(n => ({ ...n, type: 'post' }));
                emptyMessage = 'No post notifications';
                break;
            case 'expense':
                notifications = expenseNotifications.map(n => ({ ...n, type: 'expense' }));
                emptyMessage = 'No expense notifications';
                break;
            case 'calendar':
                notifications = calendarNotifications.map(n => ({ ...n, type: 'calendar' }));
                emptyMessage = 'No calendar notifications';
                break;
            case 'meeting':
                notifications = meetingNotifications.map(n => ({ ...n, type: 'meeting' }));
                emptyMessage = 'No meeting notifications';
                break;
        }

        return (
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">{emptyMessage}</p>
                    </div>
                ) : (
                    notifications.map((notification, idx) =>
                        renderNotificationCard(notification, notification.type)
                    )
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <Bell className="w-8 h-8" />
                            <h1 className="text-3xl font-bold">Notifications</h1>
                        </div>
                        <p className="text-blue-100 text-lg">Stay updated with all your important activities</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                        {tab.count > 0 && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default NotificationDashboard;