"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Signup() {
  const router = useRouter();
  const texts = [
    "Reduces time spent remembering or searching for Tasks",
    "Improves task handling through simple, efficient tracking.",
    "Simplifies tracking and managing tasks efficiently every day."
  ];

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(false); // reset animation
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length);
        setAnimate(true); // re-trigger animation
      }, 100); // short delay to reset class
    }, 3000); // every 3 seconds

    return () => clearInterval(interval);
  }, []);


  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [validationMessage, setValidationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (formData.password.length < 8) {
      setPasswordError(true);
      setValidationMessage("Password must be at least 8 characters long.");
      setIsSubmitting(false);
      return;
    } else {
      setPasswordError(false);
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError(true);
      setValidationMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    } else {
      setConfirmPasswordError(false);
    }

    const phoneRegex = /^[789]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setValidationMessage("Please enter a valid 10-digit Indian phone number starting with 7, 8, or 9.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/register`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password,
          companyName: "DemoCompany",
        }),
      });
    

      const data = await response.json();

      if (!response.ok) {
        setValidationMessage(data.message || "Failed to register");
        toast.error(data.message || "Registration failed");
      } else {
        toast.success('Registered successfully!');
      setTimeout(() => {
        router.push('/');
      }, 1500);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error("Something went wrong!");
      setValidationMessage("Server error");
      console.error("Registration error:", error);
    }

    setIsSubmitting(false);
  };
  return (
    <div className="flex flex-row h-screen">
      {/* Left Side */}
      <div
      className="w-2/5 h-full bg-cover bg-center relative flex items-center justify-center"
      style={{ backgroundImage: "url('/signup/bgleft.png')" }}
    >
      <div className="flex flex-col items-center gap-1">
        <Image src="/signup/tasklogo.png" alt="Logo" width={300} height={150} />
        <Image src="/signup/image1.png" alt="Image" width={300} height={150} className="-mt-20" />
        <p
          key={index} // ensures animation re-runs
          className={`text-black text-2xl mx-30 text-center -mt-2 transition-all duration-700 ease-in-out ${
            animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          {texts[index]}
        </p>
      </div>
    </div>

      {/* Right Side */}
      <div
        className="w-3/5 flex flex-col items-center justify-center bg-white bg-cover bg-center relative px-4"
        
      >
          <Image src="/vector2.png" alt="vector" width={60} height={60} className="absolute top-10 right-45 z-0" />
  <Image src="/vector2.png" alt="vector" width={60} height={60} className="absolute bottom-10 left-100 rotate-300 " />
  <Image src="/vector3.png" alt="vector" width={40} height={40} className="absolute top-1/2 left-22 " />
  <Image src="/vector1.png" alt="vector" width={40} height={40} className="absolute top-17 left-20 " />
  
  <Image src="/vector3.png" alt="vector" width={40} height={40} className="absolute bottom-8 left-40" />
  <Image src="/vector3.png" alt="vector" width={40} height={40} className="absolute bottom-8 right-40 scale-x-[-1]" />
  <Image src="/vector3.png" alt="vector" width={40} height={40} className="absolute bottom-50 right-20 scale-x-[-1] 
 " />
  <Image src="/vector1.png" alt="vector" width={45} height={45} className="absolute top-70 right-23 scale-x-[-1] "  />

        <h2 className="text-3xl font-bold text-black mb-6 mt-0">Create an Account</h2>

        <div className="bg-white p-8 rounded-2xl  shadow-[1px_1px_10px_lightgray] w-full max-w-2xl z-10">
          <form className="grid grid-cols-2 gap-4 " onSubmit={handleSubmit}>
            <InputField label="First Name" name="firstName" value={formData.firstName} handleChange={handleChange} />
            <InputField label="Last Name" name="lastName" value={formData.lastName} handleChange={handleChange} />
            <InputField label="E-mail" name="email" type="email" value={formData.email} handleChange={handleChange} />
            <InputField
              label="Phone"
              name="phone"
              type="tel"
              pattern="[0-9]{10}"
              value={formData.phone}
              handleChange={handleChange}
            />

            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              handleChange={handleChange}
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              error={passwordError}
            />
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              handleChange={handleChange}
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword(!showConfirmPassword)}
              error={confirmPasswordError}
            />

            {validationMessage && (
              <div className="col-span-2 text-red-600 text-center text-sm">{validationMessage}</div>
            )}

            <div className="col-span-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-300 hover:bg-cyan-400 text-black font-bold mt-2 cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>

            <div className="col-span-2 text-center mt-2">
              <p className="text-sm text-gray-700">
                Already have an account?{' '}
                <span
                  onClick={() => router.push('/')}
                  className="text-[#3E9097] font-medium cursor-pointer hover:underline">
                  Login here
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, type = 'text', value, handleChange, pattern }) {
  return (
    <div>
      <label htmlFor={name} className="text-gray-900 mb-1 px-1 block">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        pattern={pattern}
        placeholder={`Enter your ${label.toLowerCase()}`}
        className="w-full p-3 rounded-xl px-3 shadow-[1px_1px_10px_lightgray] focus:border-blue-500 focus:outline-none bg-white text-black"
        required
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

function PasswordField({ label, name, value, handleChange, show, toggle, error }) {
  return (
    <div className="relative">
      <label htmlFor={name} className="text-gray-900 mb-1 px-1 block">
        {label}
      </label>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        id={name}
        placeholder={`Enter your ${label.toLowerCase()}`}
        className={`w-full p-3 pr-10 rounded-xl shadow-[1px_1px_10px_lightgray] focus:border-blue-500 focus:outline-none ${error ? 'bg-purple-200' : 'bg-white'} text-black`}
        required
        value={value}
        onChange={handleChange}
      />
      <div
        className="absolute right-3 top-[42px] text-gray-500 cursor-pointer"
        onClick={toggle}
      >
        {show ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
      </div>
    </div>
  );
}
