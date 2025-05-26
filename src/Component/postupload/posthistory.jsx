"use client"
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const PostHistory = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/admin/getAllPosts`,
          {
            withCredentials: true
          }
        );
        setPosts(response.data.posts || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const isImageFile = (fileName) => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'zip':
      case 'rar':
        return '🗜️';
      default:
        return '📎';
    }
  };

  const downloadFile = async (fileUrl, fileName, e) => {
    e.stopPropagation();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/admin/proxyDownload`,
        { fileUrl, fileName },
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      // Fallback to direct download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getDateRange = (range) => {
    const today = new Date();
    switch (range) {
      case 'today':
        return new Date(today.setHours(0, 0, 0, 0));
      case 'week':
        return new Date(today.setDate(today.getDate() - 7));
      case 'month':
        return new Date(today.setMonth(today.getMonth() - 1));
      case 'quarter':
        return new Date(today.setMonth(today.getMonth() - 3));
      case 'year':
        return new Date(today.setFullYear(today.getFullYear() - 1));
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Enhanced filtering logic
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Tab filtering
      if (activeTab === 'published' && post.status !== 'published') return false;
      if (activeTab === 'draft' && post.status !== 'draft') return false;
      if (activeTab === 'scheduled' && post.status !== 'scheduled') return false;
      if (activeTab === 'withAttachments' && (!post.attachments || post.attachments.length === 0)) return false;
      if (activeTab === 'withImages' && (!post.attachments || !post.attachments.some(att => isImageFile(att.fileName)))) return false;
      if (activeTab === 'withDocuments' && (!post.attachments || !post.attachments.some(att => !isImageFile(att.fileName)))) return false;

      // Search filtering
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!post.message?.toLowerCase().includes(query) &&
            !post.note?.toLowerCase().includes(query) &&
            !post.tags?.some(tag => tag.toLowerCase().includes(query))) {
          return false;
        }
      }

      // Date range filtering
      if (selectedDateRange !== 'all') {
        const rangeDate = getDateRange(selectedDateRange);
        if (rangeDate && new Date(post.createdAt) < rangeDate) return false;
      }

      // Priority filtering
      if (selectedPriority !== 'all' && post.priority !== selectedPriority) return false;

      // Status filtering
      if (selectedStatus !== 'all' && post.status !== selectedStatus) return false;

      return true;
    });
  }, [posts, activeTab, searchQuery, selectedDateRange, selectedPriority, selectedStatus]);

  // Enhanced sorting logic
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'attachmentsDesc':
          return (b.attachments?.length || 0) - (a.attachments?.length || 0);
        case 'alphabetical':
          return (a.message || '').localeCompare(b.message || '');
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [filteredPosts, sortOption]);

  // Statistics
  const statistics = useMemo(() => {
    const total = posts.length;
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;
    const scheduled = posts.filter(p => p.status === 'scheduled').length;
    const withAttachments = posts.filter(p => p.attachments?.length > 0).length;
    const withImages = posts.filter(p => p.attachments?.some(att => isImageFile(att.fileName))).length;
    const urgent = posts.filter(p => p.priority === 'urgent').length;

    return { total, published, drafts, scheduled, withAttachments, withImages, urgent };
  }, [posts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading posts...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your content</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="text-red-500 text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-800 text-lg">Unable to load posts</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderPostModal = () => {
    if (!selectedPost) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setSelectedPost(null)}>
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPost.message}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPost.status)}`}>
                    {selectedPost.status?.charAt(0).toUpperCase() + selectedPost.status?.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedPost.priority)}`}>
                    {selectedPost.priority?.charAt(0).toUpperCase() + selectedPost.priority?.slice(1)} Priority
                  </span>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold rounded-full p-2 hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedPost(null)}
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6">
            {selectedPost.note && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">📝</span>
                  Note
                </h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">{selectedPost.note}</p>
              </div>
            )}

            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">🏷️</span>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedPost.targetAudience && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">👥</span>
                  Target Audience
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Positions:</strong> {selectedPost.targetAudience.positions?.join(', ') || 'None'}
                  </p>
                  {selectedPost.targetAudience.departments && selectedPost.targetAudience.departments.length > 0 && (
                    <p className="text-gray-700 mt-2">
                      <strong>Departments:</strong> {selectedPost.targetAudience.departments.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedPost.attachments && selectedPost.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">📎</span>
                  Attachments ({selectedPost.attachments.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPost.attachments.map((attachment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {isImageFile(attachment.fileName) ? (
                        <div>
                          <img
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzI4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                          <div className="p-3">
                            <p className="font-medium text-sm text-gray-900 truncate">{attachment.fileName}</p>
                            <button
                              onClick={(e) => downloadFile(attachment.fileUrl, attachment.fileName, e)}
                              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex items-center">
                          <div className="text-3xl mr-3">{getFileIcon(attachment.fileName)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{attachment.fileName}</p>
                            <button
                              onClick={(e) => downloadFile(attachment.fileUrl, attachment.fileName, e)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mt-1"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Created:</strong> {formatDate(selectedPost.createdAt)}
                </div>
                <div>
                  <strong>Updated:</strong> {formatDate(selectedPost.updatedAt)}
                </div>
                {selectedPost.publishedAt && (
                  <div>
                    <strong>Published:</strong> {formatDate(selectedPost.publishedAt)}
                  </div>
                )}
                {selectedPost.schedule?.scheduledAt && (
                  <div>
                    <strong>Scheduled for:</strong> {formatDate(selectedPost.schedule.scheduledAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatistics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
        <div className="text-sm text-gray-500">Total Posts</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-green-600">{statistics.published}</div>
        <div className="text-sm text-gray-500">Published</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-gray-600">{statistics.drafts}</div>
        <div className="text-sm text-gray-500">Drafts</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-blue-600">{statistics.scheduled}</div>
        <div className="text-sm text-gray-500">Scheduled</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-purple-600">{statistics.withAttachments}</div>
        <div className="text-sm text-gray-500">With Files</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-indigo-600">{statistics.withImages}</div>
        <div className="text-sm text-gray-500">With Images</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-red-600">{statistics.urgent}</div>
        <div className="text-sm text-gray-500">Urgent</div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📭</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {searchQuery ?
          `No posts matching "${searchQuery}" were found. Try adjusting your search term or filters.` :
          "There are no posts available with the current filters. Try changing your filter settings or create your first post."
        }
      </p>
      {(searchQuery || selectedDateRange !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all') && (
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedDateRange('all');
            setSelectedPriority('all');
            setSelectedStatus('all');
            setActiveTab('all');
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedPosts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          onClick={() => setSelectedPost(post)}
        >
          {post.attachments?.find(att => isImageFile(att.fileName)) && (
            <div className="h-48 overflow-hidden bg-gray-100 relative">
              <img
                src={post.attachments.find(att => isImageFile(att.fileName)).fileUrl}
                alt="Post thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzI4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                }}
              />
              {post.attachments.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                  +{post.attachments.length - 1} more
                </div>
              )}
            </div>
          )}
          
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{post.message}</h3>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(post.priority)}`}>
                {post.priority}
              </span>
            </div>

            {post.note && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.note}</p>
            )}

            <div className="flex items-center justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                {post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
              </span>
              
              {post.attachments && post.attachments.length > 0 && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {post.attachments.length}
                </div>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs">
                    +{post.tags.length - 2} more
                  </span>
                )}
              </div>
            )}

            <div className="text-xs text-gray-400 flex items-center justify-between">
              <span>{getRelativeTime(post.createdAt)}</span>
              {post.schedule?.type === 'scheduled' && (
                <span className="text-blue-500">📅 Scheduled</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedPost(post)}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1 pr-4">{post.message}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                      {post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(post.priority)}`}>
                      {post.priority}
                    </span>
                  </div>
                </div>
                
                {post.note && (
                  <p className="text-gray-600 mb-3 line-clamp-3">{post.note}</p>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {post.attachments && post.attachments.length > 0 && (
                <div className="ml-6 flex items-center text-sm text-gray-500">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="font-medium">{post.attachments.length} {post.attachments.length === 1 ? 'file' : 'files'}</span>
                </div>
              )}
            </div>

            {post.attachments?.filter(att => isImageFile(att.fileName)).length > 0 && (
              <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                {post.attachments.filter(att => isImageFile(att.fileName)).slice(0, 4).map((attachment, idx) => (
                  <div className="flex-shrink-0" key={idx}>
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjcyODEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>
                ))}
                {post.attachments.filter(att => isImageFile(att.fileName)).length > 4 && (
                  <div className="flex-shrink-0 flex items-center justify-center h-20 w-20 bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-600">
                    +{post.attachments.filter(att => isImageFile(att.fileName)).length - 4}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>Created: {getRelativeTime(post.createdAt)}</span>
                {post.publishedAt && post.publishedAt !== post.createdAt && (
                  <span>Published: {getRelativeTime(post.publishedAt)}</span>
                )}
                {post.schedule?.scheduledAt && (
                  <span className="text-blue-600">Scheduled: {formatDate(post.schedule.scheduledAt)}</span>
                )}
              </div>
              
              {post.targetAudience?.positions && (
                <div className="text-right">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    👥 {post.targetAudience.positions.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedPost && renderPostModal()}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Post Management</h1>
          <p className="text-gray-600 text-lg">Browse, filter, and manage all your posts in one place</p>
        </div>

        {/* Statistics */}
        {renderStatistics()}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Search posts, notes, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${showFilters ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                className={`px-4 py-3 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="quarter">Past Quarter</option>
                    <option value="year">Past Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority">By Priority</option>
                    {/* <option value="attachmentsDesc">Most Attachments</option> */}
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>

              {(searchQuery || selectedDateRange !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all') && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Active filters: {[
                      searchQuery && `Search: "${searchQuery}"`,
                      selectedDateRange !== 'all' && `Date: ${selectedDateRange}`,
                      selectedPriority !== 'all' && `Priority: ${selectedPriority}`,
                      selectedStatus !== 'all' && `Status: ${selectedStatus}`
                    ].filter(Boolean).join(', ')}
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDateRange('all');
                      setSelectedPriority('all');
                      setSelectedStatus('all');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 bg-white rounded-t-xl">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'all', name: 'All Posts', count: statistics.total },
                { id: 'published', name: 'Published', count: statistics.published },
                { id: 'draft', name: 'Drafts', count: statistics.drafts },
                { id: 'scheduled', name: 'Scheduled', count: statistics.scheduled },
                { id: 'withAttachments', name: 'With Files', count: statistics.withAttachments },
                { id: 'withImages', name: 'With Images', count: statistics.withImages },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-gray-600">
            Showing <span className="font-medium text-gray-900">{sortedPosts.length}</span> of{' '}
            <span className="font-medium text-gray-900">{posts.length}</span> posts
            {activeTab !== 'all' && (
              <span className="ml-2 text-sm">
                • Filtered by: <span className="font-medium">{activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {sortedPosts.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="animate-in fade-in duration-300">
            {viewMode === 'grid' ? renderGridView() : renderListView()}
          </div>
        )}

        {/* Load More (if pagination is needed in the future) */}
        {sortedPosts.length > 0 && (
          <div className="mt-12 text-center">
            <div className="text-sm text-gray-500">
              Showing all {sortedPosts.length} posts
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostHistory;