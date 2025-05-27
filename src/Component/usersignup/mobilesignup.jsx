"use client";

import { Toaster, toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const texts = [
    "Reduces time spent remembering or searching for Tasks",
    "Improves task handling through simple, efficient tracking.",
    "Simplifies tracking and managing tasks efficiently every day.",
  ];
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length);
        setAnimate(true);
      }, 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.success("Registered successfully!");
    console.log(formData);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-no-repeat bg-cover pt-2"
      style={{
        backgroundImage: "url('/signup/mobilebg.png')",
      }}
    >
      <Image
        src="/signup/tasklogo.png"
        alt="Task Logo"
        width={200}
        height={40}
        className="w-50 sm:w-30 md:w-38 h-auto"
      />

      <div className="bg-white/70 p-4 rounded-lg shadow-md w-full max-w-xs">
        <Toaster position="top-right" />
        <h2 className="text-xl font-bold text-center text-[#018ABE] mb-4">
          Create Account
        </h2>

        <div className="bg-white p-2 rounded-xl shadow-md">
          <form className="grid grid-cols-1 gap-3" onSubmit={handleSubmit}>
            {[
              { name: "firstName", label: "First Name" },
              { name: "lastName", label: "Last Name" },
              { name: "email", label: "E-mail", type: "email" },
              { name: "phone", label: "Phone", type: "tel" },
              { name: "password", label: "Password", type: "password" },
              {
                name: "confirmPassword",
                label: "Confirm Password",
                type: "password",
              },
            ].map(({ name, label, type = "text" }) => (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="block text-gray-900 text-sm mb-1"
                >
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  id={name}
                  placeholder={`Enter your ${label.toLowerCase()}`}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border border-gray-400 focus:outline-none text-sm"
                  required
                  pattern={name === "phone" ? "\\d{10}" : undefined}
                  maxLength={name === "phone" ? 10 : undefined}
                />
              </div>
            ))}

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-cyan-300 hover:bg-cyan-400 text-black font-semibold text-sm"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>

      <p
        key={index}
        className={`text-black text-xl mx-10 text-center my-8 transition-all duration-700 ease-in-out ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        {texts[index]}
      </p>
    </div>
  );
}
