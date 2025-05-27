
import MobilePolicy5 from "@/Component/Companypolicy/mobilepolicy5";
import MobilePolicy6 from "@/Component/Companypolicy/mobilepolicy6";

import Policy5 from "@/Component/Companypolicy/policy5";
import Policy6 from "@/Component/Companypolicy/policy6";
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
                
        <Policy6/>
      </div>
  </div>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobilePolicy6/>
      </div>

          

        </div>
    );
}

export default page;
