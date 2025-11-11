// src/pages/hooks/useUpdateTicket.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { http, ServiceProvider, services, deleteDocument, updateTicket } from "../../../../http";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const useUpdateTicket = () => {
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
  const [providers, setProviders] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deletingDocument, setDeletingDocument] = useState(null);

  // === React-Select Options ===
  const providerOptions = providers.map(p => ({
    value: p.id.toString(),
    label: p.provider_name
  }));

  const serviceOptions = servicesList.map(s => ({
    value: s.id.toString(),
    label: s.service_name
  }));

  const selectedProvider = providerOptions.find(o => o.value === form.service_provider_id);
  const selectedService = serviceOptions.find(o => o.value === form.service_id);

  // === Fetch Ticket + Providers ===
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch ticket
        const ticketRes = await http.get(`ticket/show/${id}`);
        if (ticketRes.data.status === 200) {
          const ticket = ticketRes.data.data;
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
        const provRes = await ServiceProvider();
        if (provRes.status === 200) {
          setProviders(provRes.data || []);
        } else {
          toast.error("Failed to load service providers");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // === Fetch Services when Provider Changes ===
  useEffect(() => {
    const fetchServices = async () => {
      if (!form.service_provider_id) {
        setServicesList([]);
        return;
      }

      try {
        const res = await services(form.service_provider_id);
        if (res.status === 200) {
          setServicesList(res.data || []);
        } else {
          setServicesList([]);
          toast.error("Failed to load services");
        }
      } catch (err) {
        console.error("Services fetch error:", err);
        setServicesList([]);
        toast.error("Error loading services");
      }
    };

    fetchServices();
  }, [form.service_provider_id]);

  // === Handlers ===
  const handleProviderChange = (opt) => {
    setForm(prev => ({
      ...prev,
      service_provider_id: opt ? opt.value : "",
      service_id: ""
    }));
  };

  const handleServiceChange = (opt) => {
    setForm(prev => ({ ...prev, service_id: opt ? opt.value : "" }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE);

    if (validFiles.length < files.length) {
      toast.warning("Some files exceed 10MB and were skipped.");
    }

    if (validFiles.length > 0) {
      setNewDocuments(prev => [...prev, ...validFiles]);
      const previews = validFiles.map(f => ({
        name: f.name,
        size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
        type: f.type,
        file: f
      }));
      setPreviewFiles(prev => [...prev, ...previews]);
      toast.success(`${validFiles.length} file(s) added`);
    }

    e.target.value = "";
  };

  const removeNewFile = (index) => {
    const file = previewFiles[index];
    setNewDocuments(prev => prev.filter((_, i) => i !== index));
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
    toast.info(`"${file.name}" removed`);
  };

  const removeExistingDocument = (docId) => {
    setDocumentToDelete(docId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setDeletingDocument(documentToDelete);
      const res = await deleteDocument(documentToDelete);

      const isSuccess =
        res?.data?.status === 200 ||
        res?.status === 200 ||
        res?.data?.success ||
        res?.success ||
        !!res?.data;

      if (isSuccess) {
        const removed = existingDocuments.find(d => d.document_id === documentToDelete);
        setExistingDocuments(prev => prev.filter(d => d.document_id !== documentToDelete));
        toast.success("Document deleted successfully");

        if (currentDocument?.document_id === documentToDelete) {
          closeDocumentViewer();
        }
      } else {
        const msg = res?.data?.message || res?.message || "Failed to delete";
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Delete failed";
      toast.error(msg);
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

  const openDocumentViewer = (doc, index) => {
    setCurrentDocument(doc);
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const closeDocumentViewer = () => {
    setViewerOpen(false);
    setCurrentDocument(null);
    setCurrentIndex(0);
  };

  const navigateDocument = (dir) => {
    if (!existingDocuments.length) return;
    const newIdx = dir === 'next'
      ? (currentIndex + 1) % existingDocuments.length
      : (currentIndex - 1 + existingDocuments.length) % existingDocuments.length;
    setCurrentIndex(newIdx);
    setCurrentDocument(existingDocuments[newIdx]);
  };

  const downloadDocument = (doc) => {
    if (doc.document_url) {
      window.open(doc.document_url, '_blank');
      toast.info("Opening download...");
    } else {
      toast.error("No URL found");
    }
  };

  const getFileIcon = (url) => {
    const ext = url.split(".").pop().toLowerCase();
    const icons = {
      image: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"],
      pdf: ["pdf"],
      word: ["doc", "docx"],
    };
    if (icons.image.includes(ext)) return "image";
    if (icons.pdf.includes(ext)) return "pdf";
    if (icons.word.includes(ext)) return "word";
    return "file";
  };

  const isImageFile = (url) => getFileIcon(url) === "image";
  const isPdfFile = (url) => getFileIcon(url) === "pdf";

  const getFileType = (url) => {
    const type = getFileIcon(url);
    return type === "image" ? "Image" :
           type === "pdf" ? "PDF" :
           type === "word" ? "Word Document" : "File";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.service_provider_id || !form.service_id || form.ticket_details.trim().length < 10) {
      toast.error("Please fill all fields with valid data (min 10 chars for description)");
      return;
    }

    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append("ticket_id", id);
      formData.append("service_provider_id", form.service_provider_id);
      formData.append("service_id", form.service_id);
      formData.append("ticket_details", form.ticket_details.trim());

      newDocuments.forEach(f => formData.append("documents[]", f));

      const res = await updateTicket(formData);

      const isSuccess =
        res?.data?.status === 200 ||
        res?.status === 200 ||
        res?.data?.success ||
        res?.success ||
        !!res?.data;

      if (isSuccess) {
        toast.success("Ticket updated successfully!");
        setTimeout(() => navigate(`/ticket/${id}`), 2000);
      } else {
        const msg = res?.data?.message || "Update failed";
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Update failed";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  return {
    // Form & Data
    form,
    existingDocuments,
    newDocuments,
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

    // Select Options
    providerOptions,
    serviceOptions,
    selectedProvider,
    selectedService,

    // Handlers
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

    // Helpers
    getFileIcon,
    isImageFile,
    isPdfFile,
    getFileType,
    formatFileSize,
  };
};