'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { axiosInstance } from '@/lib/axiosInstance'

// Import icons
import { RxDashboard } from 'react-icons/rx'
import { FaRegCalendarAlt, FaSignOutAlt, FaUniversity } from 'react-icons/fa'
import { MdAccessTime } from 'react-icons/md'
import { AiOutlineUserSwitch } from 'react-icons/ai'
import { BiMoney } from 'react-icons/bi'
import { IoMdListBox } from 'react-icons/io'
import { HiOutlineDocumentText } from 'react-icons/hi'
import { RiMoneyDollarCircleLine } from 'react-icons/ri'

const menuItems = [
  { label: 'Dashboard', icon: <RxDashboard />, href: '/dashboard' },
  { label: 'Attendance', icon: <AiOutlineUserSwitch />, href: '/attendance' },
  { label: 'Add TimeSheet', icon: <MdAccessTime />, href: '/timesheet' },
  // { label: 'Calendar', icon: <FaRegCalendarAlt />, href: '/calendar' },
  { label: 'Leave', icon: <IoMdListBox />, href: '/leavetable' },
  { label: 'Salary', icon: <BiMoney />, href: '/salarypage' },
  // { label: 'Company Policies', icon: <HiOutlineDocumentText />, href: '/companyPolicy' },
  { label: 'Expense', icon: <RiMoneyDollarCircleLine />, href: '/expense' },
  // { label: 'Bank Info', icon: <FaUniversity />, href: '/bankinformation' },
  { label: 'Logout', icon: <FaSignOutAlt />, href: '/' }
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout')
      toast.success('Logged out successfully!')

      // Delay navigation to allow toast to show
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error) {
      console.log('Failed to log out:', error)
      toast.error('Failed to log out.')
    }
  }

  return (
    <div className="fixed min-h-screen w-1/6 bg-gradient-to-b from-[#018ABE] from-15% via-[#65B7D4] via-80% to-[#E0E2E3] text-white flex flex-col items-center py-6">
      {/* Logo */}
      <div className="flex justify-center mb-3">
        <Image
          src="/task.png"
          alt="Logo"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 w-full px-4">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href
          const commonClasses =
            'flex items-center gap-4 px-3 py-2 rounded-lg transition duration-200'
          const activeClasses = isActive
            ? 'bg-white text-sky-700'
            : 'hover:bg-white hover:text-sky-700'

          return item.label === 'Logout' ? (
            <button
              key={index}
              onClick={handleLogout}
              className={`${commonClasses} ${activeClasses}`}
            >
              <div className="w-6 h-6 flex items-center justify-center text-lg">
                {item.icon}
              </div>
              <span className="text-md font-medium">{item.label}</span>
            </button>
          ) : (
            <Link
              key={index}
              href={item.href}
              className={`${commonClasses} ${activeClasses}`}
            >
              <div className="w-6 h-6 flex items-center justify-center text-lg">
                {item.icon}
              </div>
              <span className="text-md font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
