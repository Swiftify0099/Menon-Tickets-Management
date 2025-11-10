import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ticketlist } from "../http";

const Tickets = () => {
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();

  // ✅ Fetch tickets using TanStack Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await ticketlist();
      return res?.data || []; // extract array from response
    },
  });

  const tickets = data || [];

  // Filter by tab
  const filteredTickets =
    activeTab === "All"
      ? tickets
      : tickets.filter((t) => t.status?.toLowerCase() === activeTab.toLowerCase());

  const handleOpen = (id) => navigate(`/takits-details/${id}`);
  const handleEdit = (id) => navigate(`/new-takits?edit=${id}`);
  const handleDelete = (id) => {
    if (window.confirm("Delete this ticket?")) {
      alert(`Ticket ${id} deleted`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">All Tickets</h2>
        <button
          onClick={() => refetch()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Refresh
        </button>
      </div>

      {/* Tickets Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-md">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-orange-500" size={28} />
          </div>
        ) : isError ? (
          <p className="text-center py-6 text-red-500">
            Failed to load tickets. Please try again.
          </p>
        ) : filteredTickets.length === 0 ? (
          <p className="text-center py-6 text-gray-500">
            No tickets found for this category.
          </p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-orange-50 text-left border-b border-gray-200">
                {[
                  "Ticket No",
                  "Service",
                  "Provider",
                  "Assign To",
                  "Assign Date",
                  "Status",
                  "Created At",
                  "Action",
                ].map((h) => (
                  <th key={h} className="p-4 font-semibold text-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition text-gray-700"
                >
                  <td className="p-4">{t.ticket_number}</td>
                  <td className="p-4">{t.service_name}</td>
                  <td className="p-4">{t.provider_name}</td>
                  <td className="p-4">{t.assign_user_name || "—"}</td>
                  <td className="p-4">{t.assign_date || "—"}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        t.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : t.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.status || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">{t.created_at}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpen(t.id)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleEdit(t.id)}
                        className="text-green-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Tickets;
