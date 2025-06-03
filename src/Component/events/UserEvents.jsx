import React, { useEffect, useState } from "react";
import axios from "axios";
import EventModal from "./EventModal";
import { useRouter } from "next/navigation";

const UserEvents = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    axios
      .get("http://localhost:4110/api/event/all", { withCredentials: true })
      .then((res) => {
        const allEvents = res.data.events || [];
        // Filter out events with date less than today
        const formatDate = (date) => new Date(date).toISOString().split("T")[0];
        const today = formatDate(new Date());
        const filteredEvents = allEvents.filter(
          (event) => formatDate(event.date) >= today
        );
        setEvents(filteredEvents);
      })
      .catch(() => setEvents([]));
  }, []);

  const handleCardClick = (event) => {
    const label = getLabel(event.date);
    if (label === "Today") {
      router.push("/games");
    } else if (label === "Tomorrow") {
      setSelectedEvent(event);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const formatDate = (date) => new Date(date).toISOString().split("T")[0];
  const today = formatDate(new Date());
  const tomorrow = formatDate(new Date(Date.now() + 86400000));

  const getLabel = (date) => {
    const eventDate = formatDate(date);
    if (eventDate === today) return "Today";
    if (eventDate === tomorrow) return "Tomorrow";
    if (eventDate > tomorrow) return "Upcoming";
    return "";
  };

  const getLabelClass = (label) => {
    if (label === "Today") return "bg-green-100 text-green-700";
    if (label === "Tomorrow") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Your Events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const label = getLabel(event.date);
          return (
            <div
              key={event._id}
              className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer relative"
              onClick={() => handleCardClick(event)}
            >
              {label && (
                <span
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${getLabelClass(
                    label
                  )}`}
                >
                  {label}
                </span>
              )}
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                📅 Date: {event.date}
              </p>
              <p className="text-gray-700 text-sm">{event.description}</p>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <EventModal event={selectedEvent} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEvents;
