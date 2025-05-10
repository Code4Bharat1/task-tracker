"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Policy1() {
  const underlineRef = useRef(null);
  const sectionRef = useRef(null);

  useGSAP(() => {
    // Underline animation
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );

    // Section fade-in animation
    const sections = sectionRef.current.querySelectorAll("h2, p, ul, ol");
    gsap.from(sections, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  return (
    <div
      ref={sectionRef}
      className="p-8 max-w-5xl mx-auto bg-white rounded-lg "
    >
      <h2 className="text-2xl font-bold mb-8 -ml-10 relative inline-block text-gray-700">
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
        ></span>
        LEAVE POLICY
      </h2>

      <p className="text-gray-700 mb-4">
        Our Leave Policy is designed to support employees in maintaining a
        healthy work-life balance while ensuring smooth business operations.
      </p>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Types of Leave
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>
          <strong>Paid Leave:</strong> 12 days annually. Must be approved in
          advance.
        </li>
        <li>
          <strong>Sick Leave:</strong> 8 days annually. No prior approval
          needed but inform ASAP.
        </li>
        <li>
          <strong>Casual Leave:</strong> 5 days annually. For emergencies or
          short personal needs.
        </li>
        <li>
          <strong>Maternity Leave:</strong> Up to 26 weeks as per government
          norms.
        </li>
        <li>
          <strong>Paternity Leave:</strong> Up to 7 days post childbirth.
        </li>
        <li>
          <strong>Unpaid Leave:</strong> Can be taken in special cases with
          manager approval.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Leave Application Process
      </h2>
      <ol className="list-decimal list-inside text-gray-700">
        <li>
          Submit leave request through the internal portal or to your manager
          via email.
        </li>
        <li>
          Wait for manager approval before proceeding with travel or absence
          plans.
        </li>
        <li>
          In case of emergency/sick leave, inform your reporting manager as
          early as possible.
        </li>
      </ol>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Leave Balance & Tracking
      </h2>
      <p className="text-gray-700">
        Leave balances are updated monthly. Employees can view their balances
        in the HR system or by contacting HR directly.
      </p>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Important Notes
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Unused paid leaves can be carried forward up to 30 days.</li>
        <li>Habitual absenteeism may result in disciplinary action.</li>
        <li>
          All leave requests must be made with sufficient notice when possible.
        </li>
      </ul>

      <p className="text-gray-600 mt-6 italic">
        For any clarifications, please contact the HR department.
      </p>
    </div>
  );
}
