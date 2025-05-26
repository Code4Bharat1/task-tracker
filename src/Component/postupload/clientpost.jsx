"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IoEyeOutline, IoClose } from "react-icons/io5";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function ClientPostHistory() {
  const [posts, setPosts] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    setPosts(storedPosts);
  }, []);

  const underlineRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { scaleX: 0, transformOrigin: "left" },
      { scaleX: 1, duration: 0.8, ease: "power2.out" }
    );
  }, []);

  const openViewModal = (post) => {
    setSelectedPost(post);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      {/* Header */}
      <div className="relative ml-4 mt-4 mb-4 w-max">
        <h2 className="text-2xl font-bold text-black">Post View</h2>
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full scale-x-0"
        ></span>
      </div>

      {/* Table */}
      <div
        className={`max-w-6xl mx-auto mt-10 transition-all duration-300 ${
          isViewModalOpen ? "blur-sm" : ""
        }`}
      >
        {posts.length === 0 ? (
          <p className="text-center text-gray-600 text-lg font-medium">
            No posts available.
          </p>
        ) : (
          <div className="bg-white shadow-lg rounded-xl overflow-x-auto border border-gray-200">
            <table className="w-full table-auto min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-center border-b-2 border-gray-200 uppercase text-xs tracking-wider">
                  <th className="py-4 px-6 w-16">ID</th>
                  <th className="py-4 px-6 w-32">Date</th>
                  <th className="py-4 px-6 w-48">Message Preview</th>
                  <th className="py-4 px-6 w-48">Note Preview</th>
                  <th className="py-4 px-6 w-24">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {posts.map((post, index) => (
                  <tr
                    key={post.id}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-[#e6f4fa] transition-colors duration-200`}
                  >
                    <td className="py-4 px-6 border-r border-gray-100 text-center">
                      {post.id}
                    </td>
                    <td className="py-4 px-6 border-r border-gray-100 text-center">
                      {new Date(post.date).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 border-r border-gray-100 truncate text-center">
                      {post.message
                        ? post.message.slice(0, 30) +
                          (post.message.length > 30 ? "..." : "")
                        : "No message"}
                    </td>
                    <td className="py-4 px-6 border-r border-gray-100 truncate text-center">
                      {post.note
                        ? post.note.slice(0, 30) +
                          (post.note.length > 30 ? "..." : "")
                        : "No note"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => openViewModal(post)}
                        className="bg-[#058CBF] text-white px-4 py-2 rounded-lg hover:bg-[#69b0c9] transition-colors duration-300 flex items-center justify-center mx-auto space-x-2 focus:outline-none focus:ring-2 focus:ring-[#058CBF] focus:ring-offset-2"
                        aria-label={`View post ${post.id}`}
                      >
                        <IoEyeOutline className="h-4 w-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Post Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedPost && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg relative"
              initial={{ scale: 0.85, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <button
                onClick={closeViewModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#058CBF] rounded-full p-1"
                aria-label="Close modal"
              >
                <IoClose className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Post Details
              </h2>
              <div className="space-y-5">
                <p className="text-gray-700 text-sm">
                  <strong className="font-semibold">ID:</strong>{" "}
                  {selectedPost.id}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong className="font-semibold">Date:</strong>{" "}
                  {new Date(selectedPost.date).toLocaleString()}
                </p>
                {selectedPost.image ? (
                  <div>
                    <strong className="font-semibold text-gray-700 text-sm">
                      Image:
                    </strong>
                    <img
                      src={selectedPost.image}
                      alt="Post"
                      className="w-full max-w-sm h-48 object-cover rounded-lg mt-2 mx-auto"
                      onError={(e) =>
                        (e.target.src = "/placeholder-image.jpg")
                      }
                    />
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No image available</p>
                )}
                <p className="text-gray-700 text-sm">
                  <strong className="font-semibold">Message:</strong>{" "}
                  {selectedPost.message || "No message"}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong className="font-semibold">Note:</strong>{" "}
                  {selectedPost.note || "No note"}
                </p>
              </div>
              <button
                onClick={closeViewModal}
                className="mt-6 w-full bg-[#058CBF] text-white py-2 px-4 rounded-lg hover:bg-[#69b0c9] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#058CBF] focus:ring-offset-2"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
