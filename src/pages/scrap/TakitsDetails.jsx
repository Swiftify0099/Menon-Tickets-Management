import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { markComplete, reopenTicket, updateTicket } from "../../redux/slices/ticketsSlice";

const TicketDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const tickets = useSelector((state) => state.tickets.tickets);
  const ticket = tickets.find((t) => t.id.toString() === id.toString());

  // Initialize remarks safely
  const [remarks, setRemarks] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [PrivewAttachment, setPrivewAttachment] = useState(null);


  useEffect(() => {
    if (ticket) {
      setRemarks(
        ticket.remarks || [
          { takenBy: "", date: "", remark: "" },
          { takenBy: "", date: "", remark: "" },
          { takenBy: "", date: "", remark: "" },
        ]
      );
    }
  }, [ticket]);

  // Handle input changes
  const handleChange = (index, field, value) => {
    const ticket = tickets.find((t) => t.id.toString() === id.toString());
    const updated = remarks.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRemarks(updated);

    // Update ticket in Redux + localStorage immediately
    if (ticket) {
      const updatedTicket = { ...ticket, remarks: updated };
      dispatch(updateTicket(updatedTicket));
    }
  };

  const handleMarkComplete = () => {
    dispatch(markComplete(ticket.id));
    alert("Ticket marked as complete ✅");
  };

  const [showReopenPopup, setShowReopenPopup] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const handleReopenClick = () => {
    setShowReopenPopup(true);
  };

  const handleReopenConfirm = () => {
    dispatch(reopenTicket({ id: ticket.id, reason: reopenReason }));
    setShowReopenPopup(false);
    setReopenReason('');
    alert("Ticket reopened 🔄");
  };

  if (!ticket) return <p>Ticket not found</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Ticket Details</h2>

      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        {/* Ticket Info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 text-sm mb-6">
          <p>
            <span className="font-medium text-gray-700">Ticket No:</span>{" "}
            <span className="text-orange-600 font-semibold">{ticket.ticketNo || "N/A"}</span>
          </p>
          <p>
            <span className="font-medium text-gray-700">Created At:</span>{" "}
            <span className="text-orange-600 font-semibold">{ticket.createdAt || "N/A"}</span>
          </p>
          <p>
            <span className="font-medium text-gray-700">Attachment:</span>{" "}
            <a href="#" className="text-orange-600 font-semibold hover:underline">
              View
            </a>
          </p>
          <p>
            <span className="font-medium text-gray-700">Type:</span>{" "}
            <span className="text-orange-600 font-semibold">{ticket.type || "N/A"}</span>
          </p>
          <p>
            <span className="font-medium text-gray-700">Service:</span>{" "}
            <span className="text-orange-600 font-semibold">{ticket.service || "N/A"}</span>
          </p>
          <p>
            <span className="font-medium text-gray-700">Provider:</span>{" "}
            <span className="text-orange-600 font-semibold">{ticket.provider || "N/A"}</span>
          </p>
        </div>

        {/* Details Box */}
        <div className="mb-8">
          <textarea
            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            rows="3"
            readOnly
            value={ticket.details || "No details available"}
          />
        </div>

        {/* Remarks Section */}
        <div className="space-y-6">
          {remarks.map((row, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taken By</label>
                  <input
                    type="text"
                    value={row.takenBy}
                    onChange={(e) => handleChange(index, "takenBy", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => handleChange(index, "date", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                <textarea
                  value={row.remark}
                  onChange={(e) => handleChange(index, "remark", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-y whitespace-pre-wrap"
                  rows="3"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          {ticket.status === "Open" || ticket.status === "In-Progress" && (
            <button
              onClick={handleMarkComplete}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition"
            >
              Mark as Complete
            </button>
          )}
          {ticket.status === "Completed" && (
            <button
              onClick={handleReopenClick}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition"
            >
            Re-OpenTicket
            </button>
          )}
        </div>
      </div>

      {/* Reopen Popup */}
{showReopenPopup && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50"
    onClick={() => setShowReopenPopup(false)} // click outside to close
  >
    <div
      className="bg-white/90 backdrop-blur-xl border border-gray-200 p-6 rounded-2xl shadow-2xl max-w-md w-full relative"
      onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
    >
      <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
        🎫 Reopen Ticket
      </h3>

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Reason for reopening:
      </label>
      <textarea
        value={reopenReason}
        onChange={(e) => setReopenReason(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
        rows="4"
        placeholder="Enter your reason..."
      />

      {/* Attachment Upload */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attach up to 5 files:
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (files.length > 5) {
              alert("You can upload up to 5 attachments only!");
              e.target.value = "";
              return;
            }
            setAttachments(files);
          }}
          className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />

        {attachments?.length > 0 && (
          <ul className="mt-2 text-sm text-gray-700 list-disc pl-4 space-y-1">
            {attachments.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => setShowReopenPopup(false)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl shadow-md transition-all duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleReopenConfirm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-md transition-all duration-200"
        >
          Reopen
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default TicketDetails;
