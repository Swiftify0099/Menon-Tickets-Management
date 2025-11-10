// src/pages/UpdateTicket.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Upload, X, ArrowLeft, CheckCircle, FileText, Image, File } from "lucide-react";
import { http, ServiceProvider, services } from "../../../../http";

const UpdateTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    service_provider_id: "",
    service_id: "",
    ticket_details: "",
  });
  
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [providers, setProviders] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch ticket details
        const ticketResponse = await http.get(`ticket/show/${id}`);
        
        if (ticketResponse.data.status === 200) {
          const ticket = ticketResponse.data.data;
          
          setForm({
            service_provider_id: ticket.service_provider_id.toString(),
            service_id: ticket.service_id.toString(),
            ticket_details: ticket.ticket_details,
          });
          
          setExistingDocuments(ticket.documents || []);
        }

        // Fetch providers
        const providersResponse = await ServiceProvider();
        if (providersResponse.status === 200) {
          setProviders(providersResponse.data || []);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Fetch services when provider changes
  useEffect(() => {
    const fetchServices = async () => {
      if (form.service_provider_id) {
        try {
          const servicesResponse = await services(form.service_provider_id);
          if (servicesResponse.status === 200) {
            setServicesList(servicesResponse.data || []);
          }
        } catch (error) {
          console.error('Error fetching services:', error);
          setServicesList([]);
        }
      } else {
        setServicesList([]);
      }
    };

    fetchServices();
  }, [form.service_provider_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value,
      // Reset service_id when provider changes
      ...(name === 'service_provider_id' && { service_id: "" })
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    
    if (validFiles.length !== files.length) {
      alert("Some files exceed the 10MB size limit and were not added.");
    }

    setNewDocuments(prev => [...prev, ...validFiles]);
    
    const newPreviews = validFiles.map(file => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      file: file
    }));
    
    setPreviewFiles(prev => [...prev, ...newPreviews]);
  };

  const removeNewFile = (index) => {
    setNewDocuments(prev => prev.filter((_, i) => i !== index));
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to remove this document?")) {
      return;
    }

    try {

      setExistingDocuments(prev => prev.filter(doc => doc.document_id !== documentId));
    } catch (error) {
      console.error('Error removing document:', error);
      alert('Error removing document');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.service_provider_id || !form.service_id || !form.ticket_details) {
      alert("Please fill all required fields");
      return;
    }

    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append("ticket_id", id);
      formData.append("service_provider_id", form.service_provider_id);
      formData.append("service_id", form.service_id);
      formData.append("ticket_details", form.ticket_details);
      
      // Append new documents
      newDocuments.forEach((file) => {
        formData.append("documents[]", file);
      });

      const response = await http.post('ticket/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/ticket/${id}`);
        }, 2000);
      } else {
        alert("Failed to update ticket");
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert("Error updating ticket");
    } finally {
      setUpdating(false);
    }
  };

  const getFileIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return <Image className="w-4 h-4 text-blue-600" />;
    if (["pdf"].includes(ext)) return <FileText className="w-4 h-4 text-red-600" />;
    return <File className="w-4 h-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-500 w-8 h-8 mx-auto" />
          <p className="mt-4 text-gray-600">Loading ticket data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50  px-4 sm:px-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Update Ticket</h1>
            <p className="text-gray-600 text-sm mt-1">Modify ticket information</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-4">
            <CheckCircle size={32} />
            <div>
              <h3 className="text-lg font-bold">Ticket Updated Successfully!</h3>
              <p className="text-sm mt-1">Redirecting to ticket details...</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white px-6 py-4">
            <h2 className="text-xl font-bold">Update Ticket Information</h2>
            <p className="text-orange-100 text-sm mt-1">Update the fields below</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Service Provider */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Provider <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="service_provider_id"
                    value={form.service_provider_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                  >
                    <option value="">Select Provider</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>{p.provider_name}</option>
                    ))}
                  </select>
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="service_id"
                    value={form.service_id}
                    onChange={handleChange}
                    required
                    disabled={!form.service_provider_id}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Service</option>
                    {servicesList.map((s) => (
                      <option key={s.id} value={s.id}>{s.service_name}</option>
                    ))}
                  </select>
                  {!form.service_provider_id && (
                    <p className="text-xs text-gray-500 mt-1">Please select a provider first</p>
                  )}
                </div>

                {/* Existing Documents */}
                {existingDocuments.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Existing Documents
                    </label>
                    <div className="space-y-2">
                      {existingDocuments.map((doc) => (
                        <div key={doc.document_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getFileIcon(doc.document_url)}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {doc.document_url.split('/').pop()}
                              </p>
                              <p className="text-xs text-gray-500">Existing Document</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingDocument(doc.document_id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                            title="Remove document"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Documents */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Add New Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <label className="cursor-pointer mt-2 block">
                      <span className="text-sm font-medium text-orange-600 hover:text-orange-700">
                        Click to upload files
                      </span>
                      <input 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      />
                    </label>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG, PDF, DOC • Max 10MB each</p>
                  </div>

                  {/* New File List */}
                  {previewFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-gray-600">New files to upload:</p>
                      {previewFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-white rounded border">{getFileIcon(file.name)}</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeNewFile(i)} 
                            className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Ticket Details */}
                <div className="h-full flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="ticket_details"
                    value={form.ticket_details}
                    onChange={handleChange}
                    required
                    placeholder="Describe the issue in detail..."
                    className="flex-1 w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none transition min-h-[250px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-8 py-3 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updating && <Loader2 className="animate-spin" size={16} />}
                    {updating ? "Updating..." : "Update Ticket"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateTicket;