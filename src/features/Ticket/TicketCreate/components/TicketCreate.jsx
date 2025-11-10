// src/pages/NewTakits.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload, X, ArrowLeft, CheckCircle, FileText, Image, File } from "lucide-react";
import { useProviders } from "../hooks/UseProviders";
import { useServices } from "../hooks/UseServices";
import { useTicketCreate } from "../hooks/UseTicketCreate";
import { useFileUpload } from "../hooks/UseFileUpload";

const TicketCreate = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    provider_id: "",
    service_id: "",
    ticket_details: "",
  });

  const { providers, loading: loadingProviders } = useProviders();
  const { servicesList, loading: loadingServices } = useServices(form.provider_id);
  const { loading, success, ticketNumber, submit } = useTicketCreate();
  const { documents, previewFiles, addFiles, removeFile } = useFileUpload();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.provider_id || !form.service_id) {
      alert("Please select Provider and Service");
      return;
    }

    const formData = new FormData();
    formData.append("service_provider_id", form.provider_id);
    formData.append("service_id", form.service_id);
    formData.append("ticket_details", form.ticket_details);
    documents.forEach((file) => formData.append("documents[]", file));

    await submit(formData, (data) => {
      const newTicket = {
        id: data.ticket_id,
        ticketNo: data.ticket_number,
        type: "Support",
        createdAt: new Date().toLocaleDateString("en-GB"),
        service: servicesList.find((s) => s.id == form.service_id)?.service_name,
        provider: providers.find((p) => p.id == form.provider_id)?.provider_name,
        status: "In-Progress",
      };

      const stored = JSON.parse(localStorage.getItem("dashboard-tickets") || "[]");
      stored.unshift(newTicket);
      localStorage.setItem("dashboard-tickets", JSON.stringify(stored));

      setTimeout(() => navigate("/tickets"), 2500);
    });
  };

  const getFileIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return <Image className="w-4 h-4 text-blue-600" />;
    if (["pdf"].includes(ext)) return <FileText className="w-4 h-4 text-red-600" />;
    return <File className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <div className="max-w-8xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center  gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create New Ticket</h1>
        
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-4">
            <CheckCircle size={32} />
            <div>
              <h3 className="text-lg font-bold">Ticket Created Successfully!</h3>
              <p className="text-sm mt-1">
                Your ticket number is:{" "}
                <span className="font-mono text-lg bg-white text-green-700 px-3 py-1 rounded-md">
                  {ticketNumber}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600  rounded-lg text-white px-6 py-4">
            <h2 className="text-xl font-bold">Ticket Information</h2>
            <p className="text-orange-100 text-sm mt-1">All fields marked with * are required</p>
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
                  {loadingProviders ? (
                    <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ) : (
                    <select
                      name="provider_id"
                      value={form.provider_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                    >
                      <option value="">Select Provider</option>
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>{p.provider_name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  {loadingServices ? (
                    <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ) : servicesList.length === 0 ? (
                    <div className="px-4 py-3 bg-gray-50 border border-dashed rounded-lg text-gray-500 text-center text-sm">
                      {form.provider_id ? "No services available" : "Select provider first"}
                    </div>
                  ) : (
                    <select
                      name="service_id"
                      value={form.service_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                    >
                      <option value="">Select Service</option>
                      {servicesList.map((s) => (
                        <option key={s.id} value={s.id}>{s.service_name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attach Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <label className="cursor-pointer mt-2 block">
                      <span className="text-sm font-medium text-orange-600 hover:text-orange-700">
                        Click to upload files
                      </span>
                      <input type="file" multiple onChange={addFiles} className="hidden" />
                    </label>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG, PDF, DOC • Max 10MB</p>
                  </div>

                  {/* File List */}
                  {previewFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-gray-600">{previewFiles.length} file(s) attached</p>
                      {previewFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded border">{getFileIcon(file.name)}</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeFile(i)} 
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
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
                    placeholder="Please describe your issue in detail. Include steps to reproduce, error messages, and what you expected to happen..."
                    className="flex-1 w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none transition min-h-[200px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && <Loader2 className="animate-spin" size={16} />}
                    {loading ? "Creating..." : "Create Ticket"}
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

export default TicketCreate;