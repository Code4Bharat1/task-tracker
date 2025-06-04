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

const uploadImageToCloudinary = async (imageDataUrl) => {
  try {
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, `attendance-selfie-${Date.now()}.jpg`);
    const uploadResponse = await axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return uploadResponse.data;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

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
  const [punchInPhoto, setPunchInPhoto] = useState('');
  const [punchOutPhoto, setPunchOutPhoto] = useState('');
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

  const checkTodayAttendance = async () => {
    try {
      const res = await axiosInstance.get('/attendance/today');
      const data = res.data;
      if (data.punchedIn) {
        const punchInDate = new Date(data.punchInTime);
        setHasPunchedIn(true);
        setInTime(formatTime(punchInDate));
        setInLocation(data.punchInLocation || 'Unknown');
        setPunchInPhoto(data.punchInPhoto || '');
      }
      if (data.punchedOut) {
        setHasPunchedOut(true);
        const punchOutDate = new Date(data.punchOutTime);
        setOutTime(formatTime(punchOutDate));
        setOutLocation(data.punchOutLocation || 'Unknown');
        setPunchOutPhoto(data.punchOutPhoto || '');
      }
    } catch (error) {
      console.error(`Failed to fetch today's attendance: , ${error}`);
    }
  };
  useEffect(() => {
    checkTodayAttendance();
  }, []);

  useEffect(() => {
    checkTodayAttendance()
  }, [hasPunchedIn])
  useEffect(() => {
    checkTodayAttendance()
  }, [hasPunchedOut])
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
      try {
        const { latitude, longitude } = pos.coords;
        const location = await fetchLocation(latitude, longitude);
        const now = new Date();
        toast.loading('Uploading selfie...');
        const cloudinaryResult = await uploadImageToCloudinary(selfieImage);
        toast.dismiss();
        setInTime(formatTime(now));
        setInLocation(location);
        setHasPunchedIn(true);
        setPunchInPhoto(cloudinaryResult.fileUrl);
        await axiosInstance.post("/attendance/punch-in", {
          punchInTime: now.toISOString(),
          punchInLocation: location,
          selfieImage: cloudinaryResult.fileUrl,
          selfiePublicId: cloudinaryResult.publicId,
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
      try {
        const { latitude, longitude } = pos.coords;
        const location = await fetchLocation(latitude, longitude);
        const now = new Date();
        const punchInDate = new Date();
        const elapsed = (now - punchInDate) / 1000;
        toast.loading('Uploading selfie...');
        const cloudinaryResult = await uploadImageToCloudinary(selfieImage);
        toast.dismiss();
        const punchOutData = {
          punchOutTime: now.toISOString(),
          punchOutLocation: location,
          selfieImage: cloudinaryResult.fileUrl,
          selfiePublicId: cloudinaryResult.publicId,
          userLocation: {
            latitude,
            longitude
          }
        };
        if (elapsed < 270) {
          setCapturedImage(selfieImage);
          setPendingPunchOutData(punchOutData);
          setShowModal(true);
          setIsPunchingOut(false);
          return;
        }
        await axiosInstance.post("/attendance/punch-out", punchOutData);
        setOutTime(formatTime(now));
        setOutLocation(location);
        setHasPunchedOut(true);
        setPunchOutPhoto(cloudinaryResult.fileUrl);
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
      setPunchOutPhoto(capturedImage);
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

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-white p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-xl shadow-md w-full max-w-[90%] sm:max-w-3xl p-4 sm:p-6 border-2 border-gray-300 relative">
          <div className="flex flex-col sm:flex-row justify-between items-center mx-2 sm:mx-4 my-4 space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => router.push('/attendance/punchhistory')}
              className="bg-[#058CBF] text-white px-4 py-2 rounded shadow-md font-semibold hover:bg-[#69b0c9] w-full sm:w-auto"
            >
              Punch History
            </button>

            <h2 className="text-xl sm:text-2xl font-medium font-roboto text-gray-700 relative text-center">
              ATTENDANCE
              <span
                ref={underlineRef}
                className="absolute left-0 bottom-[-6px] h-[3px] bg-[#058CBF] w-full scale-x-0"
              ></span>
            </h2>

            <button className="bg-[#F4F5FD] px-4 py-2 rounded shadow-md font-semibold w-full sm:w-auto">
              {currentDate}
            </button>
          </div>

          <hr className="h-0.5 bg-gray-400 border-0" />
          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
              <strong className="w-full sm:w-40 text-sm sm:text-base">Punch in Time:</strong>
              <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md w-full sm:min-w-[80px] text-sm">
                {inTime || '--:--:--'}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <strong className="w-full sm:w-40 text-sm sm:text-base">Punch in Location:</strong>
              <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md text-xs sm:text-sm w-full sm:min-w-[200px]">
                {inLocation || 'Not punched in yet'}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
              <strong className="w-full sm:w-40 text-sm sm:text-base">Punch In Photo:</strong>
              <div className="p-2 rounded-md w-full sm:min-w-[100px] min-h-[80px] flex items-center justify-start">
                {punchInPhoto ? (
                  <img
                    src={punchInPhoto}
                    alt="Punch In Selfie"
                    className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-md cursor-pointer"
                    onClick={() => window.open(punchInPhoto, '_blank')}
                  />
                ) : (
                  <img
                    src="/profile.png"
                    alt="No photo"
                    className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-md opacity-50"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-x-10 mt-8 mb-8">
              <button
                onClick={handlePunchIn}
                disabled={hasPunchedIn || isPunchingIn}
                className="flex items-center justify-center bg-[#058CBF] text-sm sm:text-lg text-white px-4 sm:px-6 py-2 rounded hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
              >
                <LuAlarmClock className="mr-2" />
                {isPunchingIn ? 'Punching In...' : 'Punch In'}
                <TbDoorEnter className="ml-2" />
              </button>
              <button
                onClick={handlePunchOut}
                disabled={!hasPunchedIn || hasPunchedOut || isPunchingOut}
                className="flex items-center justify-center bg-[#058CBF] text-sm sm:text-lg text-white px-4 sm:px-6 py-2 rounded hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
              >
                <LuAlarmClock className="mr-2" />
                {isPunchingOut ? 'Punching Out...' : 'Punch Out'}
                <TbDoorExit className="ml-2" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
              <strong className="w-full sm:w-40 text-sm sm:text-base">Punch Out Time:</strong>
              <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md w-full sm:min-w-[80px] text-sm">
                {outTime || '--:--:--'}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <strong className="w-full sm:w-40 text-sm sm:text-base">Punch Out Location:</strong>
              <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md text-xs sm:text-sm w-full sm:min-w-[200px]">
                {outLocation || 'Not punched out yet'}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <strong className="w-full sm:w-40 text-sm sm:text-base">Punch Out Photo:</strong>
              <div className="p-2 rounded-md w-full sm:min-w-[100px] min-h-[80px] flex items-center justify-start">
                {punchOutPhoto ? (
                  <img
                    src={punchOutPhoto}
                    alt="Punch Out Selfie"
                    className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-md cursor-pointer"
                    onClick={() => window.open(punchOutPhoto, '_blank')}
                  />
                ) : (
                  <img
                    src="/profile.png"
                    alt="No photo"
                    className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-md opacity-50"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCameraModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-[95%] sm:w-full max-w-md sm:max-w-lg">
            <h2 className="text-lg sm:text-2xl font-bold mb-4">Take Attendance Selfie</h2>
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
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleCapturePhoto}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
              >
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-[95%] sm:w-full max-w-md sm:max-w-lg">
            <h2 className="text-xl sm:text-3xl text-red-600 text-center font-bold mb-4">Emergency Punch Out</h2>
            {capturedImage && (
              <div className="mb-4 flex justify-center">
                <img
                  src={capturedImage}
                  alt="Attendance Selfie"
                  className="w-32 h-32 object-cover rounded-md border border-gray-300"
                />
              </div>
            )}
            <p className="mb-2 text-base sm:text-xl">You're punching out early. Please provide a reason:</p>
            <textarea
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4 resize-none overflow-y-auto text-sm sm:text-base"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEmergencyReason('');
                }}
                className="bg-gray-300 px-4 py-2 rounded font-bold cursor-pointer text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={confirmEmergencyPunchOut}
                className="bg-red-600 active:scale-90 text-white px-4 py-2 rounded font-bold cursor-pointer text-sm sm:text-base"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}