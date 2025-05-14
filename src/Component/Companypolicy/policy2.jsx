"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Policy2() {
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
    const sections = sectionRef.current.querySelectorAll("h2, p");
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
      className="p-8 max-w-5xl mx-auto bg-white rounded-lg min-h-screen"
    >

      {/* Main Heading with Underline */}
      <h2 className="text-2xl font-bold mb-8 -ml-10 relative inline-block text-gray-700">
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
        ></span>
        Company Travel Policy
      </h2>

      {/* Sections */}
      <section className="mb-6 bg-white p-4 rounded-lg shadow-[1px_1px_10px_lightgray]">
        <h2 className="text-xl font-semibold text-[#018ABE] mb-2">Introduction</h2>
        <p className="text-gray-700">
          When employees travel for company-related purposes, it is{' '}
          <span className="font-semibold">COD4BHARAT</span>'s responsibility to provide safe and reliable travel arrangements.
          This company travel policy serves to clarify the conditions and parameters of a company-paid trip.
        </p>
      </section>

      <section className="mb-6 bg-white p-4 rounded-lg shadow-[1px_1px_10px_lightgray]">
        <h2 className="text-xl font-semibold text-[#018ABE] mb-2">Purpose</h2>
        <p className="text-gray-700">
          The purpose of this company travel policy is to (a) outline the authorization and reimbursement process for travel
          arrangements and expenses; (b) to list the company-paid travel expenses; and (c) to establish protocols that
          oversee the travel arrangement process.
        </p>
      </section>

      <section className="mb-6 bg-white p-4 rounded-lg shadow-[1px_1px_10px_lightgray]">
        <h2 className="text-xl font-semibold text-[#018ABE] mb-2">Scope</h2>
        <p className="text-gray-700">
          This company travel policy is applicable to all employees under contract at{' '}
          <span className="font-semibold">COD4BHARAT</span>, including paid interns, contractors, and seasonal, part-time,
          and full-time employees. <span className="font-semibold">COD4BHARAT</span> sees traveling out of the city, state,
          and/or country as a fully-paid business trip, as well as one-day trips that are{' '}
          <span className="font-semibold">9</span> hours away from the office.
        </p>
      </section>

      <section className="mb-6 bg-white p-4 rounded-lg shadow-[1px_1px_10px_lightgray]">
        <h2 className="text-xl font-semibold text-[#018ABE] mb-2">Authorization & Reimbursements</h2>
        <p className="text-gray-700">
          All company travel arrangements must be authorized by senior employees at least{' '}
          <span className="font-semibold">4 Weeks/1 Month</span> before the expected travel date, depending on the
          circumstances and the required travel arrangement time period. Employees are not permitted to authorize their own
          travel arrangements.
        </p>
      </section>
    </div>
  );
}
