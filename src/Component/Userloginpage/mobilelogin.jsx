"use client";

import { Toaster, toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MobileLogin() {
  const [formData, setFormData] = useState({
    identifier: "", // Email or Phone
    password: "",
  });
  const router = useRouter();
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

    if (name === "identifier") {
      // Check if value is digits only
      const isNumber = /^\d*$/.test(value);

      if (isNumber && value.length > 10) {
        return; // Don't update state if number exceeds 10 digits
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Add password validation function (same as desktop)
  const validatePassword = (pwd) => {
    const lengthValid = pwd.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    return lengthValid && hasLetter && hasNumber && hasSymbol;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { identifier, password } = formData;

    // Validation checks (same as desktop)
    if (!identifier.trim() && !password.trim()) {
      toast.error('Please enter your email/phone and password.');
      return;
    }

    if (!identifier.trim()) {
      toast.error('Please enter your email or phone.');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password.');
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\d{10}$/.test(identifier);

    if (!isEmail && !isPhone) {
      toast.error("Please enter a valid email or 10-digit phone number.");
      return;
    }

    // Use same password validation as desktop
    if (!validatePassword(password)) {
      toast.error('Password must be between 8 and include at least one letter, number, and special character.');
      return;
    }

    // Add the actual API call (same as desktop)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          identifier: identifier,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Login failed');
        return;
      }

      toast.success('Login successful!');
      router.push('/dashboard'); // Add navigation to dashboard
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    }
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
        className="w-80 sm:w-30 md:w-38 h-auto"
      />

      <div className="bg-white/90 p-4 rounded-xl shadow-md w-full max-w-xs">
        <Toaster position="top-right" />
        <h2 className="text-3xl font-bold text-center font-Poppins text-[#018ABE] mb-4">
          User Login
        </h2>

        <div className="p-2 rounded-xl">
          <form className="grid grid-cols-1 gap-3" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="identifier"
                className="block text-gray-900 text-lg mb-1"
              >
                E-mail / Phone
              </label>
              <input
                type="text"
                name="identifier"
                id="identifier"
                placeholder="Enter email or phone"
                value={formData.identifier}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-white border border-gray-400 focus:outline-none text-lg"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-900 text-lg mb-1"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter above 8 character secure password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-white border border-gray-400 focus:outline-none text-lg"
                required
                minLength={8}
              />
            </div>
            <p
              className="text-center text-lg text-[#018ABE] hover:underline cursor-pointer"
              onClick={() => router.push("/forgotpassword")}
            >
              Forgot Password?
            </p>
            
            <button
              type="submit"
              className="px-8 py-2 rounded-lg bg-cyan-300 hover:bg-cyan-400 text-black font-semibold text-lg mx-auto block"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      <p
        key={index}
        className={`text-white text-xl mx-10 text-center my-12 transition-all duration-700 ease-in-out ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        {texts[index]}
      </p>
    </div>
  );
}