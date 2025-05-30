import { useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Copy, ExternalLink } from 'lucide-react';

export default function VideoCallPage() {
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [userName, setUserName] = useState('');
  const [copied, setCopied] = useState(false);

  const meetingId = "123 456 7890";
  const zoomLink = "https://zoom.us/j/1234567890?pwd=example";
  const meetingPassword = "meeting123";

  const handleJoinCall = () => {
    if (userName.trim()) {
      setIsJoined(true);
    }
  };

  const handleLeaveCall = () => {
    setIsJoined(false);
    setUserName('');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(zoomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isJoined) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">Team Meeting</h1>
            <p className="text-sm text-gray-300">Meeting ID: {meetingId}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-400">● Connected as {userName}</span>
            <span className="text-xs bg-gray-700 px-2 py-1 rounded">3 participants</span>
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
            <div className="bg-gray-800 rounded-lg relative overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <span className="text-2xl font-bold">J</span>
                  </div>
                  <p className="text-sm">John Doe</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg relative overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <span className="text-2xl font-bold">S</span>
                  </div>
                  <p className="text-sm">Sarah Wilson</p>
                </div>
              </div>
            </div>
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
          <p className="text-blue-100">Team Meeting</p>
        </div>

        {/* Meeting Info */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Meeting Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Meeting ID:</span>
                <span className="font-mono font-semibold">{meetingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Password:</span>
                <span className="font-mono font-semibold">{meetingPassword}</span>
              </div>
            </div>
          </div>

          {/* Zoom Link */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-800">Zoom Link</h4>
              <button
                onClick={copyLink}
                className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={zoomLink}
                readOnly
                className="flex-1 text-xs bg-white border border-green-200 rounded px-2 py-1 text-gray-600"
              />
              <a
                href={zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Join Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <button
              onClick={handleJoinCall}
              disabled={!userName.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              Join Video Call
            </button>
          </div>

          {/* Alternative Options */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">Or join with</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Phone
              </button>
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Browser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}