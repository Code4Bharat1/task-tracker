"use client"
import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Eye,
    Calendar,
    FileText,
    ImageIcon,
    File,
    X,
    ChevronDown,
    SortAsc,
    SortDesc
} from 'lucide-react';

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [previewModal, setPreviewModal] = useState({ show: false, file: null, type: null });
    const [downloadingFiles, setDownloadingFiles] = useState(new Set());
    const [fileErrors, setFileErrors] = useState(new Set());
    const [notifications, setNotifications] = useState([]);

    const showNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:4110/api/admin/getUserPosts', {
                    credentials: 'include'
                });
                const data = await response.json();
                setPosts(data.posts);
                setFilteredPosts(data.posts);
            } catch (error) {
                console.error('Error fetching posts:', error);
                showNotification('Failed to fetch posts', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    useEffect(() => {
        let filtered = posts.filter(post => {
            const searchMatch = post.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.note.toLowerCase().includes(searchTerm.toLowerCase());

            if (selectedFilter === 'all') return searchMatch;
            if (selectedFilter === 'with-attachments') return searchMatch && post.attachments.length > 0;
            if (selectedFilter === 'no-attachments') return searchMatch && post.attachments.length === 0;
            if (selectedFilter === 'images') return searchMatch && post.attachments.some(att => att.fileName.match(/\.(jpg|jpeg|png|gif)$/i));
            if (selectedFilter === 'documents') return searchMatch && post.attachments.some(att => att.fileName.match(/\.(pdf|doc|docx)$/i));

            return searchMatch;
        });

        // Sort posts
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        setFilteredPosts(filtered);
    }, [posts, searchTerm, selectedFilter, sortOrder]);

    const handleDownload = async (attachment) => {
        const fileKey = `${attachment.fileUrl}-${attachment.fileName}`;

        if (downloadingFiles.has(fileKey)) return;

        setDownloadingFiles(prev => new Set([...prev, fileKey]));

        try {
            const response = await fetch('http://localhost:4110/api/admin/proxyDownload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Add this line to match PostHistory
                body: JSON.stringify({
                    fileUrl: attachment.fileUrl,
                    fileName: attachment.fileName,
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = attachment.fileName; // This ensures proper filename and extension
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Remove from error set if it was there
                setFileErrors(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(fileKey);
                    return newSet;
                });
            } else {
                throw new Error(`Download failed with status ${response.status}`);
            }
        } catch (error) {
            console.error('Download failed:', error);
            setFileErrors(prev => new Set([...prev, fileKey]));
            showNotification(`Failed to download ${attachment.fileName}. File may not exist.`, 'error');
        } finally {
            setDownloadingFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(fileKey);
                return newSet;
            });
        }
    };

    const handlePreview = (attachment) => {
        const fileKey = `${attachment.fileUrl}-${attachment.fileName}`;

        // Check if file has known errors
        if (fileErrors.has(fileKey)) {
            showNotification(`Cannot preview ${attachment.fileName}. File may not exist.`, 'error');
            return;
        }

        const fileExtension = attachment.fileName.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
        const isPdf = fileExtension === 'pdf';

        setPreviewModal({
            show: true,
            file: attachment,
            type: isImage ? 'image' : isPdf ? 'pdf' : 'other'
        });
    };

    const handleImageError = (attachment) => {
        const fileKey = `${attachment.fileUrl}-${attachment.fileName}`;
        setFileErrors(prev => new Set([...prev, fileKey]));
        showNotification(`Failed to load ${attachment.fileName}. File may not exist.`, 'error');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
            return <ImageIcon className="w-4 h-4" />;
        } else if (['pdf', 'doc', 'docx'].includes(extension)) {
            return <FileText className="w-4 h-4" />;
        }
        return <File className="w-4 h-4" />;
    };

    const filterOptions = [
        { value: 'all', label: 'All Posts' },
        { value: 'with-attachments', label: 'With Attachments' },
        { value: 'no-attachments', label: 'No Attachments' },
        { value: 'images', label: 'Images Only' },
        { value: 'documents', label: 'Documents Only' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center ml-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 ml-64">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Posts</h1>
                    <p className="text-gray-600">Manage and view all company posts</p>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-4">
                            {/* Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                >
                                    <Filter className="w-4 h-4" />
                                    {filterOptions.find(opt => opt.value === selectedFilter)?.label}
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {showFilterDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        {filterOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSelectedFilter(option.value);
                                                    setShowFilterDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${selectedFilter === option.value ? 'bg-blue-50 text-blue-700' : ''
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sort */}
                            <button
                                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                            >
                                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                                Date
                            </button>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredPosts.length} of {posts.length} posts
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                        <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="p-6">
                                {/* Post Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(post.createdAt)}
                                    </div>
                                </div>

                                {/* Message */}
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {post.message}
                                </h3>

                                {/* Note */}
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {post.note}
                                </p>

                                {/* Attachments */}
                                {post.attachments.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            Attachments ({post.attachments.length})
                                        </h4>
                                        {post.attachments.map((attachment, index) => {
                                            const fileKey = `${attachment.fileUrl}-${attachment.fileName}`;
                                            const hasError = fileErrors.has(fileKey);
                                            const isDownloading = downloadingFiles.has(fileKey);
                                            const fileExtension = attachment.fileName.split('.').pop().toLowerCase();
                                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
                                            const isPdf = fileExtension === 'pdf';

                                            return (
                                                <div
                                                    key={index}
                                                    className={`flex items-center justify-between p-3 rounded-lg ${hasError ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        {/* Image Preview or File Icon */}
                                                        {isImage && !hasError ? (
                                                            <img
                                                                src={attachment.fileUrl}
                                                                alt="Preview"
                                                                className="w-8 h-8 object-cover rounded"
                                                                onError={() => handleImageError(attachment)}
                                                            />
                                                        ) : (
                                                            getFileIcon(attachment.fileName)
                                                        )}
                                                        <span className={`text-sm truncate ${hasError ? 'text-red-700' : 'text-gray-700'}`}>
                                                            {attachment.fileName}
                                                        </span>
                                                        {hasError && (
                                                            <span className="text-xs text-red-500 ml-2">
                                                                (File not found)
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Action Buttons - Hide Eye icon for PDFs */}
                                                    <div className="flex gap-2">
                                                        {/* Only show preview button for non-PDF files */}
                                                        {!isPdf && (
                                                            <button
                                                                onClick={() => handlePreview(attachment)}
                                                                disabled={hasError}
                                                                className={`p-1 transition-colors ${hasError
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-gray-500 hover:text-blue-600'
                                                                    }`}
                                                                title={hasError ? "File not available" : "Preview"}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDownload(attachment)}
                                                            disabled={isDownloading}
                                                            className={`p-1 transition-colors ${isDownloading
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : hasError
                                                                    ? 'text-gray-400 hover:text-orange-600'
                                                                    : 'text-gray-500 hover:text-green-600'
                                                                }`}
                                                            title={
                                                                isDownloading
                                                                    ? "Downloading..."
                                                                    : hasError
                                                                        ? "Try download anyway"
                                                                        : "Download"
                                                            }
                                                        >
                                                            {isDownloading ? (
                                                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                                            ) : (
                                                                <Download className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* No attachments message */}
                                {post.attachments.length === 0 && (
                                    <div className="text-center py-4 text-gray-400 text-sm">
                                        No attachments
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredPosts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-2">No posts found</div>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                )}

                {/* Preview Modal */}
                {previewModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-4xl max-h-full w-full flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="text-lg font-semibold">{previewModal.file.fileName}</h3>
                                <button
                                    onClick={() => setPreviewModal({ show: false, file: null, type: null })}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 p-4 overflow-auto">
                                {previewModal.type === 'image' ? (
                                    <div className="relative">
                                        <img
                                            src={previewModal.file.fileUrl}
                                            alt={previewModal.file.fileName}
                                            className="max-w-full h-auto mx-auto"
                                            onError={() => handleImageError(previewModal.file)}
                                        />
                                    </div>
                                ) : previewModal.type === 'pdf' ? (
                                    <div className="relative">
                                        <iframe
                                            src={previewModal.file.fileUrl}
                                            className="w-full h-96 border-0"
                                            title={previewModal.file.fileName}
                                            onError={() => handleImageError(previewModal.file)}
                                        />
                                        <div className="mt-2 text-xs text-gray-500 text-center">
                                            If the PDF doesn't load, the file may not be available.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                                        <button
                                            onClick={() => handleDownload(previewModal.file)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Download File
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 p-4 border-t">
                                <button
                                    onClick={() => handleDownload(previewModal.file)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button
                                    onClick={() => setPreviewModal({ show: false, file: null, type: null })}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications */}
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 max-w-sm ${notification.type === 'success'
                                ? 'bg-green-500 text-white'
                                : notification.type === 'error'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-blue-500 text-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {notification.type === 'success' && (
                                    <div className="w-4 h-4 rounded-full bg-white text-green-500 flex items-center justify-center text-xs">
                                        ✓
                                    </div>
                                )}
                                {notification.type === 'error' && (
                                    <div className="w-4 h-4 rounded-full bg-white text-red-500 flex items-center justify-center text-xs">
                                        ✕
                                    </div>
                                )}
                                <span className="text-sm">{notification.message}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Posts;