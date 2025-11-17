import React, { useState, useEffect } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadTickets } from "../../../redux/slices/ticketsSlice";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ticketlist, http, DashbordCount } from "../../../http";
import { toast } from "react-toastify";
import Tickets from "../../Ticket/AllTickets/components/Tickets";

// 🔥 Shimmer-style skeleton loader
const Skeleton = ({ className }) => (
  <div
    className={`relative overflow-hidden rounded-lg bg-gray-200 ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
  </div>
);

const Dashboard = () => {
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const limit = 10;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    data: ticketData,
    isLoading: ticketLoading,
    refetch,
  } = useQuery({
    queryKey: ["tickets", page],
    queryFn: async () => {
      const res = await ticketlist(page, limit);
      return res || {};
    },
    keepPreviousData: true,
  });

  const {
    data: countData,
    isLoading: countLoading,
    refetch: refetchCount,
  } = useQuery({
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
    pending:countData?.pending || 0,
    underverification: countData?.under_verification || 0,
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-10 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-1xl sm:text-2xl font-semibold text-gray-800">
          Dashboard / <span>डॅशबोर्ड</span>
        </h2>
      </div>

      {/* Dashboard Stats */}
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mt-6">

  {[
    { title: "Tickets / तिकिटे", color: "gray", value: stats.total },
    { title: "Completed / पूर्ण तिकिटे", color: "green", value: stats.completed },
    { title: "In Progress / प्रगतीत तिकिटे", color: "blue", value: stats.inProgress },
    { title: "Pending / प्रलंबित तिकिटे", color: "yellow", value: stats.pending},
    { title: "Under Verification / तपासणीखाली तिकिटे", color: "orange", value: stats.underverification },
  ].map((item, idx) => (
    <div
      key={idx}
      className={`rounded-2xl border border-${item.color}-200 bg-white p-4 
        shadow-md hover:shadow-xl hover:-translate-y-1 
        transition-all duration-300 flex flex-col items-center justify-between`}
    >
      <h3 className={`text-sm font-semibold text-${item.color}-600 uppercase tracking-wide text-center`}>
        {item.title}
      </h3>

      {countLoading ? (
        <div className="mt-2s flex justify-center w-full">
          <Skeleton className="h-10 w-20" />
        </div>
      ) : (
        <p className={`text-4xl font-extrabold text-${item.color}-700 mt-1 text-center`}>
          {item.value}
        </p>
      )}
    </div>
  ))}

  {/* Create New */}
  <button
    onClick={() => navigate("/new-takits")}
    className="rounded-2xl bg-orange-600 hover:bg-orange-700  text-white 
      p-6 text-center flex flex-col items-center justify-center 
      shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  >
    <h3 className="text-sm font-semibold uppercase tracking-wide text-center">
      Create New / नवीन तयार करा
    </h3>
    <Plus className="mt-3" size={28} />
  </button>

</div>


      {/* Delete Modal */}
      {showDeleteModal && deletingTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={36} className="text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Delete Ticket? / तिकीट हटवायचे का?
              </h3>
              <p className="text-gray-600 mt-3 text-sm sm:text-base">
                You're about to delete ticket:
              </p>
              <strong className="block text-orange-600 font-mono text-xl mt-2">
                {deletingTicket.ticket_number}
              </strong>
              <p className="text-sm text-orange-600 font-semibold mt-3">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-6 py-3 border border-orange-300 text-orange-700 rounded-xl hover:bg-orange-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium flex items-center justify-center gap-3 shadow-lg"
              >
                {isDeleting && <Loader2 className="animate-spin" size={18} />}
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Section with skeleton */}
      {ticketLoading ? (
        <div className="space-y-4 mt-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <Skeleton className="h-5 w-1/3 mb-3" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <Tickets />
      )}
    </div>
  );
};

export default Dashboard;
