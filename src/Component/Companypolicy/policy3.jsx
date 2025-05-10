"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Policy3() {
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
      className="p-8 max-w-5xl mx-auto bg-white rounded-lg"
    >
      <h2 className="text-2xl font-bold mb-8 -ml-10 relative inline-block text-gray-700">
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full"
        ></span>
        HEALTH INSURANCE POLICY
      </h2>

      <p className="text-gray-700 mb-4">
        Our Health Insurance Policy ensures financial security and medical
        assistance for employees and their families, covering a wide range of
        treatments and emergencies.
      </p>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Policy Coverage
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>
          <strong>Hospitalization:</strong> Covers expenses related to inpatient
          treatment, including surgery and room charges.
        </li>
        <li>
          <strong>Day Care Procedures:</strong> Includes treatments that do not
          require 24-hour hospitalization.
        </li>
        <li>
          <strong>Maternity Benefits:</strong> Covers delivery and related
          medical expenses.
        </li>
        <li>
          <strong>Pre & Post Hospitalization:</strong> Coverage for diagnostics
          and medications for 30 days before and 60 days after hospitalization.
        </li>
        <li>
          <strong>Family Coverage:</strong> Includes spouse, children, and
          dependent parents.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Claim Process
      </h2>
      <ol className="list-decimal list-inside text-gray-700">
        <li>
          Inform the HR or insurance coordinator before or at the time of
          hospitalization.
        </li>
        <li>
          Submit required documents: claim form, medical reports, bills,
          discharge summary, etc.
        </li>
        <li>
          The TPA (Third Party Administrator) will process and settle the claim.
        </li>
      </ol>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Exclusions
      </h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Cosmetic or aesthetic treatments.</li>
        <li>Pre-existing conditions in the first year unless otherwise stated.</li>
        <li>Injuries from substance abuse or self-harm.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[#018ABE] mt-6 mb-2">
        Premium & Coverage Limit
      </h2>
      <p className="text-gray-700">
        The company pays the premium for basic coverage. Additional voluntary
        top-up options are available at employee cost.
      </p>

      <p className="text-gray-600 mt-6 italic">
        For claim assistance or more information, contact the HR or insurance
        helpdesk.
      </p>
    </div>
  );
}
