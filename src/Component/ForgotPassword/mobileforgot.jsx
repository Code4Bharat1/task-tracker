"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";

export default function MobileForgotPassword() {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState(""); // "email" or "phone"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const value = e.target.value;

    const isNumericOnly = /^\d*$/.test(value);

    if (isNumericOnly && value.length <= 10) {
      setInput(value);
      setInputType("phone");
    } else if (!isNumericOnly) {
      setInput(value);
      setInputType("email");
    }
  };

  const validateInput = () => {
    if (inputType === "phone") {
      return input.length === 10 && /^\d{10}$/.test(input);
    } else if (inputType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input);
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInput()) {
      if (inputType === "phone") {
        toast.error("Please enter a valid 10-digit phone number");
      } else {
        toast.error("Please enter a valid email address");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (inputType === "phone") {
        toast.success(`OTP sent to ${input.slice(0, 3)}***${input.slice(-3)}`);
      } else {
        const emailParts = input.split("@");
        const maskedEmail = `${emailParts[0].slice(0, 2)}***@${emailParts[1]}`;
        toast.success(`OTP sent to ${maskedEmail}`);
      }

      console.log(`OTP sent to ${inputType}:`, input);

      // ✅ Navigate to verify OTP page
      router.push("/forgotpassword/verifyotp");
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlaceholderText = () => {
    if (inputType === "phone") {
      return "Enter 10-digit phone number";
    } else if (inputType === "email") {
      return "Enter your email address";
    }
    return "Enter your email or phone";
  };

  const getInputHint = () => {
    if (inputType === "phone") {
      return `${input.length}/10 digits`;
    } else if (inputType === "email" && input.includes("@")) {
      return validateInput() ? "Valid email format" : "Invalid email format";
    }
    return "";
  };

  const isSubmitDisabled = !validateInput() || isSubmitting;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-no-repeat bg-cover pt-6"
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

      <div className="bg-white/90 p-5 rounded-xl shadow-md w-full max-w-xs mt-4">
        
        <h2 className="text-xl font-bold text-center text-[#018ABE]">
          Forget Password
        </h2>
        <p className="text-center font-semibold text-black mt-2">Request OTP</p>

        <form onSubmit={handleSubmit} className="mt-4">
          <label
            htmlFor="emailOrPhone"
            className="text-md text-gray-900 block mb-1"
          >
            E-mail / Phone
          </label>
          <div className="relative">
            <input
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              placeholder={getPlaceholderText()}
              value={input}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                input && !validateInput()
                  ? "border-red-400 focus:border-red-500"
                  : input && validateInput()
                  ? "border-green-400 focus:border-green-500"
                  : "border-gray-400 focus:border-blue-500"
              }`}
              required
            />
            {inputType === "phone" && (
              <div className="absolute right-2 top-2 text-xs text-gray-500">
                {getInputHint()}
              </div>
            )}
          </div>

          {input && (
            <div className="mt-1 text-md">
              {inputType === "email" && getInputHint() && (
                <span
                  className={
                    validateInput() ? "text-green-600" : "text-red-600"
                  }
                >
                  {getInputHint()}
                </span>
              )}
              {inputType === "phone" && input.length < 10 && (
                <span className="text-orange-600">
                  Please enter {10 - input.length} more digit(s)
                </span>
              )}
              {inputType === "phone" && input.length === 10 && (
                <span className="text-green-600">Ready to send OTP</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-2 my-10 rounded-lg font-semibold text-lg transition-all ${
              isSubmitDisabled
                ? "bg-[#65c9f0] text-blue-50 cursor-not-allowed"
                : "bg-cyan-300 hover:bg-cyan-400 text-black hover:shadow-md"
            }`}
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? "Sending OTP..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
