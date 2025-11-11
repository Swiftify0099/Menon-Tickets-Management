// src/pages/hooks/useProfile.js
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getUser, updateProfilePicture } from "../../../http";
import { updateUser } from "../../../redux/slices/login";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const useProfile = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    avatar: "",
    role: {},
    department: {},
    division: {},
    id: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // === Load from localStorage on mount ===
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setFormData(user);
      dispatch(updateUser(user));
    }
  }, [dispatch]);

  // === Fetch Profile from API ===
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUser,
  });

  // === Sync API data to state & storage ===
  useEffect(() => {
    if (profile?.data?.user) {
      const user = profile.data.user;
      setFormData(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("profile", JSON.stringify(user));
      dispatch(updateUser(user));
    }
  }, [profile, dispatch]);

  // === Update Profile Photo Mutation ===
  const updatePhotoMutation = useMutation({
    mutationFn: updateProfilePicture,
    onSuccess: (res) => {
      let updatedUser = { ...formData };

      if (res?.data?.user) {
        updatedUser = res.data.user;
      } else if (res?.data?.avatar) {
        updatedUser.avatar = res.data.avatar;
      }

      // Sync everywhere
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("profile", JSON.stringify(updatedUser));
      dispatch(updateUser(updatedUser));
      setFormData(updatedUser);

      toast.success("Profile photo updated successfully!");
      setSelectedFile(null);
      refetch();
    },
    onError: (err) => {
      console.error("Upload failed:", err);
      toast.error("Failed to update photo!");
    },
  });

  // === File Change Handler ===
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File too large! Max 5MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  // === Upload Handler ===
  const handlePhotoUpload = () => {
    if (!selectedFile) {
      toast.warn("Please select a photo!");
      return;
    }
    updatePhotoMutation.mutate({ profile_photo: selectedFile });
  };

  return {
    formData,
    selectedFile,
    isLoading,
    isError,
    updatePhotoMutation,
    handleFileChange,
    handlePhotoUpload,
    refetch,
  };
};