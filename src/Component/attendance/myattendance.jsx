'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { TbDoorExit, TbDoorEnter } from 'react-icons/tb';
import { LuAlarmClock } from "react-icons/lu";
import { FiCamera, FiX, FiUser } from 'react-icons/fi';
import { BiImageAlt } from 'react-icons/bi';
import { axiosInstance } from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { useGSAP } from '@gsap/react';

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState('');
  const [inTime, setInTime] = useState('');
  const [inLocation, setInLocation] = useState('');
  const [outTime, setOutTime] = useState('');
  const [outLocation, setOutLocation] = useState('');
  const [hasPunchedIn, setHasPunchedIn] = useState(false);
  const [hasPunchedOut, setHasPunchedOut] = useState(false);
  const [isPunchingIn, setIsPunchingIn] = useState(false);
  const [isPunchingOut, setIsPunchingOut] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [pendingPunchOutData, setPendingPunchOutData] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [captureAction, setCaptureAction] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [punchInPhoto, setPunchInPhoto] = useState(null);
  const [punchOutPhoto, setPunchOutPhoto] = useState(null);
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
    const checkTodayAttendance = async () => {
      try {
        const res = await axiosInstance.get('/attendance/today');
        const data = res.data;
        if (data.punchedIn) {
          const punchInDate = new Date(data.punchInTime);
          setHasPunchedIn(true);
          setInTime(formatTime(punchInDate));
          setInLocation(data.punchInLocation || 'Unknown');
          setPunchInPhoto(data.punchInPhoto || null);
        }
        if (data.punchedOut) {
          setHasPunchedOut(true);
          const punchOutDate = new Date(data.punchOutTime);
          setOutTime(formatTime(punchOutDate));
          setOutLocation(data.punchOutLocation || 'Unknown');
          setPunchOutPhoto(data.punchOutPhoto || null);
        }
      } catch (error) {
        console.error('Failed to fetch todays attendance:', error);
      }
    };
    checkTodayAttendance();
  }, []);

  useEffect(() => {
    const dateStr = new Date().toLocaleDateString('en-GB');
    setCurrentDate(dateStr);
  }, []);

  useEffect(() => {
    if (showCameraModal) {
      startCamera();
    } else {
      stopCameraStream();
    }
  }, [showCameraModal]);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

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
      console.error("Camera error:", error);
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

  const fetchLocation = async (lat, lon) => {
    if (!navigator.onLine) {
      toast.error('No internet connection. Unable to fetch location.');
      return 'Offline - Unable to fetch location';
    }

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return 'Unknown Location';
    } catch (error) {
      console.error('Location fetch failed:', error);
      return 'Failed to fetch location';
    }
  };

  const handlePunchIn = () => {
    if (hasPunchedIn || isPunchingIn) return;
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
      setInTime(formatTime(now));
      setInLocation(location);
      setHasPunchedIn(true);
      setPunchInPhoto(selfieImage);
      try {
        await axiosInstance.post("/attendance/punch-in", {
          punchInTime: now.toISOString(),
          punchInLocation: location,
          selfieImage,
          userLocation: {
            latitude,
            longitude
          }
        });
        toast.success('Punched in successfully!');
      } catch (error) {
        console.error('Failed to punch in:', error);
        toast.error(error.response?.data?.message || 'Punch in failed.');
      } finally {
        setIsPunchingIn(false);
      }
    });
  };

  const handlePunchOut = () => {
    if (!hasPunchedIn || hasPunchedOut || isPunchingOut) return;
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
      const punchInDate = new Date();
      const elapsed = (now - punchInDate) / 1000;
      if (elapsed < 270) {
        setPendingPunchOutData({
          punchOutTime: now.toISOString(),
          punchOutLocation: location,
          selfieImage,
          userLocation: {
            latitude,
            longitude
          }
        });
        setShowModal(true);
        setIsPunchingOut(false);
        return;
      }
      try {
        await axiosInstance.post("/attendance/punch-out", {
          punchOutTime: now.toISOString(),
          punchOutLocation: location,
          selfieImage,
          userLocation: {
            latitude,
            longitude
          }
        });

        setOutTime(formatTime(now));
        setOutLocation(location);
        setHasPunchedOut(true);
        setPunchOutPhoto(selfieImage);
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
      toast.error("Please provide the reason.");
      return;
    }
    setIsPunchingOut(true);
    try {
      await axiosInstance.post("/attendance/punch-out", {
        ...pendingPunchOutData,
        emergencyReason: trimmedReason,
      });
      const time = new Date(pendingPunchOutData.punchOutTime);
      setOutTime(formatTime(time));
      setOutLocation(pendingPunchOutData.punchOutLocation);
      setHasPunchedOut(true);
      setPunchOutPhoto(pendingPunchOutData.selfieImage);
      toast.success('Emergency punch out recorded!');
    } catch (error) {
      console.error('Punch out failed:', error);
      toast.error('Punch out failed.');
    } finally {
      setIsPunchingOut(false);
      setShowModal(false);
      setEmergencyReason('');
    }
  };

  const handlePhotoClick = (photo, type) => {
    if (photo) {
      setSelectedPhoto({ image: photo, type });
      setShowPhotoModal(true);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#058CBF] to-[#0ea5e9] p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl w-fit">
                    <span className="text-white font-semibold text-sm sm:text-base">{currentDate}</span>
                  </div>
                  <button
                    onClick={() => router.push('/attendance/punchhistory')}
                    className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-200 w-fit text-sm sm:text-base"
                  >
                    📊 Punch History
                  </button>
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <Image src="/profile.png" alt="avatar" width={80} height={80} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">ATTENDANCE</h1>
                <div
                  ref={underlineRef}
                  className="h-1 bg-white/30 rounded-full mx-auto w-32 sm:w-48"
                ></div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-8 space-y-6">
              {/* Punch In Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
                <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <TbDoorEnter className="text-xl" />
                  Punch In Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="font-medium text-gray-700 min-w-[120px]">Time:</label>
                      <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex-1">
                        {inTime || '--:--:--'}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                      <label className="font-medium text-gray-700 min-w-[120px] mt-2">Location:</label>
                      <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex-1 text-sm">
                        {inLocation || 'Not punched in yet'}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <div 
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 border-4 border-green-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-200 group"
                      onClick={() => handlePhotoClick(punchInPhoto, 'Punch In')}
                    >
                      {punchInPhoto ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <img src={punchInPhoto} alt="Punch In" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <BiImageAlt className="text-white text-2xl" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FiUser className="text-3xl text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-500">No Photo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 py-6">
                <button
                  onClick={handlePunchIn}
                  disabled={hasPunchedIn || isPunchingIn}
                  className="flex items-center justify-center bg-gradient-to-r from-[#058CBF] to-[#0ea5e9] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                >
                  <LuAlarmClock className="mr-2 text-xl" />
                  {isPunchingIn ? 'Punching In...' : 'Punch In'}
                  <TbDoorEnter className="ml-2 text-xl" />
                </button>
                <button
                  onClick={handlePunchOut}
                  disabled={!hasPunchedIn || hasPunchedOut || isPunchingOut}
                  className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                >
                  <LuAlarmClock className="mr-2 text-xl" />
                  {isPunchingOut ? 'Punching Out...' : 'Punch Out'}
                  <TbDoorExit className="ml-2 text-xl" />
                </button>
              </div>

              {/* Punch Out Section */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 sm:p-6 border border-red-100">
                <h3 className="text-lg sm:text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <TbDoorExit className="text-xl" />
                  Punch Out Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="font-medium text-gray-700 min-w-[120px]">Time:</label>
                      <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex-1">
                        {outTime || '--:--:--'}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                      <label className="font-medium text-gray-700 min-w-[120px] mt-2">Location:</label>
                      <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex-1 text-sm">
                        {outLocation || 'Not punched out yet'}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <div 
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 border-4 border-red-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-200 group"
                      onClick={() => handlePhotoClick(punchOutPhoto, 'Punch Out')}
                    >
                      {punchOutPhoto ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <img src={punchOutPhoto} alt="Punch Out" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <BiImageAlt className="text-white text-2xl" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FiUser className="text-3xl text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-500">No Photo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Take Attendance Selfie</h2>
                <button
                  onClick={() => {
                    setShowCameraModal(false);
                    stopCameraStream();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowCameraModal(false);
                    stopCameraStream();
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCapturePhoto}
                  className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FiCamera />
                  Capture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo View Modal */}
      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{selectedPhoto.type} Photo</h3>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img 
                  src={selectedPhoto.image} 
                  alt={selectedPhoto.type}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <h2 className="text-2xl sm:text-3xl text-red-600 text-center font-bold mb-4">Emergency Punch Out</h2>
              <p className="mb-4 text-lg text-gray-700">You're punching out early. Please provide a reason:</p>
              <textarea
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl mb-4 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Enter your reason here..."
              />
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEmergencyReason('');
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEmergencyPunchOut}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 active:scale-95 transition-all duration-200"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}