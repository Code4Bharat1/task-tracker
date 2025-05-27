"use client";
import React, { useRef } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const policies = [
  {
    title: "Leave Policy",
    desc: "Our company offers a comprehensive leave policy designed to support the well-being and work-life balance of all employees. Employees are entitled to paid vacation, sick leave, and emergency leaves.",
    img: "/policy.png",
    link: "/companyPolicy/policy1"
  },
  {
    title: "Business Travel Policy",
    desc: "Outlines the rules, procedures, and expectations for employees traveling on behalf of the organization including booking and reimbursement.",
    img: "/business.png",
    link: "/companyPolicy/policy2"
  },
  {
    title: "Health Insurance Policy",
    desc: "Covers hospital stays, surgeries, and medical treatments for employees and their family members, with wellness programs included.",
    img: "/health.png",
    link: "/companyPolicy/policy3"
  },
  {
    title: "Work From Home Policy",
    desc: "WFH is available after 6 months of service, subject to approval. Regular check-ins and performance tracking continue remotely.",
    img: "/home.png",
    link: "/companyPolicy/policy4"
  },
  {
    title: "Employee Conduct Policy",
    desc: "Sets behavioral expectations like punctuality, respect, professionalism, and ethical conduct within the company.",
    img: "/employee.png",
    link: "/companyPolicy/policy5"
  },
  {
    title: "Overtime Policy",
    desc: "Covers compensation for extra hours worked, requiring manager approval and tracking for payroll purposes.",
    img: "/overtime.png",
    link: "/companyPolicy/policy6"
  },
];

export default function CompanypolicyMobile() {
  const router = useRouter();
  const underlineRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="px-4 py-4 sm:hidden">
      <h2 className="text-xl font-bold mb-6 relative inline-block text-gray-800">
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
        ></span>
        Company Policies
      </h2>
      <div className="flex flex-col gap-7">
        {policies.map((policy, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-[1px_1px_10px_lightgray] p-4 hover:shadow-[1px_1px_10px_lightgray] transition-transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <Image
                src={policy.img}
                alt={policy.title}
                width={80}
                height={80}
                className="mb-3 object-contain"
              />
              <h3 className="text-lg font-semibold mb-2">{policy.title}</h3>
              <p className="text-gray-700 text-sm mb-3">{policy.desc}</p>
              <button
                onClick={() => router.push(policy.link)}
                className="bg-[#018ABE] text-white px-3 py-1 rounded text-sm"
              >
                Read more
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
