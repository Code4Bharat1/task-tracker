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
  const underlineRef = useRef(null);
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
        }

        if (data.punchedOut) {
          setHasPunchedOut(true);
          const punchOutDate = new Date(data.punchOutTime);
          setOutTime(formatTime(punchOutDate));
          setOutLocation(data.punchOutLocation || 'Unknown');
        }
      } catch (error) {
        console.error('Failed to fetch today’s attendance:', error);
      }
    };

    checkTodayAttendance();
  }, []);

  useEffect(() => {
    const dateStr = new Date().toLocaleDateString('en-GB');
    setCurrentDate(dateStr);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

  const fetchLocation = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      return data.display_name || 'Unknown Location';
    } catch {
      return 'Failed to fetch location';
    }
  };

  const handlePunchIn = async () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setIsPunchingIn(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const location = await fetchLocation(latitude, longitude);
      const now = new Date();

      setInTime(formatTime(now));
      setInLocation(location);
      setHasPunchedIn(true);

      try {
        await axiosInstance.post("/attendance/punch-in", {
          punchInTime: now.toISOString(),
          punchInLocation: location,
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

  const handlePunchOut = async () => {
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
        });
        setShowModal(true);
        setIsPunchingOut(false);
        return;
      }

      try {
        await axiosInstance.post("/attendance/punch-out", {
          punchOutTime: now.toISOString(),
          punchOutLocation: location,
          emergencyReason: "",
        });

        setOutTime(formatTime(now));
        setOutLocation(location);
        setHasPunchedOut(true);
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

    if (wordCount < 5) {
      toast.error("Please provide at least 5 words explaining the reason.");
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
      <div className="relative ml-10 mt-4 w-max">
        <h2 className="text-2xl font-bold text-black">Attendance</h2>
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full scale-x-0"
        ></span>
      </div>

      <div className="flex items-center justify-center bg-white p-4">
        <div className="bg-white rounded-xl w-full max-w-5xl p-6 border-2 border-gray-300 relative">
        <div className="flex items-center mx-20 mb-6">
  <button className="bg-[#F4F5FD] px-4 py-2 text-2xl rounded-xl shadow-md font-semibold">
    {currentDate}
  </button>

  {/* Spacer */}
  <div className="flex-1" />

  {/* Centered Profile Image */}
  <div className="w-[70px] h-[70px] rounded-full flex justify-center items-center overflow-hidden">
    <Image src="/profile.png" alt="avatar" width={70} height={70} />
  </div>

  {/* Spacer */}
  <div className="flex-1" />

  <button
    onClick={() => router.push('/punchhistory')}
    className="bg-[#058CBF] text-white px-4 py-2 rounded cursor-pointer hover:bg-[#69b0c9]"
  >
    Punch History
  </button>
</div>


          <hr className="h-0.5 bg-gray-400 border-0" />

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <strong className="w-40">Punch in Time:</strong>
              <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md min-w-[80px]">
                {inTime || '--:--:--'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <strong className="w-40">Punch in Location:</strong>
              <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md text-sm min-w-[200px]">
                {inLocation || 'Not punched in yet'}
              </div>
            </div>

            <div className="flex justify-around mt-8 mb-8">
              <button
                onClick={handlePunchIn}
                disabled={hasPunchedIn || isPunchingIn}
                className="flex items-center bg-[#058CBF] text-lg text-white ml-5 px-6 py-2 rounded hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <LuAlarmClock className="mr-2" />
                {isPunchingIn ? 'Punching In...' : 'Punch In'}
                <TbDoorEnter className="ml-2" />
              </button>

              <button
                onClick={handlePunchOut}
                disabled={!hasPunchedIn || hasPunchedOut || isPunchingOut}
                className="flex items-center bg-[#058CBF] text-lg text-white px-6 py-2 rounded hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <LuAlarmClock className="mr-2" />
                {isPunchingOut ? 'Punching Out...' : 'Punch Out'}
                <TbDoorExit className="ml-2" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <strong className="w-40">Punch Out Time:</strong>
              <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md min-w-[80px]">
                {outTime || '--:--:--'}
              </div>
             
            </div>

            <div className="flex items-center gap-2">
              <strong className="w-40">Punch Out Location:</strong>
              <div className="bg-[#F4F5FD] p-2 rounded-md shadow-md text-sm min-w-[200px]">
                {outLocation || 'Not punched out yet'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-3xl text-red-600 text-center font-bold mb-4">Emergency Punch Out</h2>
            <p className="mb-2 text-xl">You’re punching out early. Please provide a reason:</p>
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
    </>
  );
}
