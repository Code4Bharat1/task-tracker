'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { axiosInstance } from '@/lib/axiosInstance';
import { connectSocket } from '@/utils/socket';
import { usePermissionStore } from '@/store/permissionStore';

// Icons
import { Route } from 'lucide-react';
import { RxDashboard } from 'react-icons/rx';
import { AiOutlineUserSwitch, AiOutlineProject } from 'react-icons/ai';
import { MdAccessTime } from 'react-icons/md';
import { IoMdListBox } from 'react-icons/io';
import { BiMoney } from 'react-icons/bi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { FaSignOutAlt, FaGamepad } from 'react-icons/fa';
import { MdEmojiEvents } from "react-icons/md";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState(null);
  const { features, maxFeatures, setPermissions } = usePermissionStore();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axiosInstance.get('/user/auth/me', { withCredentials: true });

        setRole(res.data.role);

        if (!res.data.role || !res.data.userId) {
          toast.error('You are not authorized to access this page.');
          router.push('/');
          return;
        }

        const permissionsRes = await axiosInstance.get('/permissions/user/features');
        const userPermissions = permissionsRes.data[0]; // assume one entry
        setPermissions({
          features: userPermissions?.features || [],
          maxFeatures: userPermissions?.maxFeatures || [],
        });

        const socket = connectSocket(res.data.userId);
        socket.on('permissions_updated', (data) => {
          console.log('🟢 Updated features:', data.updatedFeatures);
          setPermissions({
            features: data.updatedFeatures || [],
            maxFeatures: data.maxFeatures || [],
          });
        });

        return () => socket.disconnect();
      } catch (err) {
        console.error('Error fetching user info:', err);
        toast.error('Failed to fetch user information.');
        router.push('/');
      }
    };

    fetchUserInfo();
  }, [router, setPermissions]);

  if (!role) return null; // Optionally show a loader

  const canAccess = (key) => {
    if (!key) return true; // Always visible
    return features.includes(key) && !maxFeatures.includes(key);
  };

  const menuItems = [
    { label: "Dashboard", icon: <RxDashboard />, href: "/dashboard" },
    { label: "Attendance", icon: <AiOutlineUserSwitch />, href: "/attendance" },
    { label: "Add TimeSheet", icon: <MdAccessTime />, href: "/timesheet" },
    { label: "Leave", icon: <IoMdListBox />, href: "/leavetable" },
    { label: "Salary", icon: <BiMoney />, href: "/salarypage" },
    { label: "Expense", icon: <RiMoneyDollarCircleLine />, href: "/expense" },
    {
      label: "Project Overview",
      icon: <AiOutlineProject />,
      href: "/projectoverview",
    },
    { label: "Games", icon: <FaGamepad />, href: "/games" },
    { label: "Events", icon: <MdEmojiEvents />, href: "/event" },

    // Feature-controlled items
    {
      label: "Leave Application",
      icon: <IoMdListBox />,
      href: "/viewleave",
      featureKey: "viewleave",
    },
    {
      label: "View Expense",
      icon: <IoMdListBox />,
      href: "/expenseRequest",
      featureKey: "viewexpense",
    },
    {
      label: "View Timesheet",
      icon: <IoMdListBox />,
      href: "/viewtimesheet",
      featureKey: "viewtimesheet",
    },
    {
      label: "Upload Post",
      icon: <IoMdListBox />,
      href: "/postupload",
      featureKey: "postUpload",
    },
    {
      label: "View Attendance",
      icon: <IoMdListBox />,
      href: "/viewattendance",
      featureKey: "viewattendance",
    },
    {
      label: "Team Task",
      icon: <AiOutlineProject />,
      href: "/teamtask",
      featureKey: "teamTasks",
    },
    {
      label: "Site Visit",
      icon: <Route />,
      href: "/site-visit",
      featureKey: "site-visit",
    },
    { label: "Logout", icon: <FaSignOutAlt />, href: "/", isLogout: true },
  ];

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout');
      toast.success('Logged out successfully!');
      setTimeout(() => router.push('/'), 1000);
    } catch {
      toast.error('Failed to log out.');
    }
  };

  return (
    <div className="fixed min-h-screen w-1/6 bg-gradient-to-b from-[#018ABE] via-[#39768e] to-[#85b8d1] text-white flex flex-col items-center py-6">
      <div className="flex justify-center mb-3">
        <Image src="/task.png" alt="Logo" width={120} height={120} className="object-contain" />
      </div>

      <nav className="flex flex-col gap-2 w-full px-4">
        {menuItems.map((item, index) => {
          const isVisible = item.featureKey ? canAccess(item.featureKey) : true;
          if (!isVisible) return null;

          const isActive = pathname === item.href;
          const commonClasses = 'flex items-center gap-4 px-3 py-2 rounded-lg transition duration-200';
          const activeClasses = isActive ? 'bg-white text-sky-700' : 'hover:bg-white hover:text-sky-700';

          if (item.isLogout) {
            return (
              <button key={index} onClick={handleLogout} className={`${commonClasses} ${activeClasses}`}>
                <div className="w-6 h-6 flex items-center justify-center text-lg">{item.icon}</div>
                <span className="text-md font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={index} href={item.href} className={`${commonClasses} ${activeClasses}`}>
              <div className="w-6 h-6 flex items-center justify-center text-lg">{item.icon}</div>
              <span className="text-md font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
