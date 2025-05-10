"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Policy6() {
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
        OVERTIME POLICY
      </h2>

      <p className="text-gray-700 mb-4">
        Our Overtime Policy ensures that employees are fairly compensated for
        any additional work beyond standard working hours, while maintaining
        efficiency and workforce balance.
      </p>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Eligibility
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Applies to non-exempt employees as per labor regulations.</li>
        <li>Must have prior approval from a supervisor or manager.</li>
        <li>Overtime is calculated after 8 working hours per day or 40 per week.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Compensation
      </h2>
      <ol className="list-decimal list-inside text-gray-700">
        <li>Overtime is paid at 1.5x the regular hourly rate.</li>
        <li>Public holiday or weekend work may qualify for 2x pay if approved.</li>
        <li>Payout is processed monthly along with regular salary.</li>
      </ol>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Approval & Tracking
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Use the official timesheet or HR system to log extra hours.</li>
        <li>Supervisors must review and verify entries weekly.</li>
        <li>Unauthorized overtime will not be compensated.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Limitations
      </h2>
      <p className="text-gray-700">
        Excessive overtime is discouraged to ensure employee well-being.
        Continuous overtime beyond two weeks requires HR and management review.
      </p>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Important Notes
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>All overtime must be accurately recorded and approved.</li>
        <li>Company reserves the right to adjust or deny claims if policy is not followed.</li>
        <li>Frequent overtime may indicate need for workload review.</li>
      </ul>

      <p className="text-gray-600 mt-6 italic">
        For any clarifications, please contact the HR department.
      </p>
    </div>
  );
}
