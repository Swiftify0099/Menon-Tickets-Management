import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { changepassword } from "../../http";
import { toast } from "react-toastify";
const ChangePassword = ({ onChangePassword }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
 
  const { mutate,isError } = useMutation({
    mutationFn: changepassword,
    onSuccess: (response) => {
      toast.success("Password changed successfully!");
    }
    ,onError: (error) => {
      toast.error("Error changing password: " + error.response?.data?.message || error.message);
    }
  });

  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password ani Confirm password same asava!");
      return;
    }
    mutate({old_password :currentPassword, new_password:newPassword,new_password_confirmation: confirmPassword});
    onChangePassword?.({ currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const inputBase =
    "w-full pl-11 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-700";

  return (
    <div className="min-h-40 flex items-center justify-center  p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-5 border border-gray-200"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Change Password
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Update your password securely
        </p>

        {/* Current Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type={showCurrent ? "text" : "password"}
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputBase}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((s) => !s)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* New Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type={showNew ? "text" : "password"}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputBase}
          />
          <button
            type="button"
            onClick={() => setShowNew((s) => !s)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputBase}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg shadow-md transition-all duration-300"
         
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
