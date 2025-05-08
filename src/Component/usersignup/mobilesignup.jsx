'use client';

import { Toaster, toast } from 'react-hot-toast';
import { useState } from 'react';

export default function MobileSignup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Simulate form submission
    toast.success('Registered successfully!');
    console.log(formData); // You can send this to your backend
  };

  return (
    <div className="flex flex-col h-screen">
      
      <Toaster position="top-right" />
      
      {/* Mobile View - Only visible on mobile screens */}
      <div className=" w-full flex flex-col items-center justify-center bg-cover bg-center px-4">
        <h2 className="text-2xl font-bold text-white mb-6 mt-6">Create an Account</h2>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md">
          <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="firstName" className="block text-gray-900 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="Enter your first name"
                className="w-full p-3 rounded-xl border border-gray-500 focus:outline-none bg-white text-black"
                required
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-gray-900 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Enter your last name"
                className="w-full p-3 rounded-xl border border-gray-500 focus:outline-none bg-white text-black"
                required
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-900 mb-1">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-xl border border-gray-500 focus:outline-none bg-white text-black"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-900 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                placeholder="Enter your phone number"
                className="w-full p-3 rounded-xl border border-gray-500 focus:outline-none bg-white text-black"
                pattern="[0-9]{10}"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-900 mb-1">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                className="w-full p-3 rounded-xl border border-gray-500 focus:outline-none bg-white text-black"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-gray-900 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Re-enter your password"
                className="w-full p-3 rounded-xl border border-gray-500 focus:outline-none bg-white text-black"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-1">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-300 hover:bg-cyan-400 text-black font-bold mt-2 cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
