import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function GameModal({ onSubmit, eventDate, editingEvent }) {
  const [selectedGames, setSelectedGames] = useState([]);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    if (editingEvent) {
      setEventName(editingEvent.title || "");
      setSelectedGames(editingEvent.games || []);
    } else {
      setEventName("");
      setSelectedGames([]);
    }
  }, [editingEvent]);

  const games = [
    { name: "binary", displayName: "Binary Game", icon: "🔢" },
    { name: "chess", displayName: "Chess", icon: "♛" },
    { name: "debug", displayName: "Debug Game", icon: "🐛" },
    { name: "itquiz", displayName: "IT Quiz", icon: "💻" },
    { name: "ludo", displayName: "Ludo", icon: "🎲" },
    { name: "tictactoe", displayName: "Tic Tac Toe", icon: "⭕" },
    { name: "triStrike", displayName: "Stone Paper Scissors", icon: "✂️" },
    { name: "typing", displayName: "Speed Typing Test", icon: "⌨️" },
  ];

  const toggleGame = (name) => {
    setSelectedGames((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        // Update
        await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_API}/event/${editingEvent._id}`, {
          title: eventName,
          date: eventDate,
          games: selectedGames,
        });
        toast.success("Event updated successfully!");
      } else {
        // Create
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/event/create`, {
          title: eventName,
          date: eventDate,
          games: selectedGames,
        });
        toast.success("Event created successfully!");
      }
      if (onSubmit) onSubmit();
    } catch (error) {
      toast.error("Failed to save event");
    }
  };

  return (
    <div className="bg-white text-black px-4 py-8 sm:px-8">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-blue-500">
          Create Your Event
        </h1>
        <form onSubmit={handleSubmit} className="w-full">
          {/* Event Name and Button */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
            <div className="w-full sm:w-2/3">
              <label className="block text-gray-700 font-semibold mb-2">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter event name"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 w-full sm:w-auto text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Save Event
            </button>
          </div>

          {/* Game Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {games.map((game) => (
              <div
                key={game.name}
                onClick={() => toggleGame(game.name)}
                className={`relative bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-400 rounded-lg p-4 transition-all duration-300 transform hover:scale-105 shadow-md group cursor-pointer ${
                  selectedGames.includes(game.name)
                    ? "border-2 border-blue-500"
                    : ""
                }`}
              >
                {selectedGames.includes(game.name) && (
                  <span className="absolute top-2 right-2 text-green-400 text-xl font-bold z-10">
                    ✔️
                  </span>
                )}
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
            Select one or more games to add to your event.
          </p>
        </form>
      </div>
    </div>
  );
}
