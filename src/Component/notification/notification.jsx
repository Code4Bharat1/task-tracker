"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Notifications() {
  const underlineRef = useRef(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  const notificationsData = [
    {
      id: 1,
      date: "05/05/2025",
      message: "Meeting invite: 'Sprint Planning' – 7 May, 11:00 AM.",
      time: "4:35 PM",
      read: false,
    },
    {
      id: 2,
      date: "06/05/2025",
      message: "Task 'UI Design' assigned to you",
      time: "4:35 PM",
      read: true,
    },
    {
      id: 3,
      date: "11/05/2025",
      message: "Sprint Review scheduled by PM – 8 May, 10 AM.",
      time: "4:35 PM",
      read: false,
    },
    {
      id: 4,
      date: "12/05/2025",
      message: "Reminder: Submit timesheet by 6 PM.",
      time: "4:35 PM",
      read: true,
    },
  ];

  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState(notificationsData);

  const filtered = notifications.filter((note) => {
    if (filter === "All") return true;
    return filter === "Read" ? note.read : !note.read;
  });

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((note) => (note.id === id ? { ...note, read: true } : note))
    );
  };



  return (
    <div className="max-w-5xl mx-auto p-2">
      <div className="flex items-center justify-between mb-6 mt-4">
        <h2 className="text-2xl font-bold relative inline-block text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full"
          ></span>
          Notifications
        </h2>

        <div className="flex items-center gap-4">
          <select
            className="px-4 py-2 font-medium border border-gray-300 rounded-xl shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Read">Read</option>
            <option value="Unread">Unread</option>
          </select>

        </div>
      </div>

      <div className="space-y-4" ref={pdfRef}>
        {filtered.map((note) => (
          <div key={note.id} className="space-y-1 mb-4">
            <p className="text-sm font-medium text-black">{note.date}</p>

            <div
              onClick={() => markAsRead(note.id)}
              className={`flex items-center justify-between p-2 rounded-md px-6 border border-gray-300 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] ${
                note.read ? "bg-white" : "bg-blue-50"
              }`}
            >
              <div className="mr-4">
                <Image
                  src={"/profile.png"}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>

              <div className="flex-1 text-sm text-black font-medium">
                “{note.message}”
              </div>

              <div className="text-sm text-gray-500 ml-4">{note.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
