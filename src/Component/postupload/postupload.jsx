"use client"
import React, { useState, useRef, useEffect } from "react";
import {
  FaTrashAlt,
  FaTimes,
  FaCalendarAlt,
  FaUsers,
  FaFilter,
  FaSearch,
  FaImage,
  FaFilePdf,
  FaClock,
  FaTag,
  FaChevronDown,
  FaPlus,
  FaEdit,
  FaEye,
  FaCheckCircle,
  FaExclamationCircle,
  FaPaperPlane,
  FaSave,
  FaSpinner,
  FaBell
} from "react-icons/fa";
import { useRouter } from 'next/navigation';

// API Base URL - adjust according to your setup
const API_BASE_URL = 'http://localhost:4110/api';

// Utility function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken'); // Adjust token key as needed

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }

  return await response.json();
};

// Upload file function
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  return await response.json();
};

// Toast Component
const Toast = ({ message, type = "success", show, onClose }) => (
  <div
    className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
  >
    <div className={`flex items-center px-6 py-4 rounded-lg shadow-lg ${type === "success" ? "bg-green-500" :
        type === "error" ? "bg-red-500" :
          type === "warning" ? "bg-yellow-500" : "bg-blue-500"
      } text-white`}>
      {type === "success" && <FaCheckCircle className="mr-2" />}
      {type === "error" && <FaExclamationCircle className="mr-2" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-75">
        <FaTimes size={14} />
      </button>
    </div>
  </div>
);

// Multi-Select Dropdown Component
const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  

  const toggleOption = (optionId) => {
    if (optionId === 'all') {
      onChange(['all']);
    } else {
      const newSelected = selected.includes('all')
        ? [optionId]
        : selected.includes(optionId)
          ? selected.filter(id => id !== optionId)
          : [...selected.filter(id => id !== 'all'), optionId];
      onChange(newSelected);
    }
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.includes('all')) return 'All Employees';
    if (selected.length === 1) {
      const option = options.find(opt => opt.id === selected[0]);
      return option?.name || "";
    }
    return `${selected.length} selected`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className="text-gray-700">{getDisplayText()}</span>
        <FaChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label key={option.id} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option.id)}
                onChange={() => toggleOption(option.id)}
                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-gray-900">{option.name}</span>
                <span className="ml-2 text-sm text-gray-500">({option.count})</span>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Schedule Modal Component
const ScheduleModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [scheduleData, setScheduleData] = useState({
    type: "immediate",
    datetime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    recurring: false,
    recurringType: "daily",
    endDate: "",
    ...initialData
  });

  const handleSave = () => {
    onSave(scheduleData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Schedule Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When to post
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheduleType"
                  value="immediate"
                  checked={scheduleData.type === "immediate"}
                  onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value })}
                  className="mr-2"
                />
                Post immediately
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheduleType"
                  value="scheduled"
                  checked={scheduleData.type === "scheduled"}
                  onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value })}
                  className="mr-2"
                />
                Schedule for later
              </label>
            </div>
          </div>

          {scheduleData.type === "scheduled" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleData.datetime}
                  onChange={(e) => setScheduleData({ ...scheduleData, datetime: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={scheduleData.recurring}
                  onChange={(e) => setScheduleData({ ...scheduleData, recurring: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                  Make this a recurring post
                </label>
              </div>

              {scheduleData.recurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat
                  </label>
                  <select
                    value={scheduleData.recurringType}
                    onChange={(e) => setScheduleData({ ...scheduleData, recurringType: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Schedule
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Post Component
const CreatePost = ({ onPostCreated, onPreview, positions }) => {
  const [formData, setFormData] = useState({
    message: "",
    note: "",
    postType: "announcement",
    priority: "medium",
    targetAudience: { positions: ["all"] },
    tags: [],
    attachments: []
  });

  const [scheduleSettings, setScheduleSettings] = useState({ type: "immediate" });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [currentTag, setCurrentTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
const router = useRouter();
const PostClick=(()=>{
  router.push('/postupload/posthistory');
})
  const fileInputRef = useRef(null);

  const POST_TEMPLATES = [
    { id: "announcement", name: "Announcement", icon: "📢" },
    { id: "meeting", name: "Meeting", icon: "🤝" },
    { id: "training", name: "Training", icon: "📚" },
    { id: "policy", name: "Policy Update", icon: "📋" },
    { id: "celebration", name: "Celebration", icon: "🎉" },
    { id: "reminder", name: "Reminder", icon: "⏰" }
  ];

  const PRIORITY_LEVELS = [
    { id: "low", name: "Low", color: "bg-green-100 text-green-800" },
    { id: "medium", name: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { id: "high", name: "High", color: "bg-red-100 text-red-800" },
    { id: "urgent", name: "Urgent", color: "bg-red-200 text-red-900" }
  ];

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit");
      return;
    }

    setFile(selectedFile);
    setUploadingFile(true);

    try {
      // Upload file immediately
      const uploadResult = await uploadFile(selectedFile);

      // Update attachments in form data
      const newAttachment = {
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.fileUrl,
        publicId: uploadResult.publicId,
        format: uploadResult.format,
        fileResourceType: uploadResult.fileResourceType
      };

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));

      // Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
        setFileType(selectedFile.type.startsWith("image/") ? "image" : "pdf");
      };
      reader.readAsDataURL(selectedFile);

    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileType(null);
    setFormData(prev => ({ ...prev, attachments: [] }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.message.trim()) return "Please enter a message";
    if (!formData.note.trim()) return "Please enter a note";
    if (formData.targetAudience.positions.length === 0) return "Please select target audience";
    if (scheduleSettings.type === "scheduled" && !scheduleSettings.datetime) {
      return "Please set schedule date and time";
    }
    return null;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft) {
      const validationError = validateForm();
      if (validationError) {
        alert(validationError);
        return;
      }
    }

    setIsLoading(true);
    try {
      const postData = {
        ...formData,
        schedule: scheduleSettings,
        status: isDraft ? 'draft' : 'published'
      };

      const endpoint = isDraft ? '/admin/draft' : '/admin/create';
      const result = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(postData)
      });

      // Reset form
      setFormData({
        message: "",
        note: "",
        postType: "announcement",
        priority: "medium",
        targetAudience: { positions: ["all"] },
        tags: [],
        attachments: []
      });
      setScheduleSettings({ type: "immediate" });
      removeFile();

      onPostCreated(result.data, isDraft);

    } catch (error) {
      console.error('Submit error:', error);
      alert(error.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewData = () => ({
    ...formData,
    schedule: scheduleSettings,
    file: file?.name,
    filePreview,
    fileType
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Post Type Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POST_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setFormData(prev => ({ ...prev, postType: template.id }))}
                className={`p-4 rounded-lg border-2 transition-all ${formData.postType === template.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <div className="text-sm font-medium">{template.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your message here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note *
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add additional notes..."
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>

          {!filePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              {uploadingFile ? (
                <div className="flex flex-col items-center">
                  <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
                  <p className="text-lg font-medium text-gray-700">Uploading...</p>
                </div>
              ) : (
                <>
                  <div className="text-4xl text-gray-400 mb-4">📎</div>
                  <p className="text-lg font-medium text-gray-700">Click to upload files</p>
                  <p className="text-sm text-gray-500 mt-1">Images and PDFs up to 10MB</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {fileType === "image" ? (
                    <FaImage className="text-blue-500 mr-3" />
                  ) : (
                    <FaFilePdf className="text-red-500 mr-3" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{file?.name}</p>
                    <p className="text-sm text-gray-500">
                      {file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrashAlt />
                </button>
              </div>

              {fileType === "image" && (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf"
          />
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                <FaTag className="mr-1" size={12} />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 hover:text-blue-600"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTag()}
              placeholder="Add a tag..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTag}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Priority */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Level</h3>
          <div className="space-y-2">
            {PRIORITY_LEVELS.map((level) => (
              <label key={level.id} className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value={level.id}
                  checked={formData.priority === level.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="mr-3"
                />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                  {level.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FaUsers className="inline mr-2" />
            Target Audience
          </h3>
          <MultiSelectDropdown
            options={positions}
            selected={formData.targetAudience.positions}
            onChange={(selected) => setFormData(prev => ({
              ...prev,
              targetAudience: { ...prev.targetAudience, positions: selected }
            }))}
            placeholder="Select positions"
          />
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FaClock className="inline mr-2" />
            Schedule
          </h3>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="w-full p-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
          >
            {scheduleSettings.type === "immediate" ? (
              <span className="flex items-center">
                <FaClock className="mr-2 text-green-500" />
                Post immediately
              </span>
            ) : (
              <span className="flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-500" />
                Scheduled for {new Date(scheduleSettings.datetime).toLocaleString()}
              </span>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Creating Post...
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2" />
                Create Post
              </>
            )}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center justify-center"
          >
            <FaSave className="mr-2" />
            Save as Draft
          </button>
          <button
            onClick={PostClick}
            className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center justify-center"
          >
            <FaEye className="mr-2" />
            Post Historyb
          </button>
        </div>
      </div>

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSave={setScheduleSettings}
        initialData={scheduleSettings}
      />
    </div>
  );
};

// Preview Component
const Preview = ({ previewData, positions }) => {
  const POST_TEMPLATES = [
    { id: "announcement", name: "Announcement", icon: "📢" },
    { id: "meeting", name: "Meeting", icon: "🤝" },
    { id: "training", name: "Training", icon: "📚" },
    { id: "policy", name: "Policy Update", icon: "📋" },
    { id: "celebration", name: "Celebration", icon: "🎉" },
    { id: "reminder", name: "Reminder", icon: "⏰" }
  ];

  const PRIORITY_LEVELS = [
    { id: "low", name: "Low", color: "bg-green-100 text-green-800" },
    { id: "medium", name: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { id: "high", name: "High", color: "bg-red-100 text-red-800" },
    { id: "urgent", name: "Urgent", color: "bg-red-200 text-red-900" }
  ];

  const getTargetCount = () => {
    if (!previewData?.targetAudience?.positions) return 0;

    if (previewData.targetAudience.positions.includes('all')) {
      return positions.find(p => p.id === 'all')?.count || 0;
    }

    return previewData.targetAudience.positions.reduce((sum, posId) => {
      const position = positions.find(p => p.id === posId);
      return sum + (position?.count || 0);
    }, 0);
  };

  if (!previewData?.message && !previewData?.note) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-500">Start creating your post to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Post Preview</h3>

        <div className="space-y-6">
          {/* Post Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div>
                <p className="font-medium text-gray-900">Admin</p>
                <p className="text-sm text-gray-500">
                  {previewData.schedule?.type === "immediate"
                    ? "Now"
                    : new Date(previewData.schedule?.datetime).toLocaleString()}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_LEVELS.find(p => p.id === previewData.priority)?.color
              }`}>
              {PRIORITY_LEVELS.find(p => p.id === previewData.priority)?.name}
            </span>
          </div>

          {/* Post Content */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">{previewData.message}</h4>
            <p className="text-gray-700">{previewData.note}</p>
          </div>

          {/* File Preview */}
          {previewData.filePreview && (
            <div className="border border-gray-200 rounded-lg p-4">
              {previewData.fileType === "image" ? (
                <img
                  src={previewData.filePreview}
                  alt="Attached image"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaFilePdf className="text-red-500 mr-3 text-xl" />
                  <span className="font-medium text-gray-900">{previewData.file}</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {previewData.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previewData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  <FaTag className="mr-1" size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Target Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Distribution</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Post Type:</span>
                <span className="font-medium">
                  {POST_TEMPLATES.find(t => t.id === previewData.postType)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Target Audience:</span>
                <span className="font-medium">
                  {previewData.targetAudience?.positions?.includes("all")
                    ? "All Employees"
                    : `${previewData.targetAudience?.positions?.length || 0} Position${previewData.targetAudience?.positions?.length > 1 ? 's' : ''}`
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Recipients:</span>
                <span className="font-medium">{getTargetCount()} employees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Drafts Component
const Drafts = ({ onEdit }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const POST_TEMPLATES = [
    { id: "announcement", name: "Announcement", icon: "📢" },
    { id: "meeting", name: "Meeting", icon: "🤝" },
    { id: "training", name: "Training", icon: "📚" },
    { id: "policy", name: "Policy Update", icon: "📋" },
    { id: "celebration", name: "Celebration", icon: "🎉" },
    { id: "reminder", name: "Reminder", icon: "⏰" }
  ];

  const PRIORITY_LEVELS = [
    { id: "low", name: "Low", color: "bg-green-100 text-green-800" },
    { id: "medium", name: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { id: "high", name: "High", color: "bg-red-100 text-red-800" },
    { id: "urgent", name: "Urgent", color: "bg-red-200 text-red-900" }
  ];

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/admin/getAllPosts?status=draft');
      setDrafts(response.posts || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (draftId) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;

    try {
      await apiCall(`/admin/${draftId}`, { method: 'DELETE' });
      setDrafts(drafts.filter(draft => draft._id !== draftId));
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Failed to delete draft');
    }
  };

  const publishDraft = async (draft) => {
    try {
      const postData = {
        ...draft,
        status: 'published',
        publishedAt: new Date()
      };

      await apiCall(`/admin/${draft._id}`, {
        method: 'PUT',
        body: JSON.stringify(postData)
      });

      fetchDrafts(); // Refresh drafts list
      alert('Draft published successfully!');
    } catch (error) {
      console.error('Error publishing draft:', error);
      alert('Failed to publish draft');
    }
  };

  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.note.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || draft.postType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Draft Posts</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search drafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {POST_TEMPLATES.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredDrafts.length > 0 ? (
          <div className="space-y-4">
            {filteredDrafts.map((draft) => (
              <div key={draft._id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 truncate max-w-md">
                        {draft.message.length > 50 ? `${draft.message.substring(0, 50)}...` : draft.message}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_LEVELS.find(p => p.id === draft.priority)?.color
                        }`}>
                        {PRIORITY_LEVELS.find(p => p.id === draft.priority)?.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        {POST_TEMPLATES.find(t => t.id === draft.postType)?.icon}{' '}
                        {POST_TEMPLATES.find(t => t.id === draft.postType)?.name}
                      </span>
                      <span>Last edited {getTimeAgo(draft.updatedAt || draft.createdAt)}</span>
                      <span>
                        {draft.targetAudience?.positions?.includes("all")
                          ? "All employees"
                          : `${draft.targetAudience?.positions?.length || 0} position${draft.targetAudience?.positions?.length > 1 ? 's' : ''}`
                        }
                      </span>
                    </div>
                    {draft.note && (
                      <p className="text-sm text-gray-600 mt-2 truncate max-w-2xl">
                        {draft.note.length > 100 ? `${draft.note.substring(0, 100)}...` : draft.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(draft)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Draft"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => publishDraft(draft)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Publish Draft"
                    >
                      <FaPaperPlane />
                    </button>
                    <button
                      onClick={() => deleteDraft(draft._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Draft"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📄</div>
            <p>No drafts found</p>
            <p className="text-sm mt-2">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start creating posts to save drafts"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Post Management Component
export default function PostManagementSystem() {
  const [activeTab, setActiveTab] = useState("create");
  const [positions, setPositions] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loadingPositions, setLoadingPositions] = useState(true);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoadingPositions(true);
      const response = await apiCall('/admin/positions');
      setPositions(response.positions || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
      // Fallback positions if API fails
      setPositions([
        { id: "all", name: "All Employees", count: 245 },
        { id: "hr", name: "Human Resources", count: 12 },
        { id: "management", name: "Management", count: 8 },
        { id: "engineering", name: "Engineering", count: 85 },
        { id: "sales", name: "Sales", count: 45 },
        { id: "marketing", name: "Marketing", count: 23 },
        { id: "finance", name: "Finance", count: 18 },
        { id: "operations", name: "Operations", count: 32 },
        { id: "support", name: "Customer Support", count: 22 }
      ]);
    } finally {
      setLoadingPositions(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handlePostCreated = (postData, isDraft) => {
    if (isDraft) {
      showToast('Draft saved successfully!', 'success');
      setActiveTab('drafts');
    } else {
      showToast('Post created successfully!', 'success');
    }
  };

  const handlePreview = (data) => {
    setPreviewData(data);
    setActiveTab('preview');
  };

  const handleEditDraft = (draft) => {
    // For now, just show a toast. In a real app, you'd populate the create form
    showToast('Edit functionality would populate the create form with draft data', 'info');
    setActiveTab('create');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning! 🌅";
    if (hour < 17) return "Good Afternoon! ☀️";
    return "Good Evening! 🌙";
  };

  if (loadingPositions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Post Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Post Management</h1>
            <p className="text-gray-600 mt-1">{getGreeting()}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "create", name: "Create Post", icon: FaPlus },
              { id: "preview", name: "Preview", icon: FaEye },
              { id: "drafts", name: "Drafts", icon: FaEdit },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <tab.icon className="mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === "create" && (
          <CreatePost
            onPostCreated={handlePostCreated}
            onPreview={handlePreview}
            positions={positions}
          />
        )}

        {activeTab === "preview" && (
          <Preview
            previewData={previewData}
            positions={positions}
          />
        )}

        {activeTab === "drafts" && (
          <Drafts onEdit={handleEditDraft} />
        )}
      </div>

      {/* Quick Stats Sidebar */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <FaBell className="mr-2 text-blue-500" />
          Quick Stats
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Employees:</span>
            <span className="font-medium">{positions.find(p => p.id === 'all')?.count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Departments:</span>
            <span className="font-medium text-blue-600">{positions.length - 1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current Time:</span>
            <span className="font-medium text-green-600">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <div className="fixed bottom-4 left-4">
        <button
          className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition-colors shadow-lg"
          title="Keyboard Shortcuts"
        >
          <span className="text-xs font-mono">?</span>
        </button>
      </div>
    </div>
  );
}