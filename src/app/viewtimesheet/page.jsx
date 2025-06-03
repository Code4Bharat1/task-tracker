"use client";
import React, { useState } from "react";
import NavBar from "@/Component/Navbar/navbar";
import MobileNavbar from "@/Component/Navbar/mobilenavbar";
import Sidebar from "@/Component/Usersidebar/usersidebar";
import MobileSidebar from "@/Component/Usersidebar/mobilesidebar";
import { Menu } from "lucide-react";
import RouteGuard from "@/Component/RouteGuard";
import ViewTeamTimesheet from "@/Component/Timesheet/ViewTeamTimesheet"; // ✅ Replace with actual path
// Make sure ViewTeamTimesheet exists

function Page() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop View */}
      <div className="hidden md:flex w-full">
        <div className="md:w-1/6">
          <Sidebar />
        </div>
        <div className="w-full md:w-5/6">
          <NavBar />
          <RouteGuard featurekey="viewtimesheet">
            <ViewTeamTimesheet />
          </RouteGuard>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden relative">
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="absolute left-4 top-4 z-50 text-white"
          >
            <Menu size={28} />
          </button>
          <MobileNavbar />
        </div>

        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-35"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
        />

        <div className="p-4">
          <RouteGuard featurekey="viewtimesheet">
            <ViewTeamTimesheet />
          </RouteGuard>
        </div>
      </div>
    </div>
  );
}

export default Page;
