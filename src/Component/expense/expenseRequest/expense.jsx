'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

const Expense = () => {
  const underlineRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { scaleX: 0, transformOrigin: 'left' },
      { scaleX: 1, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  const openModal = (e) => {
    e.preventDefault(); // Prevent default button behavior
    e.stopPropagation(); // Stop event propagation
    setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);

  return (
    <div className="p-8 max-w-5xl mx-auto text-[15px] text-gray-900">
      {/* Top Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="relative">
          <h2 className="text-2xl font-bold">Expenses Request</h2>
          <div
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] w-full bg-[#FA4A4A] scale-x-0"
          ></div>
        </div>
        <div className="text-sm font-medium">
          <span className="text-gray-600">Submitted On</span> :{' '}
          <span className="font-semibold">10/05/2025</span>
        </div>
      </div>

      {/* Details Box */}
      <div className="border-2 border-blue-500 rounded-lg p-6 bg-white shadow-sm">
        <div className="flex flex-col gap-5">
          <InfoRow label="Employee ID & Name" value="NXC101 / Shubham Prajapati" />
          <InfoRow label="Expense Title" value="Cab to client Site" />
          <InfoRow label="Category" value="Travel" />
          <InfoRow label="Date & Time of Expense" value="8/05/2025" />
          <InfoRow label="Amount (₹)" value="₹1,200" />
          <InfoRow label="Payment Method" value="Cash, UPI, Credit Card, etc." />
          <InfoRow
            label="Uploaded Receipt"
            value={
              <div>
                <span 
                  className="bg-[#1A98D7] hover:bg-[#147FB3] text-white px-5 py-2 rounded-md text-sm font-bold shadow-xl cursor-pointer inline-block"
                  onClick={openModal}
                >
                  View Doc
                </span>
              </div>
            }
          />
          <InfoRow
            label="Employee Notes / Description"
            value={
              <p className="text-gray-800">
                E.g., <strong>"Took Uber from office to client."</strong>
              </p>
            }
          />
          <InfoRow
            label="Admin Notes"
            value={
              <p className="text-gray-500">
                Field where admin can add remarks while approving/rejecting,&nbsp;
                Reasons for Rejecting application
              </p>
            }
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-8 pt-8">
          <button 
            type="button" 
            className="bg-[#0F9D58] hover:bg-green-700 text-black font-semibold px-8 py-2 rounded-md text-[15px]"
          >
            Approve
          </button>
          <button 
            type="button"
            className="bg-[#EA4335] hover:bg-red-700 text-black font-semibold px-8 py-2 rounded-md text-[15px]"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Document Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeModal}></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl z-10 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Receipt Document</h3>
              <button 
                type="button"
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center">
              <div className="w-full h-64 flex items-center justify-center border border-gray-300 bg-white rounded-md mb-4">
                <img src="/api/placeholder/400/320" alt="Receipt document" className="max-h-full object-contain" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Receipt for cab ride on 8/05/2025</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Download
                  </button>
                  <button 
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
    <div className="text-md w-64 font-bold">
      {label} <span className="font-bold">:</span>
    </div>
    <div>{value}</div>
  </div>
);

export default Expense;