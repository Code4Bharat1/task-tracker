"use client";

import { useRouter, usePathname } from "next/navigation"; // 🧭 For navigation and active route

import { RxDashboard } from "react-icons/rx";
import { AiOutlineUserSwitch, AiOutlineProject } from "react-icons/ai";
import { MdAccessTime } from "react-icons/md";
import { IoMdListBox } from "react-icons/io";
import { BiMoney } from "react-icons/bi";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { FaSignOutAlt, FaRegNewspaper, FaRegCalendarAlt } from "react-icons/fa";

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
  { label: "Calendar", icon: <FaRegCalendarAlt />, href: "/monthcalendar" },
  { label: "View Posts", icon: <FaRegNewspaper />, href: "/dashboard/posts" },
  { label: "Logout", icon: <FaSignOutAlt />, href: "/" },
];

export default function MobileSidebar({ isOpen, setIsOpen }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (href) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white text-black z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-end p-4">
        <button onClick={() => setIsOpen(false)}>❌</button>
      </div>
      <ul className="space-y-3 px-6">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <li key={index}>
              <button
                onClick={() => handleNavigate(item.href)}
                className={`w-full text-left flex items-center gap-3 p-2 rounded transition ${
                  isActive
                    ? "bg-gradient-to-r from-[#058CBF] to-[#69b0c9] font-semibold text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-md">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
