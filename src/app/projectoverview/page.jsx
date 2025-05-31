"use client";
import React, { useState } from "react";
import MobileNavbar from "@/Component/Navbar/mobilenavbar";
import Sidebar from "@/Component/Usersidebar/usersidebar";
import MobileSidebar from "@/Component/Usersidebar/mobilesidebar";
import NavBar from "@/Component/Navbar/navbar";
import ProjectOverview from "@/Component/projectoverview/project";
import { Menu } from "lucide-react";

export default function Page() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen ">
      {/* ✅ Desktop Sidebar (Fixed Left) */}
      <div className="hidden md:flex fixed top-0 left-0 h-screen w-1/6  border-r border-gray-200 shadow-sm">
        <Sidebar />
      </div>

      {/* ✅ Desktop Navbar (Fixed Top Right) */}
      <div className="hidden md:flex fixed top-0 left-[16.6667%] w-5/6 h-16  z-40 border-b border-gray-200 shadow-sm">
        <NavBar />
      </div>

      {/* ✅ Desktop Content */}
      <div className="hidden md:block ml-[16.6667%] mt-16 p-6 h-[calc(100vh-64px)] ">
        <div className="max-w-5xl mx-auto">
          <ProjectOverview />
        </div>
      </div>

      {/* ✅ Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50   shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="absolute left-4 top-4 z-50 text-white"
          >
            <Menu size={28} />
          </button>
          <MobileNavbar />
        </div>
      </div>

      {/* ✅ Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ✅ Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
      />

      {/* ✅ Mobile Content */}
      <div className="md:hidden mt-16 p-6 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <ProjectOverview />
        </div>
      </div>
    </div>
  );
}
