'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaRegBell, FaVideo, FaUser, FaSignOutAlt } from "react-icons/fa";
import { axiosInstance } from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const [userData, setUserData] = useState({ firstName: "", email: "" });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMeetingPopup, setShowMeetingPopup] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const notifications = [];

  const toggleMeetingPopup = () => {
    setShowMeetingPopup(!showMeetingPopup);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/profile/getProfile');
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast.error('Failed to fetch user data.');
      }
    };
    fetchData();
  }, []);


  const router = useRouter();
  return (
    <div className="bg-gradient-to-r from-[#018ABE] via-[#65B7D4] to-[#E0E2E3] px-6 py-3 flex items-center min-w-full relative">
      <h1 className="text-3xl font-bold text-white absolute left-10 whitespace-nowrap">
        Welcome {userData.firstName || 'Guest'}!
      </h1>

      <div className="ml-auto flex items-center gap-12 mr-10">
        <button title="Video Call" onClick={toggleMeetingPopup}>
          <FaVideo className="w-6 h-7 text-black cursor-pointer" />
        </button>

        {showMeetingPopup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50 backdrop-blur-[1px]"
            onClick={() => setShowMeetingPopup(false)} // ⬅ closes popup on outside click
          >
            <div
              className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-xl relative"
              onClick={(e) => e.stopPropagation()} // ⬅ prevents inner click from closing
            >

              <h2 className="text-2xl font-bold mb-6 border-b-2 border-black inline-block">
                SCHEDULE MEETING
              </h2>

              <form className="space-y-2">
                <input
                  type="text"
                  placeholder="Meeting Title"
                  required
                  className="w-full p-2 border border-black rounded placeholder-black"
                />
                <textarea
                  placeholder="Description"
                  required
                  className="w-full p-2 border border-black rounded placeholder-black"
                ></textarea>

                <select required className="w-full p-2 border border-black rounded">
                  <option value="">Select Team Members</option>
                  <option value="Member 1">Member 1</option>
                  <option value="Member 2">Member 2</option>
                  <option value="Member 3">Member 3</option>
                </select>

                <div className="flex gap-4">
                  <div className="relative w-1/2">
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full p-2 border border-black rounded bg-white text-black ${date ? "" : "text-transparent"}`}
                    />
                    {!date && (
                      <span className="absolute left-3 top-2 text-black pointer-events-none">
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
                      className={`w-full p-2 border border-black rounded bg-white ${time ? "text-black" : "text-transparent"}`}
                    />
                    {!time && (
                      <span className="absolute left-3 top-2 text-black pointer-events-none">
                        Meeting Time
                      </span>
                    )}
                  </div>
                </div>

                <select required className="w-full p-2 border border-black rounded">
                  <option value="">Select Duration</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                </select>
                <div className="flex items-center gap-2">
                  <label className="text-gray-800">Link</label>
                  <input
                    id="meetingLink"
                    type="url"
                    required
                    className="flex-1 p-2 border border-black rounded"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('meetingLink');
                      if (input && input.value) {
                        navigator.clipboard.writeText(input.value);
                      }
                    }}
                    className="text-sm text-blue-600 underline"
                  >
                    Copy Link
                  </button>
                </div>




                {/* Spacer for layout if needed */}
                <div className="h-16"></div>

                {/* Absolute Create button - outside flow */}
                <div className="relative">
                  <button
                    onClick={toggleMeetingPopup}
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-[#018ABE] rounded-xl text-2xl text-white px-8 py-2"
                  >
                    Create
                  </button>
                </div></form>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <FaRegBell
            className="cursor-pointer text-black w-10 h-6"
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

        {/* Profile Avatar and Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-black hover:border-gray-300 transition-all">
              <Image
                src="/profile.png"
                width={500}
                height={500}
                alt="Profile picture"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-black rounded-lg shadow-lg z-10">
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src="/profile.png"
                      width={500}
                      height={500}
                      alt="Profile picture"
                      style={{ objectFit: 'cover' }}
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

                <div className="border-t my-1"></div>

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
    </div>
  );
}
