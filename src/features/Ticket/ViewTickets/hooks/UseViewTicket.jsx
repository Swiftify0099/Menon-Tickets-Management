// src/pages/hooks/useViewTicket.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { http } from "../../../../http";

export const useViewTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // === Fetch Ticket ===
  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await http.get(`ticket/show/${id}`);

        if (response.data.status === 200) {
          setTicket(response.data.data);
        } else {
          setError("Failed to fetch ticket details");
          toast.error("Failed to load ticket details");
        }
      } catch (err) {
        setError("Error fetching ticket details");
        console.error(err);
        toast.error("Error loading ticket details");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  // === File Helpers ===
  const getFileIcon = (url) => {
    const ext = url.split(".").pop().toLowerCase();
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const pdfExts = ["pdf"];
    const wordExts = ["doc", "docx"];

    if (imageExts.includes(ext)) return "image";
    if (pdfExts.includes(ext)) return "pdf";
    if (wordExts.includes(ext)) return "word";
    return "file";
  };

  const isImageFile = (url) => getFileIcon(url) === "image";
  const isPdfFile = (url) => getFileIcon(url) === "pdf";

  const getFileType = (url) => {
    const type = getFileIcon(url);
    return type === "image" ? "Image" :
           type === "pdf" ? "PDF" :
           type === "word" ? "Word Document" : "File";
  };

  // === Document Viewer ===
  const openDocumentViewer = (doc, idx) => {
    setCurrentDocument(doc);
    setCurrentIndex(idx);
    setViewerOpen(true);
  };

  const closeDocumentViewer = () => {
    setViewerOpen(false);
    setCurrentDocument(null);
    setCurrentIndex(0);
  };

  const navigateDocument = (dir) => {
    if (!ticket?.documents || ticket.documents.length === 0) return;

    const newIdx =
      dir === "next"
        ? (currentIndex + 1) % ticket.documents.length
        : (currentIndex - 1 + ticket.documents.length) % ticket.documents.length;

    setCurrentIndex(newIdx);
    setCurrentDocument(ticket.documents[newIdx]);
  };

  // === Download ===
  const downloadFile = async (url, filename) => {
    try {
      if (url.startsWith("http")) {
        window.open(url, "_blank");
        toast.info("Opening document...");
        return;
      }

      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
      toast.success("Download started");
    } catch (err) {
      window.open(url, "_blank");
      toast.info("Opening in new tab...");
    }
  };

  // === Status Helpers ===
  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (["completed", "resolved"].includes(s)) return "bg-green-100 text-green-800 border border-green-200";
    if (["in-progress", "in_progress", "processing"].includes(s)) return "bg-blue-100 text-blue-800 border border-blue-200";
    if (["pending", "open"].includes(s)) return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    if (["cancelled", "closed"].includes(s)) return "bg-red-100 text-red-800 border border-red-200";
    return "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const formatStatusText = (status) => {
    const map = {
      pending: "Pending",
      "in-progress": "In Progress",
      in_progress: "In Progress",
      completed: "Completed",
      resolved: "Resolved",
      cancelled: "Cancelled",
      closed: "Closed",
    };
    return map[status?.toLowerCase()] || status || "Unknown";
  };

  // === Static Button Handlers (can be extended later) ===
  const handleMarkAsCompleted = () => {
    toast.info("Mark as Completed clicked (static)");
  };

  const handleReopenTicket = () => {
    toast.info("Reopen Ticket clicked (static)");
  };

  return {
    // Data
    ticket,
    loading,
    error,

    // Viewer
    viewerOpen,
    currentDocument,
    currentIndex,

    // Handlers
    openDocumentViewer,
    closeDocumentViewer,
    navigateDocument,
    downloadFile,
    handleMarkAsCompleted,
    handleReopenTicket,

    // Helpers
    getFileIcon,
    isImageFile,
    isPdfFile,
    getFileType,
    getStatusColor,
    formatStatusText,
  };
};