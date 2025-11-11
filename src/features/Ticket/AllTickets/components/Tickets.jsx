import React, { useEffect, useRef } from "react";
import { Loader2, Trash2, Eye, Edit, ChevronDown, FolderOpenDot } from "lucide-react";
import { useTickets } from "../hooks/UseTickets";

const Tickets = () => {
  const {
    activeTab,
    setActiveTab,
    page,
    setPage,
    showStatusFilter,
    setShowStatusFilter,
    showDeleteModal,
    setShowDeleteModal,
    deletingTicket,
    isDeleting,
    filteredTickets,
    totalPages,
    isLoading,
    isError,
    isFetching,
    refetch,
    handleView,
    handleEdit,
    handleDeleteClick,
    confirmDelete,
    statusOptions,
    getStatusColor,
  } = useTickets();

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!showStatusFilter) return;
    const handleOutside = (e) => {
      if (
        (triggerRef.current && triggerRef.current.contains(e.target)) ||
        (dropdownRef.current && dropdownRef.current.contains(e.target))
      ) {
        return;
      }
      setShowStatusFilter(false);
    };
    document.addEventListener("mousedown", handleOutside, true);
    return () => document.removeEventListener("mousedown", handleOutside, true);
  }, [showStatusFilter]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">All Tickets</h2>
          <div className="relative w-full sm:w-auto">
            <button
              ref={triggerRef}
              onClick={() => setShowStatusFilter((s) => !s)}
              className="flex items-center justify-between gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-all shadow-md w-full"
            >
              <span className="truncate">Status: {activeTab}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${showStatusFilter ? "rotate-180" : ""}`}
              />
            </button>

            {showStatusFilter && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
              >
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
                          ? "bg-orange-100 text-orange-400 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
                      <td className="px-5 py-4 font-mono font-bold text-black">{t.ticket_number}</td>
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
                          <button
                            onClick={() => handleView(t.id)}
                            className="p-2.5 bg-green-200 text-red-800 rounded-lg hover:bg-green-400 transition group"
                            title="View Ticket"
                          >
                            <Eye size={18} className="group-hover:scale-110 transition" />
                          </button>
                          <button
                            onClick={() => handleEdit(t.id)}
                            className="p-2.5 bg-yellow-100 text-orange-700 rounded-lg hover:bg-yellow-300 transition group"
                            title="Edit Ticket"
                          >
                            <Edit size={18} className="group-hover:scale-110 transition" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

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

      {showDeleteModal && deletingTicket && (
        <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={40} className="text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Delete Ticket?</h3>
              <p className="text-gray-600 mt-3">You're about to delete ticket:</p>
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