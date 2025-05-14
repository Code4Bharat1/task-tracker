'use client'
import { useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';

export default function BankInformation() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    branchNameLeft: '',
    branchNameRight: '',
    ifscCode: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    // Clear error for this field
    if (errors[id]) {
      setErrors({ ...errors, [id]: null });
    }
    
    // If updating account number or confirm account number, validate match
    if (id === 'accountNumber' || id === 'confirmAccountNumber') {
      validateAccountNumbers(id, value);
    }
  };

  // Validate account numbers match
  const validateAccountNumbers = (field, value) => {
    const newErrors = { ...errors };
    
    if (field === 'accountNumber') {
      if (formData.confirmAccountNumber && value !== formData.confirmAccountNumber) {
        newErrors.confirmAccountNumber = "Account numbers don't match";
      } else if (formData.confirmAccountNumber) {
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

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    document.getElementById('fileUpload').click();
  };

  return (
   <div className="max-w-5xl mx-auto pt-6 px-6 pb-3 bg-white rounded-md sha">

      <h1 className="text-2xl font-bold mb-6">
        Bank Information
        <div className="h-1 w-32 bg-yellow-400 mt-1"></div>
      </h1>
      
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="fullName">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="As Per Your Bank Account"
                className="w-[400px] p-2 border border-gray-300 rounded-md shadow-lg"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="accountNumber">
                Account Number
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="accountNumber"
                  placeholder="Enter account number"
                  className="w-[400px] p-2 border border-gray-300 rounded-md shadow-lg"
                  value={formData.accountNumber}
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  className="absolute left-90 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="branchNameLeft">
                Branch Name
              </label>
              <input
                type="text"
                id="branchNameLeft"
                className="w-[400px] p-2 border border-gray-300 rounded-md shadow-lg"
                value={formData.branchNameLeft}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="branchNameRight">
                Branch Name
              </label>
              <input
                type="text"
                id="branchNameRight"
                className="w-[400px] p-2 border border-gray-300 rounded-md shadow-lg"
                value={formData.branchNameRight}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="confirmAccountNumber">
                Confirm Account Number
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmAccountNumber"
                  placeholder="Re-enter account number"
                  className={`w-[400px] p-2 border rounded-md shadow-sm ${
                    errors.confirmAccountNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.confirmAccountNumber}
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmAccountNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmAccountNumber}</p>
              )}
            </div>
            
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="ifscCode">
                IFSC Code
              </label>
              <input
                type="text"
                id="ifscCode"
                className="w-full p-2 border border-gray-300 rounded-md shadow-lg"
                value={formData.ifscCode}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        {/* Document Upload Section */}
        <div className="mt-8">
          <label className="block text-lg font-medium mb-2">
            Document Attach
          </label>
          <div className="relative">
            <select className="w-48 p-2 border border-gray-300 rounded-md shadow-lg appearance-none bg-white pr-8">
              <option>Pass Book</option>
              <option>Bank Statement</option>
              <option>Cancelled Cheque</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div 
            onClick={triggerFileUpload}
            className="mt-4 border-2 border-dashed border-gray-300 rounded-md p-12 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <input
              type="file"
              className="hidden"
              id="fileUpload"
              onChange={handleFileChange}
            />
            
            {!file ? (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-4 text-gray-500">
                  <Upload size={48} />
                </div>
                <p className="text-lg font-medium">Upload File</p>
                <p className="text-sm text-gray-500 mt-1">Click to browse files</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-4 text-green-500">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <p className="text-lg font-medium text-green-700">File Uploaded</p>
                <p className="text-sm text-gray-700 mt-1 truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">Click to change file</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Information
          </button>
        </div>
      </div>
    </div>
  );
}