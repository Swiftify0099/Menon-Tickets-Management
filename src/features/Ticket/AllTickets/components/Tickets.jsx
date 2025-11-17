// src/features/Ticket/AllTickets/components/Tickets.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Trash2,
  FolderOpenDot,
  Eye,
  Edit,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ticketlist, http } from "../../../../http";
import { toast } from "react-toastify";

const Tickets = () => {
  const [activeTab, setActiveTab] = useState("All / सर्व");
  const [page, setPage] = useState(1);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const limit = 10;
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
const [filter, setFilter] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("dashboard-tickets")) || {};
  } catch {
    return {};
  }
});
  
  const dropdownRef = useRef(null);

  // ⭐ FIX 1: Correct userId
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const userId = currentUser?.id?.toString();

  const statusOptions = [
    "All / सर्व",
    "Pending / प्रलंबित",
    "In Progress / चालू आहे",
    "Mark as Completed / पूर्ण म्हणून चिन्हांकित",
   
  ];

const getStatusForAPI = (status) => {
  const statusMap = {
    "Pending / प्रलंबित": "pending",
    "In Progress / चालू आहे": "in-progress",
    "Mark as Completed / पूर्ण म्हणून चिन्हांकित": "completed",
    "ReOpened / पुन्हा उघडले": "re-opened"
  };
  return statusMap[status] || null;
};


  // ⭐ FIX 2: queryKey मध्ये userId add केला
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tickets", page, activeTab, userId],
    queryFn: async () => {
      const status =
        activeTab === "All / सर्व" ? null : getStatusForAPI(activeTab);
      const res = await ticketlist(page, limit, status, userId);
      return res || {};
    },
    keepPreviousData: true,
    staleTime: 0, // ⭐ FIX 3: Always fetch fresh data
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
      toast.success("Ticket deleted successfully! / तिकीट यशस्वीरित्या हटवले गेले!");
      refetch();
      setShowDeleteModal(false);
      setDeletingTicket(null);
      setIsDeleting(false);
    },
    onError: () => {
      toast.error("Failed to delete ticket / तिकीट हटवण्यात अयशस्वी");
      setIsDeleting(false);
    },
  });

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

 const getStatusColor = (status) => {
  const s = status?.toLowerCase();

  if (s === "completed") return "bg-green-100 text-green-800";
  if (s === "pending") return "bg-yellow-100 text-yellow-800";
  if (s === "re-opened") return "bg-purple-100 text-purple-800";
  if (s === "allocated") return "bg-blue-100 text-blue-800";
  if (s === "in-progress") return "bg-orange-100 text-orange-800";

  return "bg-gray-100 text-gray-700";
};


  const formatDate = (dateString) => {
    if (!dateString || dateString === "null") return "—";
    return dateString;
  };

  const formatAssignName = (name) => {
    if (!name || name.trim() === "" || name === " ") return "—";
    return name;
  };
const normalizeStatus = (s) => {
  if (!s) return null;

  let x = s.toLowerCase().trim();

  if (x === "working progress") return "in-progress";
  if (x === "re opened") return "re-opened";

  return x;
};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowStatusFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* UI SAME — NO CHANGES DONE */}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            All Tickets / सर्व तिकिटे
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-all shadow-md w-full sm:w-auto justify-between"
              >
                <span>{activeTab}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showStatusFilter ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showStatusFilter && (
                <div className="absolute top-full right-1 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setActiveTab(status);
                          setShowStatusFilter(false);
                          setPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 transition ${
                          activeTab === status
                            ? "bg-orange-100 text-orange-500 font-medium"
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-500 text-white">
                  <tr>
                    {[
                      "Ticket No / तिकीट क्र.",
                      "Service / सेवा",
                      "Provider / प्रदाता",
                      "Assign To / नेमणूक",
                      "Assign Date / नेमणूक तारीख",
                      "Status / स्थिती",
                      "Created / तयार केले",
                      "Actions / कृती",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-sm font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : isError ? (
              <div className="text-center py-12 text-orange-500 font-medium">
                Failed to load tickets / तिकिटे लोड करण्यात अयशस्वी
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderOpenDot
                  size={48}
                  className="mx-auto mb-4 text-gray-300"
                />
                <p>No tickets found / कोणतीही तिकिटे सापडली नाहीत</p>
                {activeTab !== "All / सर्व" && (
                  <button
                    onClick={() => setActiveTab("All / सर्व")}
                    className="mt-2 text-orange-600 hover:text-orange-500 text-sm font-medium"
                  >
                    Clear filters / फिल्टर काढा
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-500 text-white">
                  <tr>
                    {[
                      "Ticket No / तिकीट क्र.",
                      "Service / सेवा",
                      "Provider / प्रदाता",
                      "Assign To / नेमणूक",
                      "Assign Date / नेमणूक तारीख",
                      "Status / स्थिती",
                      "Created / तयार केले",
                      "Actions / कृती",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-sm font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-mono font-bold text-black">
                        {t.ticket_number}
                      </td>
                      <td className="px-5 py-4 font-medium">
                        {t.service_name}
                      </td>
                      <td className="px-5 py-4">{t.provider_name}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {formatAssignName(t.assign_user_name)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(t.assign_date)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                            t.status
                          )}`}
                        >
                          {t.status || "Open / उघडा"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(t.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleView(t.id)}
                            className="p-2.5 bg-green-200 text-green-800 rounded-lg hover:bg-green-400 transition group"
                          >
                            <Eye
                              size={18}
                              className="group-hover:scale-110 transition"
                            />
                          </button>
                            {t.assign_to?.toString() === userId && (
                          <button
                            onClick={() => handleEdit(t.id)}
                            className="p-2.5 bg-yellow-100 text-orange-700 rounded-lg hover:bg-yellow-300 transition group"
                          >
                            <Edit
                              size={18}
                              className="group-hover:scale-110 transition"
                            />
                          </button>
                                  )}
                          {/* ⭐ FIX 4: Delete फक्त assigned user ला दिसेल */}
                          {t.assign_to?.toString() === userId && (
                            <button
                              onClick={() => handleDeleteClick(t)}
                              className="p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-300 transition group"
                            >
                              <Trash2
                                size={18}
                                className="group-hover:scale-110 transition"
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination SAME */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-700">
                Showing page / पृष्ठ दाखवत आहे <strong>{page}</strong> of /
                पैकी <strong>{totalPages}</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 border border-orange-300 text-orange-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 transition"
                >
                  Previous / मागील
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next / पुढे
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal SAME */}
      {showDeleteModal && deletingTicket && (
        <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={40} className="text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Delete Ticket? / तिकीट हटवायचे का?
              </h3>
              <strong className="block text-orange-600 font-mono text-2xl mt-2">
                {deletingTicket.ticket_number}
              </strong>
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
                Cancel / रद्द करा
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition font-medium flex items-center gap-3 shadow-lg"
              >
                {isDeleting && <Loader2 className="animate-spin" size={18} />}
                {isDeleting ? "Deleting..." : "Yes, Delete / हो, हटवा"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tickets;
