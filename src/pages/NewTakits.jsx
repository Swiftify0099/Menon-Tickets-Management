// src/pages/TicketCreate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload, X, ArrowLeft, CheckCircle } from "lucide-react";
import { http, ServiceProvider, services, createTicket } from "../http";

const TicketCreate = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");

  const [providers, setProviders] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);

  const [form, setForm] = useState({
    provider_id: "",
    service_id: "",
    ticket_details: "",
  });

  const [documents, setDocuments] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);

  // Load Providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoadingProviders(true);
        const res = await ServiceProvider();
        if (res.status === 200) {
          setProviders(res.data || []);
        }
      } catch (err) {
        alert("Failed to load service providers");
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

  // Load Services when provider changes
  useEffect(() => {
    if (!form.provider_id) {
      setServicesList([]);
      return;
    }

    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const res = await services(form.provider_id);
        if (res.status === 200) {
          setServicesList(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [form.provider_id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments((prev) => [...prev, ...files]);
    setPreviewFiles((prev) => [
      ...prev,
      ...files.map((f) => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + " KB",
      })),
    ]);
  };

  const removeFile = (i) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== i));
    setPreviewFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.provider_id || !form.service_id) {
      alert("Please select Provider and Service");
      return;
    }

    setLoading(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append("provider_id", form.provider_id);        // CORRECT
    formData.append("service_id", form.service_id);          // CORRECT
    formData.append("ticket_details", form.ticket_details);

    documents.forEach((file) => formData.append("documents[]", file));

    try {
      const res = await createTicket(formData);

      if (res.status === 200) {
        const { ticket_id, ticket_number } = res.data;

        const newTicket = {
          id: ticket_id,
          ticketNo: ticket_number,
          type: "Support",
          createdAt: new Date().toLocaleDateString("en-GB"),
          service: servicesList.find((s) => s.id == form.service_id)?.service_name || form.service_id,
          provider: providers.find((p) => p.id == form.provider_id)?.provider_name || form.provider_id,
          status: "In-Progress",
        };

        const stored = JSON.parse(localStorage.getItem("dashboard-tickets") || "[]");
        stored.unshift(newTicket);
        localStorage.setItem("dashboard-tickets", JSON.stringify(stored));

        setTicketNumber(ticket_number);
        setSuccess(true);

        setTimeout(() => navigate("/tickets"), 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Create New Ticket</h1>
      </div>

      {success && (
        <div className="mb-8 p-6 bg-green-50 border border-green-300 rounded-xl flex items-center gap-4">
          <CheckCircle className="text-green-600" size={32} />
          <div>
            <p className="text-green-800 font-bold text-lg">Ticket Created Successfully!</p>
            <p className="text-green-700">
              Ticket Number: <span className="font-mono text-xl">{ticketNumber}</span>
            </p>
            <p className="text-sm text-green-600">Redirecting to tickets...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl p-8 space-y-8">
        {/* Provider */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Service Provider <span className="text-red-500">*</span>
          </label>
          {loadingProviders ? (
            <div className="px-4 py-3 bg-gray-100 rounded-lg">Loading...</div>
          ) : (
            <select
              name="provider_id"
              value={form.provider_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Select Provider --</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.provider_name}
                </option>
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
            <div className="px-4 py-3 bg-gray-100 rounded-lg">Loading services...</div>
          ) : servicesList.length === 0 ? (
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-500">
              {form.provider_id ? "No services available" : "Select provider first"}
            </div>
          ) : (
            <select
              name="service_id"
              value={form.service_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Select Service --</option>
              {servicesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.service_name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Details */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ticket Details
          </label>
          <textarea
            name="ticket_details"
            rows="6"
            value={form.ticket_details}
            onChange={handleChange}
            placeholder="Describe your issue..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Files */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Attach Documents
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-orange-400">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <label className="cursor-pointer">
              <span className="text-sm font-semibold text-orange-600">Click to upload</span>
              <input type="file" multiple onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {previewFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              {previewFiles.map((file, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 border-2 border-dashed rounded w-10 h-10" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeFile(i)} className="text-red-600">
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate("/tickets")}
            className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-3"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketCreate;