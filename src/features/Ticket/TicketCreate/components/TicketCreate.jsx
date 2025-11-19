// src/pages/TicketCreate.jsx
import React, { useMemo, useRef } from "react";
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
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const TicketCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { providers, loading: loadingProviders } = useProviders();
  const [selectedProvider, setSelectedProvider] = React.useState(null);
  const [selectedService, setSelectedService] = React.useState(null);

  const { servicesList, loading: loadingServices } = useServices(
    selectedProvider?.value || ""
  );
  const { loading, submit } = useTicketCreate();
  const { documents, previewFiles, removeFile, addFiles: addFilesToUpload } = useFileUpload();

  const addFiles = (e) => {
    const incoming = Array.from(e.target.files);

    // ❗ MAX 5 FILE LIMIT
    if (documents.length + incoming.length > 5) {
      toast.error(
        "Maximum 5 documents allowed / कमाल 5 दस्तऐवज परवानगी आहेत",
        { position: "top-right" }
      );
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // If within limit, process the files
    if (incoming.length > 0) {
      addFilesToUpload(e);
    }

    // Reset the file input for next selection
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const validationSchema = Yup.object({
    provider_id: Yup.string().required(
      "Please select Provider / कृपया प्रदाता निवडा"
    ),
    service_id: Yup.string().required(
      "Please select Service / कृपया सेवा निवडा"
    ),
    ticket_details: Yup.string()
      .required("Please describe your issue / कृपया आपली समस्या वर्णन करा")
      .min(10, "Minimum 10 characters required / किमान 10 अक्षरे आवश्यक आहेत"),
  });

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("service_provider_id", values.provider_id);
    formData.append("service_id", values.service_id);
    formData.append("ticket_details", values.ticket_details);
    documents.forEach((file) => formData.append("documents[]", file));

    await submit(formData, (data) => {
      const newTicket = {
        id: data.ticket_id,
        ticketNo: data.ticket_number,
        type: "Support",
        createdAt: new Date().toLocaleDateString("en-GB"),
        service: servicesList.find((s) => s.id == values.service_id)?.service_name,
        provider: providers.find((p) => p.id == values.provider_id)?.provider_name,
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
        <div className="rounded-xl shadow-lg border border-gray-200">
          <div className="bg-[#f57c00] from-orange-500 to-orange-600 rounded-t-xl text-white px-6 py-4">
            <h2 className="text-xl font-bold">Ticket Information / तिकीट माहिती</h2>
            <p className="text-orange-100 text-sm mt-1">
              All fields marked with * are required / * असलेली सर्व फील्ड आवश्यक आहेत
            </p>
          </div>

          <Formik
            initialValues={{
              provider_id: "",
              service_id: "",
              ticket_details: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form className="p-6">
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
                          value={providerOptions.find((o) => o.value === values.provider_id) || null}
                          onChange={(option) => {
                            setSelectedProvider(option);
                            setSelectedService(null);
                            setFieldValue("provider_id", option?.value || "");
                            setFieldValue("service_id", "");
                          }}
                          placeholder="Search provider... / प्रदाता शोधा..."
                          isSearchable
                          isClearable
                          styles={selectStyles}
                        />
                      )}
                      {errors.provider_id && touched.provider_id && (
                        <p className="text-red-500 text-xs mt-1">{errors.provider_id}</p>
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
                        <div className="px-4 py-3 bg-gray-50 border border-dashed rounded-lg text-gray-500 text-start text-sm">
                          {values.provider_id
                            ? "No services available / कोणतीही सेवा उपलब्ध नाही"
                            : "Select provider first / प्रथम प्रदाता निवडा"}
                        </div>
                      ) : (
                        <Select
                          options={serviceOptions}
                          value={serviceOptions.find((o) => o.value === values.service_id) || null}
                          onChange={(option) => {
                            setSelectedService(option);
                            setFieldValue("service_id", option?.value || "");
                          }}
                          placeholder="Search service... / सेवा शोधा..."
                          isSearchable
                          isClearable
                          styles={selectStyles}
                        />
                      )}
                      {errors.service_id && touched.service_id && (
                        <p className="text-red-500 text-xs mt-1">{errors.service_id}</p>
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
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={addFiles}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          />
                        </label>
                        <p className="text-gray-500 text-xs mt-1">
                          PNG, JPG, PDF, DOC • Max 10 MB / कमाल 10 MB • Max 5 files / कमाल 5 फाईल
                        </p>
                        {previewFiles.length > 0 && (
                          <p className="text-orange-600 text-xs mt-1 font-medium">
                            {previewFiles.length}/5 files selected / फाईल निवडल्या
                          </p>
                        )}
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
                    <Field
  as="textarea"
  name="ticket_details"
  placeholder="Please describe your issue... / कृपया आपली समस्या वर्णन करा..."
  className="flex-1 w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none transition min-h-[200px]"
  minLength={1}
  maxLength={1000}
/>
                      <ErrorMessage
                        name="ticket_details"
                        component="p"
                        className="text-red-500 text-xs mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {values.ticket_details.length} / 1000
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end mt-2 gap-4 pt-4">
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
                    className="px-8 py-3 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-[#f57c00] shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px] h-11"
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
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default TicketCreate;