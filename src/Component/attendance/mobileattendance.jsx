"use client";
import { useEffect, useState, useRef } from "react";
import { TbDoorExit, TbDoorEnter } from "react-icons/tb";
import { LuAlarmClock } from "react-icons/lu";
import { useRouter } from "next/navigation";
export default function MobileAttendancePage() {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [inTime, setInTime] = useState("");
  const [inLocation, setInLocation] = useState("");
  const [outTime, setOutTime] = useState("");
  const [outLocation, setOutLocation] = useState("");
  const [hasPunchedIn, setHasPunchedIn] = useState(false);
  const [hasPunchedOut, setHasPunchedOut] = useState(false);
  const [isPunchingIn, setIsPunchingIn] = useState(false);
  const [isPunchingOut, setIsPunchingOut] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [pendingPunchOutData, setPendingPunchOutData] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const fetchLocation = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      return data.display_name || "Unknown Location";
    } catch {
      return "Failed to fetch location";
    }
  };

  const handlePunchIn = async () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setIsPunchingIn(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const location = await fetchLocation(latitude, longitude);
      const now = new Date();

      setInTime(formatTime(now));
      setInLocation(location);
      setHasPunchedIn(true);
      setIsPunchingIn(false);

      // Simulate API call
      console.log("Punch in data:", {
        punchInTime: now.toISOString(),
        punchInLocation: location,
      });
    });
  };

  const handlePunchOut = async () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setIsPunchingOut(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const location = await fetchLocation(latitude, longitude);
      const now = new Date();

      // Simulate early punch out check (less than 4.5 minutes for demo)
      const elapsed = Math.random() * 300; // Random time for demo

      if (elapsed < 270) {
        setPendingPunchOutData({
          punchOutTime: now.toISOString(),
          punchOutLocation: location,
        });
        setShowModal(true);
        setIsPunchingOut(false);
        return;
      }

      setOutTime(formatTime(now));
      setOutLocation(location);
      setHasPunchedOut(true);
      setIsPunchingOut(false);

      console.log("Punch out data:", {
        punchOutTime: now.toISOString(),
        punchOutLocation: location,
      });
    });
  };

  const confirmEmergencyPunchOut = async () => {
    const trimmedReason = emergencyReason.trim();
    if (trimmedReason.length < 1) {
      alert("Please provide the reason.");
      return;
    }

    setIsPunchingOut(true);

    const time = new Date(pendingPunchOutData.punchOutTime);
    setOutTime(formatTime(time));
    setOutLocation(pendingPunchOutData.punchOutLocation);
    setHasPunchedOut(true);

    console.log("Emergency punch out:", {
      ...pendingPunchOutData,
      emergencyReason: trimmedReason,
    });

    setIsPunchingOut(false);
    setShowModal(false);
    setEmergencyReason("");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ATTENDANCE
            </h1>
            <div className="h-1 w-20 bg-[#058CBF] mx-auto rounded-full mb-4"></div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-700">
                {currentDate}
              </p>
              <p className="text-3xl font-bold text-[#058CBF]">{currentTime}</p>
            </div>
          </div>

          <button
            className="bg-[#058CBF] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#69b0c9] transition-all duration-200 font-semibold"
            onClick={() => router.push("/attendance/punchhistory")}
          >
            Punch History
          </button>
        </div>

        {/* Profile Avatar */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#058CBF] to-[#69b0c9] rounded-full flex items-center justify-center shadow-lg">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-[#058CBF]">👤</span>
            </div>
          </div>
        </div>

        {/* Punch Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handlePunchIn}
            disabled={hasPunchedIn || isPunchingIn}
            className="w-full flex items-center justify-center bg-gradient-to-r from-[#058CBF] to-[#69b0c9] text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-lg font-semibold"
          >
            <TbDoorEnter className="mr-3 text-xl" />
            <LuAlarmClock className="mr-3 text-xl" />
            {isPunchingIn ? "Punching In..." : "Punch In"}
          </button>

          <button
            onClick={handlePunchOut}
            disabled={!hasPunchedIn || hasPunchedOut || isPunchingOut}
            className="w-full flex items-center justify-center bg-gradient-to-r from-[#058CBF] to-[#69b0c9] text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-lg font-semibold"
          >
            <TbDoorExit className="mr-3 text-xl" />
            <LuAlarmClock className="mr-3 text-xl" />
            {isPunchingOut ? "Punching Out..." : "Punch Out"}
          </button>
        </div>

        {/* Attendance Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
            Today's Record
          </h3>

          {/* Punch In Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-[#F4F5FD] rounded-xl">
              <span className="font-semibold text-gray-700">Punch In Time</span>
              <span className="text-[#058CBF] font-bold text-lg">
                {inTime || "--:--:--"}
              </span>
            </div>

            <div className="p-4 bg-[#F4F5FD] rounded-xl">
              <div className="font-semibold text-gray-700 mb-2">
                Punch In Location
              </div>
              <div className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                {inLocation || "Not punched in yet"}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="px-4 text-gray-500 text-sm">•••</div>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Punch Out Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-[#F4F5FD] rounded-xl">
              <span className="font-semibold text-gray-700">
                Punch Out Time
              </span>
              <span className="text-[#058CBF] font-bold text-lg">
                {outTime || "--:--:--"}
              </span>
            </div>

            <div className="p-4 bg-[#F4F5FD] rounded-xl">
              <div className="font-semibold text-gray-700 mb-2">
                Punch Out Location
              </div>
              <div className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                {outLocation || "Not punched out yet"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Emergency Punch Out
              </h2>
              <p className="text-gray-600">
                You're punching out early. Please provide a reason:
              </p>
            </div>

            <textarea
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl mb-6 resize-none focus:border-[#058CBF] focus:outline-none"
              rows={4}
              placeholder="Enter your reason here..."
            />

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEmergencyReason("");
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEmergencyPunchOut}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
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
