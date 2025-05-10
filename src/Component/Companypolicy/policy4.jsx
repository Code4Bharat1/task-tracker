"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Policy4() {
  const underlineRef = useRef(null);
  const sectionRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );

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
        WORK FROM HOME POLICY
      </h2>

      <p className="text-gray-700 mb-4">
        Our Work From Home Policy ensures flexibility and continued productivity while maintaining team collaboration and accountability.
      </p>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Eligibility
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Employees with roles that can be performed remotely.</li>
        <li>Must have completed at least 3 months in the company.</li>
        <li>Manager approval is mandatory before starting remote work.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Guidelines
      </h2>
      <ol className="list-decimal list-inside text-gray-700">
        <li>Maintain regular working hours unless approved otherwise.</li>
        <li>Be reachable during work hours through official communication tools.</li>
        <li>Attend all scheduled virtual meetings and team check-ins.</li>
      </ol>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Tools & Security
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Use company-approved devices and secure VPN for access.</li>
        <li>Do not share confidential company data on personal devices.</li>
        <li>Report any data breach or issue to IT immediately.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Performance & Monitoring
      </h2>
      <p className="text-gray-700">
        Regular performance reviews will include work-from-home contributions. Productivity, communication, and timely task completion are key evaluation metrics.
      </p>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Important Notes
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>WFH is a privilege, not an entitlement, and can be revoked.</li>
        <li>Employees must ensure a quiet and disturbance-free workspace.</li>
        <li>All policies remain applicable, including code of conduct.</li>
      </ul>

      <p className="text-gray-600 mt-6 italic">
        For any clarifications, please contact the HR department.
      </p>
    </div>
  );
}
