import React, { useEffect, useState } from "react";
import { getUser, updateUserProfile } from "../http";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { updateUser } from "../redux/slices/login";

const Profile = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  // ✅ Load user data from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setFormData(userData);
        dispatch(updateUser(userData));
      }
    } catch (error) {
      console.error("Error loading user data from localStorage:", error);
    }
  }, [dispatch]);

  // ✅ Fetch user profile
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUser,
  });

  // ✅ Update user mutation
  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      try {
        alert("✅ Profile updated successfully!");
        dispatch(updateUser(formData));
        refetch();
      } catch (error) {
        console.error("Error in onSuccess callback:", error);
      }
    },
    onError: (err) => {
      console.error("❌ Update failed:", err);
      alert("Profile update failed. Try again.");
    },
  });

  // ✅ When data fetched → show in inputs and store in localStorage
  useEffect(() => {
    try {
      if (profile && profile.data && profile.data.user) {
        const userData = profile.data.user;
        setFormData(userData);
        dispatch(updateUser(userData));
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error processing profile data:", error);
    }
  }, [profile, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    updateMutation.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
    });
  };

  if (isLoading) return <p>Loading profile...</p>;
  if (isError) return <p className="text-red-500">Failed to load profile.</p>;

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg p-6 rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>

      <div className="space-y-3">
        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">
            First Name
          </label>
          <input
            name="first_name"
            value={formData.first_name || ""}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">
            Last Name
          </label>
          <input
            name="last_name"
            value={formData.last_name || ""}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">
            Email
          </label>
          <input
            value={formData.email || ""}
            disabled
            className="w-full border rounded-md px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">
            Phone
          </label>
          <input
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={updateMutation.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md mt-4"
        >
          {updateMutation.isPending ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
