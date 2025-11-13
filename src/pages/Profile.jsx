import React, { useEffect, useState } from "react";
import { getUser, updateUserProfile, updateProfilePicture } from "../http";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { updateUser } from "../redux/slices/login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPage, setShowPage] = useState(false); // ✅ simulate 3s loading

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setFormData(userData);
      dispatch(updateUser(userData));
    }

    // ✅ 3 second delay before showing page
    const timer = setTimeout(() => setShowPage(true), 3000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Fetch user profile
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUser,
  });

  const syncUser = (user) => {
    if (!user) return;
    setFormData(user);
    localStorage.setItem("user", JSON.stringify(user));
    dispatch(updateUser(user));
  };

  useEffect(() => {
    if (profile?.data?.user) syncUser(profile.data.user);
  }, [profile]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (res) => {
      const updatedUser = res?.user || formData;
      toast.success("Profile info updated!");
      syncUser(updatedUser);
      refetch();
    },
    onError: () => toast.error("Failed to update profile info."),
  });

  const updatePhotoMutation = useMutation({
    mutationFn: updateProfilePicture,
    onSuccess: (res) => {
      let updatedUser = formData;
      if (res?.user) updatedUser = res.user;
      else if (res?.avatar) updatedUser = { ...formData, avatar: res.avatar };
      toast.success("Profile photo updated!");
      syncUser(updatedUser);
      setSelectedFile(null);
      refetch();
    },
    onError: (err) => {
      console.error("Photo upload error:", err);
      toast.error("Failed to upload photo.");
    },
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return toast.error("File too large! Max 5MB allowed.");
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type))
      return toast.error("Invalid file type! Use JPG, PNG, or WEBP.");
    setSelectedFile(file);
  };

  const handleProfileUpdate = () =>
    updateProfileMutation.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
    });

  const handlePhotoUpload = () => {
    if (!selectedFile) return toast.warn("Please select a photo first!");
    updatePhotoMutation.mutate({ profile_photo: selectedFile });
  };

  // ✅ Show spinner if loading or during 3s delay
  if (isLoading || !showPage)
    return (
      <div className="flex items-center justify-center h-screen ">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500 text-center mt-10">
        Failed to load profile.
      </p>
    );

return (
  <div className="w-full py-10">
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg p-8 rounded-lg space-y-8">
      <ToastContainer position="top-right" autoClose={2500} />
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>

      {/* Profile Photo */}
      <div className="flex flex-col items-center space-y-3">
        <img
          src={previewUrl || formData.avatar || "/default-avatar.png"}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border shadow-sm"
        />
        <label className="cursor-pointer bg-gray-100 px-4 py-2 text-sm rounded-md hover:bg-gray-200">
          Change Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        <button
          onClick={handlePhotoUpload}
          disabled={updatePhotoMutation.isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md text-sm disabled:opacity-60"
        >
          {updatePhotoMutation.isLoading ? "Uploading..." : "Upload Photo"}
        </button>
      </div>

      {/* Profile Info */}
      <div className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            name="first_name"
            value={formData.first_name || ""}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            name="last_name"
            value={formData.last_name || ""}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            value={formData.email || ""}
            disabled
            className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          onClick={handleProfileUpdate}
          disabled={updateProfileMutation.isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md text-sm disabled:opacity-60"
        >
          {updateProfileMutation.isLoading ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </div>
  </div>
);

};

export default Profile;
