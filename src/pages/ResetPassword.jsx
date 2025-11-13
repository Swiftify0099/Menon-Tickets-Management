import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../http";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  console.log("Token from URL:", token);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Reset password mutation
  const updateMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (res) => {
      toast.success(res.message || "✅ Password updated successfully!");
      navigate("/login");
    },
    onError: (err) => {
      console.error("Password update failed:", err);
      console.error("Error response:", err.response);
      
      if (err.response?.status === 401 || err.response?.status === 400) {
        toast.error("❌ Invalid or expired reset token.");
      } else if (err.response?.data?.message) {
        toast.error(`❌ ${err.response.data.message}`);
      } else {
        toast.error("❌ Failed to update password. Please try again.");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("❌ Invalid reset link. Please request a new one.");
      return;
    }

    if (!password || !confirmPassword) {
      toast.warn("⚠️ Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.warn("⚠️ Passwords do not match.");
      return;
    }

    console.log("Sending reset request with:", {
      reset_token: token,
      password,
      password_confirmation: confirmPassword
    });

    updateMutation.mutate({
      reset_token: token,
      password,
      password_confirmation: confirmPassword,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md border">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Reset Password
        </h2>
        
        {/* Debug info */}

        {!token && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              ❌ No reset token found in URL
            </p>
            <Link 
              to="/forgot-password" 
              className="text-blue-500 hover:underline text-sm"
            >
              Request new reset link
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 text-sm mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 text-sm mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending || !token}
            className="w-full bg-orange-500 text-white py-2 rounded-lg mt-4 hover:bg-orange-600 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Back to{" "}
          <Link
            to="/login"
            className="text-orange-500 hover:text-orange-600 transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;