import React, { useState, useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { ChevronDown, Search, Users } from "lucide-react";

// Helper function for user ID - prioritize _id over email
const getUserId = (user) => {
  // First try to get the MongoDB ObjectId
  if (user._id) return user._id;
  if (user.id) return user.id;
  
  // Fall back to email only if no ObjectId is available
  // (This should typically not be used for database operations)
  if (user.email) return user.email;
  
  console.error("User object missing both _id and email:", user);
  return null;
};

// Participant Dropdown Component
const ParticipantDropdown = ({ participants = [], selectedParticipants = [], onSelectionChange, maxUsers = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter participants based on search term
  const filteredParticipants = participants.filter(participant =>
    (participant.name && participant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (participant.username && participant.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (participant.email && participant.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle checkbox change
  const handleCheckboxChange = (participant) => {
    const participantId = getUserId(participant);
    const isSelected = selectedParticipants.some(p => getUserId(p) === participantId);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedParticipants.filter(p => getUserId(p) !== participantId);
    } else {
      // Check if we've reached the maximum limit
      if (maxUsers && selectedParticipants.length >= maxUsers) {
        toast.error(`You can only select ${maxUsers} participants for this game`);
        return;
      }
      newSelection = [...selectedParticipants, participant];
    }
    
    onSelectionChange(newSelection);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-400" />
            <span className="text-gray-500">
              {selectedParticipants.length === 0 
                ? 'Select Participants' 
                : `${selectedParticipants.length} participant${selectedParticipants.length > 1 ? 's' : ''} selected${maxUsers ? ` (${selectedParticipants.length}/${maxUsers})` : ''}`
              }
            </span>
          </div>
          <ChevronDown 
            size={20} 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Participants List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredParticipants.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No participants found
              </div>
            ) : (
              filteredParticipants.map((participant) => {
                const participantId = getUserId(participant);
                const isSelected = selectedParticipants.some(p => getUserId(p) === participantId);
                const displayName = participant.name || participant.username || participant.email || "Unknown User";
                
                return (
                  <label
                    key={participantId}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(participant)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {displayName}
                      </div>
                      {participant.email && (
                        <div className="text-xs text-gray-500 truncate">
                          {participant.email}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// User Selection Modal Component
function UserSelectionModal({
  isOpen,
  onClose,
  gameName,
  gameDisplayName,
  gameIcon,
  eventDate,  
  eventName,
  setEventName,
  setEventDate,
}) {
  const [selectedUsers, setSelectedUsers] = useState([]); // Now stores user objects instead of IDs
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentEventName, setCurrentEventName] = useState(eventName || "");
  const [currentEventDate, setCurrentEventDate] = useState(eventDate || "");
  const [time, setTime] = useState("");

  const getMaxUsers = (game) => {
    switch (game) {
      case "chess":
      case "tictactoe":
        return 2;
      case "drawize":
        return 4;
      default:
        return null;
    }
  };

  const maxUsers = getMaxUsers(gameName);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setCurrentEventName(eventName || "");
      setCurrentEventDate(eventDate || "");
      setTime("");
    } else {
      // Reset state when modal closes
      setSelectedUsers([]);
      setCurrentEventName("");
      setCurrentEventDate("");
      setTime("");
    }
  }, [isOpen, eventName, eventDate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/event/user`
      );

      // Debug: Log the response to see its structure
      console.log("API Response:", response.data);

      // Handle different possible response structures
      let users;
      if (Array.isArray(response.data)) {
        users = response.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        users = response.data.users;
      } else if (response.data && Array.isArray(response.data.data)) {
        users = response.data.data;
      } else {
        // If none of the above, log the structure and default to empty array
        console.error("Unexpected API response structure:", response.data);
        users = [];
        toast.error("Unexpected response format from server");
      }

      setAllUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      setAllUsers([]); // Ensure allUsers is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (!currentEventName.trim()) {
      toast.error("Please enter an event name");
      return;
    }

    if (!time.trim()) {
      toast.error("Please enter a valid time");
      return;
    }

    if (!currentEventDate) {
      toast.error("Please select an event date");
      return;
    }

    try {
      setLoading(true);

      // Convert user objects to IDs for the API call
      const participantIds = selectedUsers.map((user) => {
        // Get the actual ObjectId (_id), not email
        const id = user.userId || user.userId;
        if (!id) {
          console.error("User missing _id:", user);
          throw new Error(`User ${user.email || user.name || 'unknown'} is missing _id field`);
        }
        return id;
      });

      console.log("Participant IDs:", participantIds);
      console.log("Selected users:", selectedUsers);

      // Debug: Log the API endpoint and payload
      const eventApiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API}/event/create`;
      const eventPayload = {
        title: currentEventName,
        date: currentEventDate,
        time: time,
        game: gameName,
        participants: participantIds, // Ensure this is an array of ObjectIds
      };

      console.log("Creating event with:");
      console.log("API URL:", eventApiUrl);
      console.log("Payload:", JSON.stringify(eventPayload, null, 2));
      console.log("Participants type:", typeof participantIds, "isArray:", Array.isArray(participantIds));
      console.log("Backend API base:", process.env.NEXT_PUBLIC_BACKEND_API);

      // Create event with all required data including participants and game
      const eventResponse = await axiosInstance.post(eventApiUrl, eventPayload);

      console.log("Event created successfully:", eventResponse.data);

      toast.success(
        `Event "${currentEventName}" created successfully with ${selectedUsers.length} participants!`
      );
      
      // Update parent component state
      setEventName(currentEventName);
      setEventDate(currentEventDate);
      
      // Close modal
      onClose();

      // Optional: You can also call a callback to refresh events list if needed
      // if (onEventCreated) {
      //   onEventCreated(eventResponse.data);
      // }

    } catch (error) {
      console.error("Detailed error information:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // More specific error handling
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || `Server error (${status})`;
        
        if (status === 404) {
          toast.error(`API endpoint not found. Please check if the server is running and the route '/event/create' exists.`);
          console.error("404 Error - Check backend routes:");
          console.error("- Is the server running?");
          console.error("- Is the route '/event/create' defined?");
          console.error("- Is the route properly registered?");
          console.error("- Backend API URL:", process.env.NEXT_PUBLIC_BACKEND_API);
        } else if (status === 500) {
          toast.error(`Server error: ${errorMessage}`);
        } else {
          toast.error(`Failed to create event: ${errorMessage}`);
        }
      } else if (error.request) {
        toast.error("Network error - please check your connection and server status");
        console.error("Network error - server not responding");
      } else {
        toast.error("Failed to create event");
        console.error("Unexpected error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{gameIcon}</span>
            <h2 className="text-xl font-bold">Setup {gameDisplayName} Event</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Event Details */}
          <div className="mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Event Name *
              </label>
              <input
                type="text"
                value={currentEventName}
                onChange={(e) => setCurrentEventName(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter event name"
                required
              />
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={
                    currentEventDate
                      ? new Date(currentEventDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => setCurrentEventDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            </div>

            {/* Game Info Display */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center gap-2">
                <span className="text-lg">{gameIcon}</span>
                <span className="font-medium text-blue-800">Game: {gameDisplayName}</span>
                {maxUsers && (
                  <span className="text-sm text-blue-600 ml-auto">
                    Max {maxUsers} players
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Participant Selection */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Participants *
                </label>
                <ParticipantDropdown
                  participants={allUsers}
                  selectedParticipants={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  maxUsers={maxUsers}
                />
              </div>

              {/* Selected Participants Display */}
              {selectedUsers.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 text-lg">
                      Selected Participants ({selectedUsers.length}
                      {maxUsers ? `/${maxUsers}` : ""})
                    </h4>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => {
                      const userId = getUserId(user);
                      const displayName =
                        user.name ||
                        user.username ||
                        user.email ||
                        "Unknown User";
                      const userEmail =
                        user.email && user.name ? user.email : "";

                      return (
                        <div
                          key={userId}
                          className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 rounded-full text-sm shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {displayName}
                            </span>
                            {userEmail && (
                              <span className="text-xs text-gray-500">
                                {userEmail}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const newSelection = selectedUsers.filter(u => getUserId(u) !== userId);
                              setSelectedUsers(newSelection);
                            }}
                            className="ml-1 text-red-500 hover:text-red-700 font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
                            title="Remove user"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border">
                    💡 <strong>Tip:</strong> Click the × button to remove a
                    user, or use "Clear All" to remove everyone
                  </div>
                </div>
              )}

              {/* Show message when no users selected */}
              {selectedUsers.length === 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">👥 No participants selected yet</p>
                    <p className="text-xs mt-1">
                      Use the dropdown above to select participants for this game
                    </p>
                  </div>
                </div>
              )}

              {/* Validation Summary */}
              <div className="mb-6 p-3 bg-gray-50 rounded border">
                <h4 className="font-medium text-gray-700 mb-2">Event Summary:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>📝 Event: {currentEventName || "Not set"}</div>
                  <div>📅 Date: {currentEventDate || "Not set"}</div>
                  <div>🕐 Time: {time || "Not set"}</div>
                  <div>🎮 Game: {gameDisplayName}</div>
                  <div>👥 Participants: {selectedUsers.length} selected</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={
                    selectedUsers.length === 0 ||
                    !currentEventName.trim() ||
                    !time.trim() ||
                    !currentEventDate ||
                    loading
                  }
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Game Modal Component
export default function GameModal({
  onSubmit,
  onEventCreated, // Optional callback when event is created
}) {
  const [eventDate, setEventDate] = useState(""); // Add state for eventDate
  const [eventName, setEventName] = useState("");
  const [userSelectionModal, setUserSelectionModal] = useState({
    isOpen: false,
    gameName: "",
    gameDisplayName: "",
    gameIcon: "",
  });

  const games = [
    { name: "binary", displayName: "Binary Game", icon: "🔢" },
    { name: "chess", displayName: "Chess", icon: "♛" },
    { name: "debug", displayName: "Debug Game", icon: "🐛" },
    { name: "itquiz", displayName: "IT Quiz", icon: "💻" },
    { name: "drawize", displayName: "Drawize", icon: "🎲" },
    { name: "tictactoe", displayName: "Tic Tac Toe", icon: "⭕" },
    { name: "wordpuzzle", displayName: "Word Search", icon: "🧩" },
    { name: "typing", displayName: "Typing Speed Test", icon: "⌨️" },
  ];

  const handleGameClick = (game) => {
    setUserSelectionModal({
      isOpen: true,
      gameName: game.name,
      gameDisplayName: game.displayName,
      gameIcon: game.icon,
    });
  };

  const closeUserSelectionModal = () => {
    setUserSelectionModal({
      isOpen: false,
      gameName: "",
      gameDisplayName: "",
      gameIcon: "",
    });
  };

  return (
    <>
      <div className="bg-white text-black px-4 py-8 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-blue-500">
            Select a Game
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {games.map((game) => (
              <div
                key={game.name}
                onClick={() => handleGameClick(game)}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-400 rounded-lg p-4 transition-all duration-300 transform hover:scale-105 shadow-md group cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-200 group-hover:text-blue-400 transition-colors duration-300">
                    {game.displayName}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-center text-sm mt-4">
            Click on any game to create an event and select participants.
          </p>
        </div>
      </div>

      <UserSelectionModal
        isOpen={userSelectionModal.isOpen}
        onClose={closeUserSelectionModal}
        gameName={userSelectionModal.gameName}
        gameDisplayName={userSelectionModal.gameDisplayName}
        gameIcon={userSelectionModal.gameIcon}
        eventDate={eventDate}
        eventName={eventName}
        setEventName={setEventName}
        setEventDate={setEventDate}
      />
    </>
  );
}