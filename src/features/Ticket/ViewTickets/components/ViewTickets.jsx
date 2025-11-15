// src/pages/ViewTicket.jsx
import React, { useState } from "react";
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
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  RotateCcw,
  MessageSquare,
  Video,
  Archive,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";
import { parse, format } from "date-fns";
import { http } from "../../../../http";

// ✨ Skeleton Component
const SkeletonBox = ({ className }) => (
  <div className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-md ${className}`} />
);

const ViewTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReopenPopup, setShowReopenPopup] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [attachments, setAttachments] = useState([]);

  // Static remarks data
  const staticRemarks = [
    {
      id: 1,
      takenBy: "John Doe",
      date: "2024-01-15",
      remark: "Initial assessment completed. Waiting for parts to arrive from supplier.",
      timestamp: "2024-01-15 10:30 AM",
      attachments: [
        {
          name: "initial_assessment.pdf",
          url: "/documents/initial_assessment.pdf",
          type: "pdf"
        },
        {
          name: "damage_photos.zip",
          url: "/documents/damage_photos.zip",
          type: "archive"
        }
      ]
    },
    {
      id: 2,
      takenBy: "Jane Smith",
      date: "2024-01-16",
      remark: "Parts received. Started repair work. Estimated completion in 2 days.",
      timestamp: "2024-01-16 02:15 PM",
      attachments: [
        {
          name: "parts_receipt.jpg",
          url: "/images/parts_receipt.jpg",
          type: "image"
        },
        {
          name: "repair_progress.mp4",
          url: "/videos/repair_progress.mp4",
          type: "video"
        },
        {
          name: "work_log.pdf",
          url: "/documents/work_log.pdf",
          type: "pdf"
        }
      ]
    },
    {
      id: 3,
      takenBy: "Mike Johnson",
      date: "2024-01-18",
      remark: "Repair completed successfully. Quality check passed. Ready for delivery.",
      timestamp: "2024-01-18 11:45 AM",
      attachments: [
        {
          name: "final_report.pdf",
          url: "/documents/final_report.pdf",
          type: "pdf"
        },
        {
          name: "quality_certificate.jpg",
          url: "/images/quality_certificate.jpg",
          type: "image"
        },
        {
          name: "completion_photos.zip",
          url: "/documents/completion_photos.zip",
          type: "archive"
        }
      ]
    }
  ];

  // React Query Fetch
  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const res = await http.get(`ticket/show/${id}`);
      if (res.data.status !== 200) throw new Error("Ticket not found");
      return res.data.data;
    },
    retry: 1,
  });

  const handleReopenConfirm = () => {
    // dispatch(reopenTicket({ id: ticket.id, reason: reopenReason }));
    setShowReopenPopup(false);
    setReopenReason('');
    toast.info("Reopen Ticket clicked  / तिकीट पुन्हा उघडले")
  };

  const handleDownload = (attachment) => {
    // Your download logic here
    console.log('Downloading:', attachment.name);
    // Example download implementation:
    // const link = document.createElement('a');
    // link.href = attachment.url;
    // link.download = attachment.name;
    // link.click();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const parsedDate = parse(dateStr, "dd-MM-yyyy hh:mm a", new Date());
      return format(parsedDate, "dd MMM yyyy, hh:mm a");
    } catch (err) {
      return dateStr;
    }
  };

  // File Utilities
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
        toast.info("Document has been downloaded successfully/ दस्तावेज यशस्वीरित्या डाउनलोड करण्यात आला आहे");
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
    if (["completed", "resolved"].includes(s))
      return "bg-green-100 text-green-800 border border-green-200";
    if (["in-progress", "in_progress", "processing"].includes(s))
      return "bg-blue-100 text-blue-800 border border-blue-200";
    if (["pending", "open"].includes(s))
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    if (["cancelled", "closed"].includes(s))
      return "bg-red-100 text-red-800 border border-red-200";
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

  // Skeleton Loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10 animate-fadeIn">
        <div className="max-w-6xl mx-auto space-y-6">
          <SkeletonBox className="h-8 w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBox key={i} className="h-32" />
            ))}
          </div>
          <SkeletonBox className="h-6 w-1/4 mt-8" />
          {[1, 2, 3].map((i) => (
            <SkeletonBox key={i} className="h-20" />
          ))}
          <SkeletonBox className="h-6 w-1/4 mt-8" />
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            Ticket not found / त्रुटी
          </p>
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

  // ✅ Main UI
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Ticket ID {ticket.ticket_number || `TICKET-${id}`}
                </h2>
                <p className="text-orange-100 mt-1">
                  Created on / तयार केले दिनांक {formatDate(ticket.created_at)}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Service */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Tag className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Service / सेवा</p>
                  <p className="font-semibold text-gray-800 truncate">{ticket.service_name || "N/A"}</p>
                </div>
              </div>

              {/* Provider */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <User className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Provider / प्रदाता</p>
                  <p className="font-semibold text-gray-800 truncate">{ticket.provider_name || "N/A"}</p>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Created Date / तयार केलेली तारीख</p>
                  <p className="font-semibold text-gray-800">{formatDate(ticket.created_at)}</p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated / शेवटचे अद्यतन</p>
                  <p className="font-semibold text-gray-800">{formatDate(ticket.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-semibold text-gray-800">Status कृती इतिहास / Action History कार्य नोंद</h3>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                  <MessageSquare size={14} />
                  {staticRemarks.length} remark(s) / शेरा
                </span>
              </div>
              
              {/* Grid with 3 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {staticRemarks.map((remark, index) => (
                  <div key={remark.id} className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-orange-200 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full">
                    {/* Header with User Info and Labels */}
                    <div className="flex flex-col gap-3 mb-4">
  <div className="flex h-10 items-start gap-3">
    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
      {remark.takenBy.split(" ").map((n) => n[0]).join("")}
    </div>

    <div className="flex-1 min-w-0">
      {/* Name + Technician */}
      <div className="flex items-center gap-2 mb-1">
        <p className="font-semibold text-gray-800 text-sm truncate">
          {remark.takenBy}
        </p>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200 flex-shrink-0">
          Technician
        </span>
      </div>

      {/* Date + Taken By (Right aligned) */}
      <div className="flex justify-between items-center text-xs text-gray-500 w-full">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {remark.date}
        </span>

        <span className="flex items-center gap-1">
          <User size={12} />
          Taken By / घेतले
        </span>
      </div>
    </div>
  </div>
</div>


                    {/* Remark Content */}
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-inner mb-4 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-orange-500" />
                        <label className="text-sm font-medium text-gray-700">Remark / शेरा:</label>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded border-l-4 border-orange-500 max-h-20 overflow-y-auto">
                        {remark.remark}
                      </p>
                    </div>

                    {/* Document Attachments - Dynamic */}
                    {remark.attachments && remark.attachments.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                        <div className="flex items-center gap-4 mb-2">
                          <FileText size={14} className="text-blue-600" />
                          <label className="text-sm font-medium text-gray-700">Attachments:</label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {remark.attachments.map((attachment, index) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group"
                              onClick={() => window.open(attachment.url, '_blank')}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {attachment.type === 'image' ? (
                                  <Image className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                ) : attachment.type === 'pdf' ? (
                                  <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                                ) : attachment.type === 'video' ? (
                                  <Video className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                ) : attachment.type === 'archive' ? (
                                  <Archive className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                ) : (
                                  <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-800 text-xs truncate group-hover:text-blue-600 transition-colors">
                                    {attachment.name}
                                  </p>
                                </div>
                              </div>
                              <button 
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors flex-shrink-0" 
                                title="Download"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(attachment);
                                }}
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                   
                  </div>
                ))}
              </div>
            </div>

            {/* Description and Remarks Section in Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-1 mt-5 gap-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description / वर्णन</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.ticket_details || "No description provided. / वर्णन उपलब्ध नाही."}</p>
                </div>
              </div>
              
              {/* Documents */}
              {ticket.documents && ticket.documents.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mt-5 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Attached Documents / जोडलेली कागदपत्रे</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{ticket.documents.length} document(s) / कागदपत्रे</span>
                  </div>
                  <div className="space-y-3">
                    {ticket.documents.map((doc, idx) => (
                      <div key={doc.document_id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">{getFileIcon(doc.document_url)}</div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-800 truncate">{doc.document_url.split("/").pop()}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <span>{getFileType(doc.document_url)}</span>
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>Document / कागदपत्र {idx + 1}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openDocumentViewer(doc, idx)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View / पहा"><Eye size={18} /></button>
                          <button onClick={() => downloadFile(doc.document_url, doc.document_url.split("/").pop())} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download / डाउनलोड करा"><Download size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 mt-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 text-lg font-medium">No documents attached / कोणतीही कागदपत्रे जोडलेली नाहीत</p>
                  <p className="text-gray-400 text-sm mt-1">There are no documents attached to this ticket / या तिकिटाशी कोणतीही कागदपत्रे जोडलेली नाहीत</p>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="p-6 mt-5">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md cursor-pointer select-none flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:from-green-600 hover:to-emerald-700 w-full sm:w-auto justify-center"
                onClick={() => toast.info("Mark as Completed clicked  / पूर्ण झाले म्हणून चिन्हांकित केले")}
              >
                <CheckCircle size={18} />
                <span>Mark as Completed / पूर्ण झाले म्हणून चिन्हांकित करा</span>
              </button>

              <button
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md cursor-pointer select-none flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 w-full sm:w-auto justify-center"
                onClick={() => setShowReopenPopup(true)}
              >
                <RotateCcw size={18} />
                <span>Reopen Ticket / तिकीट पुन्हा उघडा</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reopen Ticket Popup */}
      {showReopenPopup && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowReopenPopup(false)}
        >
          <div
            className="bg-white/90 backdrop-blur-xl border border-gray-200 p-6 rounded-2xl shadow-2xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowReopenPopup(false)}
              className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
              🎫 Reopen Ticket / तिकीट पुन्हा उघडा
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reopening / पुन्हा उघडण्याचे कारण:
                </label>
                <textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                  rows="4"
                  placeholder="Enter your reason... / तुमचे कारण प्रविष्ट करा..."
                />
              </div>

              {/* Attachment Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach up to 5 files / जास्तीत जास्त ५ फाईल जोडा:
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 5) {
                      toast.info("You can upload up to 5 attachments only! / तुम्ही फक्त ५ फाईल जोडू शकता!");
                      e.target.value = "";
                      return;
                    }
                    setAttachments(files);
                  }}
                  className="block w-full p-5 text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />

                {attachments.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-700 list-disc pl-4 space-y-1">
                    {attachments.map((file, i) => (
                      <li key={i}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReopenPopup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel / रद्द करा
              </button>
              <button
                onClick={handleReopenConfirm}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors"
              >
                Confirm / पुष्टी करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewerOpen && currentDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {getFileIcon(currentDocument.document_url)}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{currentDocument.document_url.split("/").pop()}</h3>
                  <p className="text-sm text-gray-500">{currentIndex + 1} of {ticket.documents.length} • {getFileType(currentDocument.document_url)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ticket.documents.length > 1 && (
                  <>
                    <button onClick={() => navigateDocument("prev")} className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg" title="Previous / मागील"><ChevronLeft size={20} /></button>
                    <button onClick={() => navigateDocument("next")} className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg" title="Next / पुढील"><ChevronRight size={20} /></button>
                  </>
                )}
                <button onClick={() => downloadFile(currentDocument.document_url, currentDocument.document_url.split("/").pop())} className="p-3 text-green-600 hover:bg-green-50 rounded-lg" title="Download / डाउनलोड करा"><Download size={20} /></button>
                <button onClick={closeDocumentViewer} className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg" title="Close / बंद करा"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto bg-gray-900 flex items-center justify-center">
              {isImageFile(currentDocument.document_url) ? (
                <img src={currentDocument.document_url} alt="Preview / पूर्वावलोकन" className="max-w-full max-h-full object-contain" onError={(e) => (e.target.style.display = "none")} />
              ) : isPdfFile(currentDocument.document_url) ? (
                <iframe src={currentDocument.document_url} className="w-full h-full border-0 bg-white" title="PDF / पीडीएफ" />
              ) : (
                <div className="text-center p-8 bg-white rounded-lg max-w-md">
                  <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Preview Not Available / पूर्वावलोकन उपलब्ध नाही</h4>
                  <p className="text-gray-600 mb-4">Download to view this file. / ही फाईल पाहण्यासाठी डाउनलोड करा.</p>
                  <button onClick={() => downloadFile(currentDocument.document_url, currentDocument.document_url.split("/").pop())} className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 mx-auto">
                    <Download size={18} /> Download / डाउनलोड करा
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium">{getFileType(currentDocument.document_url)}</span>
                <span>{currentIndex + 1} of {ticket.documents.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTicket;