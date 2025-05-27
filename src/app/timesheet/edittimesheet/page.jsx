// Assuming this is in /pages/attendance/page.jsx or similar (for Next.js App Router)

import React from "react";


import NavBar from "@/Component/Navbar/navbar";
import Sidebar from "@/Component/Usersidebar/usersidebar";
import MobileEditTimeSheet from "@/Component/Timesheet/mobileedittimesheet";
import EditTimeSheet from "@/Component/Timesheet/edittimesheet";

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
          <EditTimeSheet />
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileEditTimeSheet />
      </div>
    </div>
  );
}

export default Page;
