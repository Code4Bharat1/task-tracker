"use client";
import React, { useState } from "react";
import NavBar from "@/Component/Navbar/navbar";
import MobileNavbar from "@/Component/Navbar/mobilenavbar"; // Import your MobileNavbar
import Sidebar from "@/Component/Usersidebar/usersidebar";
import MobileSidebar from "@/Component/Usersidebar/mobilesidebar";
import { Menu } from "lucide-react";
import RockPaperScissorsGame from "@/Component/games/titStrike";

function Page() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            {/* Desktop View */}
            <div className="hidden md:flex w-full">
                {/* Sidebar */}
                <div className="md:w-1/6">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="w-full md:w-5/6">
                    <NavBar />
                    <RockPaperScissorsGame/>
                </div>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden relative">
                {/* Use your MobileNavbar component instead of creating duplicate header */}
                <div className="flex items-center">
                    {/* Menu button for sidebar */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="absolute left-4 top-4 z-50 text-white"
                    >
                        <Menu size={28} />
                    </button>

                    {/* Your existing MobileNavbar component */}
                    <MobileNavbar />
                </div>

                {/* Overlay for sidebar */}
                {isMobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-35"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <MobileSidebar
                    isOpen={isMobileSidebarOpen}
                    setIsOpen={setIsMobileSidebarOpen}
                />

                {/* Mobile Attendance Page */}
                <div className="p-4">
                    <RockPaperScissorsGame/>
                </div>
            </div>
        </div>
    );
}

export default Page;
