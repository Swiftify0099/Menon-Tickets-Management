import React, { useState } from "react";
import { Lock, Eye, EyeOff, Home, ChevronRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { changepassword } from "../../../http";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ChangePassword = ({ onChangePassword }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
 
  const { mutate, isError } = useMutation({
    mutationFn: changepassword,
    onSuccess: (response) => {
      toast.success("Password changed successfully!");
    },
    onError: (error) => {
      toast.error("Error changing password: " + error.response?.data?.message || error.message);
    }
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and Confirm password must match!");
      return;
    }
    mutate({old_password: currentPassword, new_password: newPassword, new_password_confirmation: confirmPassword});
    onChangePassword?.({ currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const inputBase =
    "w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-gray-700 transition-all duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4">
      <div className="max-w-md mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 transition-colors"
          >
            <Home size={16} />
            <span>Home</span>
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Change Password</span>
        </nav>

        {/* Password Change Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl w-full border border-gray-200 space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-orange-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
            <p className="text-gray-500 text-sm mt-2">
              Update your password securely
            </p>
          </div>

          {/* Current Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputBase}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputBase}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputBase}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Update Password
          </button>

          
       
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;