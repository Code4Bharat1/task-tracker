import React, { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";

const EventModal = ({ event }) => {
  const [toggles, setToggles] = useState(() =>
    event?.games?.reduce((acc, game) => {
      acc[game] = false;
      return acc;
    }, {}) || {}
  );

  if (!event) return null;

  const handleToggle = (game) => {
    setToggles((prev) => ({
      ...prev,
      [game]: !prev[game],
    }));
  };

const handleSubmit = async () => {
  const registeredGames = Object.keys(toggles).filter(game => toggles[game]);

  if (registeredGames.length === 0) {
    toast.error("Please select at least one game");
    return;
  }

  try {
    const res = await axiosInstance.post("/registration/submit", {
      eventId: event._id,
      registeredGames,
    });

    if (res.data.success) {
      toast.success("Registration submitted successfully");
      // Reset toggles after successful submission
      setToggles(prev => {
        const reset = {};
        Object.keys(prev).forEach(key => reset[key] = false);
        return reset;
      });
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Failed to submit registration";
    toast.error(errorMessage);
    console.error("Submit Error:", err);
  }
};


  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-lg sm:text-xl font-bold mb-2">{event.title}</h2>
      <p className="text-gray-600 text-sm sm:text-base mb-2">📅 Date: {event.date}</p>
      <p className="text-gray-700 text-sm sm:text-base mb-4">{event.description}</p>

      <h3 className="font-semibold text-base sm:text-lg mb-2">Games:</h3>
      {event.games && event.games.length > 0 ? (
        <ul className="space-y-3 mb-4">
          {event.games.map((game, idx) => (
            <li
              key={idx}
              className="flex flex-wrap items-center justify-between bg-gray-50 px-4 py-2 rounded-md"
            >
              <span className="text-sm sm:text-base">{game}</span>
              <button
                onClick={() => handleToggle(game)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  toggles[game] ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    toggles[game] ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm sm:text-base">No games added.</p>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300"
      >
        Submit Registration
      </button>
    </div>
  );
};

export default EventModal;
