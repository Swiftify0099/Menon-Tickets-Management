import React, { useEffect, useState } from "react";
import { getUser, updateProfilePicture } from "../../http";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Building, MapPin, User, Mail, Phone } from "lucide-react";

const Profile = () => {
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


  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setFormData(user);
      dispatch(updateUser(user));
    }
  }, [dispatch]);


  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUser,
  });

 
  useEffect(() => {
    if (profile?.data?.user) {
      const user = profile.data.user;
      setFormData(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("profile", JSON.stringify(user));
      dispatch(updateUser(user));
    }
  }, [profile, dispatch]);


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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large! Max 5MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handlePhotoUpload = () => {
    if (!selectedFile) {
      toast.warn("Please select a photo!");
      return;
    }
    updatePhotoMutation.mutate({ profile_photo: selectedFile });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-red-500 text-lg">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">View your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#f57c00] from-orange-500 to-orange-600 px-6 py-8 text-center">
                <div className="relative inline-block">
                  <img
                    src={
                      selectedFile
                        ? URL.createObjectURL(selectedFile)
                        : formData.avatar || "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                  />
                  {updatePhotoMutation.isPending && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mt-4">
                  {formData.first_name} {formData.last_name}
                </h2>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-black mt-2">
                  <User size={14} className="mr-1" />
                  {formData.role?.role_name || "User"}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full text-center block">
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
                  disabled={updatePhotoMutation.isPending || !selectedFile}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors w-full"
                >
                  {updatePhotoMutation.isPending ? "Uploading..." : "Upload Photo"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#f57c00] from-orange-500 to-orange-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
                <p className="text-orange-100 text-sm mt-1">Your personal details</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">First Name</label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800">
                        {formData.first_name}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">Last Name</label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800">
                        {formData.last_name}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 flex items-center">
                        <Mail size={16} className="mr-2 text-orange-500" />
                        {formData.email}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 flex items-center">
                        <Phone size={16} className="mr-2 text-orange-500" />
                        {formData.phone || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">Role</label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 flex items-center">
                        <User size={16} className="mr-2 text-orange-500" />
                        {formData.role?.role_name || "User"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">Department</label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 flex items-center">
                        <Building size={16} className="mr-2 text-orange-500" />
                        {formData.department?.department_name || "—"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">Division</label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 flex items-center">
                        <MapPin size={16} className="mr-2 text-orange-500" />
                        {formData.division?.division_name || "—"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">User ID</label>
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800">
                        {formData.id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;