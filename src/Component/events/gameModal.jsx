import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
  setEventDate
}) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentEventName, setCurrentEventName] = useState(eventName || "");
  const [currentEventDate, setCurrentEventDate] = useState(eventDate || "");

  // Get max users based on game type
  const getMaxUsers = (game) => {
    switch(game) {
      case 'chess':
      case 'tictactoe':
        return 2;
      case 'drawize':
        return 4;
      default:
        return null; // No limit for other games
    }
  };

  const maxUsers = getMaxUsers(gameName);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setCurrentEventName(eventName || "");
      setCurrentEventDate(eventDate || "");
    }
  }, [isOpen, eventName, eventDate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint to fetch users
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/users`);
      setAllUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];

      // Limit selection based on maxUsers (only for games with limits)
      if (maxUsers && newSelection.length > maxUsers) {
        toast.warning(`You can only select ${maxUsers} users for ${gameDisplayName}`);
        return prev;
      }

      return newSelection;
    });
  };

  const handleCreateRoom = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (!currentEventName.trim()) {
      toast.error("Please enter an event name");
      return;
    }

    try {
      setLoading(true);

      // Create event first
      const eventResponse = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/event/create`, {
        title: currentEventName,
        date: currentEventDate,
        games: [gameName],
      });

      // Then create room for the game
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/room/create`, {
        game: gameName,
        users: selectedUsers,
        eventId: eventResponse.data.id || eventResponse.data._id,
      });

      toast.success(`Event "${currentEventName}" created with ${gameDisplayName} room!`);
      setEventName(currentEventName); // Update parent component
      setEventDate(currentEventDate); // Update parent component
      onClose();
      setSelectedUsers([]);
      setCurrentEventName("");
      setCurrentEventDate("");
    } catch (error) {
      toast.error("Failed to create event and room");
      console.error(error);
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
                Event Name
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

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Event Date
              </label>
              <input
                type="date"
                value={currentEventDate ? new Date(currentEventDate).toISOString().split('T')[0] : ""}
                onChange={(e) => setCurrentEventDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <>
              {/* User Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {maxUsers 
                    ? `Select Users (${selectedUsers.length}/${maxUsers} selected)`
                    : `Select Users (${selectedUsers.length} selected)`
                  }
                </h3>

                {/* User Dropdown/List */}
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                  {allUsers.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No users found</p>
                  ) : (
                    allUsers.map((user) => (
                      <div
                        key={user._id || user.id}
                        className={`flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${selectedUsers.includes(user._id || user.id) ? 'bg-blue-50' : ''
                          }`}
                        onClick={() => handleUserToggle(user._id || user.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id || user.id)}
                          onChange={() => handleUserToggle(user._id || user.id)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {user.name || user.username || user.email}
                          </p>
                          {user.email && user.name && (
                            <p className="text-sm text-gray-500">{user.email}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selected Users Summary */}
              {selectedUsers.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-medium text-gray-700 mb-2">Selected Users:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(userId => {
                      const user = allUsers.find(u => (u._id || u.id) === userId);
                      return (
                        <span key={userId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {user?.name || user?.username || user?.email || 'Unknown'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={selectedUsers.length === 0 || !currentEventName.trim() || loading}
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

// Main GameModal Component - Only shows games
export default function GameModal({ onSubmit, eventDate, setEventName, eventName, setEventDate }) {
  const [userSelectionModal, setUserSelectionModal] = useState({
    isOpen: false,
    gameName: "",
    gameDisplayName: "",
    gameIcon: ""
  });

  const games = [
    { name: 'binary', displayName: 'Binary Game', icon: '🔢' },
    { name: 'chess', displayName: 'Chess', icon: '♛' },
    { name: 'debug', displayName: 'Debug Game', icon: '🐛' },
    { name: 'itquiz', displayName: 'IT Quiz', icon: '💻' },
    { name: 'drawize', displayName: 'Drawize', icon: '🎲' },
    { name: 'tictactoe', displayName: 'Tic Tac Toe', icon: '⭕' },
    { name: 'wordpuzzle', displayName: 'Word Search', icon: '🧩' },
    { name: 'typing', displayName: 'Typing Speed Test', icon: '⌨️' }
  ];

  const handleGameClick = (game) => {
    setUserSelectionModal({
      isOpen: true,
      gameName: game.name,
      gameDisplayName: game.displayName,
      gameIcon: game.icon
    });
  };

  const closeUserSelectionModal = () => {
    setUserSelectionModal({
      isOpen: false,
      gameName: "",
      gameDisplayName: "",
      gameIcon: ""
    });
  };

  return (
    <>
      <div className="bg-white text-black px-4 py-8 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-blue-500">
            Select a Game
          </h1>

          {/* Game Grid */}
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
            Click on any game to create an event and select users.
          </p>
        </div>
      </div>

      {/* User Selection Modal */}
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