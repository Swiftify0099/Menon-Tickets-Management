// src/features/Ticket/AllTickets/hooks/useTickets.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ticketlist, http } from "../../../../http";
import { toast } from "react-toastify";

const limit = 10;

export const useTickets = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const statusOptions = [
    "All",
    "Pending",
    "In Progress",
    "Mark as Completed",
    "ReOpened",
  ];

  // === Fetch Tickets ===
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

  // === Delete Mutation ===
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

  // === Handlers ===
  const handleView = (id) => navigate(`/ticket/${id}`);
  const handleEdit = (id) => navigate(`/update-ticket/${id}`);

  const handleDeleteClick = (ticket) => {
    setDeletingTicket(ticket);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setIsDeleting(true);
    deleteMutation.mutate(deletingTicket.id);
  };

  // === Filter & Color Logic ===
  const filteredTickets = activeTab === "All"
    ? tickets
    : tickets.filter(t => t.status?.toLowerCase() === activeTab.toLowerCase());

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "bg-green-100 text-green-800";
    if (s === "pending") return "bg-yellow-100 text-yellow-800";
    if (s === "re opened") return "bg-purple-100 text-purple-800";
    if (s === "allocated") return "bg-blue-100 text-blue-800";
    if (s === "in progress") return "bg-orange-100 text-orange-800";
    if (s === "mark as completed") return "bg-teal-100 text-teal-800";
    return "bg-gray-100 text-gray-700";
  };

  return {
    // State
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

    // Data
    tickets,
    filteredTickets,
    totalRecords,
    totalPages,
    isLoading,
    isError,
    isFetching,

    // Actions
    refetch,
    handleView,
    handleEdit,
    handleDeleteClick,
    confirmDelete,

    // Helpers
    statusOptions,
    getStatusColor,
  };
};