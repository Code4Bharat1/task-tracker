"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { CheckCircle, AlertCircle, Plus, History } from "lucide-react";
import { FaTrashAlt, FaRegCalendarAlt, FaPaperclip } from "react-icons/fa";
import { axiosInstance } from "@/lib/axiosInstance";
import Link from "next/link";
import { useGSAP } from "@gsap/react";

export default function Expense() {
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

          // console.log('Cloudinary upload response:', uploadResponse.data);
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
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Toast Notifications */}
      {toast.show && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all z-50 backdrop-blur-sm border ${
            toast.type === "success"
              ? "bg-emerald-50/90 text-emerald-800 border-emerald-200 shadow-emerald-100"
              : "bg-rose-50/90 text-rose-800 border-rose-200 shadow-rose-100"
          }`}
        >
          <div
            className={`p-1 rounded-full ${
              toast.type === "success" ? "bg-emerald-100" : "bg-rose-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="text-emerald-600" size={18} />
            ) : (
              <AlertCircle className="text-rose-600" size={18} />
            )}
          </div>
          <p className="font-semibold text-sm">{toast.message}</p>
        </div>
      )}

      {/* Header Section with Title and History Button */}
      <div className="max-w-4xl mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-8">
        <div className="relative">
          <h1 className="text-3xl font-bold text-black">Expense Request</h1>
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-[-4px] h-[2.5px] bg-[#0179a4] w-full scale-x-0 rounded-full"
          ></span>
        </div>

        {/* History Button */}
        <Link href="/expense/expenseHistory">
          <div
            ref={historyBtnRef}
            className="group flex items-center gap-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-blue-200/50 hover:border-blue-300 text-blue-700 px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-100/50"
          >
            <div className="p-1 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <History size={20} />
            </div>
            <span className="font-semibold">View History</span>
          </div>
        </Link>
      </div>

      {/* Expense Form */}
      <div
        ref={formRef}
        className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-6 sm:p-8 border border-white/20 max-w-4xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {expenses.map((expense, index) => (
            <div
              key={expense.id}
              id={`expense-${expense.id}`}
              className="expense-item bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group"
            >
              {/* Header with expense number and remove button */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0179a4] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Expense Entry
                  </h3>
                </div>
                {expenses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExpense(expense.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl text-sm font-medium"
                  >
                    <FaTrashAlt size={12} />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Category Dropdown */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={expense.category}
                      onChange={(e) =>
                        handleChange(expense.id, "category", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm bg-white/50 backdrop-blur-sm"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={expense.date || ""}
                        placeholder="Select date"
                        className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50 backdrop-blur-sm"
                        onFocus={() =>
                          document
                            .getElementById(`real-date-${expense.id}`)
                            ?.showPicker?.()
                        }
                        onChange={(e) =>
                          handleChange(expense.id, "date", e.target.value)
                        }
                        required
                      />
                      <input
                        type="date"
                        id={`real-date-${expense.id}`}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) =>
                          handleChange(expense.id, "date", e.target.value)
                        }
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-slate-100 rounded-lg">
                        <FaRegCalendarAlt
                          onClick={() =>
                            document
                              .getElementById(`real-date-${expense.id}`)
                              ?.showPicker?.()
                          }
                          className="text-slate-500 cursor-pointer hover:text-blue-500 transition-colors"
                          size={16}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Amount */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Amount <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute text-white px-2 py-1 rounded-lg text-sm font-bold">
                        ₹
                      </div>
                      <input
                        type="number"
                        value={expense.amount}
                        onChange={(e) =>
                          handleChange(expense.id, "amount", e.target.value)
                        }
                        className="w-full px-2 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm bg-white/50 backdrop-blur-sm"
                        placeholder="Eg. 400"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm bg-white/50 backdrop-blur-sm"
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
                </div>

                {/* Description (full width) */}
                <div className="lg:col-span-2 group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={expense.description}
                    onChange={(e) =>
                      handleChange(expense.id, "description", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm bg-white/50 backdrop-blur-sm resize-none"
                    placeholder="Enter expense details..."
                    rows={3}
                  />
                </div>

                {/* File Upload (full width) */}
                <div className="lg:col-span-2 group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Receipt/Attachment
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label
                      htmlFor={`file-input-${expense.id}`}
                      className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="p-1 bg-blue-100 rounded-lg">
                        <FaPaperclip className="text-blue-600" size={14} />
                      </div>
                      <span className="text-sm font-medium text-blue-700">
                        Choose File
                      </span>
                      <input
                        type="file"
                        id={`file-input-${expense.id}`}
                        className="hidden"
                        onChange={(e) => handleFileChange(expense.id, e)}
                      />
                    </label>
                    <div className="flex-1 min-w-0 flex items-center justify-between bg-slate-50 border-2 border-slate-200 px-4 py-3 rounded-xl">
                      <span className="text-sm text-slate-700 truncate">
                        {expense.fileName}
                      </span>
                      {expense.file && (
                        <button
                          type="button"
                          onClick={() => removeFile(expense.id)}
                          className="ml-2 p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Upload receipt or supporting document (optional)
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={addExpense}
              className="group flex items-center justify-center px-6 py-4 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl text-slate-600 hover:text-blue-600 bg-slate-50/50 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer"
            >
              <div className="p-1 bg-slate-200 group-hover:bg-blue-200 rounded-lg mr-3 transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <span className="font-semibold">Add Another Expense</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 relative overflow-hidden bg-[#0179a4] text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
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
  );
}
