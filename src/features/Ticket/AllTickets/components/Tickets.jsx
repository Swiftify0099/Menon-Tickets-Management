// src/features/Ticket/AllTickets/components/Tickets.jsx
import React, { useState } from "react";
import { Loader2, Trash2, Pencil, FolderOpenDot, Eye, Edit, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ticketlist, http } from "../../../../http";
import { toast } from "react-toastify";

const Tickets = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const limit = 10;
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusOptions = [
    "All",
    "Pending",
    "Mark as Completed",
    "Re Opened",
    "Allocated",
    "Completed",
    "Working Progress"
  ];

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["tickets", page],
    queryFn: async () => {
      const res = await ticketlist(page, limit);
      return res || {};
    },
    keepPreviousData: true,
  });

  const tickets = data?.data || [];
  const totalRecords = data?.total_records || 0;
  const totalPages = Math.ceil(totalRecords / limit) || 1;

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await http.get(`ticket/delete/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ticket deleted successfully!");
      refetch();
      setShowDeleteModal(false);
      setDeletingTicket(null);
      setIsDeleting(false);
    },
    onError: () => {
      toast.error("Failed to delete ticket");
      setIsDeleting(false);
    },
  });

  // Direct navigation — no localStorage!
  const handleView = (id) => {
    navigate(`/ticket/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/update-ticket/${id}`);
  };

  const handleDeleteClick = (ticket) => {
    setDeletingTicket(ticket);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setIsDeleting(true);
    deleteMutation.mutate(deletingTicket.id);
  };

  const filteredTickets = activeTab === "All"
    ? tickets
    : tickets.filter(t => t.status?.toLowerCase() === activeTab.toLowerCase());

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "completed") return "bg-green-100 text-green-800";
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-800";
    if (statusLower === "re opened") return "bg-purple-100 text-purple-800";
    if (statusLower === "allocated") return "bg-blue-100 text-blue-800";
    if (statusLower === "working progress") return "bg-orange-100 text-orange-800";
    if (statusLower === "mark as completed") return "bg-teal-100 text-teal-800";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">All Tickets</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Status Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-all shadow-md w-full sm:w-auto justify-between"
              >
                <span>Status: {activeTab}</span>
                <ChevronDown size={16} className={`transition-transform ${showStatusFilter ? 'rotate-180' : ''}`} />
              </button>
              
              {showStatusFilter && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setActiveTab(status);
                          setShowStatusFilter(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 transition ${
                          activeTab === status 
                            ? 'bg-orange-100 text-orange-400 font-medium' 
                            : 'text-gray-700'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-400 hover:bg-orange-400 text-white rounded-lg text-sm font-medium transition-all shadow-md"
            >
              {isFetching && <Loader2 className="animate-spin" size={16} />}
              Refresh
            </button>
          </div>
        </div>

      

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-orange-600" size={40} />
              </div>
            ) : isError ? (
              <div className="text-center py-12 text-orange-500 font-medium">
                Failed to load tickets. Please try again.
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderOpenDot size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No tickets found</p>
                {activeTab !== "All" && (
                  <button
                    onClick={() => setActiveTab("All")}
                    className="mt-2 text-orange-600 hover:text-orange-500 text-sm font-medium"
                  >
                    Clear filters to see all tickets
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-500 text-white">
                  <tr>
                    {["Ticket No", "Service", "Provider", "Assign To", "Assign Date", "Status", "Created", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-sm font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-mono font-bold text-black">
                        {t.ticket_number}
                      </td>
                      <td className="px-5 py-4 font-medium">{t.service_name}</td>
                      <td className="px-5 py-4">{t.provider_name}</td>
                      <td className="px-5 py-4 text-gray-600">{t.assign_user_name || "—"}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{t.assign_date || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(t.status)}`}>
                          {t.status || "Open"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{t.created_at}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* View */}
                          <button
                            onClick={() => handleView(t.id)}
                            className="p-2.5 bg-green-200 text-red-800 rounded-lg hover:bg-green-400 transition group"
                            title="View Ticket"
                          >
                            <Eye size={18} className="group-hover:scale-110 transition" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(t.id)}
                            className="p-2.5 bg-yellow-100 text-orange-700 rounded-lg hover:bg-yellow-300 transition group"
                            title="Edit Ticket"
                          >
                            <Edit size={18} className="group-hover:scale-110 transition" />
                          </button>

                          {/* Delete */}
                          {/* <button
                            onClick={() => handleDeleteClick(t)}
                            className="p-2.5 bg-orange-200 text-orange-700 rounded-lg hover:bg-orange-400 transition group"
                            title="Delete Ticket"
                          >
                            <Trash2 size={18} className="group-hover:scale-110 transition" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-700">
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>
                {activeTab !== "All" && (
                  <span className="ml-2 text-orange-600">• Filtered by: {activeTab}</span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 border border-orange-300 text-orange-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTicket && (
        <div className="fixed inset-0  bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={40} className="text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Delete Ticket?</h3>
              <p className="text-gray-600 mt-3">
                You're about to delete ticket:
              </p>
              <strong className="block text-orange-600 font-mono text-2xl mt-2">
                {deletingTicket.ticket_number}
              </strong>
              <p className="text-sm text-orange-600 font-semibold mt-3">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingTicket(null);
                  setIsDeleting(false);
                }}
                disabled={isDeleting}
                className="px-6 py-3 border border-orange-300 text-orange-700 rounded-xl hover:bg-orange-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition font-medium flex items-center gap-3 shadow-lg"
              >
                {isDeleting && <Loader2 className="animate-spin" size={18} />}
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tickets;