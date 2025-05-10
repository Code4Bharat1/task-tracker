
import React from 'react';

export default function Policy2() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 md:px-20 lg:px-40 text-gray-800">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
          B
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-semibold text-center mb-10">
        Company Travel Policy
      </h1>

      {/* Section: Introduction */}
      <section className="mb-6 bg-white p-4 rounded-lg shadow-[1px_1px_10px_lightgray]">
        <h2 className="font-bold mb-1">Introduction.</h2>
        <p>
          When employees travel for company-related purposes, it is{' '}
          <span className="font-semibold">COD4BHARAT</span> responsibility to provide safe and reliable travel arrangements.
          This company travel policy serves to clarify the conditions and parameters of a company-paid trip.
        </p>
      </section>

      {/* Section: Purpose */}
      <section className="mb-6 bg-white p-4 rounded-lg shadow-[1px_1px_10px_lightgray]">
        <h2 className="font-bold mb-1">Purpose.</h2>
        <p>
          The purpose of this company travel policy is to (a) outline the authorization and reimbursement process for travel
          arrangements and expenses; (b) to list the company-paid travel expenses; and (c) to establish protocols that
          oversee the travel arrangement process.
        </p>
      </section>

      {/* Section: Scope */}
      <section className="mb-6 bg-white p-4 rounded-lg shadow-[1px_1px_10px_lightgray]">
        <h2 className="font-bold mb-1">Scope.</h2>
        <p>
          This company travel policy is applicable to all employees under contract at{' '}
          <span className="font-semibold">COD4BHARAT</span>, including paid interns, contractors, and seasonal, part-time,
          and full-time employees. <span className="font-semibold">COD4BHARAT</span> sees traveling out of the city, state,
          and/or country as a fully-paid business trip, as well as one-day trips that are{' '}
          <span className="font-semibold">9</span> hours away from the office.
        </p>
      </section>

      {/* Section: Authorization & Reimbursements */}
      <section className="mb-6 bg-white p-4 rounded-lg shadow-[1px_1px_10px_lightgray]">
        <h2 className="font-bold mb-1">Authorization & Reimbursements.</h2>
        <p>
          All company travel arrangements must be authorized by senior employees at least{' '}
          <span className="font-semibold">4 Weeks/1 Month</span> before the expected travel date, depending on the
          circumstances and the required travel arrangement time period. Employees are not permitted to authorize their own
          travel arrangements.
        </p>
      </section>
    </div>
  );
}