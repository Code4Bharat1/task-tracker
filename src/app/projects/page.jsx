import React, { Suspense } from "react";
import NavBar from "@/Component/Navbar/navbar";
import AllProject from "@/Component/projectoverview/allproject";
import Sidebar from "@/Component/Usersidebar/usersidebar";

function Home() {
  return (
    <div className="min-h-screen md:flex bg-white">
      {/* Desktop Sidebar Section (visible on md+) */}
      <div className="md:w-1/6">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
        {/* Desktop Navbar (hidden on mobile) */}
        <NavBar />
        <div>
          <Suspense fallback={<div className="p-4 text-gray-500">Loading projects...</div>}>
            <AllProject />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Home;
