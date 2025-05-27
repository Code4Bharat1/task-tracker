// Assuming this is in /pages/attendance/page.jsx or similar (for Next.js App Router)

import React from "react";

import NavBar from "@/Component/Navbar/navbar";
import Sidebar from "@/Component/Usersidebar/usersidebar";

import Companypolicy from "@/Component/Companypolicy/companypolicy";
import CompanypolicyMobile from "@/Component/Companypolicy/mobilecompanypolicy";

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
          <Companypolicy/>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <CompanypolicyMobile/>
      </div>
    </div>
  );
}

export default Page;
