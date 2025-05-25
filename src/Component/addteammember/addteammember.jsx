'use client';

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoMdArrowDropdown } from 'react-icons/io'; // Import the icon

export default function Addteammember() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    dob: '',
    email: '',
    password: '',
    designation: '',
    attendance: '',
    timesheet: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Block letters for mobile field
    if (name === 'mobile' && !/^\d{0,10}$/.test(value)) return;
    // Block numbers for name fields
    if ((name === 'firstName' || name === 'lastName') && /[^A-Za-z]/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    for (let key in formData) {
      if (!formData[key]) {
        toast.error('Please fill all fields!');
        return;
      }
    }

    toast.success('Team Member Added Successfully!');
    // You can send formData to your backend here
  };

  return (
    <div className="min-h-screen bg-white p-8 ">
      <ToastContainer />

      <h1 className="text-3xl font-bold mb-2 ml-2">
        Add Team Member
        <div className="w-44 h-1 bg-red-500 mt-1 rounded"></div>
      </h1>

      <div className="bg-white rounded-xl shadow-lg border border-[#C2B7B7] p-8 justify-center items-center md:mx-10 ml-5 mt-5">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6">
          <div>
            <label className="block font-medium mb-1">First Name :</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-75 rounded-md px-3 py-2 border border-[#BFB8B8] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Last Name :</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-75 rounded-md px-3 py-2 border border-[#BFB8B8] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Mobile Number :</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              maxLength={10}
              inputMode="numeric"
              required
              className="w-75 rounded-md px-3 py-2 border border-[#BFB8B8] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="Please enter exactly 10 digits"
            />
          </div>

          <div>
  <label className="block font-medium mb-1">DOB :</label>
  <input
  type="date"
  name="dob"
  value={formData.dob}
  onChange={handleChange}
  required
  className="w-75 rounded-md px-3 py-2 border border-[#BFB8B8] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
/>

</div>



          <div>
            <label className="block font-medium mb-1">Email Address :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-75 rounded-md px-3 py-2 border border-[#BFB8B8] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Password :</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-75 rounded-md px-3 py-2 border border-[#BFB8B8] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Designation :</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
              className="w-75 rounded-md px-3 py-2 border border-[#BFB8B8] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div></div> {/* spacer */}

          <div>
  <label className="block font-medium mb-1">Attendance :</label>
  <div className="relative w-45">
    <select
      name="attendance"
      value={formData.attendance}
      onChange={handleChange}
      required
      className="appearance-none w-full rounded-md px-3 py-2 border border-[#BFB8B8] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="">Yes/No</option>
      <option>Yes</option>
      <option>No</option>
    </select>
    <IoMdArrowDropdown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black-500 pointer-events-none" />
  </div>
</div>

<div>
  <label className="block font-medium mb-1">TimeSheet :</label>
  <div className="relative w-45">
    <select
      name="timesheet"
      value={formData.timesheet}
      onChange={handleChange}
      required
      className="appearance-none w-full rounded-md px-3 py-2 border border-[#BFB8B8] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="">Yes/No</option>
      <option>Yes</option>
      <option>No</option>
    </select>
    <IoMdArrowDropdown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black-500 pointer-events-none" />
  </div>
</div>


          {/* Save Button */}
          <div className="col-span-2 flex justify-center mt-10">
            <button
              type="submit"
              className="bg-[#018ABE] text-white font-bold py-2 px-8 rounded-md shadow hover:bg-[#01719B] transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}