'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaRegBell, FaVideo, FaUser, FaSignOutAlt, FaRegNewspaper, FaUserPlus, FaRegCalendarAlt } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { MdVideoCall, MdContentCopy } from "react-icons/md";
import { axiosInstance } from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import VideoCallPage from '../videocall';

export default function NavBar() {
  const [userData, setUserData] = useState({
    firstName: "",
    email: "",
    photoUrl: ""
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMeetingPopup, setShowMeetingPopup] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false); // New state for video call
  const [imageError, setImageError] = useState(false);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [meetingData, setMeetingData] = useState({
    host: "",
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "",
    participants: []
  });
  
  const notifications = [];
  const router = useRouter();

  // Fetch all user emails for participants
  const fetchUserEmails = async () => {
    try {
      const response = await axiosInstance.get('/tasks/getAllUserEmails');
      
      // Adjust this based on your actual API response structure
      const users = response.data.map((user, index) => ({
        id: user.email || `user_${index}`,
        name: user.name || user.fullName || user.email || `User ${index + 1}`,
        email: user.email
      }));
      
      setAvailableParticipants(users);
    } catch (error) {
      console.error("Failed to fetch user emails:", error);
      toast.error("Failed to load users");
      // Fallback to default participants if API fails
      setAvailableParticipants([
        { id: "member1", name: "Member 1", email: "member1@example.com" },
        { id: "member2", name: "Member 2", email: "member2@example.com" },
        { id: "member3", name: "Member 3", email: "member3@example.com" }
      ]);
    }
  };

  const toggleMeetingPopup = () => {
    setShowMeetingPopup(!showMeetingPopup);
    if (!showMeetingPopup) {
      // Reset form when opening
      setMeetingData({
        host: userData.firstName || "Host",
        title: "",
        description: "",
        date: "",
        time: "",
        duration: "",
        participants: []
      });
      setCreatedMeeting(null);
      // Fetch users when opening the popup
      fetchUserEmails();
    }
  };

  // New function to handle video call popup
  const toggleVideoCall = () => {
    setShowVideoCall(!showVideoCall);
  };

  const handleProfileAction = () => {
    setShowProfileMenu(false);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout');
      toast.success("Logged out successfully!");
      router.push('/');
    } catch (error) {
      console.log("Failed to log out:", error);
      toast.error('Failed to log out.');
    }
  }

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
    setMeetingData(prev => ({
      ...prev,
      participants: prev.participants.includes(participantId)
        ? prev.participants.filter(id => id !== participantId)
        : [...prev.participants, participantId]
    }));
  };

  // Create Zoom Meeting
  const createZoomMeeting = async (e) => {
    e.preventDefault();
    
    // Validate form data first
    if (!meetingData.title || !meetingData.description || !meetingData.date ||
      !meetingData.time || !meetingData.duration) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreatingMeeting(true);

    try {
      const payload = {
        host: meetingData.host || userData.firstName,
        title: meetingData.title,
        description: meetingData.description,
        date: meetingData.date,
        time: meetingData.time,
        duration: meetingData.duration,
        participants: meetingData.participants
      };

      console.log("Creating meeting with payload:", payload);

      const response = await axiosInstance.post('/meeting/create', payload);

      console.log("Meeting created successfully:", response.data);

      // Set the created meeting
      setCreatedMeeting(response.data.meeting);
      
      toast.success("Meeting created successfully!");

    } catch (error) {
      console.error("Failed to create meeting:", error);
      toast.error(error.response?.data?.message || "Failed to create meeting");
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const copyMeetingLink = async (meeting) => {
    try {
      await navigator.clipboard.writeText(meeting.meetingLink);
      toast.success("Meeting link copied!");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy link");
    }
  };

  const joinMeeting = (meeting) => {
    if (!meeting?.meetingLink) {
      toast.error("Invalid meeting link");
      return;
    }

    try {
      const url = new URL(meeting.meetingLink);
      window.open(url.toString(), '_blank');
    } catch (error) {
      console.error("Invalid meeting URL:", error);
      toast.error("Could not open meeting");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/profile/getProfile');
        setUserData(response.data);
        setImageError(false);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast.error('Failed to fetch user data.');
      }
    };
    fetchData();
  }, []);

  // Function to get the appropriate image source
  const getImageSource = () => {
    if (imageError || !userData.photoUrl) {
      return "/profile.png";
    }
    return userData.photoUrl;
  };

  return (
    <div className="bg-gradient-to-r from-[#018ABE] via-[#65B7D4] to-[#E0E2E3] px-6 py-3 flex items-center min-w-full relative">
      <h1 className="text-3xl font-bold text-white absolute left-10 whitespace-nowrap">
        Welcome {userData.firstName || 'Guest'}!
      </h1>

      <div className="ml-auto flex items-center gap-10 mr-10">
        {/* Video Icon with Dropdown */}
        <div className="relative">
          <button title="Video Call" onClick={toggleVideoCall}>
            <FaVideo className="w-6 h-7 text-black cursor-pointer hover:text-white transition-colors duration-200" />
          </button>
          
          {/* Video Call Dropdown Menu */}
          {showVideoCall && (
            <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg z-20">
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowVideoCall(false);
                    toggleMeetingPopup();
                  }}
                  className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
                >
                  <MdVideoCall className="text-gray-600" />
                  <span>Schedule Meeting</span>
                </button>
                <button
                  onClick={() => {
                    setShowVideoCall(false);
                    // Open VideoCallPage in a new window/modal
                    window.open('/videocall', '_blank', 'width=1200,height=800');
                  }}
                  className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
                >
                  <FaVideo className="text-gray-600" />
                  <span>Start Instant Call</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Team Members */}
        <button title="Add Team Members" onClick={() => router.push('/dashboard/viewteammembers')}>
          <FaUserPlus className="w-6 h-6 text-black cursor-pointer hover:text-white transition-colors duration-200" />
        </button>

        {/* Calendar */}
        <button title="Calendar" onClick={() => router.push('/calendar')}>
          <FaRegCalendarAlt className="w-6 h-6 text-black cursor-pointer hover:text-white transition-colors duration-200" />
        </button>

        {/* View Posts */}
        <button title="View Posts" onClick={() => router.push('/dashboard/posts')}>
          <FaRegNewspaper className="w-6 h-6 text-black cursor-pointer hover:text-white transition-colors duration-200" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <FaRegBell
            className="cursor-pointer text-black w-10 h-6 hover:text-white transition-colors duration-200"
            onClick={() => setShowNotifications((prev) => !prev)}
          />
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-lg z-20">
              <div
                className="p-4 font-semibold border-b cursor-pointer"
                onClick={() => router.push('/notification')}
              >
                Notifications
              </div>
              <div className="p-4 text-gray-600 text-sm max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div>No new notifications</div>
                ) : (
                  notifications.map((note, idx) => (
                    <div key={idx} className="mb-2">{note}</div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
              setShowVideoCall(false); // Close video call dropdown when opening profile
            }}
            className="focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 hover:border-gray-300 transition-all">
              <Image
                src={getImageSource()}
                width={500}
                height={500}
                alt="Profile picture"
                style={{ objectFit: 'cover' }}
                onError={handleImageError}
              />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10">
              <div className="p-4 ">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={getImageSource()}
                      width={500}
                      height={500}
                      alt="Profile picture"
                      style={{ objectFit: 'cover' }}
                      onError={handleImageError}
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{userData.firstName || 'Guest'}</div>
                    <div className="text-sm text-gray-500">{userData.email}</div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <Link href="/profile">
                  <div
                    onClick={() => handleProfileAction()}
                    className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <FaUser className="text-gray-600" />
                    <span>View Profile</span>
                  </div>
                </Link>

                <div className="my-1"></div>
                <Link href="/setting">
                  <div
                    onClick={() => handleProfileAction()}
                    className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <FiSettings className="text-gray-600" />
                    <span>Settings</span>
                  </div>
                </Link>

                <div className="my-1"></div>

                <Link href="/">
                  <div
                    onClick={() => handleLogout()}
                    className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 text-red-500 cursor-pointer"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Zoom Meeting Popup */}
      {showMeetingPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={toggleMeetingPopup}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl text-center w-[90%] sm:w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {!createdMeeting ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <MdVideoCall className="text-3xl text-[#018ABE]" />
                  <h2 className="text-2xl font-bold border-b-2 border-[#018ABE] inline-block">
                    CREATE ZOOM MEETING
                  </h2>
                </div>

                <div className="space-y-4 mt-4 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Host Name
                    </label>
                    <input
                      type="text"
                      value={meetingData.host}
                      onChange={(e) => handleInputChange('host', e.target.value)}
                      placeholder="Host Name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none focus:ring-2 focus:ring-[#018ABE]/20 transition-all duration-200"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none focus:ring-2 focus:ring-[#018ABE]/20 transition-all duration-200"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none focus:ring-2 focus:ring-[#018ABE]/20 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Participants
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
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
                              <span className="text-sm text-gray-700 font-medium">{participant.name}</span>
                              {participant.email && (
                                <span className="text-xs text-gray-500">{participant.email}</span>
                              )}
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-2">
                          Loading participants...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none focus:ring-2 focus:ring-[#018ABE]/20 transition-all duration-200"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none focus:ring-2 focus:ring-[#018ABE]/20 transition-all duration-200"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#018ABE] focus:outline-none focus:ring-2 focus:ring-[#018ABE]/20 transition-all duration-200"
                    >
                      <option value="">Select Duration</option>
                      <option value="15 minutes">15 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                      <option value="1 hour">1 hour</option>
                      <option value="1.5 hours">1.5 hours</option>
                      <option value="2 hours">2 hours</option>
                    </select>
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <button
                      type="button"
                      onClick={toggleMeetingPopup}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={createZoomMeeting}
                      disabled={isCreatingMeeting}
                      className="px-6 py-3 bg-[#018ABE] text-white rounded-lg hover:bg-[#016a96] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isCreatingMeeting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <MdVideoCall />
                          Create Meeting
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Meeting Success Screen
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <MdVideoCall className="text-2xl text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-600">
                    Meeting Created Successfully!
                  </h2>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left space-y-3">
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
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-blue-600 text-sm break-all flex-1">
                          {createdMeeting.meetingLink}
                        </p>
                        <button
                          onClick={() => copyMeetingLink(createdMeeting)}
                          className="p-2 bg-[#018ABE] text-white rounded hover:bg-[#016a96] transition-colors duration-200"
                          title="Copy Link"
                        >
                          <MdContentCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => copyMeetingLink(createdMeeting)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <MdContentCopy />
                    Copy Link
                  </button>
                  <button
                    onClick={() => joinMeeting(createdMeeting)}
                    className="px-6 py-3 bg-[#018ABE] text-white rounded-lg hover:bg-[#016a96] transition-colors duration-200 flex items-center gap-2"
                  >
                    <MdVideoCall />
                    Join Meeting
                  </button>
                  <button
                    onClick={toggleMeetingPopup}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}