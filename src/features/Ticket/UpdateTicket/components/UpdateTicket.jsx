// src/pages/UpdateTicket.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from 'react-select';
import { Loader2, Upload, X, ArrowLeft, CheckCircle, FileText, Image, File, Eye, Download, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { http, ServiceProvider, services, deleteDocument, updateTicket } from "../../../../http";

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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  // Convert providers to react-select format
  const providerOptions = providers.map(provider => ({
    value: provider.id.toString(),
    label: provider.provider_name
  }));

  // Convert services to react-select format
  const serviceOptions = servicesList.map(service => ({
    value: service.id.toString(),
    label: service.service_name
  }));

  // Find current selected provider
  const selectedProvider = providerOptions.find(option => option.value === form.service_provider_id);

  // Find current selected service
  const selectedService = serviceOptions.find(option => option.value === form.service_id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch ticket details
        const ticketResponse = await http.get(`ticket/show/${id}`);

        if (ticketResponse.data.status === 200) {
          const ticket = ticketResponse.data.data;

          setForm({
            service_provider_id: ticket.service_provider_id?.toString() || "",
            service_id: ticket.service_id?.toString() || "",
            ticket_details: ticket.ticket_details || "",
          });

          setExistingDocuments(ticket.documents || []);
        } else {
          toast.error("Failed to load ticket details");
        }

        // Fetch providers
        const providersResponse = await ServiceProvider();
        if (providersResponse.status === 200) {
          setProviders(providersResponse.data || []);
        } else {
          toast.error("Failed to load service providers");
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load ticket data');
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
          } else {
            setServicesList([]);
            toast.error("Failed to load services");
          }
        } catch (error) {
          console.error('Error fetching services:', error);
          setServicesList([]);
          toast.error("Error loading services");
        }
      } else {
        setServicesList([]);
      }
    };

    fetchServices();
  }, [form.service_provider_id]);

  const handleProviderChange = (selectedOption) => {
    setForm(prev => ({
      ...prev,
      service_provider_id: selectedOption ? selectedOption.value : "",
      service_id: "" // Reset service when provider changes
    }));
  };

  const handleServiceChange = (selectedOption) => {
    setForm(prev => ({
      ...prev,
      service_id: selectedOption ? selectedOption.value : ""
    }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit

    if (validFiles.length !== files.length) {
      toast.warning("Some files exceed the 10MB size limit and were not added.");
    }

    if (validFiles.length > 0) {
      setNewDocuments(prev => [...prev, ...validFiles]);

      const newPreviews = validFiles.map(file => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type,
        file: file
      }));

      setPreviewFiles(prev => [...prev, ...newPreviews]);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }

    // Reset file input
    e.target.value = '';
  };

  const removeNewFile = (index) => {
    const removedFile = previewFiles[index];
    setNewDocuments(prev => prev.filter((_, i) => i !== index));
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
    toast.info(`"${removedFile.name}" removed from upload list`);
  };

  const removeExistingDocument = async (documentId) => {
    setDocumentToDelete(documentId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setDeletingDocument(documentToDelete);

      const response = await deleteDocument(documentToDelete);

      console.log('Delete API Response:', response); // Debug log

      // Handle different response structures
      let isSuccess = false;

      if (response?.data?.status === 200) {
        isSuccess = true;
      } else if (response?.status === 200) {
        isSuccess = true;
      } else if (response?.data?.success) {
        isSuccess = true;
      } else if (response?.success) {
        isSuccess = true;
      } else if (response?.data) {
        // If we have data but no clear success indicator, assume success
        isSuccess = true;
      }

      if (isSuccess) {
        // Remove document from state
        const removedDoc = existingDocuments.find(doc => doc.document_id === documentToDelete);
        setExistingDocuments(prev => prev.filter(doc => doc.document_id !== documentToDelete));

        // Show success toast with document name
        toast.success(
          <div>
            <p className="font-medium">Document deleted successfully</p>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );

        // Close viewer if currently viewing the deleted document
        if (currentDocument?.document_id === documentToDelete) {
          closeDocumentViewer();
        }
      } else {
        // Extract error message from different possible response structures
        const errorMessage =
          response?.data?.message ||
          response?.message ||
          response?.data?.error ||
          response?.error ||
          'Failed to delete document';

        toast.error(
          <div>
            <p className="font-medium">Failed to delete document</p>
            <p className="text-sm text-gray-600">{errorMessage}</p>
          </div>
        );
      }
    } catch (error) {
      console.error('Error removing document:', error);
      console.error('Error details:', error.response); // Debug log

      let errorMessage = 'Error deleting document. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(
        <div>
          <p className="font-medium">Delete Failed</p>
          <p className="text-sm text-gray-600">{errorMessage}</p>
        </div>
      );
    } finally {
      setDeletingDocument(null);
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);
    }
  };

  const cancelDeleteDocument = () => {
    setShowDeleteConfirm(false);
    setDocumentToDelete(null);
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
    if (!existingDocuments.length) return;

    const newIndex = direction === 'next'
      ? (currentIndex + 1) % existingDocuments.length
      : (currentIndex - 1 + existingDocuments.length) % existingDocuments.length;

    setCurrentIndex(newIndex);
    setCurrentDocument(existingDocuments[newIndex]);
  };

  const downloadDocument = (document) => {
    const link = document.document_url;
    if (link) {
      window.open(link, '_blank');
      toast.info('Opening document for download...');
    } else {
      toast.error('Document URL not found');
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext)) {
      return <Image className="w-4 h-4 text-blue-600" />;
    }
    if (["pdf"].includes(ext)) {
      return <FileText className="w-4 h-4 text-red-600" />;
    }
    if (["doc", "docx"].includes(ext)) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    }
    return <File className="w-4 h-4 text-gray-600" />;
  };

  const isImageFile = (filename) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const ext = filename.split(".").pop().toLowerCase();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.service_provider_id || !form.service_id || !form.ticket_details.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (form.ticket_details.trim().length < 10) {
      toast.error("Please provide a more detailed issue description (at least 10 characters)");
      return;
    }

    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append("ticket_id", id);
      formData.append("service_provider_id", form.service_provider_id);
      formData.append("service_id", form.service_id);
      formData.append("ticket_details", form.ticket_details.trim());

      // Append new documents
      newDocuments.forEach((file) => {
        formData.append("documents[]", file);
      });

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await updateTicket(formData);

      // Debug: Log the complete response
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);

      // Comprehensive success checking
      const isSuccess = 
        response?.data?.status === 200 ||
        response?.status === 200 ||
        response?.data?.success === true ||
        response?.success === true ||
        response?.data?.message?.toLowerCase().includes('success') ||
        response?.data?.message?.toLowerCase().includes('updated') ||
        (response?.data && Object.keys(response.data).length > 0); // If we have any data, consider it success

      if (isSuccess) {
        setSuccess(true);
        toast.success('Ticket updated successfully!');
        setTimeout(() => {
          navigate(`/ticket/${id}`);
        }, 2000);
      } else {
        // Extract error message from various possible locations
        const errorMessage = 
          response?.data?.message ||
          response?.message ||
          response?.data?.error ||
          response?.error ||
          'Failed to update ticket';

        console.log('Update failed with message:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      console.error('Error response:', error.response);
      
      // More comprehensive error handling
      const errorMessage = 
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.statusText ||
        error.message ||
        "Error updating ticket. Please try again.";

      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '52px',
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(249, 115, 22, 0.1)' : 'none',
      borderColor: state.isFocused ? '#f97316' : '#D1D5DB',
      '&:hover': {
        borderColor: state.isFocused ? '#f97316' : '#9CA3AF'
      },
      fontSize: '1rem',
      transition: 'all 0.2s'
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '1rem',
      padding: '12px 16px',
      backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? '#ffedd5' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:active': {
        backgroundColor: '#ea580c'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9CA3AF'
    }),
    singleValue: (base) => ({
      ...base,
      color: '#374151'
    })
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-500 w-8 h-8 mx-auto" />
          <p className="mt-4 text-gray-600">Loading ticket data...</p>
        </div>
        <ToastContainer />
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
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Update Ticket</h1>
            <p className="text-gray-600 text-sm mt-1">Modify ticket information and documents</p>
          </div>
        </div>

    
        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold">Update Ticket Information</h2>
            <p className="text-orange-100 text-sm mt-1">Update the fields below to modify your ticket</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Service Provider */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Provider <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedProvider}
                    onChange={handleProviderChange}
                    options={providerOptions}
                    placeholder="Select Provider"
                    isSearchable
                    styles={customStyles}
                    required
                  />
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedService}
                    onChange={handleServiceChange}
                    options={serviceOptions}
                    placeholder="Select Service"
                    isSearchable
                    isDisabled={!form.service_provider_id}
                    styles={customStyles}
                    required
                  />
                  {!form.service_provider_id && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      Please select a provider first
                    </p>
                  )}
                </div>

                {/* Existing Documents */}
                {existingDocuments.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Existing Documents
                      <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {existingDocuments.length} document(s)
                      </span>
                    </label>
                    <div className="space-y-3">
                      {existingDocuments.map((doc, index) => (
                        <div key={doc.document_id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              {getFileIcon(doc.document_url)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {doc.document_url.split('/').pop()}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <span>{getFileType(doc.document_url)}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>Existing Document</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openDocumentViewer(doc, index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View document"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadDocument(doc)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Download document"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeExistingDocument(doc.document_id)}
                              disabled={deletingDocument === doc.document_id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove document"
                            >
                              {deletingDocument === doc.document_id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <X size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Documents */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Add New Documents
                    {previewFiles.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        {previewFiles.length} new file(s)
                      </span>
                    )}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-all duration-200 cursor-pointer bg-gray-50/50">
                    <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <label className="cursor-pointer block">
                      <span className="text-base font-medium text-orange-600 hover:text-orange-700 transition-colors">
                        Click to upload files
                      </span>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.svg"
                      />
                    </label>
                    <p className="text-gray-500 text-sm mt-2">Supports PDF, DOC, JPG, PNG, GIF • Max 10MB each</p>
                  </div>

                  {/* New File List */}
                  {previewFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-gray-700">Files to be uploaded:</p>
                      {previewFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-white rounded-lg border border-orange-200">
                              {getFileIcon(file.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <span>{getFileType(file.name)}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>{file.size}</span>
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewFile(i)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Remove file"
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
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      {form.ticket_details.length}/1000 characters
                    </span>
                  </label>
                  <textarea
                    name="ticket_details"
                    value={form.ticket_details}
                    onChange={handleTextChange}
                    required
                    placeholder="Describe the issue in detail... Please include any relevant information that will help us resolve your ticket quickly."
                    className="flex-1 w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none transition-all duration-200 hover:border-gray-400 min-h-[300px]"
                    maxLength={1000}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Minimum 10 characters required</span>
                    <span>{form.ticket_details.length} / 1000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating || !form.service_provider_id || !form.service_id || !form.ticket_details.trim() || form.ticket_details.trim().length < 10}
                className="px-8 py-3 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Update Ticket"}
              </button>
            </div>
          </form>
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
                    {currentIndex + 1} of {existingDocuments.length} documents • {getFileType(currentDocument.document_url)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {existingDocuments.length > 1 && (
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
                  onClick={() => downloadDocument(currentDocument)}
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
                    onClick={() => downloadDocument(currentDocument)}
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
                  {currentIndex + 1} of {existingDocuments.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Delete Document
              </h3>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this document? This action cannot be undone and the document will be permanently removed.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelDeleteDocument}
                  disabled={deletingDocument}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteDocument}
                  disabled={deletingDocument}
                  className="px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deletingDocument ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Document'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateTicket;