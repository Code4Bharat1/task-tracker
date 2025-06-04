import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import GameModal from "./gameModal";
import { Edit3, Trash2 } from "lucide-react";

const HREvents = () => {
  const [showModal, setShowModal] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_API}/event/all`)
      .then((res) => setEvents(res.data.events || []))
      .catch(() => setEvents([]));
  }, []);

  const handleEdit = (event) => {
    setEventDate(event.date);
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/event/${eventToDelete._id}`
      );
      setEvents((prev) => prev.filter((e) => e._id !== eventToDelete._id));
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (err) {
      alert("Failed to delete event");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  return (
    <>
      {/* Create Event Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 z-50"
      >
        Create Event
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-4 w-[95%] sm:w-[90%] md:w-[80%] max-w-3xl mx-auto overflow-y-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Create Event
                </h2>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-600 hover:text-red-500 text-2xl font-bold"
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <GameModal
                eventDate={eventDate}
                onSubmit={() => {
                  setShowModal(false);
                  setEditingEvent(null);
                }}
                editingEvent={editingEvent}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event List */}
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {events.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No events found.
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition relative flex flex-col justify-between"
              style={{ minHeight: "200px" }}
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">📅 {event.date}</p>

                {/* Games Section */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.games?.map((game) => (
                    <div
                      key={game}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                    >
                      {game}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons - Bottom Right */}
              <div className="absolute right-4 bottom-4 flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteClick(event)}
                  className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete{" "}
                <strong>{eventToDelete?.title}</strong>?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HREvents;
