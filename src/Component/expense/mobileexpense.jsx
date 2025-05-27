"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { CheckCircle, AlertCircle, Plus, History, X } from "lucide-react";
import { FaTrashAlt, FaRegCalendarAlt, FaPaperclip } from "react-icons/fa";
import { axiosInstance } from "@/lib/axiosInstance";
import Link from "next/link";
import { useGSAP } from "@gsap/react";

export default function MobileExpense() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const underlineRef = useRef(null);
  const formRef = useRef(null);
  const historyBtnRef = useRef(null);

  useGSAP(() => {
    if (underlineRef.current) {
      gsap.fromTo(
        underlineRef.current,
        { scaleX: 0, transformOrigin: "left" },
        { scaleX: 1, duration: 1, ease: "power3.out" }
      );
    }

    if (formRef.current) {
      gsap.from(formRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out",
      });
    }

    if (historyBtnRef.current) {
      // Set initial visibility to ensure button is always visible
      gsap.set(historyBtnRef.current, { opacity: 1, visibility: "visible" });

      // Then animate from a slightly different position
      gsap.from(historyBtnRef.current, {
        y: -10,
        scale: 0.9,
        duration: 0.5,
        delay: 0.5,
        ease: "power3.out",
      });
    }
  }, []);

  const categories = ["Travel", "Food Expense", "Hotel Expense", "Misc"];
  const paymentMethods = [
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
  ];

  const [expenses, setExpenses] = useState([
    {
      id: Date.now(),
      category: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      description: "",
      paymentMethod: "",
      file: null,
      fileName: "No file chosen",
      filePublicId: null,
      fileResourceType: null,
    },
  ]);

  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 4000);
  };

  const addExpense = () => {
    setExpenses([
      ...expenses,
      {
        id: Date.now(),
        category: "",
        date: new Date().toISOString().split("T")[0],
        amount: "",
        description: "",
        paymentMethod: "",
        file: null,
        fileName: "No file chosen",
        filePublicId: null,
        fileResourceType: null,
      },
    ]);

    // Animate the new form entry
    gsap.from(`.expense-item:last-child`, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  const removeExpense = (id) => {
    if (expenses.length > 1) {
      const item = document.getElementById(`expense-${id}`);
      if (item) {
        gsap.to(item, {
          opacity: 0,
          x: -20,
          duration: 0.3,
          onComplete: () => {
            setExpenses(expenses.filter((exp) => exp.id !== id));
          },
        });
      }
    } else {
      showToast("error", "You need at least one expense entry");
    }
  };

  const handleChange = (id, field, value) => {
    setExpenses(
      expenses.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      setExpenses(
        expenses.map((exp) =>
          exp.id === id
            ? {
                ...exp,
                file: file,
                fileName: file.name,
              }
            : exp
        )
      );
    }
  };

  const removeFile = (id) => {
    setExpenses(
      expenses.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              file: null,
              fileName: "No file chosen",
              filePublicId: null,
              fileResourceType: null,
            }
          : exp
      )
    );
    // Reset file input
    const fileInput = document.getElementById(`file-input-${id}`);
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all expenses
    const isValid = expenses.every(
      (exp) => exp.category && exp.date && exp.amount && exp.paymentMethod
    );

    if (!isValid) {
      showToast("error", "Please fill all required fields for each expense");
      return;
    }

    try {
      // Start loading state
      setIsSubmitting(true);

      // First, upload any files to Cloudinary and get their URLs
      const expensesWithDocs = await Promise.all(
        expenses.map(async (exp) => {
          let documents = [];

          if (exp.file) {
            // Create form data for Cloudinary upload
            const formData = new FormData();
            formData.append("file", exp.file);

            // Upload the file to Cloudinary through our backend
            const uploadResponse = await axiosInstance.post(
              "/upload",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            // If successful, add the Cloudinary file info to documents
            if (uploadResponse.data && uploadResponse.data.fileUrl) {
              documents.push({
                fileName: uploadResponse.data.fileName,
                fileUrl: uploadResponse.data.fileUrl,
                filePublicId: uploadResponse.data.publicId, // Store Cloudinary public ID
                format: uploadResponse.data.format,
                fileResourceType: uploadResponse.data.resourceType,
              });
            }
          }

          // Return expense data in the format expected by backend
          return {
            category: exp.category,
            amount: parseFloat(exp.amount),
            date: exp.date,
            paymentMethod: exp.paymentMethod,
            description: exp.description,
            documents: documents,
          };
        })
      );

      // Now submit all expenses to the backend
      const response = await axiosInstance.post("/expense/createExpense", {
        expenses: expensesWithDocs,
      });
      if (response.status === 201) {
        // Show success message
        showToast("success", "Expenses submitted successfully!");

        // Reset the form after successful submission
        setExpenses([
          {
            id: Date.now(),
            category: "",
            date: new Date().toISOString().split("T")[0],
            amount: "",
            description: "",
            paymentMethod: "",
            file: null,
            fileName: "No file chosen",
            filePublicId: null,
            fileResourceType: null,
          },
        ]);

        // Animation on submit
        gsap.to(formRef.current, {
          y: -10,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        });
      }
    } catch (error) {
      console.error("Error submitting expenses:", error);

      // Show appropriate error message
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit expenses. Please try again.";
      showToast("error", errorMessage);
    } finally {
      // End loading state
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Mobile-optimized background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-0 w-40 h-40 bg-indigo-100/20 rounded-full blur-2xl"></div>

      {/* Toast Notifications - Mobile optimized */}
      {toast.show && (
        <div
          className={`fixed top-4 left-4 right-4 p-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all z-50 backdrop-blur-sm border ${
            toast.type === "success"
              ? "bg-emerald-50/95 text-emerald-800 border-emerald-200 shadow-emerald-100"
              : "bg-rose-50/95 text-rose-800 border-rose-200 shadow-rose-100"
          }`}
        >
          <div
            className={`p-2 rounded-full flex-shrink-0 ${
              toast.type === "success" ? "bg-emerald-100" : "bg-rose-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="text-emerald-600" size={20} />
            ) : (
              <AlertCircle className="text-rose-600" size={20} />
            )}
          </div>
          <p className="font-semibold text-sm flex-1">{toast.message}</p>
        </div>
      )}

      <div className="px-4 py-6">
        {/* Mobile Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Request
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Submit your expenses easily
              </p>
            </div>
            {/* Enhanced Mobile History Button - Always Visible */}
            <Link href="/expense/expenseHistory">
              <div
                ref={historyBtnRef}
                className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-[#0179a4] text-[#0179a4] rounded-2xl shadow-lg hover:bg-[#0179a4] hover:text-white active:scale-95 transition-all duration-200 font-semibold opacity-100"
                style={{ opacity: 1, visibility: "visible" }}
              >
                <History size={20} />
                <span className="text-sm font-bold">History</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile Form Container */}
        <div
          ref={formRef}
          className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-4 border border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {expenses.map((expense, index) => (
              <div
                key={expense.id}
                id={`expense-${expense.id}`}
                className="expense-item bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-gray-100/50 relative"
              >
                {/* Mobile Card Header */}
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0179a4] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Expense {index + 1}
                    </h3>
                  </div>
                  {expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpense(expense.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100 rounded-xl transition-all active:scale-95"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Mobile Form Fields - Single Column */}
                <div className="space-y-5">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={expense.category}
                      onChange={(e) =>
                        handleChange(expense.id, "category", e.target.value)
                      }
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-base bg-white/70 backdrop-blur-sm appearance-none"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold z-10">
                        ₹
                      </div>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={expense.amount}
                        onChange={(e) =>
                          handleChange(expense.id, "amount", e.target.value)
                        }
                        className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-base bg-white/70 backdrop-blur-sm"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={expense.date}
                        onChange={(e) =>
                          handleChange(expense.id, "date", e.target.value)
                        }
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-base bg-white/70 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={expense.paymentMethod}
                      onChange={(e) =>
                        handleChange(
                          expense.id,
                          "paymentMethod",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-base bg-white/70 backdrop-blur-sm appearance-none"
                      required
                    >
                      <option value="">Select payment method</option>
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={expense.description}
                      onChange={(e) =>
                        handleChange(expense.id, "description", e.target.value)
                      }
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-base bg-white/70 backdrop-blur-sm resize-none"
                      placeholder="Enter expense details..."
                      rows={3}
                    />
                  </div>

                  {/* File Upload - Mobile optimized */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Receipt/Attachment
                    </label>
                    <div className="space-y-3">
                      <label
                        htmlFor={`file-input-${expense.id}`}
                        className="flex items-center justify-center gap-3 w-full px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer active:scale-95 transition-all duration-200"
                      >
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <FaPaperclip className="text-blue-600" size={16} />
                        </div>
                        <span className="text-base font-medium text-blue-700">
                          {expense.file ? "Change File" : "Choose File"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          id={`file-input-${expense.id}`}
                          className="hidden"
                          onChange={(e) => handleFileChange(expense.id, e)}
                        />
                      </label>

                      {expense.file && (
                        <div className="flex items-center justify-between bg-gray-50/80 border border-gray-200 px-4 py-3 rounded-xl">
                          <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                            {expense.fileName}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(expense.id)}
                            className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors active:scale-95 flex-shrink-0"
                          >
                            <FaTrashAlt size={14} />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 text-center">
                        Upload receipt or supporting document (optional)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Action Buttons */}
            <div className="space-y-4 pt-2">
              {/* Add Another Expense Button */}
              <button
                type="button"
                onClick={addExpense}
                className="w-full flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl text-gray-600 hover:text-blue-600 bg-gray-50/50 hover:bg-blue-50/50 transition-all duration-300 active:scale-95"
              >
                <div className="p-2 bg-gray-200 hover:bg-blue-200 rounded-xl mr-3 transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="font-semibold text-base">
                  Add Another Expense
                </span>
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative overflow-hidden bg-[#0179a4] text-white px-6 py-5 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none active:scale-95 disabled:scale-100 disabled:opacity-70"
              >
                <span className="relative z-10">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Expenses"
                  )}
                </span>
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
