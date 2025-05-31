"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, Video, UserPlus, User, Settings, LogOut } from "lucide-react";
import { MdVideoCall, MdContentCopy } from "react-icons/md";
import { axiosInstance } from "@/lib/axiosInstance";
import toast from "react-hot-toast";

const MobileNavbar = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    firstName: "",
    email: "",
    photoUrl: "",
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMeetingPopup, setShowMeetingPopup] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [availableParticipants, setAvailableParticipants] = useState([]);
  
  const [meetingData, setMeetingData] = useState({
    title: "",
    description: "",
    host: "",
    date: "",
    time: "",
    duration: "",
    participants: []
  });

  const notifications = [];

  const toggleMeetingPopup = () => {
    setShowMeetingPopup(!showMeetingPopup);
    if (!showMeetingPopup) {
      setCreatedMeeting(null);
      // Reset form when opening
      setMeetingData({
        title: "",
        description: "",
        host: userData.firstName || "",
        date: "",
        time: "",
        duration: "",
        participants: []
      });
    }
  };

  const handleProfileAction = () => {
    setShowProfileMenu(false);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      console.log("Failed to log out:", error);
      toast.error("Failed to log out.");
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleInputChange = (field, value) => {
    setMeetingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParticipantToggle = (participantId) => {
    setMeetingData(prev => {
      const newParticipants = prev.participants.includes(participantId)
        ? prev.participants.filter(id => id !== participantId)
        : [...prev.participants, participantId];
      return {
        ...prev,
        participants: newParticipants
      };
    });
  };

  const createZoomMeeting = async () => {
    if (!meetingData.title || !meetingData.description || !meetingData.date || !meetingData.time || !meetingData.duration) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsCreatingMeeting(true);
    try {
      // Simulate API call - replace with your actual API call
      const response = await axiosInstance.post("/meetings/create", meetingData);
      setCreatedMeeting({
        ...response.data,
        date: meetingData.date,
        time: meetingData.time
      });
      toast.success("Meeting created successfully!");
    } catch (error) {
      console.error("Failed to create meeting:", error);
      toast.error("Failed to create meeting");
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const copyMeetingLink = (meeting) => {
    if (meeting?.meetingLink) {
      navigator.clipboard.writeText(meeting.meetingLink);
      toast.success("Meeting link copied to clipboard!");
    } else {
      toast.error("No meeting link available");
    }
  };

  const joinMeeting = (meeting) => {
    if (meeting?.meetingLink) {
      window.open(meeting.meetingLink, "_blank");
    } else {
      toast.error("No meeting link available");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/profile/getProfile");
        setUserData(response.data);
        setImageError(false);
        
        // Set default host name
        setMeetingData(prev => ({
          ...prev,
          host: response.data.firstName || ""
        }));
        
        // Fetch participants - replace with your actual API call
        const participantsResponse = await axiosInstance.get("/team/members");
        setAvailableParticipants(participantsResponse.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to fetch user data.");
      }
    };
    fetchData();
  }, []);

  const getImageSource = () => {
    if (imageError || !userData.photoUrl) {
      return "/profile.png";
    }
    return userData.photoUrl;
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <>
      <nav className="w-full bg-gradient-to-r from-[#018ABE] to-[#65B7D4] text-white shadow-md sticky top-0 z-40">
        <div className="flex items-center justify-end px-4 py-3">
          {/* Icons Section */}
          <div className="flex items-center space-x-4">
            {/* Video Call */}
            <button
              onClick={toggleMeetingPopup}
              title="Video Call"
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            >
              <Video size={20} className="hover:text-gray-200" />
            </button>

            {/* Add Team Members */}
            <button
              onClick={() => handleNavigation("/dashboard/addteammembers")}
              title="Add Team Members"
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            >
              <UserPlus size={20} className="hover:text-gray-200" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              >
                <Bell size={20} className="hover:text-gray-200" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-50">
                  <div
                    className="p-3 font-semibold border-b cursor-pointer text-black"
                    onClick={() => router.push("/notification")}
                  >
                    Notifications
                  </div>
                  <div className="p-3 text-gray-600 text-sm max-h-48 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div>No new notifications</div>
                    ) : (
                      notifications.map((note, idx) => (
                        <div key={idx} className="mb-2">
                          {note}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Image */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="focus:outline-none w-8 h-8 flex items-center justify-center"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white hover:border-gray-300 transition-all">
                  <Image
                    src={getImageSource()}
                    width={32}
                    height={32}
                    alt="Profile"
                    className="object-cover w-full h-full"
                    onError={handleImageError}
                  />
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50">
                  <div className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={getImageSource()}
                          width={40}
                          height={40}
                          alt="Profile picture"
                          className="object-cover w-full h-full"
                          onError={handleImageError}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-black text-sm">
                          {userData.firstName || "Guest"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {userData.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleProfileAction();
                        router.push("/profile");
                      }}
                      className="w-full px-3 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 text-black text-sm"
                    >
                      <User size={16} className="text-gray-600" />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        handleProfileAction();
                        router.push("/setting");
                      }}
                      className="w-full px-3 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 text-black text-sm"
                    >
                      <Settings size={16} className="text-gray-600" />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => handleLogout()}
                      className="w-full px-3 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 text-red-500 text-sm"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Zoom Meeting Popup - Mobile Optimized */}
      {showMeetingPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2"
          onClick={toggleMeetingPopup}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {!createdMeeting ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <MdVideoCall className="text-2xl text-[#018ABE]" />
                  <h2 className="text-xl font-bold border-b-2 border-[#018ABE] inline-block">
                    CREATE MEETING
                  </h2>
                </div>

                <div className="space-y-3 mt-3 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Host Name
                    </label>
                    <input
                      type="text"
                      value={meetingData.host}
                      onChange={(e) => handleInputChange('host', e.target.value)}
                      placeholder="Host Name"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      value={meetingData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter meeting title"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={meetingData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter meeting description"
                      required
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Participants
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2 text-sm">
                      {availableParticipants.length > 0 ? (
                        availableParticipants.map((participant) => (
                          <label key={participant.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={meetingData.participants.includes(participant.id)}
                              onChange={() => handleParticipantToggle(participant.id)}
                              className="rounded border-gray-300 text-[#018ABE] focus:ring-[#018ABE]"
                            />
                            <div className="flex flex-col">
                              <span className="text-gray-700">{participant.name}</span>
                              {participant.email && (
                                <span className="text-xs text-gray-500">{participant.email}</span>
                              )}
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-2">
                          Loading participants...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={meetingData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time *
                      </label>
                      <input
                        type="time"
                        value={meetingData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration *
                    </label>
                    <select
                      value={meetingData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none"
                    >
                      <option value="">Select Duration</option>
                      <option value="15 minutes">15 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                      <option value="1 hour">1 hour</option>
                      <option value="1.5 hours">1.5 hours</option>
                      <option value="2 hours">2 hours</option>
                    </select>
                  </div>

                  <div className="flex justify-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={toggleMeetingPopup}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={createZoomMeeting}
                      disabled={isCreatingMeeting}
                      className="px-4 py-2 bg-[#018ABE] text-white rounded-lg hover:bg-[#016a96] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                    >
                      {isCreatingMeeting ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <MdVideoCall size={16} />
                          Create
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Meeting Success Screen
              <div className="text-center">
                <div className="flex flex-col items-center justify-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MdVideoCall className="text-xl text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-green-600">
                    Meeting Created!
                  </h2>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Title:</span>
                    <p className="text-gray-600">{createdMeeting.title}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Meeting ID:</span>
                    <p className="text-gray-600 font-mono">{createdMeeting.zoomMeetingId}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Password:</span>
                    <p className="text-gray-600 font-mono">
                      {(() => {
                        try {
                          if (createdMeeting?.meetingLink) {
                            const urlParams = new URLSearchParams(new URL(createdMeeting.meetingLink).search);
                            return urlParams.get('pwd') || 'No password required';
                          }
                          return 'Not available';
                        } catch (error) {
                          console.error("Error extracting password:", error);
                          return 'Error extracting password';
                        }
                      })()}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date & Time:</span>
                    <p className="text-gray-600">{createdMeeting.date} at {createdMeeting.time}</p>
                  </div>
                  {createdMeeting.meetingLink && (
                    <div>
                      <span className="font-semibold text-gray-700">Meeting Link:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-blue-600 text-xs break-all flex-1">
                          {createdMeeting.meetingLink}
                        </p>
                        <button
                          onClick={() => copyMeetingLink(createdMeeting)}
                          className="p-1 bg-[#018ABE] text-white rounded hover:bg-[#016a96]"
                          title="Copy Link"
                        >
                          <MdContentCopy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-2">
                  <button
                    onClick={() => copyMeetingLink(createdMeeting)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center justify-center gap-1"
                  >
                    <MdContentCopy size={14} />
                    Copy Link
                  </button>
                  <button
                    onClick={() => joinMeeting(createdMeeting)}
                    className="px-4 py-2 bg-[#018ABE] text-white rounded-lg hover:bg-[#016a96] text-sm flex items-center justify-center gap-1"
                  >
                    <MdVideoCall size={14} />
                    Join Meeting
                  </button>
                  <button
                    onClick={toggleMeetingPopup}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavbar;