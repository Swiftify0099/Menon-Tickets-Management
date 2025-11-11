import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText, Image, File, Calendar, User, Tag, Loader2, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

    if (id) {
      fetchTicket();
    }
  }, [id]);

  const getFileIcon = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    if (['pdf'].includes(ext)) {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    if (['doc', 'docx'].includes(ext)) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const isImageFile = (filename) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const ext = filename.split('.').pop().toLowerCase();
    return imageExtensions.includes(ext);
  };

  const isPdfFile = (filename) => {
    return filename.toLowerCase().endsWith('.pdf');
  };

  const getFileType = (filename) => {
    if (isImageFile(filename)) return 'Image';
    if (isPdfFile(filename)) return 'PDF';
    if (filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx')) return 'Word Document';
    return 'File';
  };

  const openDocumentViewer = (document, index) => {
    setCurrentDocument(document);
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const closeDocumentViewer = () => {
    setViewerOpen(false);
    setCurrentDocument(null);
    setCurrentIndex(0);
  };

  const navigateDocument = (direction) => {
    if (!ticket?.documents) return;
    
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % ticket.documents.length
      : (currentIndex - 1 + ticket.documents.length) % ticket.documents.length;
    
    setCurrentIndex(newIndex);
    setCurrentDocument(ticket.documents[newIndex]);
  };

  const downloadFile = async (url, filename) => {
    try {
      // For external URLs, open in new tab
      if (url.startsWith('http')) {
        window.open(url, '_blank');
        toast.info('Opening document in new tab...');
        return;
      }

      // For local files, use download approach
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || url.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Download started successfully');
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback: open in new tab
      window.open(url, '_blank');
      toast.info('Opening document in new tab...');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': 
      case 'resolved': 
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'in-progress': 
      case 'in_progress': 
      case 'processing': 
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending': 
      case 'open': 
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled': 
      case 'closed': 
        return 'bg-red-100 text-red-800 border border-red-200';
      default: 
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatStatusText = (status) => {
    if (!status) return 'No Status';
    
    const statusMap = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'resolved': 'Resolved',
      'cancelled': 'Cancelled',
      'closed': 'Closed'
    };
    
    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await http.delete(`ticket/delete/${id}`);
      
      if (response.data.status === 200) {
        toast.success('Ticket deleted successfully');
        setTimeout(() => {
          navigate('/tickets');
        }, 1500);
      } else {
        toast.error('Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Error deleting ticket');
    }
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
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="max-w-8xl mx-auto ">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/tickets")}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Ticket Details</h1>
              <p className="text-gray-600 text-sm mt-1">View complete ticket information</p>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">{ticket.ticket_number || `TICKET-${id}`}</h2>
                <p className="text-orange-100 mt-1">
                  Created on {new Date(ticket.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                  {formatStatusText(ticket.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <Tag className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-semibold text-gray-800 truncate">{ticket.service_name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <User className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="font-semibold text-gray-800 truncate">{ticket.provider_name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Created Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(ticket.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(ticket.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {ticket.ticket_details || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Attached Documents */}
            {ticket.documents && ticket.documents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Attached Documents
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {ticket.documents.length} document(s)
                  </span>
                </div>
                <div className="space-y-3">
                  {ticket.documents.map((doc, index) => (
                    <div key={doc.document_id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getFileIcon(doc.document_url)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 truncate">
                            {doc.document_url.split('/').pop()}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span>{getFileType(doc.document_url)}</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span>Document {index + 1}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDocumentViewer(doc, index)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View document"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => downloadFile(doc.document_url, doc.document_url.split('/').pop())}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Download document"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Documents Message */}
            {(!ticket.documents || ticket.documents.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500 text-lg font-medium">No documents attached</p>
                <p className="text-gray-400 text-sm mt-1">There are no documents attached to this ticket</p>
              </div>
            )}

        
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewerOpen && currentDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Viewer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {getFileIcon(currentDocument.document_url)}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {currentDocument.document_url.split('/').pop()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentIndex + 1} of {ticket.documents.length} documents • {getFileType(currentDocument.document_url)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ticket.documents.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateDocument('prev')}
                      className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="Previous document"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => navigateDocument('next')}
                      className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="Next document"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => downloadFile(currentDocument.document_url, currentDocument.document_url.split('/').pop())}
                  className="p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  title="Download"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={closeDocumentViewer}
                  className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 p-4 overflow-auto bg-gray-900 flex items-center justify-center">
              {isImageFile(currentDocument.document_url) ? (
                <div className="flex items-center justify-center h-full w-full">
                  <img
                    src={currentDocument.document_url}
                    alt="Document preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      console.error('Error loading image:', currentDocument.document_url);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : isPdfFile(currentDocument.document_url) ? (
                <div className="w-full h-full">
                  <iframe
                    src={currentDocument.document_url}
                    className="w-full h-full border-0 bg-white"
                    title="PDF document"
                  />
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-lg max-w-md">
                  <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Preview Not Available</h4>
                  <p className="text-gray-600 mb-4">
                    This file type cannot be previewed in the browser. Please download the file to view its contents.
                  </p>
                  <button
                    onClick={() => downloadFile(currentDocument.document_url, currentDocument.document_url.split('/').pop())}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Download size={18} />
                    Download File
                  </button>
                </div>
              )}
            </div>

            {/* Viewer Footer */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium">
                  {getFileType(currentDocument.document_url)} Document
                </span>
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