'use client';
import { AlertCircle, CheckCircle, FolderOpen, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

// Simple multi-select component (since react-select isn't available)
const MultiSelect = ({ options, value, onChange, placeholder, disabled, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOptions = options.filter(option => value.includes(option.value));

  const handleToggle = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue) => {
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className="relative">
      <div
        className={`w-full min-h-[48px] px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none cursor-pointer ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map(option => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#0179a4] text-white text-sm rounded-md"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(option.value);
                  }}
                  className="ml-1 hover:bg-blue-700 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-sm">No options available</div>
          ) : (
            options.map(option => (
              <div
                key={option.value}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${value.includes(option.value) ? 'bg-blue-50 text-[#0179a4]' : ''
                  }`}
                onClick={() => handleToggle(option.value)}
              >
                <span>{option.label}</span>
                {value.includes(option.value) && (
                  <CheckCircle size={16} className="text-[#0179a4]" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'Self': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Client': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function AddTeamMember() {
  const [formData, setFormData] = useState({
    projectName: '',
    selectedEmployees: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const response = await fetch('${process.env.NEXT_PUBLIC_BACKEND_API}/tasks/getTasks', {
          credentials: 'include',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data) {
          setProjects(result.data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch unassigned employees when project is selected
  useEffect(() => {
    const fetchUnassignedEmployees = async () => {
      if (!formData.projectName) {
        setEmployees([]);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/tasks/getUnassignedUsers?bucketName=${encodeURIComponent(formData.projectName)}`,
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

        if (result.data) {
          // Transform the data to match our component structure
          const transformedEmployees = result.data.map((emp) => ({
            value: emp._id,
            label: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            phoneNumber: emp.phoneNumber || 'Not provided',
          }));

          setEmployees(transformedEmployees);
        }
      } catch (error) {
        console.error('Error fetching unassigned employees:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnassignedEmployees();
  }, [formData.projectName]);

  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    const project = projects.find(p => p.bucketName === projectName);

    setFormData({
      ...formData,
      projectName,
      selectedEmployees: [],
    });

    setSelectedTask(project);

    if (errors.projectName) {
      setErrors({ ...errors, projectName: '' });
    }
  };

  const handleEmployeesChange = (selectedEmployeeIds) => {
    setFormData({
      ...formData,
      selectedEmployees: selectedEmployeeIds
    });

    if (errors.selectedEmployees) {
      setErrors({ ...errors, selectedEmployees: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName) newErrors.projectName = 'Project name is required';
    if (formData.selectedEmployees.length === 0) newErrors.selectedEmployees = 'At least one employee must be selected';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || !selectedTask) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/tasks/updateTagMembers/${selectedTask._id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tagMembers: formData.selectedEmployees
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.message === "Tag members updated successfully") {
        setSubmitSuccess(true);

        // Reset form after 2 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
          setFormData({
            projectName: '',
            selectedEmployees: [],
          });
          setSelectedTask(null);
        }, 2000);
      } else {
        throw new Error('Failed to add team members');
      }
    } catch (error) {
      console.error('Error adding team members:', error);
      setErrors({ submit: 'Failed to add team members. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        onChange={onChange}
        disabled={loading}
        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="">{loading ? 'Loading...' : placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.display || option.label || option}
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

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
          <p className="text-gray-600 mb-4">
            {formData.selectedEmployees.length > 1
              ? `${formData.selectedEmployees.length} team members have been added to the project successfully!`
              : 'Team member has been added to the project successfully!'
            }
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
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
            <Users className="text-[#0179a4]" size={36} />
            Add Team Members to Project
          </h1>
          <div className="w-32 h-1 bg-[#0179a4] rounded-full"></div>
          <p className="text-gray-600 mt-3">
            Select a project and assign multiple employees to join the team
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
              {/* Project Name Selection */}
              <SelectField
                icon={FolderOpen}
                label="Select Project"
                name="projectName"
                options={projects.map(project => ({
                  value: project.bucketName,
                  label: (
                    <div className="flex items-center justify-between w-full">
                      <span>{project.bucketName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(project.projectCategory)} ml-2`}>
                        {project.projectCategory || 'N/A'}
                      </span>
                    </div>
                  ),
                  display: project.bucketName // For the selected value display
                }))}
                placeholder="Choose a project"
                required
                onChange={handleProjectChange}
              />
              {selectedTask && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Project Name: </span>
                      <span className="text-gray-800">{selectedTask.bucketName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">Category: </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(selectedTask.projectCategory)}`}>
                        {selectedTask.projectCategory || 'N/A'}
                      </span>
                    </div>
                    {selectedTask.projectCategory === 'Client' && selectedTask.clientId && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-600">Client: </span>
                        <span className="text-gray-800">{selectedTask.clientId.name}</span>
                        {selectedTask.clientId.email && (
                          <span className="text-gray-500 ml-2">({selectedTask.clientId.email})</span>
                        )}
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-600">Description: </span>
                      <span className="text-gray-800">{selectedTask.taskDescription || 'No description available'}</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Multiple Employee Selection */}
              {formData.projectName && (
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
                    <Users size={16} className="text-[#0179a4]" />
                    Select Employees
                    <span className="text-red-500">*</span>
                  </label>
                  <MultiSelect
                    options={employees}
                    value={formData.selectedEmployees}
                    onChange={handleEmployeesChange}
                    placeholder={employees.length === 0 ? "No unassigned employees available" : "Choose employees to add to the project"}
                    disabled={loading || employees.length === 0}
                    error={errors.selectedEmployees}
                  />
                  {errors.selectedEmployees && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.selectedEmployees}
                    </p>
                  )}
                  {formData.selectedEmployees.length > 0 && (
                    <p className="text-sm text-gray-600">
                      {formData.selectedEmployees.length} employee{formData.selectedEmployees.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}

              {/* Error Display */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {errors.submit}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || formData.selectedEmployees.length === 0 || loading || employees.length === 0}
                className={`px-12 py-4 bg-[#0179a4] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${isSubmitting || formData.selectedEmployees.length === 0 || loading || employees.length === 0 ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding to Project...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Users size={20} />
                    Add {formData.selectedEmployees.length > 0 ? `${formData.selectedEmployees.length} ` : ''}to Project
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
              <span>Selected employees will be assigned to the project</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text-[#0179a4]" />
              <span>Team notifications will be sent automatically</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text-[#0179a4]" />
              <span>Project access permissions will be granted</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text-[#0179a4]" />
              <span>All employees will receive project details via email</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}