import { useState } from "react";

export const useFileUpload = () => {
  const [documents, setDocuments] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);

  const addFiles = (e) => {
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

  const removeFile = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setDocuments([]);
    setPreviewFiles([]);
  };

  return { documents, previewFiles, addFiles, removeFile, reset };
};