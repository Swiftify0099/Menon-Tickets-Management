// src/pages/ViewTicket.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Image,
  File,
  Calendar,
  User,
  Tag,
  Loader2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { http } from "../../../../http";

const ViewTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTicket = async () => {
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

    if (id) fetchTicket();
  }, [id]);

  /* ---------- File Helpers ---------- */
  const getFileIcon = (url) => {
    const ext = url.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext))
      return <Image className="w-5 h-5 text-blue-600" />;
    if (["pdf"].includes(ext)) return <FileText className="w-5 h-5 text-red-600" />;
    if (["doc", "docx"].includes(ext)) return <FileText className="w-5 h-5 text-blue-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const isImageFile = (filename) => {
    const exts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    return exts.includes(filename.split(".").pop().toLowerCase());
  };

  const isPdfFile = (filename) => filename.toLowerCase().endsWith(".pdf");

  const getFileType = (filename) => {
    if (isImageFile(filename)) return "Image";
    if (isPdfFile(filename)) return "PDF";
    if (filename.toLowerCase().endsWith(".doc") || filename.toLowerCase().endsWith(".docx"))
      return "Word Document";
    return "File";
  };

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
    if (!ticket?.documents) return;
    const newIdx =
      dir === "next"
        ? (currentIndex + 1) % ticket.documents.length
        : (currentIndex - 1 + ticket.documents.length) % ticket.documents.length;
    setCurrentIndex(newIdx);
    setCurrentDocument(ticket.documents[newIdx]);
  };

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

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (["completed", "resolved"].includes(s)) return "bg-green-100 text-green-800 border border-green-200";
    if (["in-progress", "in_progress", "processing"].includes(s))
      return "bg-blue-100 text-blue-800 border border-blue-200";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-500 w-8 h-8 mx-auto" />
          <p className="mt-4 text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || "Ticket not found"}</p>
          <button
            onClick={() => navigate("/tickets")}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 px-4 sm:px-6">
  <ToastContainer position="top-right" autoClose={4000} theme="light" />

  <div className="max-w-8xl mx-auto">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Ticket Details / तिकिट तपशील
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            View complete ticket information / संपूर्ण तिकीट माहिती पहा
          </p>
        </div>
      </div>
    </div>

    {/* Main Card */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {ticket.ticket_number || `TICKET-${id}`}
            </h2>
            <p className="text-orange-100 mt-1">
              Created on / तयार केले दिनांक{" "}
              {new Date(ticket.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                ticket.status
              )}`}
            >
              {formatStatusText(ticket.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Tag className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Service / सेवा</p>
              <p className="font-semibold text-gray-800 truncate">
                {ticket.service_name || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <User className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Provider / प्रदाता</p>
              <p className="font-semibold text-gray-800 truncate">
                {ticket.provider_name || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Calendar className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Created Date / तयार केलेली तारीख</p>
              <p className="font-semibold text-gray-800">
                {new Date(ticket.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Calendar className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Last Updated / शेवटचे अद्यतन</p>
              <p className="font-semibold text-gray-800">
                {new Date(ticket.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Description / वर्णन
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {ticket.ticket_details || "No description provided. / वर्णन उपलब्ध नाही."}
            </p>
          </div>
        </div>

        {/* Documents */}
        {ticket.documents && ticket.documents.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Attached Documents / जोडलेली कागदपत्रे
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {ticket.documents.length} document(s) / कागदपत्रे
              </span>
            </div>
            {existingDocuments.map((doc, index) => {
  const fileUrl = doc.document_url;
  const fileName = fileUrl.split("/").pop();
  const fileType = getFileType(fileUrl);
  const isImage = /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(fileUrl); // ✅ image check

  return (
    <div
      key={doc.document_id}
      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
    >
      {/* File info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">{getFileIcon(fileUrl)}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 truncate">{fileName}</p>
          <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
            <span>{fileType}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>Existing Document / विद्यमान दस्तऐवज</span>
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* 👁️ Eye फक्त image साठी */}
        {isImage && (
          <button
            type="button"
            onClick={() => openDocumentViewer(doc, index)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="View document / दस्तऐवज पहा"
          >
            <Eye size={16} />
          </button>
        )}

        {/* 📥 Download सर्वांसाठी */}
        <button
          type="button"
          onClick={() => downloadDocument(doc)}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
          title="Download document / दस्तऐवज डाउनलोड करा"
        >
          <Download size={16} />
        </button>

      
      </div>
    </div>
  );
})}

          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 text-lg font-medium">
              No documents attached / कोणतीही कागदपत्रे जोडलेली नाहीत
            </p>
            <p className="text-gray-400 text-sm mt-1">
              There are no documents attached to this ticket / या तिकिटाशी कोणतीही कागदपत्रे जोडलेली नाहीत
            </p>
          </div>
        )}
      </div>

      {/* === TWO STATIC BUTTONS === */}
      <div className="p-6 ">
        <div className="flex justify-end gap-4">
          <div
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md cursor-pointer select-none flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:from-green-600 hover:to-emerald-700"
            onClick={() => toast.info("Mark as Completed clicked (static) / पूर्ण झाले म्हणून चिन्हांकित केले")}
          >
            <CheckCircle size={18} />
            <span>Mark as Completed / पूर्ण झाले म्हणून चिन्हांकित करा</span>
          </div>

          <div
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md cursor-pointer select-none flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:from-orange-600 hover:to-orange-700"
            onClick={() => toast.info("Reopen Ticket clicked (static) / तिकीट पुन्हा उघडले")}
          >
            <RotateCcw size={18} />
            <span>Reopen Ticket / तिकीट पुन्हा उघडा</span>
          </div>
        </div>
      </div>
      {/* === END OF BUTTONS === */}
    </div>
  </div>

  {/* Document Viewer Modal */}
  {viewerOpen && currentDocument && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {getFileIcon(currentDocument.document_url)}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {currentDocument.document_url.split("/").pop()}
              </h3>
              <p className="text-sm text-gray-500">
                {currentIndex + 1} of {ticket.documents.length} • {getFileType(currentDocument.document_url)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ticket.documents.length > 1 && (
              <>
                <button
                  onClick={() => navigateDocument("prev")}
                  className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Previous / मागील"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => navigateDocument("next")}
                  className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Next / पुढील"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <button
              onClick={() =>
                downloadFile(
                  currentDocument.document_url,
                  currentDocument.document_url.split("/").pop()
                )
              }
              className="p-3 text-green-600 hover:bg-green-50 rounded-lg"
              title="Download / डाउनलोड करा"
            >
              <Download size={20} />
            </button>
            <button
              onClick={closeDocumentViewer}
              className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Close / बंद करा"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto bg-gray-900 flex items-center justify-center">
          {isImageFile(currentDocument.document_url) ? (
            <img
              src={currentDocument.document_url}
              alt="Preview / पूर्वावलोकन"
              className="max-w-full max-h-full object-contain"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : isPdfFile(currentDocument.document_url) ? (
            <iframe
              src={currentDocument.document_url}
              className="w-full h-full border-0 bg-white"
              title="PDF / पीडीएफ"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-lg max-w-md">
              <FileText size={64} className="mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Preview Not Available / पूर्वावलोकन उपलब्ध नाही
              </h4>
              <p className="text-gray-600 mb-4">
                Download to view this file. / ही फाईल पाहण्यासाठी डाउनलोड करा.
              </p>
              <button
                onClick={() =>
                  downloadFile(
                    currentDocument.document_url,
                    currentDocument.document_url.split("/").pop()
                  )
                }
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 mx-auto"
              >
                <Download size={18} /> Download / डाउनलोड करा
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="font-medium">{getFileType(currentDocument.document_url)}</span>
            <span>
              {currentIndex + 1} of {ticket.documents.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )}
</div>

);

};

export default ViewTicket;