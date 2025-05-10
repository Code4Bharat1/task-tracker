"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Policy5() {
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
      className="p-8 max-w-5xl mx-auto bg-white rounded-lg"
    >
      <h2 className="text-2xl font-bold mb-8 -ml-10 relative inline-block text-gray-700">
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
        ></span>
        EMPLOYEE CONDUCT POLICY
      </h2>

      <p className="text-gray-700 mb-4">
        Our Employee Conduct Policy outlines the expected behavior, ethics, and professionalism that all employees must maintain within the organization.
      </p>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        General Behavior
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Employees must act with integrity, honesty, and respect toward colleagues, clients, and management.</li>
        <li>Discrimination, harassment, or abusive behavior of any kind is strictly prohibited.</li>
        <li>Workplace conflicts should be resolved constructively or reported to HR.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Attendance & Punctuality
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Employees are expected to adhere to their work schedule and report on time.</li>
        <li>Chronic tardiness or unapproved absences may lead to disciplinary action.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Use of Company Resources
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Company property must be used responsibly and only for official purposes.</li>
        <li>Unauthorized access or sharing of confidential data is prohibited.</li>
        <li>Misuse of systems, including the internet or email, may result in penalties.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Dress Code
      </h2>
      <p className="text-gray-700">
        Employees should dress appropriately according to their role and company guidelines. Attire must reflect professionalism and cleanliness.
      </p>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Disciplinary Actions
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Violation of this policy may result in verbal/written warnings, suspension, or termination.</li>
        <li>All cases will be investigated fairly before any disciplinary decision is made.</li>
      </ul>

      <p className="text-gray-600 mt-6 italic">
        For questions or reports related to employee conduct, please reach out to the HR department.
      </p>
    </div>
  );
}
