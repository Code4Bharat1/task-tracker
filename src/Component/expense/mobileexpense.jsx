import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  AlertCircle,
  Plus,
  History,
  X,
  ChevronDown,
  Calendar,
  Trash2,
  Paperclip,
} from "lucide-react";

export default function MobileExpense() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const underlineRef = useRef(null);
  const formRef = useRef(null);
  const historyBtnRef = useRef(null);
  const router = useRouter();

  // Custom dropdown states
  const [dropdownStates, setDropdownStates] = useState({});
  const [datePickerStates, setDatePickerStates] = useState({});

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
    },
  ]);

  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 4000);
  };

  // Handle history button click
  const handleHistoryClick = () => {
    router.push("/expense/expenseHistory");
  };

  // Custom Dropdown Component
  const CustomDropdown = ({
    id,
    value,
    onChange,
    options,
    placeholder,
    label,
    required = false,
  }) => {
    const isOpen = dropdownStates[id] || false;

    const toggleDropdown = () => {
      setDropdownStates((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    const selectOption = (option) => {
      onChange(option);
      setDropdownStates((prev) => ({
        ...prev,
        [id]: false,
      }));
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest(`#dropdown-${id}`)) {
          setDropdownStates((prev) => ({
            ...prev,
            [id]: false,
          }));
        }
      };

      if (isOpen) {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
      }
    }, [isOpen, id]);

    return (
      <div className="relative" id={`dropdown-${id}`}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div
          onClick={toggleDropdown}
          className={`w-full px-4 py-4 rounded-xl border-2 transition-all text-base bg-white/70 backdrop-blur-sm cursor-pointer flex items-center justify-between ${
            isOpen
              ? "border-blue-400 ring-4 ring-blue-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value || placeholder}
          </span>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => selectOption(option)}
                className={`px-4 py-3 cursor-pointer transition-colors text-base ${
                  value === option
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                } ${index === 0 ? "rounded-t-xl" : ""} ${
                  index === options.length - 1 ? "rounded-b-xl" : ""
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Custom Date Picker Component with Calendar
  const CustomDatePicker = ({
    id,
    value,
    onChange,
    label,
    required = false,
  }) => {
    const isOpen = datePickerStates[id] || false;
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(
      value ? new Date(value) : null
    );

    const toggleDatePicker = () => {
      setDatePickerStates((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    const formatDisplayDate = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    // Generate calendar days
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      const days = [];
      const today = new Date();

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.toDateString() === today.toDateString();
        const isSelected =
          selectedDate && date.toDateString() === selectedDate.toDateString();

        days.push({
          date,
          day: date.getDate(),
          isCurrentMonth,
          isToday,
          isSelected,
        });
      }

      return days;
    };

    const selectDate = (date) => {
      const dateStr = date.toISOString().split("T")[0];
      setSelectedDate(date);
      onChange(dateStr);
      setDatePickerStates((prev) => ({
        ...prev,
        [id]: false,
      }));
    };

    const navigateMonth = (direction) => {
      setCurrentMonth((prev) => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + direction);
        return newDate;
      });
    };

    const goToToday = () => {
      const today = new Date();
      setCurrentMonth(today);
      selectDate(today);
    };

    // Close date picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest(`#datepicker-${id}`)) {
          setDatePickerStates((prev) => ({
            ...prev,
            [id]: false,
          }));
        }
      };

      if (isOpen) {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
      }
    }, [isOpen, id]);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="relative" id={`datepicker-${id}`}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div
          onClick={toggleDatePicker}
          className={`w-full px-4 py-4 rounded-xl border-2 transition-all text-base bg-white/70 backdrop-blur-sm cursor-pointer flex items-center justify-between ${
            isOpen
              ? "border-blue-400 ring-4 ring-blue-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value ? formatDisplayDate(value) : "Select date"}
          </span>
          <Calendar size={20} className="text-gray-400" />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown size={16} className="rotate-90 text-gray-600" />
              </button>

              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown size={16} className="-rotate-90 text-gray-600" />
              </button>
            </div>

            {/* Today Button */}
            <button
              type="button"
              onClick={goToToday}
              className="w-full mb-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Today
            </button>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => day.isCurrentMonth && selectDate(day.date)}
                  disabled={!day.isCurrentMonth}
                  className={`
                    h-10 w-full text-sm rounded-lg transition-all
                    ${
                      day.isCurrentMonth
                        ? "hover:bg-blue-50 cursor-pointer"
                        : "text-gray-300 cursor-not-allowed"
                    }
                    ${
                      day.isSelected
                        ? "bg-[#0179a4] text-white font-semibold"
                        : day.isToday
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "text-gray-700"
                    }
                  `}
                >
                  {day.day}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
      },
    ]);
  };

  const removeExpense = (id) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((exp) => exp.id !== id));
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
            }
          : exp
      )
    );
    // Reset file input
    const fileInput = document.getElementById(`file-input-${id}`);
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async () => {
    // Validate all expenses
    const isValid = expenses.every(
      (exp) => exp.category && exp.date && exp.amount && exp.paymentMethod
    );

    if (!isValid) {
      showToast("error", "Please fill all required fields for each expense");
      return;
    }

    try {
      setIsSubmitting(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      showToast("success", "Expenses submitted successfully!");

      // Reset form
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
        },
      ]);
    } catch (error) {
      showToast("error", "Failed to submit expenses. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Mobile-optimized background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-0 w-40 h-40 bg-indigo-100/20 rounded-full blur-2xl"></div>

      {/* Toast Notifications */}
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
            {/* Mobile History Button */}
            <div
              ref={historyBtnRef}
              onClick={handleHistoryClick}
              className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-[#0179a4] text-[#0179a4] rounded-2xl shadow-lg hover:bg-[#0179a4] hover:text-white active:scale-95 transition-all duration-200 font-semibold cursor-pointer"
            >
              <History size={20} />
              <span className="text-sm font-bold">History</span>
            </div>
          </div>
        </div>

        {/* Mobile Form Container */}
        <div
          ref={formRef}
          className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-4 border border-white/20"
        >
          <div className="space-y-6">
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

                {/* Mobile Form Fields */}
                <div className="space-y-5">
                  {/* Custom Category Dropdown */}
                  <CustomDropdown
                    id={`category-${expense.id}`}
                    value={expense.category}
                    onChange={(value) =>
                      handleChange(expense.id, "category", value)
                    }
                    options={categories}
                    placeholder="Select category"
                    label="Category"
                    required
                  />

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

                  {/* Custom Date Picker */}
                  <CustomDatePicker
                    id={`date-${expense.id}`}
                    value={expense.date}
                    onChange={(value) =>
                      handleChange(expense.id, "date", value)
                    }
                    label="Date"
                    required
                  />

                  {/* Custom Payment Method Dropdown */}
                  <CustomDropdown
                    id={`payment-${expense.id}`}
                    value={expense.paymentMethod}
                    onChange={(value) =>
                      handleChange(expense.id, "paymentMethod", value)
                    }
                    options={paymentMethods}
                    placeholder="Select payment method"
                    label="Payment Method"
                    required
                  />

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

                  {/* File Upload */}
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
                          <Paperclip className="text-blue-600" size={16} />
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
                            <Trash2 size={14} />
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
                type="button"
                onClick={handleSubmit}
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
          </div>
        </div>
      </div>
    </div>
  );
}
