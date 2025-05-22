
'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Upload, AlertCircle, CheckCircle, Info, X, Save, Edit } from 'lucide-react';

export default function BankInformation() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    branchName: '',
    bankName: '',
    ifscCode: '',
    documentType: 'Pass Book'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user bank info on mount
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/bank/getPersonalInfo`, {
        withCredentials: true
      });

      if (res.data && res.data.user) {
        // Extract first bank detail if exists
        const bankDetail = res.data.user.bankDetails && res.data.user.bankDetails.length > 0
          ? res.data.user.bankDetails[0]
          : {};

        setFormData({
          fullName: bankDetail.accountHolderName || '',
          accountNumber: bankDetail.accountNumber || '',
          confirmAccountNumber: bankDetail.accountNumber || '',
          branchName: bankDetail.branchName || '',
          bankName: bankDetail.bankName || '',
          ifscCode: bankDetail.ifscCode || '',
          documentType: bankDetail.documentType || 'Pass Book'
        });
      }
    } catch (error) {
      console.error('Error fetching personal info:', error);
      showError('Unable to fetch your bank information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Special handling for account number - only allow digits
    if ((id === 'accountNumber' || id === 'confirmAccountNumber') && !/^\d*$/.test(value)) {
      return;
    }

    // Special handling for IFSC code - uppercase and alphanumeric only
    if (id === 'ifscCode') {
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

    if (id === 'accountNumber' || id === 'confirmAccountNumber') {
      validateAccountNumbers(id, value);
    }
  };

  // Handle document type change
  const handleDocumentTypeChange = (e) => {
    setFormData({ ...formData, documentType: e.target.value });
  };

  // Validate account numbers match
  const validateAccountNumbers = (field, value) => {
    const newErrors = { ...errors };

    if (field === 'accountNumber') {
      if (formData.confirmAccountNumber && value !== formData.confirmAccountNumber) {
        newErrors.confirmAccountNumber = "Account numbers don't match";
      } else {
        newErrors.confirmAccountNumber = null;
      }
    } else if (field === 'confirmAccountNumber') {
      if (formData.accountNumber && value !== formData.accountNumber) {
        newErrors.confirmAccountNumber = "Account numbers don't match";
      } else {
        newErrors.confirmAccountNumber = null;
      }
    }

    setErrors(newErrors);
  };

  // File upload handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validate file type (PDF or images only)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type)) {
        showError('Please upload only PDF or image files (JPEG, PNG)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        showError('File size should not exceed 5MB');
        return;
      }
      
      setFile(selectedFile);
      setErrors({ ...errors, file: null });
    }
  };

  const triggerFileUpload = () => {
    document.getElementById('fileUpload').click();
  };

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  // Show error message
  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
      newErrors.accountNumber = 'Account number should be between 9 and 18 digits';
    }
    
    if (!formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Please confirm your account number';
    } else if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers don't match";
    }
    
    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }
    
    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }
    
    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format (e.g., SBIN0123456)';
    }
    
    if (!file && !isEditing) {
      newErrors.file = 'Please upload a bank document';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Toggle between edit and save
  const handleEditSave = async () => {
    if (isEditing) {
      // On Save: Validate & send data to backend
      if (!validateForm()) {
        showError("Please fix all errors before saving.");
        return;
      }

      try {
        setLoading(true);

        // Prepare form payload
        const payload = new FormData();
        payload.append('accountHolderName', formData.fullName);
        payload.append('accountNumber', formData.accountNumber);
        payload.append('branchName', formData.branchName);
        payload.append('bankName', formData.bankName);
        payload.append('ifscCode', formData.ifscCode);
        payload.append('documentType', formData.documentType);
        
        if (file) {
          payload.append('document', file);
        }

        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/bank/updateUserInfo`, payload, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        showSuccess('Bank information saved successfully!');
        
        setIsEditing(false);
        fetchUserInfo(); // Refresh data
      } catch (error) {
        console.error('Error saving user info:', error);
        
        if (error.response) {
          // Handle specific error responses from backend
          if (error.response.status === 400) {
            showError(error.response.data.message || 'Invalid input data. Please check your information.');
          } else if (error.response.status === 401) {
            showError('Session expired. Please login again.');
          } else {
            showError('Failed to save bank information. Please try again later.');
          }
        } else {
          showError('Network error. Please check your internet connection.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // On Edit: enable editing
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    fetchUserInfo();
    setIsEditing(false);
    setFile(null);
    setErrors({});
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">
        Bank Information
        <div className="h-1 w-24 sm:w-32 bg-yellow-400 mt-1"></div>
      </h1>
      
      {/* Instructions Panel */}
      <div className="bg-blue-50 p-3 rounded-md flex items-start mb-6 mt-4">
        <Info className="text-blue-500 mt-1 flex-shrink-0 mr-2" size={20} />
        <div className="text-sm">
          <p className="font-medium text-blue-700">Instructions:</p>
          <ul className="list-disc list-inside text-blue-600 space-y-1 mt-1">
            <li>All fields marked with * are mandatory</li>
            <li>Account holder name must match exactly as it appears in your bank account</li>
            <li>IFSC code format: 4 letters followed by 0 and 6 alphanumeric characters (e.g., SBIN0123456)</li>
            <li>Please upload a clear scan/photo of your passbook/statement/cheque</li>
          </ul>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 p-3 rounded-md flex items-center mb-4">
          <CheckCircle className="text-green-500 flex-shrink-0 mr-2" size={20} />
          <p className="text-green-700">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-green-700">
            <X size={18} />
          </button>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 p-3 rounded-md flex items-center mb-4">
          <AlertCircle className="text-red-500 flex-shrink-0 mr-2" size={20} />
          <p className="text-red-700">{errorMessage}</p>
          <button onClick={() => setErrorMessage('')} className="ml-auto text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {loading && (
        <div className="mb-4 text-blue-600 flex items-center font-medium">
          <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
          Loading your information...
        </div>
      )}

      <div className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="As Per Your Bank Account"
                className={`w-full p-2 border rounded-md ${
                  errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="accountNumber">
                Account Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="accountNumber"
                  placeholder="Enter account number"
                  className={`w-full p-2 pr-10 border rounded-md ${
                    errors.accountNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={formData.accountNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength={18}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={!isEditing}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.accountNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="branchName">
                Branch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="branchName"
                className={`w-full p-2 border rounded-md ${
                  errors.branchName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.branchName}
                onChange={handleChange}
                placeholder="Branch Name"
                disabled={!isEditing}
              />
              {errors.branchName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.branchName}
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="bankName">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bankName"
                className={`w-full p-2 border rounded-md ${
                  errors.bankName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Bank Name"
                disabled={!isEditing}
              />
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.bankName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="confirmAccountNumber">
                Confirm Account Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmAccountNumber"
                  placeholder="Re-enter account number"
                  className={`w-full p-2 pr-10 border rounded-md ${
                    errors.confirmAccountNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={formData.confirmAccountNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength={18}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  disabled={!isEditing}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmAccountNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.confirmAccountNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="ifscCode">
                IFSC Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ifscCode"
                className={`w-full p-2 border rounded-md ${
                  errors.ifscCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g. SBIN0123456"
                disabled={!isEditing}
                maxLength={11}
              />
              {errors.ifscCode && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.ifscCode}
                </p>
              )}
              {!errors.ifscCode && isEditing && (
                <p className="mt-1 text-xs text-gray-500">Format: 4 letters + 0 + 6 characters</p>
              )}
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">
            Document Attachment <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-4 items-start">
            <div className="w-48">
              <select 
                className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                disabled={!isEditing}
                value={formData.documentType}
                onChange={handleDocumentTypeChange}
              >
                <option>Pass Book</option>
                <option>Bank Statement</option>
                <option>Cancelled Cheque</option>
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={triggerFileUpload}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm ${
                  isEditing 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300' 
                    : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                }`}
                disabled={!isEditing}
              >
                <Upload size={16} /> Upload Document
              </button>
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <p className="mt-1 text-xs text-gray-500">Accepted formats: PDF, JPEG, PNG (Max: 5MB)</p>
              {file && (
                <div className="mt-2 text-sm flex items-center text-green-700">
                  <CheckCircle size={16} className="mr-1" />
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
              {errors.file && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.file}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleEditSave}
            disabled={loading}
            className={`rounded-md px-5 py-2 font-medium text-sm flex items-center gap-2 ${
              isEditing
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
            } transition-colors shadow-md`}
          >
            {isEditing ? (
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
              className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}