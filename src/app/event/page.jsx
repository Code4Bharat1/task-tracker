'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HREvents from '@/Component/events/HREvents';
import UserEvents from '@/Component/events/UserEvents';
import NavBar from '@/Component/Navbar/navbar';
import MobileNavbar from '@/Component/Navbar/mobilenavbar';
import Sidebar from '@/Component/Usersidebar/usersidebar';
import MobileSidebar from '@/Component/Usersidebar/mobilesidebar';
import { Menu } from 'lucide-react';

const Page = () => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/profile/getProfile`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        setPosition(res.data.position);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  const EventComponent = position === 'HR' ? HREvents : UserEvents;

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop View */}
      <div className="hidden md:flex w-full">
        {/* Sidebar */}
        <div className="md:w-1/6">
          <Sidebar />
        </div>
        {/* Main Content */}
        <div className="w-full md:w-5/6">
          <NavBar />
          <EventComponent />
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden relative">
        <div className="flex items-center">
          {/* Menu button for sidebar */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="absolute left-4 top-4 z-50 text-white"
          >
            <Menu size={28} />
          </button>
          <MobileNavbar />
        </div>

        {/* Overlay for sidebar */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-35"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
        />

        {/* Mobile Event Page */}
        <div className="p-4">
          <EventComponent />
        </div>
      </div>
    </div>
  );
};

export default Page;
