
import MobilePolicy1 from "@/Component/Companypolicy/mobilepolicy1";
import Policy1 from "@/Component/Companypolicy/policy1";
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
                
        <Policy1/>
      </div>
  </div>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobilePolicy1/>
      </div>

          

        </div>
    );
}

export default page;
