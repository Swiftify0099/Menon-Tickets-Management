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

  // ✅ Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setFormData(userData);
        dispatch(updateUser(userData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [dispatch]);

  // ✅ Fetch user profile from API
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUser,
  });

  // ✅ Mutation - update profile info
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (res) => {
      const updatedUser = res?.data?.user || formData;
      toast.success("Profile info updated successfully!");
      syncUser(updatedUser);
      refetch();
    },
    onError: (err) => {
      console.error("Update failed:", err);
      toast.error("Failed to update profile!");
    },
  });

  // ✅ Mutation - update profile photo
  const updatePhotoMutation = useMutation({
    mutationFn: updateProfilePicture,
    onSuccess: (res) => {
      let updatedUser = formData;
      if (res?.data?.user) {
        updatedUser = res.data.user;
      } else if (res?.data?.avatar) {
        updatedUser = { ...formData, avatar: res.data.avatar };
      }
      toast.success("Profile photo updated successfully!");
      syncUser(updatedUser);
      setSelectedFile(null);
      refetch();
    },
    onError: (err) => {
      console.error("Photo upload failed:", err);
      toast.error("Failed to update photo!");
    },
  });

  // ✅ Sync with Redux + localStorage
  const syncUser = (user) => {
    setFormData(user);
    localStorage.setItem("user", JSON.stringify(user));
    dispatch(updateUser(user));
  };

  // ✅ When fetched from server, sync to state
  useEffect(() => {
    if (profile?.data?.user) syncUser(profile.data.user);
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
    });
  };

  const handlePhotoUpload = () => {
    if (!selectedFile) {
      toast.warn("Please select a photo first!");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File too large! Please select an image under 5MB.");
      return;
    }

    updatePhotoMutation.mutate({ profile_photo: selectedFile });
  };

  if (isLoading) return <p>Loading profile...</p>;
  if (isError) return <p className="text-red-500">Failed to load profile.</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg p-6 rounded-lg space-y-4">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} />

      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>

      {/* ✅ Profile Photo */}
      <div className="flex flex-col items-center space-y-3">
        <img
          src={
            selectedFile
              ? URL.createObjectURL(selectedFile)
              : formData.avatar || "/default-avatar.png"
          }
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border"
        />

        <label className="cursor-pointer bg-gray-100 px-3 py-1 text-sm rounded-md hover:bg-gray-200">
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
          disabled={updatePhotoMutation.isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-4 rounded-md text-sm"
        >
          {updatePhotoMutation.isPending ? "Uploading..." : "Upload Photo"}
        </button>
      </div>

      <div className="space-y-3 mt-4">
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
          disabled={updateProfileMutation.isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-4 rounded-md text-sm"
        >
          {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </div>
  );
};

export default Profile;