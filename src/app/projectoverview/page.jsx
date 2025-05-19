
import NavBar from "@/Component/Navbar/navbar";
import ProjectOverview from "@/Component/projectoverview/project";

import Sidebar from "@/Component/Usersidebar/usersidebar";


export default function Home() {
    return (
        <div className="h-screen overflow-hidden bg-gray-50">
            {/* Sidebar - Fixed */}
            <div className="w-1/6 fixed top-0 bottom-0 left-0 bg-white border-r border-gray-200 shadow-sm">
                <Sidebar />
            </div>

            {/* Navbar - Fixed */}
            <div className="fixed top-0 right-0 w-5/6 ml-[16.6667%] z-10 bg-white border-b border-gray-200 shadow-sm">
                <NavBar/>
            </div>

            {/* Scrollable Content below Navbar */}
            <div className="mt-[64px] ml-[16.6667%] h-[calc(100vh-64px)] overflow-y-auto p-6 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <ProjectOverview/>
                </div>
            </div>
        </div>
    );
}