// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../../http"; // ✅ correct import

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
const navigate = useNavigate();
  // ✅ UseMutation for API call
  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (res) => {
      toast.success("✅ Password reset link sent to your email!");
      // Do not navigate here, let user click the link from email
      navigate("/reset-password");
    },
    onError: (err) => {
      toast.error("❌ Failed to send reset link!");
      console.error("Reset Password Error:", err);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.warn("Please enter your email");
      return;
    }

    // ✅ API call
    mutate({ email });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-600 text-sm sm:text-base mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 text-sm mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {isPending ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-orange-500 hover:text-orange-600 transition-colors"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;