"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";

export default function MobileRequestOTP() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastToastId, setLastToastId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "otp") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 6) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateOTP = () =>
    formData.otp.length === 6 && /^\d{6}$/.test(formData.otp);

  const validatePassword = () => formData.password.length >= 8;

  const validateConfirmPassword = () =>
    formData.confirmPassword === formData.password &&
    formData.password.length >= 8;

  const validateForm = () =>
    validateOTP() && validatePassword() && validateConfirmPassword();

  // Helper function to show toast without duplicates
  const showToast = (message, type = "error", options = {}) => {
    // Dismiss previous toast if it exists
    if (lastToastId) {
      toast.dismiss(lastToastId);
    }

    let toastId;
    if (type === "success") {
      toastId = toast.success(message, {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#dcfce7",
          border: "1px solid #86efac",
          color: "#16a34a",
          fontWeight: "600",
        },
        ...options,
      });
    } else {
      toastId = toast.error(message, {
        duration: 3000,
        position: "top-center",
        ...options,
      });
    }

    setLastToastId(toastId);
    return toastId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all required fields are filled
    if (
      !formData.otp.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      showToast("❗ Please fill all required fields");
      return;
    }

    // Validate OTP
    if (!validateOTP()) {
      showToast("❗ Please enter a valid 6-digit OTP");
      return;
    }

    // Validate Password
    if (!validatePassword()) {
      showToast("❗ Password must be at least 8 characters long");
      return;
    }

    // Validate Confirm Password
    if (!validateConfirmPassword()) {
      if (formData.password !== formData.confirmPassword) {
        showToast("❗ Password and Confirm Password do not match", "error", {
          duration: 4000,
          style: {
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#dc2626",
            fontWeight: "600",
          },
        });
      } else {
        showToast("❗ Please enter a valid password");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate API

      showToast("✅ Password reset successful!", "success");

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      showToast("❌ Failed to reset password. Please try again.", "error", {
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = !validateForm() || isSubmitting;

  const getFieldValidationClass = (field) => {
    let isValid = false;
    let hasValue = false;

    switch (field) {
      case "otp":
        hasValue = formData.otp.length > 0;
        isValid = validateOTP();
        break;
      case "password":
        hasValue = formData.password.length > 0;
        isValid = validatePassword();
        break;
      case "confirmPassword":
        hasValue = formData.confirmPassword.length > 0;
        isValid = validateConfirmPassword();
        break;
    }

    if (hasValue && !isValid) return "border-red-400 focus:border-red-500";
    if (hasValue && isValid) return "border-green-400 focus:border-green-500";
    return "border-gray-400 focus:border-blue-500";
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-no-repeat bg-cover pt-6"
      style={{ backgroundImage: "url('/signup/mobilebg.png')" }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#000",
            fontWeight: "500",
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            maxWidth: "350px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

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
        <p className="text-center font-semibold text-black mt-2">Enter OTP</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* OTP */}
          <div>
            <label htmlFor="otp" className="text-sm text-gray-900 block mb-1">
              Enter OTP <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="otp"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg text-sm focus:outline-none transition-colors ${getFieldValidationClass(
                  "otp"
                )}`}
                maxLength={6}
                required
              />
              <div className="absolute right-2 top-2 text-xs text-gray-500">
                {formData.otp.length}/6 digits
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="text-sm text-gray-900 block mb-1"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter new password (min 8 characters)"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg text-sm focus:outline-none transition-colors ${getFieldValidationClass(
                "password"
              )}`}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm text-gray-900 block mb-1"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg text-sm focus:outline-none transition-colors ${getFieldValidationClass(
                "confirmPassword"
              )}`}
              required
            />
            {formData.confirmPassword.length > 0 &&
              formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
          </div>

          <button
            type="submit"
            className={`w-full py-2 mt-4 rounded-lg font-semibold text-sm transition-all ${
              isSubmitDisabled
                ? "bg-[#97a9ad] text-white cursor-not-allowed"
                : "bg-cyan-300 hover:bg-cyan-400 text-black hover:shadow-md"
            }`}
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? "Resetting Password..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
