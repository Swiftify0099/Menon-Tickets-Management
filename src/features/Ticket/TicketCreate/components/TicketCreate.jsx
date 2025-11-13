// src/pages/TicketCreate.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Upload,
  X,
  ArrowLeft,
  CheckCircle,
  FileText,
  Image,
  File,
} from "lucide-react";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  const providerOptions = useMemo(
    () =>
      providers.map((p) => ({
        value: p.id,
        label: p.provider_name,
      })),
    [providers]
  );

  const serviceOptions = useMemo(
    () =>
      servicesList.map((s) => ({
        value: s.id,
        label: s.service_name,
      })),
    [servicesList]
  );

  const handleProviderChange = (selected) => {
    setForm((prev) => ({
      ...prev,
      provider_id: selected?.value || "",
      service_id: "",
    }));
  };

  const handleServiceChange = (selected) => {
    setForm((prev) => ({
      ...prev,
      service_id: selected?.value || "",
    }));
  };

  const handleTextChange = (e) => {
    setForm((prev) => ({ ...prev, ticket_details: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.provider_id || !form.service_id) {
      toast.error("Please select Provider and Service / कृपया प्रदाता आणि सेवा निवडा");
      return;
    }

    if (!form.ticket_details.trim()) {
      toast.error("Please describe your issue / कृपया आपली समस्या वर्णन करा");
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

      toast.success(
        <div>
          <p className="font-semibold">
            Ticket Created Successfully! / तिकीट यशस्वीरित्या तयार झाले!
          </p>
          <p className="text-sm mt-1">
            Your ticket number is / तुमचा तिकीट क्रमांक आहे:{" "}
            <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded">
              {data.ticket_number}
            </span>
          </p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          theme: "light",
        }
      );

      setTimeout(() => navigate("/"), 2500);
    });
  };

  const getFileIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      return <Image className="w-4 h-4 text-blue-600" />;
    if (["pdf"].includes(ext)) return <FileText className="w-4 h-4 text-red-600" />;
    return <File className="w-4 h-4 text-gray-600" />;
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      borderColor: "#d1d5db",
      padding: "0.25rem 0",
    }),
    placeholder: (base) => ({ ...base, color: "#9ca3af" }),
    singleValue: (base) => ({ ...base, color: "#1f2937" }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <ToastContainer />

      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Create New Ticket / नवीन तिकीट तयार करा
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-xl text-white px-6 py-4">
            <h2 className="text-xl font-bold">Ticket Information / तिकीट माहिती</h2>
            <p className="text-orange-100 text-sm mt-1">
              All fields marked with * are required / * असलेली सर्व फील्ड आवश्यक आहेत
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT */}
              <div className="space-y-6">
                {/* Service Provider */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Provider / सेवा प्रदाता <span className="text-red-500">*</span>
                  </label>
                  {loadingProviders ? (
                    <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ) : (
                    <Select
                      options={providerOptions}
                      value={providerOptions.find((o) => o.value === form.provider_id) || null}
                      onChange={handleProviderChange}
                      placeholder="Search provider... / प्रदाता शोधा..."
                      isSearchable
                      isClearable
                      styles={selectStyles}
                    />
                  )}
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service / सेवा <span className="text-red-500">*</span>
                  </label>
                  {loadingServices ? (
                    <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ) : serviceOptions.length === 0 ? (
                    <div className="px-4 py-3 bg-gray-50 border border-dashed rounded-lg text-gray-500 text-center text-sm">
                      {form.provider_id
                        ? "No services available / कोणतीही सेवा उपलब्ध नाही"
                        : "Select provider first / प्रथम प्रदाता निवडा"}
                    </div>
                  ) : (
                    <Select
                      options={serviceOptions}
                      value={serviceOptions.find((o) => o.value === form.service_id) || null}
                      onChange={handleServiceChange}
                      placeholder="Search service... / सेवा शोधा..."
                      isSearchable
                      isClearable
                      styles={selectStyles}
                    />
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attach Documents / दस्तऐवज जोडा
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <label className="cursor-pointer mt-2 block">
                      <span className="text-sm font-medium text-orange-600 hover:text-orange-700">
                        Click to upload files / फाईल अपलोड करण्यासाठी क्लिक करा
                      </span>
                      <input
                        type="file"
                        multiple
                        onChange={addFiles}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      />
                    </label>
                    <p className="text-gray-500 text-xs mt-1">
                      PNG, JPG, PDF, DOC • Max 10 MB / कमाल 10 MB
                    </p>
                  </div>

                  {previewFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-gray-600">
                        {previewFiles.length} file(s) attached / फाईल जोडल्या
                      </p>
                      {previewFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded border">
                              {getFileIcon(file.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {file.name}
                              </p>
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

              {/* RIGHT */}
              <div className="space-y-6">
                {/* Issue Description */}
                <div className="h-full flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Description / समस्या वर्णन{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="ticket_details"
                    value={form.ticket_details}
                    onChange={handleTextChange}
                    required
                    placeholder="Please describe your issue... / कृपया आपली समस्या वर्णन करा..."
                    className="flex-1 w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none transition min-h-[200px]"
                    minLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {form.ticket_details.length} / 1000
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel / रद्द करा
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px] h-11"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                        <span>Creating... / तयार करत आहे...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Create Ticket / तिकीट तयार करा</span>
                      </>
                    )}
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
