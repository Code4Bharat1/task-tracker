'use client';
import React, { useState } from 'react';
import { User, Mail, Phone, Briefcase, Building, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export default function AddTeamMember() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    reportingManager: '',
    employeeId: '',
    joiningDate: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Predefined options for dropdowns
  const departments = [
    'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 
    'Operations', 'Customer Support', 'Design', 'Product Management'
  ];

  const roles = [
    'Software Engineer', 'Senior Software Engineer', 'Team Lead', 
    'Project Manager', 'Product Manager', 'Designer', 'QA Engineer',
    'Marketing Specialist', 'Sales Representative', 'HR Specialist',
    'Finance Analyst', 'Operations Manager', 'Customer Support Representative'
  ];

  const managers = [
    'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
    'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez'
  ];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone.replace(/\D/g, ''));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Input restrictions
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
      return;
    }
    
    if ((name === 'firstName' || name === 'lastName') && /[^A-Za-z\s]/.test(value)) return;
    
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          department: '',
          role: '',
          reportingManager: '',
          employeeId: '',
          joiningDate: '',
        });
      }, 2000);
    }, 1500);
  };

  const InputField = ({ icon: Icon, label, name, type = 'text', required = false, ...props }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
        <Icon size={16} className="text-blue-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
          errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        {...props}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle size={14} />
          {errors[name]}
        </p>
      )}
    </div>
  );

  const SelectField = ({ icon: Icon, label, name, options, placeholder, required = false }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
        <Icon size={16} className="text-[#0179a4]" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
          errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle size={14} />
          {errors[name]}
        </p>
      )}
    </div>
  );

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
          <p className="text-gray-600 mb-4">
            Team member has been added successfully. You will be redirected shortly.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white  p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <UserPlus className="text-[#0179a4]" size={36} />
            Add Team Member
          </h1>
          <div className="w-32 h-1 bg-[#0179a4] rounded-full"></div>
          <p className="text-gray-600 mt-3">
            Add a new team member to your organization with their essential details
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-[#0179a4] px-8 py-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <User size={20} />
              Employee Information
            </h2>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Personal Information */}
              <InputField
                icon={User}
                label="First Name"
                name="firstName"
                placeholder="Enter first name"
                required
              />

              <InputField
                icon={User}
                label="Last Name"
                name="lastName"
                placeholder="Enter last name"
                required
              />

              <InputField
                icon={Mail}
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter work email"
                required
              />

              <InputField
                icon={Phone}
                label="Phone Number"
                name="phone"
                placeholder="Enter 10-digit phone number"
                required
              />

              {/* Work Information */}
              <InputField
                icon={User}
                label="Employee ID"
                name="employeeId"
                placeholder="Enter employee ID"
                required
              />

              <SelectField
                icon={Building}
                label="Department"
                name="department"
                options={departments}
                placeholder="Select department"
                required
              />

              <SelectField
                icon={Briefcase}
                label="Role/Position"
                name="role"
                options={roles}
                placeholder="Select role"
                required
              />

              <SelectField
                icon={User}
                label="Reporting Manager"
                name="reportingManager"
                options={managers}
                placeholder="Select reporting manager (optional)"
              />

              <InputField
                icon={User}
                label="Joining Date"
                name="joiningDate"
                type="date"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-12 py-4 bg-[#0179a4] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:from--[#0179a4] hover:to-indigo-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding Team Member...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus size={20} />
                    Add Team Member
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#0179a4] mb-3">What happens next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text--[#0179a4]">
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text--[#0179a4]" />
              <span>Employee will receive a welcome email with login credentials</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text--[#0179a4]" />
              <span>Account will be created in the system automatically</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text--[#0179a4]" />
              <span>Manager will be notified about the new team member</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text--[#0179a4]" />
              <span>Employee profile will be added to the directory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}