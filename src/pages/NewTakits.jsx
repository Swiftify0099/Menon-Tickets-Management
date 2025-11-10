import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { ServiceProvider, services } from "../http";
import { useDispatch, useSelector } from "react-redux";
import { addTicket, updateTicket, loadTickets } from "../redux/slices/ticketsSlice";
import { useQuery } from "@tanstack/react-query";
import { LuTrash2 } from "react-icons/lu";

const NewTakits = () => {
  const [formData, setFormData] = useState({
    type: "",
    service: "",
    status: "Open",
    details: "",
    provider: "",
    documents: [],
  });

  const [editingId, setEditingId] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tickets = useSelector((state) => state.tickets.tickets);

  // ✅ Fetch providers list
  const { data: providerOptions = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await ServiceProvider();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      return data.map((p) => ({
        value: p.id,
        label: p.provider_name,
      }));
    },
  });

  // ✅ Fetch services dynamically by providerId
  const { data: dynamicServices = [], isLoading: loadingServices } = useQuery({
    queryKey: ["services", formData.provider],
    queryFn: async () => {
      if (!formData.provider) return [];
      const res = await services(Number(formData.provider));
      const data = Array.isArray(res) ? res : res.data || [];
      return data.map((s) => ({ value: s.id, label: s.service_name }));
    },
    enabled: !!formData.provider,
  });

  // ✅ Load tickets from localStorage if empty
  useEffect(() => {
    if (tickets.length === 0) {
      const stored = localStorage.getItem("dashboard-tickets");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) dispatch(loadTickets(parsed));
        } catch (error) {
          console.error("Error parsing stored tickets:", error);
        }
      }
    }
  }, [tickets.length, dispatch]);

  useEffect(() => {
    if (tickets.length > 0) {
      localStorage.setItem("dashboard-tickets", JSON.stringify(tickets));
    }
  }, [tickets]);

  // ✅ Handle file upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) return alert("You can only upload up to 5 files.");

    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              url: reader.result,
            });
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((fileData) => {
      setFormData({ ...formData, documents: fileData });
      setPreviewImages(fileData.map((f) => f.url));
    });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index),
    });
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  // ✅ Provider change handler
  const handleProviderChange = (selected) => {
    const providerId = selected?.value || "";
    setFormData({
      ...formData,
      provider: providerId,
      service: "", // Reset service when provider changes
    });
  };

  // ✅ Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    // if (!formData.service || !formData.provider) {
    //   return alert("Please fill all required fields.");
    // }

    if (editingId) {
      dispatch(updateTicket({ id: editingId, ...formData }));
      alert("Ticket updated successfully!");
    } else {
      let maxTicketNum = 0;
      tickets.forEach((t) => {
        const num = parseInt(t.ticketNo?.replace("TKT-", ""), 10);
        if (!isNaN(num) && num > maxTicketNum) maxTicketNum = num;
      });

      const newTicket = {
        id: Date.now().toString(),
        ticketNo: `TKT-${maxTicketNum + 1}`,
        createdAt: new Date().toLocaleDateString(),
        ...formData,
      };
      dispatch(addTicket(newTicket));
      alert("Ticket created successfully!");
    }

    setFormData({
      type: "",
      service: "",
      status: "Open",
      details: "",
      provider: "",
      documents: [],
    });
    setPreviewImages([]);
    setEditingId(null);
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        {editingId ? "Edit Ticket" : "Create New Ticket"}
      </h2>

      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 md:p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Provider */}
              <label className="block">
                <span className="font-medium text-gray-700 mb-1.5 block">
                  Service Provider *
                </span>
                <Select
                  options={providerOptions}
                  isLoading={loadingProviders}
                  value={
                    providerOptions.find(
                      (opt) => opt.value === formData.provider
                    ) || null
                  }
                  onChange={handleProviderChange}
                  placeholder="Search or Select Provider"
                  isSearchable
                  required
                />
              </label>

              {/* Services */}
              {/* <label className="block">
                <span className="font-medium text-gray-700 mb-1.5 block">
                  Service *
                </span>
                <Select
                  options={dynamicServices}
                  isLoading={loadingServices}
                  isDisabled={!formData.provider || loadingServices}
                  value={
                    dynamicServices.find(
                      (opt) => opt.value === formData.service
                    ) || null
                  }
                  onChange={(selected) =>
                    setFormData({ ...formData, service: selected?.value || "" })
                  }
                  placeholder={
                    loadingServices
                      ? "Loading services..."
                      : !formData.provider
                      ? "Select Provider First"
                      : "Select Service"
                  }
                  isSearchable
                  required
                />
                {formData.provider &&
                  dynamicServices.length === 0 &&
                  !loadingServices && (
                    <p className="text-sm text-gray-500 mt-1">
                      No services available for this provider
                    </p>
                  )}
              </label> */}
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Details */}
              <label className="block">
                <span className="font-medium text-gray-700 mb-1.5 block">
                  Details
                </span>
                <textarea
                  rows="4"
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="Enter details about the ticket..."
                />
              </label>

              {/* Upload */}
              <label className="block">
                <span className="font-medium text-gray-700 mb-1.5 block">
                  Upload Documents (max 5)
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  accept="image/*,.pdf,.doc,.docx"
                />
                {formData.documents?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.documents.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {file.type.startsWith("image/") &&
                            previewImages[i] && (
                              <img
                                src={previewImages[i]}
                                alt="preview"
                                className="w-10 h-10 object-cover rounded-md border border-gray-200"
                              />
                            )}
                          <div>
                            <span className="text-sm text-gray-700 block">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="text-red-500 hover:text-red-700 font-semibold text-sm px-2 py-1 rounded"
                        >
                          <LuTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  type: "",
                  service: "",
                  status: "Open",
                  details: "",
                  provider: "",
                  documents: [],
                });
                setPreviewImages([]);
                setEditingId(null);
              }}
              className="border border-gray-300 py-2.5 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200"
            >
              Reset
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200"
            >
              {editingId ? "Update Ticket" : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTakits;
