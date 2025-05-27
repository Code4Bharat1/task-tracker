"use client";
import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Upload,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Save,
  Edit,
} from "lucide-react";

export default function MobileBankInformation() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    branchName: "",
    bankName: "",
    ifscCode: "",
    documentType: "Pass Book",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDocumentDropdown, setShowDocumentDropdown] = useState(false);

  // Mock fetch function (replace with actual API call)
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      // Simulated API call
      setTimeout(() => {
        setFormData({
          fullName: "John Doe",
          accountNumber: "1234567890123456",
          confirmAccountNumber: "1234567890123456",
          branchName: "Main Branch",
          bankName: "State Bank of India",
          ifscCode: "SBIN0123456",
          documentType: "Pass Book",
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching personal info:", error);
      showError(
        "Unable to fetch your bank information. Please try again later."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;

    if (
      (id === "accountNumber" || id === "confirmAccountNumber") &&
      !/^\d*$/.test(value)
    ) {
      return;
    }

    if (id === "ifscCode") {
      const upperValue = value.toUpperCase();
      if (!/^[A-Z0-9]*$/.test(upperValue)) {
        return;
      }
      setFormData({ ...formData, [id]: upperValue });
    } else {
      setFormData({ ...formData, [id]: value });
    }

    if (errors[id]) {
      setErrors({ ...errors, [id]: null });
    }

    if (id === "accountNumber" || id === "confirmAccountNumber") {
      validateAccountNumbers(id, value);
    }
  };

  const handleDocumentTypeChange = (value) => {
    setFormData({ ...formData, documentType: value });
    setShowDocumentDropdown(false);
  };

  const validateAccountNumbers = (field, value) => {
    const newErrors = { ...errors };

    if (field === "accountNumber") {
      if (
        formData.confirmAccountNumber &&
        value !== formData.confirmAccountNumber
      ) {
        newErrors.confirmAccountNumber = "Account numbers don't match";
      } else {
        newErrors.confirmAccountNumber = null;
      }
    } else if (field === "confirmAccountNumber") {
      if (formData.accountNumber && value !== formData.accountNumber) {
        newErrors.confirmAccountNumber = "Account numbers don't match";
      } else {
        newErrors.confirmAccountNumber = null;
      }
    }

    setErrors(newErrors);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        showError("Please upload only PDF or image files (JPEG, PNG)");
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        showError("File size should not exceed 5MB");
        return;
      }

      setFile(selectedFile);
      setErrors({ ...errors, file: null });
    }
  };

  const triggerFileUpload = () => {
    document.getElementById("fileUpload").click();
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage("");
    }, 5000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (
      formData.accountNumber.length < 9 ||
      formData.accountNumber.length > 18
    ) {
      newErrors.accountNumber =
        "Account number should be between 9 and 18 digits";
    }

    if (!formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Please confirm your account number";
    } else if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers don't match";
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = "Branch name is required";
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = "Invalid IFSC code format (e.g., SBIN0123456)";
    }

    if (!file && !isEditing) {
      newErrors.file = "Please upload a bank document";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSave = async () => {
    if (isEditing) {
      if (!validateForm()) {
        showError("Please fix all errors before saving.");
        return;
      }

      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          showSuccess("Bank information saved successfully!");
          setIsEditing(false);
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Error saving user info:", error);
        showError("Failed to save bank information. Please try again later.");
        setLoading(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    fetchUserInfo();
    setIsEditing(false);
    setFile(null);
    setErrors({});
    setShowDocumentDropdown(false);
  };

  const documentOptions = ["Pass Book", "Bank Statement", "Cancelled Cheque"];

  return (
    <div className="min-h-screen bg-white p-3 sm:p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#058CBF] to-[#69b0c9] px-4 py-6 text-white">
          <h1 className="text-xl font-bold">Bank Information</h1>
        </div>

        <div className="p-4 space-y-4 overflow-hidden">
          {/* Instructions Panel */}
          <div className="bg-blue-50 border-l-4 border-cyan-400 p-3 rounded">
            <div className="flex items-start">
              <Info
                className="text-cyan-500 mt-0.5 flex-shrink-0 mr-2"
                size={16}
              />
              <div className="text-xs">
                <p className="font-semibold text-cyan-700 mb-1">
                  Instructions:
                </p>
                <ul className="text-cyan-600 space-y-1">
                  <li>• All fields with * are mandatory</li>
                  <li>• Name must match bank records exactly</li>
                  <li>• Upload clear document scan/photo</li>
                  <li>• Max file size: 5MB</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
              <div className="flex items-center">
                <CheckCircle
                  className="text-green-500 flex-shrink-0 mr-2"
                  size={16}
                />
                <p className="text-green-700 text-sm flex-1">
                  {successMessage}
                </p>
                <button
                  onClick={() => setSuccessMessage("")}
                  className="text-green-700"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
              <div className="flex items-center">
                <AlertCircle
                  className="text-red-500 flex-shrink-0 mr-2"
                  size={16}
                />
                <p className="text-red-700 text-sm flex-1">{errorMessage}</p>
                <button
                  onClick={() => setErrorMessage("")}
                  className="text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-blue-600 flex items-center justify-center py-4">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                className="block text-sm font-medium mb-2 text-gray-700"
                htmlFor="fullName"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="As per your bank account"
                className={`w-full p-3 border rounded-lg text-sm ${
                  errors.fullName
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Bank Name */}
            <div>
              <label
                className="block text-sm font-medium mb-2 text-gray-700"
                htmlFor="bankName"
              >
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bankName"
                className={`w-full p-3 border rounded-lg text-sm ${
                  errors.bankName
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Enter bank name"
                disabled={!isEditing}
              />
              {errors.bankName && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> {errors.bankName}
                </p>
              )}
            </div>

            {/* Branch Name */}
            <div>
              <label
                className="block text-sm font-medium mb-2 text-gray-700"
                htmlFor="branchName"
              >
                Branch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="branchName"
                className={`w-full p-3 border rounded-lg text-sm ${
                  errors.branchName
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                value={formData.branchName}
                onChange={handleChange}
                placeholder="Enter branch name"
                disabled={!isEditing}
              />
              {errors.branchName && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> {errors.branchName}
                </p>
              )}
            </div>

            {/* IFSC Code */}
            <div>
              <label
                className="block text-sm font-medium mb-2 text-gray-700"
                htmlFor="ifscCode"
              >
                IFSC Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ifscCode"
                className={`w-full p-3 border rounded-lg text-sm ${
                  errors.ifscCode
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g. SBIN0123456"
                disabled={!isEditing}
                maxLength={11}
              />
              {errors.ifscCode && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> {errors.ifscCode}
                </p>
              )}
              {!errors.ifscCode && isEditing && (
                <p className="mt-1 text-xs text-gray-500">
                  Format: 4 letters + 0 + 6 characters
                </p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label
                className="block text-sm font-medium mb-2 text-gray-700"
                htmlFor="accountNumber"
              >
                Account Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="accountNumber"
                  placeholder="Enter account number"
                  className={`w-full p-3 pr-12 border rounded-lg text-sm ${
                    errors.accountNumber
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={formData.accountNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength={18}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={!isEditing}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.accountNumber && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" />{" "}
                  {errors.accountNumber}
                </p>
              )}
            </div>

            {/* Confirm Account Number */}
            <div>
              <label
                className="block text-sm font-medium mb-2 text-gray-700"
                htmlFor="confirmAccountNumber"
              >
                Confirm Account Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmAccountNumber"
                  placeholder="Re-enter account number"
                  className={`w-full p-3 pr-12 border rounded-lg text-sm ${
                    errors.confirmAccountNumber
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={formData.confirmAccountNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength={18}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 p-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  disabled={!isEditing}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmAccountNumber && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" />{" "}
                  {errors.confirmAccountNumber}
                </p>
              )}
            </div>

            {/* Document Type - Custom Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Document Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  onClick={() =>
                    isEditing && setShowDocumentDropdown(!showDocumentDropdown)
                  }
                  className={`w-full p-3 pr-10 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#058CBF] text-left ${
                    !isEditing
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "text-gray-900"
                  }`}
                  disabled={!isEditing}
                >
                  {formData.documentType}
                </button>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showDocumentDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {showDocumentDropdown && isEditing && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 max-h-40 overflow-y-auto">
                    {documentOptions.map((option, index) => (
                      <button
                        key={option}
                        onClick={() => handleDocumentTypeChange(option)}
                        className={`w-full px-4 py-3 text-sm text-left hover:bg-blue-50 ${
                          index < documentOptions.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Upload Document <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={triggerFileUpload}
                className={`w-full p-3 border-2 border-dashed rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                  isEditing
                    ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!isEditing}
              >
                <Upload size={18} />
                {file ? "Change Document" : "Upload Document"}
              </button>
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <p className="mt-1 text-xs text-gray-500 text-center">
                PDF, JPEG, PNG (Max: 5MB)
              </p>

              {file && (
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center text-green-700 text-sm">
                    <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="text-xs">
                        Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errors.file && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> {errors.file}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <button
              type="button"
              onClick={handleEditSave}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                isEditing
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  : "bg-[#018ABE] hover:bg-[#5c8b9d] text-white shadow-lg"
              } disabled:opacity-50`}
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : isEditing ? (
                <>
                  <Save size={16} /> Save Changes
                </>
              ) : (
                <>
                  <Edit size={16} /> Edit Information
                </>
              )}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
