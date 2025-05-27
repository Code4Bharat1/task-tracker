"use client";

import FloatingButtons from "@/Component/FloatingButtons";
import NavBar from "@/Component/Navbar/navbar";
import Sidebar from "@/Component/Usersidebar/usersidebar";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const hideRoutes = ["/"];

    const showSidebar = !hideRoutes.includes(pathname);
    const showNavbar = !hideRoutes.includes(pathname);
    const showFloatingButton = !hideRoutes.includes(pathname);

    return (
        <div className="min-h-screen flex bg-white">
            {/* Sidebar - shown on medium and larger screens */}
            {showSidebar && (
                <div className="hidden md:block md:w-1/6 bg-white border-r border-gray-200">
                    <Sidebar />
                </div>
            )}

            {/* Main content area */}
            <div className="flex-1 flex flex-col w-full">
                {showNavbar && <NavBar />}

                <main className="flex-1 p-4 overflow-y-auto">
                    {children}
                </main>

                {showFloatingButton && <FloatingButtons />}
            </div>
        </div>
    );
}
