import React, { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { deleteTicket, loadTickets } from "../redux/slices/ticketsSlice";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tickets = useSelector((state) => state.tickets.tickets);

  // Load tickets from localStorage on mount
  useEffect(() => {
    if (tickets.length === 0) {
      const stored = localStorage.getItem("dashboard-tickets");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            dispatch(loadTickets(parsed));
          }
        } catch (error) {
          console.error("Error parsing stored tickets:", error);
        }
      }
    }
    setLoading(false);
  }, [tickets.length, dispatch]);

  // Sync tickets to localStorage whenever tickets change
  useEffect(() => {
    localStorage.setItem("dashboard-tickets", JSON.stringify(tickets));
  }, [tickets]);

  const responce = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/tickets.json");
      const data = await res.json();
      return data;
    },
  });

  useEffect(() => {
    if (responce.data) {
      dispatch(loadTickets(responce.data));
    }
  }, [responce.data, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Delete this ticket?")) {
      dispatch(deleteTicket(id));
    }
  };

  const handleOpen = (id) => {
    navigate(`/takits-details/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/new-takits?edit=${id}`);
  };

  const handleReopenAsNew = (id) => {
    const ticket = tickets.find((t) => t.id === id);
    localStorage.setItem("reopen-ticket", JSON.stringify(ticket));
    navigate("/new-takits");
  };

  const filteredTickets =
    activeTab === "All" ? tickets : tickets.filter((t) => t.status === activeTab);

  const stats = {
    total: tickets.length,
    completed: tickets.filter((t) => t.status === "Completed").length,
    inProgress: tickets.filter((t) => t.status === "In-Progress").length,
  };

  return (
    <div className="space-y-6 px-3 sm:px-6 lg:px-10 py-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
          Dashboard
        </h2>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Tickets */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md text-center p-4 hover:shadow-lg transition">
          <h3 className="text-sm sm:text-base font-medium text-gray-700">Tickets</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">
            {stats.total}
          </p>
        </div>

        {/* Completed */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md text-center p-4 hover:shadow-lg transition">
          <h3 className="text-sm sm:text-base font-medium text-gray-700">
            Completed
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
            {stats.completed}
          </p>
        </div>

        {/* In-Progress */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md text-center p-4 hover:shadow-lg transition">
          <h3 className="text-sm sm:text-base font-medium text-gray-700">
            In-Progress
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
            {stats.inProgress}
          </p>
        </div>

        {/* Create New */}
        <button
          onClick={() => navigate("/new-takits")}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md text-center p-4 transition flex flex-col items-center justify-center"
        >
          <h3 className="text-sm sm:text-base font-medium">Create New?</h3>
          <Plus className="mt-1" size={22} />
        </button>
      </div>

      {/* Tickets Table Section */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            All Tickets
          </h2>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-md">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-orange-500" size={28} />
            </div>
          ) : filteredTickets.length === 0 ? (
            <p className="text-center py-6 text-gray-500 text-sm sm:text-base">
              No tickets found for this category.
            </p>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-orange-50 text-left border-b border-gray-200">
                    {[
                      "Ticket No",
                      "Type",
                      "Created At",
                      "Service",
                      "Provider",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="p-3 sm:p-4 font-semibold text-gray-700 whitespace-nowrap"
                      >
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
                      <td className="p-3 sm:p-4 whitespace-nowrap">{t.ticketNo}</td>
                      <td className="p-3 sm:p-4 whitespace-nowrap">{t.type}</td>
                      <td className="p-3 sm:p-4 whitespace-nowrap">{t.createdAt}</td>
                      <td className="p-3 sm:p-4 whitespace-nowrap">{t.service}</td>
                      <td className="p-3 sm:p-4 whitespace-nowrap">{t.provider}</td>
                      <td className="p-3 sm:p-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            t.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : t.status === "In-Progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
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
                            onClick={() => handleReopenAsNew(t.id)}
                            className="text-purple-600 hover:underline text-xs"
                          >
                            Reopen
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
