// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../http";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // token from reset email link
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (res) => {
      toast.success("✅ Password has been successfully reset!");
      navigate("/login");
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message || "❌ Failed to reset password";
      toast.error(message);
      console.error("Reset Password Error:", err);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    if (!token) {
      toast.error("❌ Invalid or missing token!");
      return;
    }

    // ✅ Send correct structure for backend
    mutate({
      token: token,
      password: password,
      password_confirmation: confirmPassword,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Reset Password
        </h2>
        <p className="text-center text-gray-600 text-sm sm:text-base mb-6">
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300
                         focus:ring-2 focus:ring-orange-500 focus:outline-none
                         text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 text-sm mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300
                         focus:ring-2 focus:ring-orange-500 focus:outline-none
                         text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-500 text-white py-2 rounded-lg mt-4
                       hover:bg-orange-600 transition duration-200 font-semibold text-sm sm:text-base"
          >
            {isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Go back to{" "}
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
