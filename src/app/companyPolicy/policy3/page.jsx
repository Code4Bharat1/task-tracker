import MobilePolicy3 from "@/Component/Companypolicy/mobilepolicy3";
import Policy3 from "@/Component/Companypolicy/policy3";
import NavBar from "@/Component/Navbar/navbar";
import Sidebar from "@/Component/Usersidebar/usersidebar";


import React from "react";

function page() {
    return (
        <div className="min-h-screen md:flex bg-white">
<div className="hidden md:block">
            {/* Desktop Sidebar Section (visible on md+) */}
            <div className="md:w-1/6 ">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
                {/* Desktop Navbar (hidden on mobile) */}
                <NavBar />
                
        <Policy3/>
      </div>
  </div>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobilePolicy3/>
      </div>

          

        </div>
    );
}

export default page;
