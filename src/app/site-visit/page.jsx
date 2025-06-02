'use client';

import React, { useState } from 'react';

import { Menu } from 'lucide-react';
import Sidebar from '@/Component/Usersidebar/usersidebar';
import NavBar from '@/Component/Navbar/navbar';
import SiteVisit from '@/Component/attendance/siteVisit';
import MobileNavbar from '@/Component/Navbar/mobilenavbar';
import MobileSidebar from '@/Component/Usersidebar/mobilesidebar';
import RouteGuard from '@/Component/RouteGuard';

const Page = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white">

            {/* ✅ Desktop View */}
            <div className="hidden md:flex w-full">
                {/* Sidebar */}
                <div className="md:w-1/6">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="w-full md:w-5/6">
                    <NavBar />
                    <div className="p-4">
                        <RouteGuard featureKey="site-visit">
                            <SiteVisit />
                        </RouteGuard>
                    </div>
                </div>
            </div>

            {/* ✅ Mobile View */}
            <div className="block md:hidden relative">
                {/* Mobile Navbar with Sidebar Toggle */}
                <div className="flex items-center">
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="absolute left-4 top-4 z-50 text-black"
                    >
                        <Menu size={28} />
                    </button>
                    <MobileNavbar />
                </div>

                {/* Overlay for sidebar */}
                {isMobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-30"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Drawer */}
                <MobileSidebar
                    isOpen={isMobileSidebarOpen}
                    setIsOpen={setIsMobileSidebarOpen}
                />

                {/* Main Content for Mobile */}
                <div className="p-4 pt-16">
                    <SiteVisit />
                </div>
            </div>

        </div>
    );
};

export default Page;
