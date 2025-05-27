// Assuming this is in /pages/attendance/page.jsx or similar (for Next.js App Router)

import React from "react";

import NavBar from "@/Component/Navbar/navbar";
import Sidebar from "@/Component/Usersidebar/usersidebar";
import MobileTimeline from "@/Component/Timesheet/mobiletimesheet";
import Timeline from "@/Component/Timesheet/timesheet";

function Page() {
  return (
    <div className="min-h-screen md:flex bg-white">
      {/* Desktop View */}
      <div className="hidden md:flex w-full">
        {/* Sidebar */}
        <div className="md:w-1/6">
          <Sidebar />
        </div>
        {/* Main Content */}
        <div className="w-full md:w-5/6">
          <NavBar />
          <Timeline/>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileTimeline />
      </div>
    </div>
  );
}

export default Page;
