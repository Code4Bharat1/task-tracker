'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { TbDoorExit, TbDoorEnter, TbFilter, TbCalendar, TbMapPin, TbClock, TbCamera, TbUser, TbInfoCircle, TbAlertTriangle } from 'react-icons/tb';
import { LuAlarmClock, LuSearch, LuCalendarDays, LuMapPin, LuEye } from "react-icons/lu";
import { axiosInstance } from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { useGSAP } from '@gsap/react';

// Configure axios to include cookies
axiosInstance.defaults.withCredentials = true;

export default function SiteVisit() {
    const [currentDate, setCurrentDate] = useState('');
    const [visits, setVisits] = useState([]);
    const [filteredVisits, setFilteredVisits] = useState([]);
    const [isPunchingIn, setIsPunchingIn] = useState(false);
    const [isPunchingOut, setIsPunchingOut] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [emergencyReason, setEmergencyReason] = useState('');
    const [pendingPunchOutData, setPendingPunchOutData] = useState(null);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [captureAction, setCaptureAction] = useState(null);
    const [notes, setNotes] = useState('');
    const [activeTab, setActiveTab] = useState('today');
    const [filterDate, setFilterDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [userName, setUserName] = useState('');
    const [totalVisits, setTotalVisits] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState('');
    const [locationNames, setLocationNames] = useState({});
    const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

    const underlineRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const router = useRouter();

    useGSAP(() => {
        if (underlineRef.current) {
            gsap.fromTo(
                underlineRef.current,
                { scaleX: 0, transformOrigin: 'left' },
                { scaleX: 1, duration: 1, ease: 'power3.out' }
            );
        }
    }, []);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get('/salesman/visits');
                setVisits(res.data.visits || []);
                setFilteredVisits(res.data.visits || []);
                setUserName(res.data.name || '');
                setTotalVisits(res.data.totalVisits || 0);
            } catch (error) {
                console.error('Failed to fetch visits:', error);
                toast.error('Failed to load attendance data');
            } finally {
                setLoading(false);
            }
        };

        const dateStr = new Date().toLocaleDateString('en-GB');
        setCurrentDate(dateStr);
        setFilterDate(new Date().toISOString().split('T')[0]);

        fetchVisits();
        checkLocationPermission();
    }, []);

    useEffect(() => {
        filterVisits();
    }, [visits, activeTab, filterDate, searchQuery]);

    useEffect(() => {
        if (showCameraModal) {
            startCamera();
        } else {
            stopCameraStream();
        }

        return () => stopCameraStream();
    }, [showCameraModal]);

    const checkLocationPermission = async () => {
        try {
            if (!navigator.geolocation) {
                setLocationPermissionDenied(true);
                return;
            }

            const permission = await navigator.permissions.query({ name: 'geolocation' });
            if (permission.state === 'denied') {
                setLocationPermissionDenied(true);
            }
        } catch (error) {
            console.log('Permission check not supported');
        }
    };

    // Function to get location name from coordinates
    const getLocationName = async (latitude, longitude) => {
        try {
            if (!latitude || !longitude) return 'N/A';

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                return data.results[0].formatted_address;
            }
            return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        } catch (error) {
            console.error('Failed to get location name:', error);
            return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    };

    useEffect(() => {
        const fetchLocationNames = async () => {
            const names = {};

            for (const visit of visits) {
                // Punch in location
                if (visit.punchInLocation?.latitude && visit.punchInLocation?.longitude) {
                    const key = `${visit.punchInLocation.latitude},${visit.punchInLocation.longitude}`;
                    if (!names[key]) {
                        names[key] = await getLocationName(
                            visit.punchInLocation.latitude,
                            visit.punchInLocation.longitude
                        );
                    }
                }

                // Punch out location
                if (visit.punchOutLocation?.latitude && visit.punchOutLocation?.longitude) {
                    const key = `${visit.punchOutLocation.latitude},${visit.punchOutLocation.longitude}`;
                    if (!names[key]) {
                        names[key] = await getLocationName(
                            visit.punchOutLocation.latitude,
                            visit.punchOutLocation.longitude
                        );
                    }
                }
            }

            setLocationNames(names);
        };

        if (visits.length > 0) {
            fetchLocationNames();
        }
    }, [visits]);

    const filterVisits = () => {
        let filtered = [...visits];

        // Filter by tab
        if (activeTab === 'today') {
            const today = new Date().toDateString();
            filtered = filtered.filter(visit =>
                new Date(visit.date).toDateString() === today
            );
        } else if (activeTab === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(visit =>
                new Date(visit.date) >= weekAgo
            );
        } else if (activeTab === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter(visit =>
                new Date(visit.date) >= monthAgo
            );
        }

        // Filter by specific date
        if (filterDate) {
            filtered = filtered.filter(visit =>
                new Date(visit.date).toDateString() === new Date(filterDate).toDateString()
            );
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(visit =>
                visit.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                visit.punchInLocationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                visit.punchOutLocationName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredVisits(filtered);
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            toast.error("Camera access required for attendance!");
            setShowCameraModal(false);
        }
    };

    const stopCameraStream = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    const handleCapturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setShowCameraModal(false);
        stopCameraStream();

        if (captureAction === 'in') {
            handlePunchInAfterCapture(imageData);
        } else {
            handlePunchOutAfterCapture(imageData);
        }
    };

    const formatTime = (date) =>
        new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-GB');

    const formatDuration = (start, end) => {
        if (!start || !end) return 'In Progress';
        const diffMs = new Date(end) - new Date(start);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const handlePunchIn = () => {
        if (isPunchingIn) return;

        if (locationPermissionDenied) {
            toast.error('Location permission is required for attendance tracking');
            return;
        }

        setCaptureAction('in');
        setShowCameraModal(true);
    };

    const handlePunchInAfterCapture = async (selfieImage) => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported');
            return;
        }

        setIsPunchingIn(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;

            try {
                const formData = new FormData();

                // Convert base64 to blob and append to FormData
                const response = await fetch(selfieImage);
                const blob = await response.blob();
                formData.append('photo', blob, 'selfie.jpg');
                formData.append('latitude', latitude);
                formData.append('longitude', longitude);
                formData.append('notes', notes);

                const res = await axiosInstance.post("/salesman/punch-in", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });

                // Refresh visits data
                const visitsRes = await axiosInstance.get('/salesman/visits');
                setVisits(visitsRes.data.visits || []);
                setTotalVisits(visitsRes.data.totalVisits || 0);

                setNotes('');
                toast.success('Punched in successfully!');
            } catch (error) {
                console.error('Failed to punch in:', error);
                toast.error(error.response?.data?.error || 'Punch in failed.');
            } finally {
                setIsPunchingIn(false);
            }
        }, (error) => {
            setIsPunchingIn(false);
            toast.error('Location access denied. Please enable location services.');
        });
    };

    const handlePunchOut = () => {
        if (isPunchingOut) return;

        const todayVisits = visits.filter(visit =>
            new Date(visit.date).toDateString() === new Date().toDateString()
        );

        const activeVisit = todayVisits.find(visit => visit.punchIn && !visit.punchOut);

        if (!activeVisit) {
            toast.error('No active punch-in found');
            return;
        }

        if (locationPermissionDenied) {
            toast.error('Location permission is required for attendance tracking');
            return;
        }

        setCaptureAction('out');
        setShowCameraModal(true);
    };

    const handlePunchOutAfterCapture = async (selfieImage) => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported');
            return;
        }

        setIsPunchingOut(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;

            try {
                const formData = new FormData();

                // Convert base64 to blob and append to FormData
                const response = await fetch(selfieImage);
                const blob = await response.blob();
                formData.append('photo', blob, 'selfie.jpg');
                formData.append('latitude', latitude);
                formData.append('longitude', longitude);

                await axiosInstance.post("/salesman/punch-out", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });

                // Refresh visits data
                const visitsRes = await axiosInstance.get('/salesman/visits');
                setVisits(visitsRes.data.visits || []);
                setTotalVisits(visitsRes.data.totalVisits || 0);

                toast.success('Punched out successfully!');
            } catch (error) {
                console.error('Punch out failed:', error);
                toast.error(error.response?.data?.error || 'Punch out failed.');
            } finally {
                setIsPunchingOut(false);
            }
        }, (error) => {
            setIsPunchingOut(false);
            toast.error('Location access denied. Please enable location services.');
        });
    };

    const getTodayStatus = () => {
        const todayVisits = visits.filter(visit =>
            new Date(visit.date).toDateString() === new Date().toDateString()
        );

        const activeVisit = todayVisits.find(visit => visit.punchIn && !visit.punchOut);
        return activeVisit ? 'ON DUTY' : 'OFF DUTY';
    };

    const hasActivePunch = () => {
        const todayVisits = visits.filter(visit =>
            new Date(visit.date).toDateString() === new Date().toDateString()
        );

        return todayVisits.some(visit => visit.punchIn && !visit.punchOut);
    };

    const handleViewPhoto = (photoUrl) => {
        setSelectedPhoto(photoUrl);
        setShowPhotoModal(true);
    };

    const tabs = [
        { id: 'today', label: 'Today', icon: TbClock },
        { id: 'week', label: 'This Week', icon: TbCalendar },
        { id: 'month', label: 'This Month', icon: LuCalendarDays },
        { id: 'all', label: 'All Records', icon: TbUser }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 space-y-4 lg:space-y-0">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Site Visit Dashboard</h1>
                            {/* <p className="text-gray-600">Welcome back, {userName}</p> */}
                        </div>
                        <div className="w-full lg:w-auto text-left lg:text-right">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg shadow-md inline-block">
                                <div className="text-sm opacity-90">Today</div>
                                <div className="text-lg font-semibold">{currentDate}</div>
                            </div>
                        </div>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 p-4 mb-6 rounded-lg">
                        <div className="flex items-start">
                            <TbAlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-base lg:text-lg font-semibold text-orange-800 mb-2">⚠️ Important Notice</h3>
                                <p className="text-sm lg:text-base text-orange-700 leading-relaxed">
                                    <strong>Please ensure you are at the correct location before punching in or out.</strong>
                                    Your location will be recorded for attendance verification. Make sure your GPS is enabled
                                    and you have a stable internet connection for accurate location tracking.
                                </p>
                                <div className="mt-2 text-xs lg:text-sm text-orange-600">
                                    <TbInfoCircle className="inline w-4 h-4 mr-1" />
                                    A photo will be taken for security purposes during each punch.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Current Status */}
                        <div className="bg-gradient-to-r from-[#d4eaf7] to-[#b4d4ec] text-gray-800 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm opacity-80">Current Status</p>
                                    <p className="text-lg lg:text-xl font-bold">{getTodayStatus()}</p>
                                </div>
                                <TbClock className="w-6 h-6 lg:w-8 lg:h-8 text-[#1e3a5f]" />
                            </div>
                        </div>

                        {/* Total Visits */}
                        <div className="bg-gradient-to-r from-[#e1eefd] to-[#c9daf8] text-gray-800 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm opacity-80">Total Visits</p>
                                    <p className="text-lg lg:text-xl font-bold">{totalVisits}</p>
                                </div>
                                <TbMapPin className="w-6 h-6 lg:w-8 lg:h-8 text-[#1e3a5f]" />
                            </div>
                        </div>

                        {/* Today's Visits */}
                        <div className="bg-gradient-to-r from-[#ede7f6] to-[#d1c4e9] text-gray-800 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm opacity-80">Today's Visits</p>
                                    <p className="text-lg lg:text-xl font-bold">
                                        {visits.filter(visit =>
                                            new Date(visit.date).toDateString() === new Date().toDateString()
                                        ).length}
                                    </p>
                                </div>
                                <TbCalendar className="w-6 h-6 lg:w-8 lg:h-8 text-[#4a3f63]" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Action Panel */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>

                    {/* Location Permission Warning */}
                    {locationPermissionDenied && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
                            <div className="flex items-center">
                                <TbAlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                                <p className="text-sm lg:text-base text-red-700">
                                    Location permission is required. Please enable location services in your browser settings.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Notes Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Visit Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter notes for this visit (optional)"
                            rows={3}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 lg:gap-6">
                        <button
                            onClick={handlePunchIn}
                            disabled={hasActivePunch() || isPunchingIn || locationPermissionDenied}
                            className="flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg text-sm lg:text-base"
                        >
                            <TbCamera className="mr-2 lg:mr-3 w-4 h-4 lg:w-5 lg:h-5" />
                            {isPunchingIn ? 'Punching In...' : 'Punch In'}
                            <TbDoorEnter className="ml-2 lg:ml-3 w-4 h-4 lg:w-5 lg:h-5" />
                        </button>

                        <button
                            onClick={handlePunchOut}
                            disabled={!hasActivePunch() || isPunchingOut || locationPermissionDenied}
                            className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg text-sm lg:text-base"
                        >
                            <TbCamera className="mr-2 lg:mr-3 w-4 h-4 lg:w-5 lg:h-5" />
                            {isPunchingOut ? 'Punching Out...' : 'Punch Out'}
                            <TbDoorExit className="ml-2 lg:ml-3 w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                    </div>
                </div>

                {/* Visits History */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Visit History</h2>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="relative">
                                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search visits..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto text-sm"
                                />
                            </div>

                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-3 lg:px-4 py-2 rounded-t-lg font-medium transition-all duration-200 text-sm lg:text-base ${activeTab === tab.id
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                                        }`}
                                >
                                    <IconComponent className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Visits Table */}
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading visits...</p>
                        </div>
                    ) : filteredVisits.length === 0 ? (
                        <div className="text-center py-8">
                            <TbMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No visits found for the selected criteria</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch In</th>
                                        <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch Out</th>
                                        <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                        <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Location</th>
                                        <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out Location</th>
                                        <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                        <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                        <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredVisits.map((visit, index) => (
                                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                                            <td className="px-2 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900 font-medium">
                                                {formatDate(visit.date)}
                                            </td>
                                            <td className="px-2 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                                                {visit.punchIn ? (
                                                    <div className="flex items-center">
                                                        <TbClock className="w-3 h-3 lg:w-4 lg:h-4 mr-1 text-green-500" />
                                                        <span className="text-xs lg:text-sm">{formatTime(visit.punchIn)}</span>
                                                    </div>
                                                ) : '--:--:--'}
                                            </td>
                                            <td className="px-2 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                                                {visit.punchOut ? (
                                                    <div className="flex items-center">
                                                        <TbClock className="w-3 h-3 lg:w-4 lg:h-4 mr-1 text-red-500" />
                                                        <span className="text-xs lg:text-sm">{formatTime(visit.punchOut)}</span>
                                                    </div>
                                                ) : '--:--:--'}
                                            </td>
                                            <td className="px-2 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900 font-medium">
                                                {formatDuration(visit.punchIn, visit.punchOut)}
                                            </td>
                                            <td className="px-2 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 max-w-xs">
                                                {visit.punchInLocationName || visit.punchInLocation ? (
                                                    <div className="flex items-start">
                                                        <LuMapPin className="w-3 h-3 lg:w-4 lg:h-4 mr-1 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span className="truncate text-xs lg:text-sm"
                                                            title={locationNames[`${visit.punchInLocation.latitude},${visit.punchInLocation.longitude}`] ||
                                                                `${visit.punchInLocation.latitude?.toFixed(4)}, ${visit.punchInLocation.longitude?.toFixed(4)}`}>
                                                            {locationNames[`${visit.punchInLocation.latitude},${visit.punchInLocation.longitude}`] ||
                                                                `${visit.punchInLocation.latitude?.toFixed(4)}, ${visit.punchInLocation.longitude?.toFixed(4)}`}
                                                        </span>
                                                    </div>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-2 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 max-w-xs">
                                                {visit.punchOutLocationName || visit.punchOutLocation ? (
                                                    <div className="flex items-start">
                                                        <LuMapPin className="w-3 h-3 lg:w-4 lg:h-4 mr-1 text-orange-500 mt-0.5 flex-shrink-0" />
                                                        <span className="truncate text-xs lg:text-sm"
                                                            title={locationNames[`${visit.punchOutLocation.latitude},${visit.punchOutLocation.longitude}`] ||
                                                                `${visit.punchOutLocation.latitude?.toFixed(4)}, ${visit.punchOutLocation.longitude?.toFixed(4)}`}>
                                                            {locationNames[`${visit.punchOutLocation.latitude},${visit.punchOutLocation.longitude}`] ||
                                                                `${visit.punchOutLocation.latitude?.toFixed(4)}, ${visit.punchOutLocation.longitude?.toFixed(4)}`}
                                                        </span>
                                                    </div>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-2 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                                                <div className="flex gap-1 lg:gap-2">
                                                    {visit.punchInPhoto && (
                                                        <button
                                                            onClick={() => handleViewPhoto(visit.punchInPhoto)}
                                                            className="inline-flex items-center px-1.5 lg:px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-150"
                                                            title="View Punch In Photo"
                                                        >
                                                            <TbCamera className="w-3 h-3 mr-0.5 lg:mr-1" />
                                                            <span className="text-xs">In</span>
                                                        </button>
                                                    )}
                                                    {visit.punchOutPhoto && (
                                                        <button
                                                            onClick={() => handleViewPhoto(visit.punchOutPhoto)}
                                                            className="inline-flex items-center px-1.5 lg:px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-150"
                                                            title="View Punch Out Photo"
                                                        >
                                                            <TbCamera className="w-3 h-3 mr-0.5 lg:mr-1" />
                                                            <span className="text-xs">Out</span>
                                                        </button>
                                                    )}
                                                    {!visit.punchInPhoto && !visit.punchOutPhoto && (
                                                        <span className="text-gray-400 text-xs">No photos</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 max-w-xs">
                                                <div className="truncate" title={visit.notes || '-'}>
                                                    {visit.notes || '-'}
                                                </div>
                                            </td>
                                            <td className="px-2 lg:px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${visit.punchOut
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {visit.punchOut ? 'Completed' : 'In Progress'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Camera Modal */}
            {showCameraModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-2xl w-full max-w-md lg:max-w-lg mx-4">
                        <h2 className="text-xl lg:text-2xl font-bold mb-4 text-center text-gray-800">Take Attendance Photo</h2>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg mb-4">
                            <div className="flex items-center text-blue-700">
                                <TbInfoCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-2 flex-shrink-0" />
                                <p className="text-xs lg:text-sm">
                                    Please ensure good lighting and position your face clearly in the frame for attendance verification.
                                </p>
                            </div>
                        </div>
                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-lg pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-32 h-40 lg:w-48 lg:h-64 border-2 border-white/50 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    setShowCameraModal(false);
                                    stopCameraStream();
                                }}
                                className="bg-gray-500 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center text-sm lg:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCapturePhoto}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 duration-200 flex items-center text-sm lg:text-base"
                            >
                                <TbCamera className="inline mr-2 w-4 h-4 lg:w-5 lg:h-5" />
                                Capture Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo View Modal */}
            {showPhotoModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-2xl max-w-sm lg:max-w-2xl max-h-[90vh] overflow-auto w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-800">Attendance Photo</h3>
                            <button
                                onClick={() => setShowPhotoModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                            >
                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="relative">
                            {selectedPhoto ? (
                                <img
                                    src={selectedPhoto}
                                    alt="Attendance Photo"
                                    className="w-full h-auto rounded-lg shadow-md max-h-[60vh] object-contain"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.png';
                                        e.target.alt = 'Image not available';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">No image available</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setShowPhotoModal(false)}
                                className="bg-gray-500 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm lg:text-base"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}