"use client"

// page.jsx
import { axiosInstance } from '@/lib/axiosInstance';
import { useEffect, useState } from 'react';

const page = () => {
    const [leaveNotifications, setLeaveNotifications] = useState([]);
    const [postNotifications, setPostNotifications] = useState([]);
    const [expenseNotifications, setExpenseNotifications] = useState([]);
    const [calendarNotifications, setCalendarNotifications] = useState([]);
    const [meetingNotifications, setMeetingNotifications] = useState([]);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {

            const [
                leaveRes,
                postRes,
                expenseRes,
                calendarRes,
                meetingRes
            ] = await Promise.all([
                axiosInstance.get('/user-leave' ),
                axiosInstance.get('/post-notification'),
                axiosInstance.get('/expense-notification'),
                axiosInstance.get('/calendar-notification' ),
                axiosInstance.get('/meeting-notification')
            ]);
            console.log(leaveRes)
            setLeaveNotifications(leaveRes.data.notifications || []);
            setPostNotifications(postRes.data.notifications || []);
            setExpenseNotifications(expenseRes.data.notifications || []);
            setCalendarNotifications(calendarRes.data.notifications || []);
            setMeetingNotifications(meetingRes.data.notifications || []);
            
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to fetch notifications.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderNotifications = (title, items, fields) => (
        <div className="notification-section">
            <h2>{title}</h2>
            {items.length === 0 ? (
                <p>No notifications</p>
            ) : (
                items.map((item, idx) => (
                    <div key={idx} className="notification-card">
                        {fields.map((field, i) => (
                            <p key={i}>
                                <strong>{field.label}:</strong> {item[field.key]}
                            </p>
                        ))}
                        <hr />
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div style={styles.container}>
            <h1>All Notifications</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {renderNotifications('Leave Notifications', leaveNotifications, [
                { label: 'Message', key: 'message' },
                { label: 'Status', key: 'status' },
                { label: 'Updated At', key: 'updatedAt' }
            ])}

            {renderNotifications('Post Notifications', postNotifications, [
                { label: 'Message', key: 'message' },
                { label: 'Created At', key: 'createdAt' }
            ])}

            {renderNotifications('Expense Notifications', expenseNotifications, [
                { label: 'Message', key: 'message' },
                { label: 'Category', key: 'category' },
                { label: 'Amount', key: 'amount' },
                { label: 'Date', key: 'date' },
                { label: 'Updated At', key: 'updatedAt' },
                { label: 'Rejection Reason', key: 'rejectionReason' }
            ])}

            {renderNotifications('Calendar Notifications', calendarNotifications, [
                { label: 'Type', key: 'type' },
                { label: 'Date', key: 'date' },
                { label: 'Created At', key: 'createdAt' }
            ])}

            {renderNotifications('Meeting Notifications', meetingNotifications, [
                { label: 'Title', key: 'title' },
                { label: 'Date', key: 'date' },
                { label: 'Created At', key: 'createdAt' }
            ])}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: 'auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    }
};

export default page;
