'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { TbDoorExit, TbDoorEnter } from 'react-icons/tb';
import { LuAlarmClock } from "react-icons/lu";
import { axiosInstance } from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { useGSAP } from '@gsap/react';

export default function AttendancePage() {
    const [currentDate, setCurrentDate] = useState('');
    const [records, setRecords] = useState([]);
    const [isPunchingIn, setIsPunchingIn] = useState(false);
    const [isPunchingOut, setIsPunchingOut] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [emergencyReason, setEmergencyReason] = useState('');
    const [pendingPunchOutData, setPendingPunchOutData] = useState(null);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [captureAction, setCaptureAction] = useState(null);
    const [companyId, setCompanyId] = useState('');
    const [notes, setNotes] = useState('');
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
        const fetchTodayRecords = async () => {
            try {
                const res = await axiosInstance.get('/salesman/visits');
                setRecords(res.data.records || []);
            } catch (error) {
                console.error('Failed to fetch attendance records:', error);
                toast.error('Failed to load attendance data');
            }
        };

        const dateStr = new Date().toLocaleDateString('en-GB');
        setCurrentDate(dateStr);

        fetchTodayRecords();
    }, []);

    useEffect(() => {
        if (showCameraModal) {
            startCamera();
        } else {
            stopCameraStream();
        }

        return () => stopCameraStream();
    }, [showCameraModal]);

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
        date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });

    const formatDuration = (start, end) => {
        const diffMs = end - start;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const fetchLocation = async (lat, lon) => {
        if (!navigator.onLine) {
            return 'Offline - Unable to fetch location';
        }

        try {
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            const data = await res.json();

            return data.status === 'OK' && data.results.length > 0
                ? data.results[0].formatted_address
                : 'Unknown Location';
        } catch (error) {
            console.error('Location fetch failed:', error);
            return 'Failed to fetch location';
        }
    };

    const handlePunchIn = () => {
        if (isPunchingIn) return;
        setCaptureAction('in');
        setShowCameraModal(true);
    };

    const handlePunchInAfterCapture = async (selfieImage) => {
        if (!navigator.geolocation) return alert('Geolocation not supported');

        setIsPunchingIn(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const location = await fetchLocation(latitude, longitude);
            const now = new Date();

            try {
                console.log(selfieImage);
                const res = await axiosInstance.post("/salesman/punch-in", {
                    punchInTime: now.toISOString(),
                    punchInLocation: location,
                    photo: selfieImage,
                    siteLocation: { latitude, longitude },
                    companyId,
                    notes,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });

                setRecords(prev => [
                    ...prev,
                    {
                        id: res.data.id,
                        punchInTime: formatTime(now),
                        punchInLocation: location,
                        punchOutTime: null,
                        punchOutLocation: null,
                        duration: null,
                        companyId,
                        notes
                    }
                ]);

                // Reset form fields after successful punch-in
                setCompanyId('');
                setNotes('');

                toast.success('Punched in successfully!');
            } catch (error) {
                console.error('Failed to punch in:', error);
                toast.error('Punch in failed.');
            } finally {
                setIsPunchingIn(false);
            }
        });
    };

    const handlePunchOut = () => {
        if (isPunchingOut || records.length === 0 || records[records.length - 1].punchOutTime) return;

        setCaptureAction('out');
        setShowCameraModal(true);
    };

    const handlePunchOutAfterCapture = async (selfieImage) => {
        if (!navigator.geolocation) return alert('Geolocation not supported');

        setIsPunchingOut(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const location = await fetchLocation(latitude, longitude);
            const now = new Date();
            const lastRecord = records[records.length - 1];
            const punchInDate = new Date(lastRecord.punchInTime);

            const elapsed = (now - punchInDate) / 1000;
            if (elapsed < 270) {
                setPendingPunchOutData({
                    recordId: lastRecord.id,
                    punchOutTime: now,
                    punchOutLocation: location,
                    selfieImage,
                    userLocation: { latitude, longitude }
                });
                setShowModal(true);
                setIsPunchingOut(false);
                return;
            }

            try {
                await axiosInstance.post("/salesman/punch-out", {
                    recordId: lastRecord.id,
                    punchOutTime: now.toISOString(),
                    punchOutLocation: location,
                    selfieImage,
                    userLocation: { latitude, longitude }
                });

                const duration = formatDuration(punchInDate, now);
                setRecords(prev =>
                    prev.map((record, index) =>
                        index === prev.length - 1
                            ? {
                                ...record,
                                punchOutTime: formatTime(now),
                                punchOutLocation: location,
                                duration
                            }
                            : record
                    )
                );

                toast.success('Punched out successfully!');
            } catch (error) {
                console.error('Punch out failed:', error);
                toast.error('Punch out failed.');
            } finally {
                setIsPunchingOut(false);
            }
        });
    };

    const confirmEmergencyPunchOut = async () => {
        const trimmedReason = emergencyReason.trim();
        const wordCount = trimmedReason.split(/\s+/).filter(Boolean).length;

        if (wordCount < 1) {
            toast.error("Please provide a reason.");
            return;
        }

        setIsPunchingOut(true);

        try {
            const { recordId, punchOutTime, punchOutLocation, selfieImage, userLocation } = pendingPunchOutData;
            const lastRecord = records[records.length - 1];
            const punchInDate = new Date(lastRecord.punchInTime);

            await axiosInstance.post("/attendance/punch-out", {
                recordId,
                punchOutTime: punchOutTime.toISOString(),
                punchOutLocation,
                selfieImage,
                userLocation,
                emergencyReason: trimmedReason
            });

            const duration = formatDuration(punchInDate, punchOutTime);
            setRecords(prev =>
                prev.map((record, index) =>
                    index === prev.length - 1
                        ? {
                            ...record,
                            punchOutTime: formatTime(punchOutTime),
                            punchOutLocation,
                            duration
                        }
                        : record
                )
            );

            toast.success('Emergency punch out recorded!');
        } catch (error) {
            console.error('Punch out failed:', error);
            toast.error('Punch out failed.');
        } finally {
            setIsPunchingOut(false);
            setShowModal(false);
            setEmergencyReason('');
            setPendingPunchOutData(null);
        }
    };

    const activeRecord = records.length > 0
        ? records[records.length - 1]
        : null;
    const hasActivePunch = activeRecord && !activeRecord.punchOutTime;

    return (
        <div className="flex items-center justify-center mt-15 bg-white p-4">
            <div className="bg-white rounded-xl shadow-md w-full max-w-3xl p-6 border-2 border-gray-300 relative">
                <div className="flex flex-col mx-4 space-y-4">
                    <button className="bg-[#F4F5FD] px-4 w-30 py-2 text-md rounded-xl shadow-md font-semibold">
                        {currentDate}
                    </button>
                    <button
                        onClick={() => router.push('/attendance/punchhistory')}
                        className="bg-[#058CBF] text-white w-30 whitespace-nowrap px-2 py-2 rounded cursor-pointer hover:bg-[#69b0c9]"
                    >
                        Punch History
                    </button>
                </div>
                <div className="relative -mt-20 mb-8 w-max mx-auto">
                    <h2 className="text-3xl font-medium font-roboto text-gray-700">ATTENDANCE</h2>
                    <span
                        ref={underlineRef}
                        className="absolute left-0 bottom-[-6px] h-[3px] bg-[#058CBF] w-full scale-x-0"
                    ></span>
                </div>
                <div className="flex justify-end -ml-20 -mt-25 mb-10 items-start w-full h-full pt-4">
                    <div className="w-[70px] h-[70px] rounded-full overflow-hidden flex justify-center items-center">
                        <Image src="/profile.png" alt="avatar" width={70} height={70} />
                    </div>
                </div>
                <hr className="h-0.5 bg-gray-400 border-0" />

                <div className="mt-4 space-y-3">
                    {/* Company ID and Notes Inputs */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company ID</label>
                        <input
                            type="text"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Enter company ID"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Enter notes (optional)"
                            rows={2}
                        />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <strong className="w-40">Current Status:</strong>
                        <div className={`px-4 py-2 rounded-md font-semibold ${hasActivePunch
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                            {hasActivePunch ? 'ON DUTY' : 'OFF DUTY'}
                        </div>
                    </div>

                    <div className="flex justify-center gap-x-10 mt-8 mb-8">
                        <button
                            onClick={handlePunchIn}
                            disabled={hasActivePunch || isPunchingIn}
                            className="flex items-center bg-[#058CBF] ml-2 text-lg text-white px-6 py-2 rounded hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <LuAlarmClock className="mr-2" />
                            {isPunchingIn ? 'Punching In...' : 'Punch In'}
                            <TbDoorEnter className="ml-2" />
                        </button>
                        <button
                            onClick={handlePunchOut}
                            disabled={!hasActivePunch || isPunchingOut}
                            className="flex items-center bg-[#058CBF] text-lg text-white px-6 py-2 rounded hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <LuAlarmClock className="mr-2" />
                            {isPunchingOut ? 'Punching Out...' : 'Punch Out'}
                            <TbDoorExit className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Attendance Records Table */}
            <div className="bg-white rounded-xl shadow-md w-full max-w-3xl p-6 border-2 border-gray-300 relative mt-8">
                <h3 className="text-xl font-semibold mb-4 text-center">Today's Attendance Summary</h3>

                {records.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No attendance records yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2">Punch In Time</th>
                                    <th className="border border-gray-300 px-4 py-2">Punch In Location</th>
                                    <th className="border border-gray-300 px-4 py-2">Company ID</th>
                                    <th className="border border-gray-300 px-4 py-2">Punch Out Time</th>
                                    <th className="border border-gray-300 px-4 py-2">Punch Out Location</th>
                                    <th className="border border-gray-300 px-4 py-2">Duration</th>
                                    <th className="border border-gray-300 px-4 py-2">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record, index) => (
                                    <tr key={record.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{record.punchInTime}</td>
                                        <td className="border border-gray-300 px-4 py-2">{record.punchInLocation}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{record.companyId || 'N/A'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            {record.punchOutTime || '--:--:--'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {record.punchOutLocation || 'N/A'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            {record.duration || 'In Progress'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 max-w-xs truncate">
                                            {record.notes || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Camera Modal */}
            {showCameraModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4">Take Attendance Selfie</h2>
                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                onClick={() => {
                                    setShowCameraModal(false);
                                    stopCameraStream();
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCapturePhoto}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Capture Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Punch Out Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                        <h2 className="text-3xl text-red-600 text-center font-bold mb-4">Emergency Punch Out</h2>
                        <p className="mb-2 text-xl">You're punching out early. Please provide a reason:</p>
                        <textarea
                            value={emergencyReason}
                            onChange={(e) => setEmergencyReason(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mb-4 resize-none overflow-y-auto"
                            rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEmergencyReason('');
                                }}
                                className="bg-gray-300 px-4 py-2 rounded font-bold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmEmergencyPunchOut}
                                className="bg-red-600 active:scale-90 text-white px-4 py-2 rounded font-bold cursor-pointer"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}