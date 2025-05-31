"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TbDoorExit, TbDoorEnter, TbCamera, TbX } from "react-icons/tb";
import { LuAlarmClock } from "react-icons/lu";
import { axiosInstance } from "@/lib/axiosInstance";
import toast from "react-hot-toast";

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

  // Camera related states
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [punchOutPhoto, setPunchOutPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoModalType, setPhotoModalType] = useState(""); // 'punchIn' or 'punchOut'
  const [cameraMode, setCameraMode] = useState(""); // 'punchIn' or 'punchOut'
  const [locationError, setLocationError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const router = useRouter();

  // Check today's attendance on component mount
  useEffect(() => {
    const checkTodayAttendance = async () => {
      try {
        const res = await axiosInstance.get("/attendance/today");
        const data = res.data;
        if (data.punchedIn) {
          const punchInDate = new Date(data.punchInTime);
          setHasPunchedIn(true);
          setInTime(formatTime(punchInDate));
          setInLocation(data.punchInLocation || "Unknown");
          // Set captured photo if available
          if (data.punchInPhoto) {
            setCapturedPhoto(data.punchInPhoto);
          }
        }
        if (data.punchedOut) {
          setHasPunchedOut(true);
          const punchOutDate = new Date(data.punchOutTime);
          setOutTime(formatTime(punchOutDate));
          setOutLocation(data.punchOutLocation || "Unknown");
          // Set punch out photo if available
          if (data.punchOutPhoto) {
            setPunchOutPhoto(data.punchOutPhoto);
          }
        }
      } catch (error) {
        console.error("Failed to fetch today's attendance:", error);
      }
    };
    checkTodayAttendance();
  }, []);

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

  // Use the same location fetching logic as desktop version
  const fetchLocation = async (lat, lon) => {
    if (!navigator.onLine) {
      toast.error("No internet connection. Unable to fetch location.");
      return "Offline - Unable to fetch location";
    }

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return "Unknown Location";
    } catch (error) {
      console.error("Location fetch failed:", error);
      return "Failed to fetch location";
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      setLocationError("");

      if (!navigator.geolocation) {
        const error = "Geolocation is not supported by this browser";
        setLocationError(error);
        reject(new Error(error));
        return;
      }

      console.log("Requesting location...");

      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 60000, // 1 minute
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Location obtained:", position.coords);
          const { latitude, longitude, accuracy } = position.coords;

          console.log(`Accuracy: ${accuracy} meters`);

          try {
            const locationName = await fetchLocation(latitude, longitude);
            resolve({
              latitude,
              longitude,
              accuracy,
              locationName,
            });
          } catch (error) {
            console.error("Error fetching location name:", error);
            resolve({
              latitude,
              longitude,
              accuracy,
              locationName: `Lat: ${latitude.toFixed(
                6
              )}, Lon: ${longitude.toFixed(6)}`,
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            default:
              errorMessage =
                "An unknown error occurred while fetching location";
              break;
          }

          setLocationError(errorMessage);
          reject(error);
        },
        options
      );
    });
  };

  const startCamera = async (mode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;
      setCameraMode(mode);
      setShowCamera(true);

      // Wait a bit for the modal to render before setting video source
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (error) {
      toast.error("Camera access required for attendance!");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL("image/jpeg", 0.8);

      if (cameraMode === "punchIn") {
        setCapturedPhoto(photoData);
        stopCamera();
        proceedWithPunchIn(photoData);
      } else if (cameraMode === "punchOut") {
        setPunchOutPhoto(photoData);
        stopCamera();
        proceedWithPunchOut(photoData);
      }
    }
  };

  const proceedWithPunchIn = async (photoData) => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setIsPunchingIn(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
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
            selfieImage: photoData,
            userLocation: {
              latitude,
              longitude,
            },
          });
          toast.success("Punched in successfully!");
        } catch (error) {
          console.error("Failed to punch in:", error);
          toast.error(error.response?.data?.message || "Punch in failed.");
        } finally {
          setIsPunchingIn(false);
        }
      },
      (error) => {
        console.error("Error during punch in:", error);
        toast.error(
          "Failed to get location. Please enable location services and try again."
        );
        setIsPunchingIn(false);
      }
    );
  };

  const proceedWithPunchOut = async (photoData) => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setIsPunchingOut(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const location = await fetchLocation(latitude, longitude);
        const now = new Date();

        // Check if punching out early (less than 4.5 minutes for emergency)
        const punchInDate = new Date(); // This should be the actual punch in time from your data
        const elapsed = (now - punchInDate) / 1000;

        if (elapsed < 270) {
          // Less than 4.5 minutes
          setPendingPunchOutData({
            punchOutTime: now.toISOString(),
            punchOutLocation: location,
            selfieImage: photoData,
            userLocation: {
              latitude,
              longitude,
            },
          });
          setShowModal(true);
          setIsPunchingOut(false);
          return;
        }

        try {
          await axiosInstance.post("/attendance/punch-out", {
            punchOutTime: now.toISOString(),
            punchOutLocation: location,
            selfieImage: photoData,
            userLocation: {
              latitude,
              longitude,
            },
          });

          setOutTime(formatTime(now));
          setOutLocation(location);
          setHasPunchedOut(true);
          toast.success("Punched out successfully!");
        } catch (error) {
          console.error("Punch out failed:", error);
          toast.error("Punch out failed.");
        } finally {
          setIsPunchingOut(false);
        }
      },
      (error) => {
        console.error("Error during punch out:", error);
        toast.error(
          "Failed to get location. Please enable location services and try again."
        );
        setIsPunchingOut(false);
      }
    );
  };

  const handlePunchIn = async () => {
    if (hasPunchedIn || isPunchingIn) return;
    await startCamera("punchIn");
  };

  const handlePunchOut = async () => {
    if (!hasPunchedIn || hasPunchedOut || isPunchingOut) return;
    await startCamera("punchOut");
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
      toast.success("Emergency punch out recorded!");
    } catch (error) {
      console.error("Punch out failed:", error);
      toast.error("Punch out failed.");
    } finally {
      setIsPunchingOut(false);
      setShowModal(false);
      setEmergencyReason("");
    }
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
            <div className="h-1 w-20 bg-[#018ABE] mx-auto rounded-full mb-4"></div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-700">
                {currentDate}
              </p>
              <p className="text-3xl font-bold text-[#018ABE]">{currentTime}</p>
            </div>
          </div>

          <button
            className="bg-[#018ABE] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#548598] transition-all duration-200 font-semibold"
            onClick={() => router.push("/attendance/punchhistory")}
          >
            Punch History
          </button>
        </div>

        {/* Location Error Display */}
        {locationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
            <p className="text-sm font-semibold">Location Error:</p>
            <p className="text-sm">{locationError}</p>
            <p className="text-xs mt-1">
              Please enable location services in your browser settings.
            </p>
          </div>
        )}

        {/* Profile Avatar */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#018ABE] to-blue-400 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-[#018ABE]">👤</span>
            </div>
          </div>
        </div>

        {/* Punch Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handlePunchIn}
            disabled={hasPunchedIn || isPunchingIn}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-400 text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-lg font-semibold"
          >
            <TbDoorEnter className="mr-3 text-xl" />
            <LuAlarmClock className="mr-3 text-xl" />
            {isPunchingIn ? "Punching In..." : "Punch In"}
          </button>

          <button
            onClick={handlePunchOut}
            disabled={!hasPunchedIn || hasPunchedOut || isPunchingOut}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-400 text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-lg font-semibold"
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

          {/* Photo Gallery */}
          {(capturedPhoto || punchOutPhoto) && (
            <div className="mb-6">
              <div className="flex justify-center space-x-4">
                {capturedPhoto && (
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-blue-600"
                      onClick={() => {
                        setSelectedPhoto(capturedPhoto);
                        setPhotoModalType("punchIn");
                        setShowPhotoModal(true);
                      }}
                    >
                      <img
                        src={capturedPhoto}
                        alt="Punch In"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      Punch In
                    </p>
                  </div>
                )}

                {punchOutPhoto && (
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-red-500"
                      onClick={() => {
                        setSelectedPhoto(punchOutPhoto);
                        setPhotoModalType("punchOut");
                        setShowPhotoModal(true);
                      }}
                    >
                      <img
                        src={punchOutPhoto}
                        alt="Punch Out"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      Punch Out
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Punch In Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <span className="font-semibold text-gray-700">Punch In Time</span>
              <span className="text-[#018ABE] font-bold text-lg">
                {inTime || "--:--:--"}
              </span>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
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
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <span className="font-semibold text-gray-700">
                Punch Out Time
              </span>
              <span className="text-[#018ABE] font-bold text-lg">
                {outTime || "--:--:--"}
              </span>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
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

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {cameraMode === "punchIn"
                  ? "Take Photo for Punch In"
                  : "Take Photo for Punch Out"}
              </h2>
              <p className="text-gray-600">
                Position yourself in the frame and click capture
              </p>
            </div>

            <div className="relative mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-xl bg-gray-200"
              />
              <div className="absolute inset-0 border-4 border-[#018ABE] rounded-xl pointer-events-none"></div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={stopCamera}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                <TbX className="mr-2" />
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="flex-1 bg-[#018ABE] text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <TbCamera className="mr-2" />
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo View Modal */}
      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {photoModalType === "punchIn"
                  ? "🚪 Punch In Photo"
                  : "🚪 Punch Out Photo"}
              </h2>
              <p className="text-sm text-gray-600">
                {photoModalType === "punchIn"
                  ? "Photo taken during punch in"
                  : "Photo taken during punch out"}
              </p>
            </div>

            <div className="mb-6">
              <img
                src={selectedPhoto}
                alt="Attendance Photo"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
            </div>

            <div className="flex space-x-3">
              {/* Navigation buttons if both photos exist */}
              {capturedPhoto && punchOutPhoto && (
                <>
                  <button
                    onClick={() => {
                      if (photoModalType === "punchIn" && punchOutPhoto) {
                        setSelectedPhoto(punchOutPhoto);
                        setPhotoModalType("punchOut");
                      } else if (
                        photoModalType === "punchOut" &&
                        capturedPhoto
                      ) {
                        setSelectedPhoto(capturedPhoto);
                        setPhotoModalType("punchIn");
                      }
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    {photoModalType === "punchIn"
                      ? "View Punch Out"
                      : "View Punch In"}
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  setSelectedPhoto(null);
                  setPhotoModalType("");
                }}
                className={`${
                  capturedPhoto && punchOutPhoto ? "flex-1" : "w-full"
                } bg-[#018ABE] text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
              className="w-full p-4 border-2 border-gray-200 rounded-xl mb-6 resize-none focus:border-[#018ABE] focus:outline-none"
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

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}
