// src/pages/ViewTicket.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText, Image, File, Calendar, User, Tag, Loader2 } from "lucide-react";
import { http } from "../../../../http";

const ViewTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const response = await http.get(`ticket/show/${id}`);

        if (response.data.status === 200) {
          setTicket(response.data.data);
        } else {
          setError("Failed to fetch ticket details");
        }
      } catch (err) {
        setError("Error fetching ticket details");
        console.error(err);
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
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    if (['pdf'].includes(ext)) {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const downloadFile = async (url, filename) => {
    try {
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
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await http.delete(`ticket/delete/${id}`);
      
      if (response.data.status === 200) {
        alert('Ticket deleted successfully');
        navigate('/tickets');
      } else {
        alert('Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Error deleting ticket');
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
    <div className="min-h-screen bg-gray-50  px-4 sm:px-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/tickets")}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
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
                <h2 className="text-2xl font-bold">{ticket.ticket_number}</h2>
                <p className="text-orange-100 mt-1">Created on {ticket.created_at}</p>
              </div>
              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                  {ticket.status || 'No Status'}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Tag className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-semibold text-gray-800 truncate">{ticket.service_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <User className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="font-semibold text-gray-800 truncate">{ticket.provider_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold text-gray-800">{ticket.created_at}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold text-gray-800">{ticket.updated_at}</p>
                </div>
              </div>
            </div>

            {/* Ticket Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Issue Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.ticket_details}</p>
              </div>
            </div>

            {/* Attached Documents */}
            {ticket.documents && ticket.documents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Attached Documents</h3>
                <div className="space-y-3">
                  {ticket.documents.map((doc, index) => (
                    <div key={doc.document_id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(doc.document_url)}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 truncate">
                            Document {index + 1}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {doc.document_url.split('/').pop()}
                          </p>
                        </div>
                      </div>
                      {/* <button
                        onClick={() => downloadFile(doc.document_url, `document-${ticket.ticket_number}-${index + 1}`)}
                        className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0 ml-3"
                      >
                        <Download size={16} />
                        Download
                      </button> */}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate("/tickets")}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Tickets
              </button>
              {/* <button
                onClick={() => navigate(`/update-ticket/${ticket.ticket_id}`)}
                className="px-6 py-3 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Edit Ticket
              </button> */}
              {/* <button
                onClick={handleDelete}
                className="px-6 py-3 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Ticket
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTicket;