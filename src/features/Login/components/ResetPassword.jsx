// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { verifyResetToken, resetPassword } from "../../../http";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenVerified, setTokenVerified] = useState(false);

  // ✅ Verify token automatically
  const verifyMutation = useMutation({
    mutationFn: verifyResetToken,
    onSuccess: () => {
      setTokenVerified(true);
      toast.success("✅ Token verified. You can reset your password.");
    },
    onError: () => {
      toast.error("❌ Invalid or expired token.");
      navigate("/forgot-password");
    },
  });

  // ✅ Verify token on load
  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      toast.error("Invalid reset link.");
      navigate("/forgot-password");
    }
  }, [token]);

  // ✅ Update password
  const updateMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("✅ Password updated successfully!");
      navigate("/login");
    },
    onError: (err) => {
      console.error("Password update failed:", err);
      toast.error("❌ Failed to update password.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.warn("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.warn("Passwords do not match.");
      return;
    }

    updateMutation.mutate({
      reset_token: token,
      password,
      password_confirmation: confirmPassword,
    });
  };

  if (verifyMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Verifying token...</p>
      </div>
    );
  }

  if (!tokenVerified) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Reset Password
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Enter your new password below.
        </p>

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
            disabled={updateMutation.isPending}
            className="w-full bg-orange-500 text-white py-2 rounded-lg mt-4 hover:bg-orange-600 transition duration-200 font-semibold"
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