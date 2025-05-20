"use client";
import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MdOutlineArrowBackIos } from "react-icons/md";

const sampleProjects = [
  { id: 1, name: "Code 4 Bharat", start: "2025-04-30", end: "2025-05-10" },
  { id: 2, name: "AIIM Tutorials", start: "2025-03-28", end: "2025-03-29" },
  { id: 3, name: "Task Manager", start: "2025-05-18", end: "2025-05-21" },
  { id: 4, name: "Intern Connect", start: "2025-05-22", end: "2025-06-05" },
  {
    id: 5,
    name: "Disaster Alert System",
    start: "2025-04-01",
    end: "2025-04-25",
  },
  { id: 6, name: "E-Learning Portal", start: "2025-05-01", end: "2025-05-30" },
  { id: 7, name: "Online Voting", start: "2025-06-15", end: "2025-07-01" },
  {
    id: 8,
    name: "Virtual Internship Portal",
    start: "2025-03-01",
    end: "2025-03-15",
  },
  { id: 9, name: "Event Booking App", start: "2025-07-05", end: "2025-07-20" },
  { id: 10, name: "College ERP", start: "2025-05-10", end: "2025-05-29" },
  { id: 11, name: "Travel Buddy", start: "2025-06-01", end: "2025-06-15" },
  { id: 12, name: "Task Planner", start: "2025-04-10", end: "2025-04-20" },
  { id: 13, name: "Exam Scheduler", start: "2025-05-16", end: "2025-05-19" },
  {
    id: 14,
    name: "Library Management",
    start: "2025-05-01",
    end: "2025-05-31",
  },
  { id: 15, name: "Gym Tracker", start: "2025-06-10", end: "2025-06-30" },
  { id: 16, name: "Water Quality App", start: "2025-02-01", end: "2025-02-20" },
  { id: 17, name: "Resume Builder", start: "2025-05-17", end: "2025-05-25" },
  { id: 18, name: "Fitness Planner", start: "2025-07-01", end: "2025-07-10" },
  { id: 19, name: "NGO Donation App", start: "2025-05-05", end: "2025-05-15" },
  { id: 20, name: "Portfolio Builder", start: "2025-08-01", end: "2025-08-15" },
];

export default function AllProject() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("current");
  const underlineRef = useRef(null);
  const today = new Date();

  // Get filter type from URL parameters
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam && ["past", "current", "upcoming"].includes(filterParam)) {
      setFilterType(filterParam);
    }
  }, [searchParams]);

  // Animate underline on mount
  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  const filteredProjects = sampleProjects
    .filter((project) => {
      const startDate = new Date(project.start);
      const endDate = new Date(project.end);

      if (filterType === "past") {
        return endDate < today;
      } else if (filterType === "current") {
        return startDate <= today && endDate >= today;
      } else if (filterType === "upcoming") {
        return startDate > today;
      }
      return true;
    })
    .filter(
      (project) =>
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.start.includes(query) ||
        project.end.includes(query)
    );

  const getHeading = () => {
    if (filterType === "past") return "PAST PROJECTS";
    if (filterType === "current") return "CURRENT PROJECTS";
    return "UPCOMING PROJECTS";
  };

  return (
    <div className="p-6 min-h-screen bg-white">
      {/* Back button */}
      <Link href="/projectoverview">
        <button className="mb-6 px-3 py-2 bg-[#018ABE] hover:bg-gray-200 cursor-pointer rounded-md text-gray-800 flex items-center">
          <MdOutlineArrowBackIos className="text-white" />
        </button>
      </Link>

      {/* Heading */}
      <h2 className="text-2xl font-bold mb-1 relative inline-block text-gray-800">
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
        ></span>
        {getHeading()}
      </h2>

      {/* Filter Buttons */}
      {/* Buttons + Search in One Line */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 mb-8">
        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setFilterType("past")}
            className={`px-4 py-2 rounded-md ${
              filterType === "past"
                ? "bg-[#018ABE] text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Past Projects
          </button>
          <button
            onClick={() => setFilterType("current")}
            className={`px-4 py-2 rounded-md ${
              filterType === "current"
                ? "bg-[#018ABE] text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Current Projects
          </button>
          <button
            onClick={() => setFilterType("upcoming")}
            className={`px-4 py-2 rounded-md ${
              filterType === "upcoming"
                ? "bg-[#018ABE] text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Upcoming Projects
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Name or Date (YYYY-MM-DD)"
            className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#018ABE]"
          />
          <Search className="absolute right-3 top-2.5 text-gray-500" />
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="min-w-full text-center">
          <thead className="bg-[#018ABE] text-white">
            <tr>
              <th className="px-4 py-2">SR NO</th>
              <th className="px-4 py-2 border-l border-gray-200">
                PROJECT NAME
              </th>
              <th className="px-4 py-2 border-l border-gray-200">START</th>
              <th className="px-4 py-2 border-l border-gray-200">END</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 relative">
                    {" "}
                    <span className="custom-border-left block h-6"></span>
                    {project.name}
                  </td>
                  <td className="px-4 py-2 relative">
                    {" "}
                    <span className="custom-border-left block h-6"></span>
                    {project.start}
                  </td>
                  <td className="px-4 py-2 relative">
                    {" "}
                    <span className="custom-border-left block h-6"></span>
                    {project.end}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No matching projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
