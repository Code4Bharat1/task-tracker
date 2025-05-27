"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, Video, UserPlus, User, Settings, LogOut } from "lucide-react";
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
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [imageError, setImageError] = useState(false);
  const notifications = [];

  const toggleMeetingPopup = () => {
    setShowMeetingPopup(!showMeetingPopup);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/profile/getProfile");
        setUserData(response.data);
        setImageError(false);
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
              <Video size={24} className="hover:text-gray-200" />
            </button>

            {/* Add Team Members */}
            <button
              onClick={() => handleNavigation("/dashboard/addteammembers")}
              title="Add Team Members"
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            >
              <UserPlus size={24} className="hover:text-gray-200" />
            </button>

            {/* Calendar */}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              >
                <Bell size={24} className="hover:text-gray-200" />
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

      {/* Meeting Popup */}
      {showMeetingPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50 backdrop-blur-[1px] px-4"
          onClick={() => setShowMeetingPopup(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-md text-center w-full max-w-md relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 border-b-2 border-black inline-block">
              SCHEDULE MEETING
            </h2>
            <form className="space-y-3">
              <input
                type="text"
                placeholder="Meeting Title"
                required
                className="w-full p-2 border border-black rounded placeholder-black text-sm"
              />
              <textarea
                placeholder="Description"
                required
                className="w-full p-2 border border-black rounded placeholder-black text-sm h-20"
              ></textarea>
              <select
                required
                className="w-full p-2 border border-black rounded text-sm"
              >
                <option value="">Select Team Members</option>
                <option value="Member 1">Member 1</option>
                <option value="Member 2">Member 2</option>
                <option value="Member 3">Member 3</option>
              </select>
              <div className="flex gap-2">
                <div className="relative w-1/2">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full p-2 border border-black rounded bg-white text-black text-sm ${
                      date ? "" : "text-transparent"
                    }`}
                  />
                  {!date && (
                    <span className="absolute left-2 top-2 text-black pointer-events-none text-sm">
                      Meeting Date
                    </span>
                  )}
                </div>
                <div className="relative w-1/2">
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`w-full p-2 border border-black rounded bg-white text-sm ${
                      time ? "text-black" : "text-transparent"
                    }`}
                  />
                  {!time && (
                    <span className="absolute left-2 top-2 text-black pointer-events-none text-sm">
                      Meeting Time
                    </span>
                  )}
                </div>
              </div>
              <select
                required
                className="w-full p-2 border border-black rounded text-sm"
              >
                <option value="">Select Duration</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
              </select>
              <div className="flex items-center gap-2">
                <label className="text-gray-800 text-sm">Link</label>
                <input
                  id="meetingLink"
                  type="url"
                  required
                  className="flex-1 p-2 border border-black rounded text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("meetingLink");
                    if (input && input.value) {
                      navigator.clipboard.writeText(input.value);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                  className="text-xs text-blue-600 underline"
                >
                  Copy Link
                </button>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={toggleMeetingPopup}
                  className="bg-[#018ABE] rounded-xl text-lg text-white px-6 py-2 w-full"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavbar;
