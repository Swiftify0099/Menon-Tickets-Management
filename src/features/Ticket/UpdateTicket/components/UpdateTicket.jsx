// src/pages/UpdateTicket.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { Loader2, Upload, X, ArrowLeft, FileText, Image, File, Eye, Download, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUpdateTicket } from "../hooks/UseUpdateTicket";

const UpdateTicket = () => {
  const navigate = useNavigate();
  const {
    form,
    existingDocuments,
    previewFiles,
    providers,
    servicesList,
    loading,
    updating,
    viewerOpen,
    currentDocument,
    currentIndex,
    showDeleteConfirm,
    deletingDocument,
    providerOptions,
    serviceOptions,
    selectedProvider,
    selectedService,
    handleProviderChange,
    handleServiceChange,
    handleTextChange,
    handleFileChange,
    removeNewFile,
    removeExistingDocument,
    confirmDeleteDocument,
    cancelDeleteDocument,
    openDocumentViewer,
    closeDocumentViewer,
    navigateDocument,
    downloadDocument,
    handleSubmit,
    getFileIcon,
    isImageFile,
    isPdfFile,
    getFileType,
    formatFileSize,
  } = useUpdateTicket();

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '52px',
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(249, 115, 22, 0.1)' : 'none',
      borderColor: state.isFocused ? '#f97316' : '#D1D5DB',
      '&:hover': { borderColor: state.isFocused ? '#f97316' : '#9CA3AF' },
      fontSize: '1rem',
      transition: 'all 0.2s'
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '1rem',
      padding: '12px 16px',
      backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? '#ffedd5' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:active': { backgroundColor: '#ea580c' }
    }),
    menu: base => ({ ...base, borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }),
    placeholder: base => ({ ...base, color: '#9CA3AF' }),
    singleValue: base => ({ ...base, color: '#374151' })
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
      <ToastContainer position="top-right" autoClose={5000} theme="light" />

      <div className="max-w-8xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Update Ticket</h1>
            <p className="text-gray-600 text-sm mt-1">Modify ticket information and documents</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold">Update Ticket Information</h2>
            <p className="text-orange-100 text-sm mt-1">Update the fields below to modify your ticket</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Provider <span className="text-red-500">*</span>
                  </label>
                  <Select value={selectedProvider} onChange={handleProviderChange} options={providerOptions} placeholder="Select Provider" isSearchable styles={customStyles} required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <Select value={selectedService} onChange={handleServiceChange} options={serviceOptions} placeholder="Select Service" isSearchable isDisabled={!form.service_provider_id} styles={customStyles} required />
                  {!form.service_provider_id && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      Please select a provider first
                    </p>
                  )}
                </div>

                {existingDocuments.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Existing Documents
                      <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {existingDocuments.length} document(s)
                      </span>
                    </label>
                    <div className="space-y-3">
                      {existingDocuments.map((doc, i) => (
                        <div key={doc.document_id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div>{getFileIcon(doc.document_url) === "image" ? <Image className="w-4 h-4 text-blue-600" /> : getFileIcon(doc.document_url) === "pdf" ? <FileText className="w-4 h-4 text-red-600" /> : getFileIcon(doc.document_url) === "word" ? <FileText className="w-4 h-4 text-blue-600" /> : <File className="w-4 h-4 text-gray-600" />}</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">{doc.document_url.split('/').pop()}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <span>{getFileType(doc.document_url)}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>Existing</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* <button type="button" onClick={() => openDocumentViewer(doc, i)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><Eye size={16} /></button> */}
                            <button type="button" onClick={() => downloadDocument(doc)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Download"><Download size={16} /></button>
                            <button type="button" onClick={() => removeExistingDocument(doc.document_id)} disabled={deletingDocument === doc.document_id} className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50">
                              {deletingDocument === doc.document_id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Add New Documents
                    {previewFiles.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        {previewFiles.length} new
                      </span>
                    )}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 bg-gray-50/50 cursor-pointer">
                    <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <label className="cursor-pointer block">
                      <span className="text-base font-medium text-orange-600 hover:text-orange-700">Click to upload</span>
                      <input type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.svg" />
                    </label>
                    <p className="text-gray-500 text-sm mt-2">PDF, DOC, JPG, PNG • Max 10MB</p>
                  </div>

                  {previewFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-gray-700">Files to upload:</p>
                      {previewFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-white rounded-lg border border-orange-200">
                              {getFileIcon(f.name) === "image" ? <Image className="w-4 h-4 text-blue-600" /> : getFileIcon(f.name) === "pdf" ? <FileText className="w-4 h-4 text-red-600" /> : getFileIcon(f.name) === "word" ? <FileText className="w-4 h-4 text-blue-600" /> : <File className="w-4 h-4 text-gray-600" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <span>{getFileType(f.name)}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>{f.size}</span>
                              </p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeNewFile(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="h-full flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Description <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs font-normal text-gray-500">{form.ticket_details.length}/1000</span>
                  </label>
                  <textarea
                    name="ticket_details"
                    value={form.ticket_details}
                    onChange={handleTextChange}
                    required
                    placeholder="Describe the issue in detail..."
                    className="flex-1 w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none min-h-[300px]"
                    maxLength={1000}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Min 10 characters</span>
                    <span>{form.ticket_details.length} / 1000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
              <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating || !form.service_provider_id || !form.service_id || form.ticket_details.trim().length < 10}
                className="px-8 py-3 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {getFileIcon(currentDocument.document_url) === "image" ? <Image className="w-5 h-5 text-blue-600" /> : getFileIcon(currentDocument.document_url) === "pdf" ? <FileText className="w-5 h-5 text-red-600" /> : <File className="w-5 h-5 text-gray-600" />}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{currentDocument.document_url.split('/').pop()}</h3>
                  <p className="text-sm text-gray-500">{currentIndex + 1} of {existingDocuments.length} • {getFileType(currentDocument.document_url)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {existingDocuments.length > 1 && (
                  <>
                    <button onClick={() => navigateDocument('prev')} className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
                    <button onClick={() => navigateDocument('next')} className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
                  </>
                )}
                <button onClick={() => downloadDocument(currentDocument)} className="p-3 text-green-600 hover:bg-green-50 rounded-lg"><Download size={20} /></button>
                <button onClick={closeDocumentViewer} className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto bg-gray-900 flex items-center justify-center">
              {isImageFile(currentDocument.document_url) ? (
                <img src={currentDocument.document_url} alt="Preview" className="max-w-full max-h-full object-contain" />
              ) : isPdfFile(currentDocument.document_url) ? (
                <iframe src={currentDocument.document_url} className="w-full h-full border-0" title="PDF" />
              ) : (
                <div className="text-center p-8 bg-white rounded-lg max-w-md">
                  <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Preview Not Available</h4>
                  <p className="text-gray-600 mb-4">Download to view this file.</p>
                  <button onClick={() => downloadDocument(currentDocument)} className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 mx-auto">
                    <Download size={18} /> Download
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-white text-sm text-gray-600 flex justify-between">
              <span className="font-medium">{getFileType(currentDocument.document_url)}</span>
              <span>{currentIndex + 1} of {existingDocuments.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Document</h3>
              <p className="text-gray-600 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={cancelDeleteDocument} disabled={deletingDocument} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={confirmDeleteDocument} disabled={deletingDocument} className="px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                  {deletingDocument ? <> <Loader2 size={16} className="animate-spin" /> Deleting... </> : "Delete"}
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