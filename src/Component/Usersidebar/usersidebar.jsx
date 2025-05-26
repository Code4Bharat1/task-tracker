'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { axiosInstance } from '@/lib/axiosInstance';
import { connectSocket } from '@/utils/socket';

// Icons
import { RxDashboard } from 'react-icons/rx';
import { AiOutlineUserSwitch, AiOutlineProject } from 'react-icons/ai';
import { MdAccessTime } from 'react-icons/md';
import { IoMdListBox } from 'react-icons/io';
import { BiMoney } from 'react-icons/bi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { FaSignOutAlt } from 'react-icons/fa';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [features, setFeatures] = useState([]);
  const [maxFeatures, setMaxFeatures] = useState([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axiosInstance.get('/user/auth/me', { withCredentials: true });
        setRole(res.data.role);
        setUserId(res.data.userId);

        if (!res.data.role || !res.data.userId) {
          toast.error('You are not authorized to access this page.');
          router.push('/');
          return;
        }

        const featuresRes = await axiosInstance.get('/permissions/user/features');
        const userPermissions = featuresRes.data[0]; // assuming single user entry
        setFeatures(userPermissions?.features || []);
        setMaxFeatures(userPermissions?.maxFeatures || []);

        const socket = connectSocket(res.data.userId);
        socket.on('permissions_updated', (data) => {
          console.log('🟢 Updated features:', data.updatedFeatures);
          setFeatures(data.updatedFeatures || []);
        });

        return () => socket.disconnect();
      } catch (err) {
        console.error('Error fetching user info:', err);
        toast.error('Failed to fetch user information.');
        router.push('/');
      }
    };

    fetchUserInfo();
  }, []);

  if (!role) return null; // Show nothing or a loading spinner until role is fetched

  const canAccess = (key) => {
    if (!key) return true; // alwaysVisible
    return features.includes(key) && !maxFeatures.includes(key);
  };

  const menuItems = [
    { label: 'Dashboard', icon: <RxDashboard />, href: '/dashboard', alwaysVisible: true },
    { label: 'Attendance', icon: <AiOutlineUserSwitch />, href: '/attendance', alwaysVisible: true },
    { label: 'Add TimeSheet', icon: <MdAccessTime />, href: '/timesheet', alwaysVisible: true },
    { label: 'Leave', icon: <IoMdListBox />, href: '/leavetable', alwaysVisible: true },
    { label: 'Salary', icon: <BiMoney />, href: '/salarypage', alwaysVisible: true },
    { label: 'Expense', icon: <RiMoneyDollarCircleLine />, href: '/expense', alwaysVisible: true },
    { label: 'Project Overview', icon: <AiOutlineProject />, href: '/projectoverview', alwaysVisible: true },

    // Restricted by featureKey
    { label: 'Leave Application', icon: <IoMdListBox />, href: '/viewleave', featureKey: 'viewleave' },
    { label: 'View Expense', icon: <IoMdListBox />, href: '/expenseRequest', featureKey: 'viewexpense' },
    { label: 'View Timesheet', icon: <IoMdListBox />, href: '/viewtimesheet', featureKey: 'viewtimesheet' },
    { label: 'Upload Post', icon: <IoMdListBox />, href: '/postupload', featureKey: 'postUpload' },
    { label: 'View Attendance', icon: <IoMdListBox />, href: '/viewattendance', featureKey: 'viewattendance' },
    { label: 'Team Task', icon: <AiOutlineProject />, href: '/teamtask', featureKey: 'teamTasks' },

    { label: 'Logout', icon: <FaSignOutAlt />, href: '/', alwaysVisible: true },
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
    <div className="fixed min-h-screen w-1/6 bg-gradient-to-b from-[#018ABE] via-[#65B7D4] to-[#E0E2E3] text-white flex flex-col items-center py-6">
      <div className="flex justify-center mb-3">
        <Image src="/task.png" alt="Logo" width={120} height={120} className="object-contain" />
      </div>

      <nav className="flex flex-col gap-2 w-full px-4">
        {menuItems.map((item, index) => {
          const isVisible = item.alwaysVisible || canAccess(item.featureKey);
          if (!isVisible) return null;

          const isActive = pathname === item.href;
          const commonClasses = 'flex items-center gap-4 px-3 py-2 rounded-lg transition duration-200';
          const activeClasses = isActive ? 'bg-white text-sky-700' : 'hover:bg-white hover:text-sky-700';

          return item.label === 'Logout' ? (
            <button key={index} onClick={handleLogout} className={`${commonClasses} ${activeClasses}`}>
              <div className="w-6 h-6 flex items-center justify-center text-lg">{item.icon}</div>
              <span className="text-md font-medium">{item.label}</span>
            </button>
          ) : (
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
