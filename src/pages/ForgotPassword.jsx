import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { forgotPassword } from "../http";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (res) => {
      toast.success(res.message || "✅ Reset link generated successfully!");
      
      // Extract token and redirect to reset page
      if (res.link) {
        try {
          const url = new URL(res.link);
          const token = url.searchParams.get('token');
          console.log("Extracted token:", token); // Debug log
          
          if (token) {
            navigate(`/reset-password?token=${token}`);
          } else {
            toast.error("Token not found in reset link");
          }
        } catch (error) {
          console.error("Error parsing reset link:", error);
          toast.error("Error processing reset link");
        }
      } else {
        toast.error("Reset link not found in response");
      }
    },
    onError: (err) => {
      console.error("Forgot password error:", err);
      console.error("Error response:", err.response);
      toast.error(err.response?.data?.message || "❌ Failed to generate reset link.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.warn("⚠️ Please enter your email");
    
    console.log("Sending forgot password request for:", email);
    mutate({ email });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md border">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Enter your email to generate reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 text-sm mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50"
          >
            {isPending ? "Generating..." : "Generate Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-orange-500 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;