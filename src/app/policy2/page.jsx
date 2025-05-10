

import Policy2 from '@/Component/Companypolicy/policy2';
import NavBar from '@/Component/Navbar/navbar';


import Sidebar from '@/Component/Usersidebar/usersidebar';

import React from 'react'

export default function Home() {
  return (
    <div className="h-screen overflow-hidden"> {/* Prevent page scroll */}
      {/* Sidebar - Fixed */}
      <div className="w-1/6 fixed top-0 bottom-0 left-0 bg-gray-100">
       <Sidebar/>
      </div>

      {/* Navbar - Fixed */}
      <div className="fixed top-0 right-0 w-5/6 ml-[16.6667%] z-10">
     <NavBar/>
      </div>

      {/* Scrollable Content below Navbar */}
<Policy2/>
      </div>
 
  );
}
