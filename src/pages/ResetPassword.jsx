// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // ✅ this would come from email link
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // Simulate password reset API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("✅ Password has been successfully reset!");
      navigate("/login");
    } catch (err) {
      alert("❌ Failed to reset password");
    } finally {
      setLoading(false);
    }
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
              name="password"
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
              name="confirm"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300
                         focus:ring-2 focus:ring-orange-500 focus:outline-none
                         text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg mt-4
                       hover:bg-orange-600 transition duration-200 font-semibold text-sm sm:text-base"
          >
            {loading ? "Resetting..." : "Reset Password"}
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
