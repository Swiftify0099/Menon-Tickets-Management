import React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../../../http";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // ✅ Yup Validation Schema
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters / किमान ६ अक्षरे असावी")
      .required("Password is required / पासवर्ड आवश्यक आहे"),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("password"), null],
        "Passwords do not match / पासवर्ड जुळत नाहीत"
      )
      .required("Confirm password is required / पुष्टीकरण आवश्यक आहे"),
  });

  // ✅ Reset password mutation
  const updateMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (res) => {
      toast.success(res.message || "Password updated successfully!");
      navigate("/login");
    },
    onError: (err) => {
      if (err.response?.status === 401 || err.response?.status === 400) {
        toast.error("Invalid or expired reset token.");
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to update password. Please try again.");
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md border">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Reset Password
          <br />
          पासवर्ड रीसेट करा
        </h2>

        {!token && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">❌ No reset token found</p>
            <Link to="/forgot-password" className="text-blue-500 underline text-sm">
              Request a new reset link
            </Link>
          </div>
        )}

        {/* ✅ Formik Form */}
        <Formik
          initialValues={{
            password: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (!token) {
              toast.error("Invalid reset link. Request a new one.");
              return;
            }

            updateMutation.mutate({
              reset_token: token,
              password: values.password,
              password_confirmation: values.confirmPassword,
            });
          }}
        >
          {() => (
            <Form className="space-y-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password / नवीन पासवर्ड
                </label>

                <Field
                  type="password"
                  name="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 
                             focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />

                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password / पासवर्ड पुष्टी करा
                </label>

                <Field
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 
                             focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />

                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={updateMutation.isPending || !token}
                className="w-full bg-orange-500 text-white py-2 rounded-lg mt-4 
                           hover:bg-[#f57c00] transition font-semibold 
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending
                  ? "Updating..."
                  : "Update Password / पासवर्ड अपडेट करा"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm text-gray-600 mt-6">
          Back to{" "}
          <Link
            to="/login"
            className="text-orange-500 hover:text-orange-600 transition-colors"
          >
            Login / लॉगिन
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
