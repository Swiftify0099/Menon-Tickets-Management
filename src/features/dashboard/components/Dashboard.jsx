import React, { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  Trash2,
  FolderOpenDot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadTickets } from "../../../redux/slices/ticketsSlice";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ticketlist, http, DashbordCount } from "../../../http";
import { toast } from "react-toastify";
import Tickets from "../../Ticket/AllTickets/components/Tickets";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const limit = 10;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: ticketData, refetch } = useQuery({
    queryKey: ["tickets", page],
    queryFn: async () => {
      const res = await ticketlist(page, limit);
      return res || {};
    },
    keepPreviousData: true,
  });

  const { data: countData, isLoading: countLoading, refetch: refetchCount } = useQuery({
    queryKey: ["dashboardCount"],
    queryFn: async () => {
      const res = await DashbordCount();
      return res?.data || {};
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await http.get(`ticket/delete/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ticket deleted successfully!");
      refetch();
      refetchCount();
      setShowDeleteModal(false);
      setDeletingTicket(null);
      setIsDeleting(false);
    },
    onError: () => {
      toast.error("Failed to delete ticket");
      setIsDeleting(false);
    },
  });

  const tickets = ticketData?.data || [];
  const totalRecords = ticketData?.total_records || 0;
  const totalPages = Math.ceil(totalRecords / limit) || 1;

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
    } else {
      localStorage.setItem("dashboard-tickets", JSON.stringify(tickets));
    }
  }, [tickets, dispatch]);

  const confirmDelete = () => {
    setIsDeleting(true);
    deleteMutation.mutate(deletingTicket.id);
  };

  const stats = {
    total: countData?.total_tickets || 0,
    completed: countData?.completed || 0,
    inProgress: countData?.in_progress || 0,
    underverification: countData?.under_verification || 0,
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-10 py-4">
      {/* ✅ Services Header */}
      

      {/* ✅ Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-1xl sm:text-2xl font-semibold text-gray-800">
          Dashboard / <span>डॅशबोर्ड</span>
        </h2>
      </div>

      {/* ✅ Dashboard Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {/* Tickets */}
        <div className="bg-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Tickets / तिकिटे
          </h3>
          <p className="text-4xl font-extrabold text-gray-800 mt-3">
            {countLoading ? "..." : stats.total}
          </p>
        </div>

        {/* Completed */}
        <div className="bg-green-50 rounded-xl hover:shadow-green-200 shadow-lg border border-green-300 p-6 text-center hover:shadow-xl transition">
          <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide">
            Completed / पूर्ण
          </h3>
          <p className="text-4xl font-extrabold text-green-800 mt-3">
            {countLoading ? "..." : stats.completed}
          </p>
        </div>

        {/* In Progress */}
        <div className="bg-blue-50 rounded-xl shadow-sm hover:shadow-blue-200 border border-blue-300  p-6 text-center hover:shadow-xl transition">
          <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            In Progress / प्रगतीत
          </h3>
          <p className="text-4xl font-extrabold text-blue-800 mt-3">
            {countLoading ? "..." : stats.inProgress}
          </p>
        </div>

        {/* Under Verification */}
        <div className="bg-orange-50 rounded-xl shadow-lg border hover:shadow-orange-200 border-orange-300 p-6 text-center hover:shadow-xl transition">
          <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wide">
            Under Verification / तपासणीखाली
          </h3>
          <p className="text-4xl font-extrabold text-orange-800 mt-3">
            {countLoading ? "..." : stats.underverification}
          </p>
        </div>

        {/* Create New */}
        <button
          onClick={() => navigate("/new-takits")}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide">
            Create New / नवीन तयार करा
          </h3>
          <Plus className="mt-3" size={28} />
        </button>
      </div>

      {/* ✅ Pagination */}
      <div className="space-y-7 p-4 ">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-sm text-gray-700">
                Page / पृष्ठ <strong>{page}</strong> of / पैकी <strong>{totalPages}</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg disabled:opacity-50 hover:bg-orange-50 text-sm"
                >
                  Previous / मागील
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
                >
                  Next / पुढील
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteModal && deletingTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={36} className="text-orange-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Delete Ticket? / तिकीट हटवायचे का?
              </h3>
              <p className="text-gray-600 mt-3 text-sm sm:text-base">
                You're about to delete ticket / तुम्ही हे तिकीट हटवणार आहात:
              </p>
              <strong className="block text-orange-600 font-mono text-lg sm:text-2xl mt-2">
                {deletingTicket.ticket_number}
              </strong>
              <p className="text-sm text-orange-600 font-semibold mt-3">
                This action cannot be undone / ही कृती उलटवता येणार नाही.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-6 py-3 border border-orange-300 text-orange-700 rounded-xl hover:bg-orange-50 font-medium"
              >
                Cancel / रद्द करा
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium flex items-center justify-center gap-3 shadow-lg"
              >
                {isDeleting && <Loader2 className="animate-spin" size={18} />}
                {isDeleting ? "Deleting... / हटवित आहे..." : "Yes, Delete / हो, हटवा"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Tickets />
    </div>
  );
};

export default Dashboard;
