'use client';
import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, FolderOpen, UserPlus, CheckCircle, AlertCircle, Phone } from 'lucide-react';

export default function AddTeamMember() {
  const [formData, setFormData] = useState({
    projectName: '',
    selectedEmployee: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    position: 'Employee', // Constant position
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Predefined project/bucket names
  const projects = [
    'Website Redesign Project',
    'Mobile App Development',
    'Data Analytics Platform',
    'Customer Portal',
    'E-commerce Platform',
    'Marketing Campaign Tool',
    'Internal HR System',
    'Inventory Management'
  ];

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/tasks/team`,
          {
            credentials: 'include',
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.message === "Employee details retrieved successfully" && result.data) {
          // Transform the data to match our component structure
          const transformedEmployees = result.data.map((emp, index) => ({
            id: `emp${String(index + 1).padStart(3, '0')}`, // Generate ID like emp001, emp002, etc.
            name: emp.fullName,
            fullName: emp.fullName,
            email: emp.email,
            phoneNumber: emp.phoneNumber,
            position: 'Employee' // Constant position as requested
          }));
          
          setEmployees(transformedEmployees);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        // You can add error state handling here if needed
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleProjectChange = (e) => {
    setFormData({
      ...formData,
      projectName: e.target.value
    });
    
    if (errors.projectName) {
      setErrors({ ...errors, projectName: '' });
    }
  };

  const handleEmployeeChange = (e) => {
    const selectedEmployeeId = e.target.value;
    const selectedEmp = employees.find(emp => emp.id === selectedEmployeeId);
    
    if (selectedEmp) {
      setFormData({
        ...formData,
        selectedEmployee: selectedEmployeeId,
        fullName: selectedEmp.fullName,
        email: selectedEmp.email,
        phoneNumber: selectedEmp.phoneNumber,
        position: selectedEmp.position
      });
    } else {
      setFormData({
        ...formData,
        selectedEmployee: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        position: 'Employee'
      });
    }

    if (errors.selectedEmployee) {
      setErrors({ ...errors, selectedEmployee: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName) newErrors.projectName = 'Project name is required';
    if (!formData.selectedEmployee) newErrors.selectedEmployee = 'Employee selection is required';

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
          projectName: '',
          selectedEmployee: '',
          fullName: '',
          email: '',
          phoneNumber: '',
          position: 'Employee',
        });
      }, 2000);
    }, 1500);
  };

  const InputField = ({ icon: Icon, label, name, type = 'text', required = false, ...props }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
        <Icon size={16} className="text-[#0179a4]" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleProjectChange}
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

  const SelectField = ({ icon: Icon, label, name, options, placeholder, required = false, onChange }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
        <Icon size={16} className="text-[#0179a4]" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={onChange || ((e) => setFormData({...formData, [name]: e.target.value}))}
        disabled={loading}
        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
          errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="">{loading ? 'Loading employees...' : placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
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

  const DisplayField = ({ icon: Icon, label, value }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
        <Icon size={16} className="text-[#0179a4]" />
        {label}
      </label>
      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700">
        {value || 'Auto-populated when employee is selected'}
      </div>
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
            Team member has been added to the project successfully!
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <UserPlus className="text-[#0179a4]" size={36} />
            Add Team Member to Project
          </h1>
          <div className="w-32 h-1 bg-[#0179a4] rounded-full"></div>
          <p className="text-gray-600 mt-3">
            Select a project and assign an employee to join the team
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-[#0179a4] px-8 py-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FolderOpen size={20} />
              Project Assignment
            </h2>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              {/* Project Name Input */}
              <InputField
                icon={FolderOpen}
                label="Project Name"
                name="projectName"
                placeholder="Enter project/bucket name"
                required
              />

              {/* Employee Selection */}
              <SelectField
                icon={User}
                label="Select Employee"
                name="selectedEmployee"
                options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
                placeholder="Choose employee to add"
                required
                onChange={handleEmployeeChange}
              />

              {/* Auto-populated Employee Details */}
              {formData.selectedEmployee && (
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={18} className="text-[#0179a4]" />
                    Employee Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DisplayField
                      icon={User}
                      label="Full Name"
                      value={formData.fullName}
                    />

                    <DisplayField
                      icon={Mail}
                      label="Email Address"
                      value={formData.email}
                    />

                    <DisplayField
                      icon={Phone}
                      label="Phone Number"
                      value={formData.phoneNumber}
                    />

                    <DisplayField
                      icon={Briefcase}
                      label="Position"
                      value={formData.position}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.selectedEmployee || loading}
                className={`px-12 py-4 bg-[#0179a4] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                  isSubmitting || !formData.selectedEmployee || loading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding to Project...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus size={20} />
                    Add to Project
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#0179a4] mb-3">What happens next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text-[#0179a4]" />
              <span>Employee will be assigned to the selected project</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text-[#0179a4]" />
              <span>Team notification will be sent automatically</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text-[#0179a4]" />
              <span>Project access permissions will be granted</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text-[#0179a4]" />
              <span>Employee will receive project details via email</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}