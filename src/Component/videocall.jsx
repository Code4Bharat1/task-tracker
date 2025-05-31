// src/app/video-call/page.js
"use client";
import { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Copy, ExternalLink, Loader } from 'lucide-react';

export default function VideoCall() {
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [userName, setUserName] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [otherParticipants, setOtherParticipants] = useState([]);

  const API_URL = "http://localhost:4110/api/meeting/participant";

  const handleJoinCall = async () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantName: userName }),
      });

      const data = await response.json();
      console.log('Meeting data:', data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch meeting details');
      }

      if (data.meetings.length === 0) {
        throw new Error('No meetings found for this participant');
      }
      
      // Use the first meeting for simplicity
      const meeting = data.meetings[0];
      setMeetingDetails(meeting);
      
      // Filter out the current user from participants
      const others = meeting.participants
        .filter(p => p.name.toLowerCase() !== userName.trim().toLowerCase())
        .slice(0, 2); // Only show first 2 others
      
      setOtherParticipants(others);
      
      // Auto-join the call
      setIsJoined(true);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Meeting fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCall = () => {
    setIsJoined(false);
    setUserName('');
    setMeetingDetails(null);
    setOtherParticipants([]);
  };

  const copyLink = () => {
    if (meetingDetails) {
      navigator.clipboard.writeText(meetingDetails.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-12 text-center">
          <Loader className="w-16 h-16 mx-auto animate-spin text-blue-500" />
          <p className="mt-4 text-lg font-medium text-gray-700">Finding your meeting...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we retrieve your meeting details</p>
        </div>
      </div>
    );
  }

  if (isJoined && meetingDetails) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">{meetingDetails.title}</h1>
            <p className="text-sm text-gray-300">Meeting ID: {meetingDetails.zoomMeetingId}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-400">● Connected as {userName}</span>
            <span className="text-xs bg-gray-700 px-2 py-1 rounded">
              {meetingDetails.participants.length} participants
            </span>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 bg-gray-900 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Main video (user) */}
            <div className="bg-gray-800 rounded-lg relative overflow-hidden">
              {isVideoOn ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <span className="text-2xl font-bold">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="text-sm">{userName} (You)</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <VideoOff className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">{userName} (You)</p>
                  </div>
                </div>
              )}
              {isMuted && (
                <div className="absolute bottom-2 left-2 bg-red-500 p-1 rounded">
                  <MicOff className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Other participants */}
            {otherParticipants.map((participant, index) => (
              <div key={index} className="bg-gray-800 rounded-lg relative overflow-hidden">
                <div className={`w-full h-full flex items-center justify-center ${
                  index === 0 ? 'bg-gradient-to-br from-green-600 to-teal-600' : 'bg-gradient-to-br from-orange-600 to-red-600'
                }`}>
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <span className="text-2xl font-bold">{participant.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="text-sm">{participant.name}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Placeholder for additional participants */}
            {meetingDetails.participants.length > 3 && (
              <div className="bg-gray-800 rounded-lg relative overflow-hidden">
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <span className="text-2xl font-bold">+{meetingDetails.participants.length - 3}</span>
                    </div>
                    <p className="text-sm">more participants</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-colors ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>
            
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-colors ${
                !isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
            </button>
            
            <button
              onClick={handleLeaveCall}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            >
              <Phone className="w-6 h-6 text-white transform rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Join Video Call</h1>
          <p className="text-blue-100">Enter your name to find your meeting</p>
        </div>

        {/* Join Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name as registered"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleJoinCall}
            disabled={!userName.trim() || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Finding Meeting...
              </span>
            ) : (
              'Find My Meeting'
            )}
          </button>

          {/* Info Section */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">How this works:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Enter your name exactly as it appears in meeting invites</li>
              <li>We'll find all meetings you're scheduled to attend</li>
              <li>You'll be automatically connected to the meeting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}