import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { forgotPassword } from "../../../http";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // ✅ Validation Schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format / ईमेल चुकीचा आहे")
      .required("Email is required / ईमेल आवश्यक आहे"),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (res) => {
      toast.success(
        res?.data?.message ||
          "Reset link has been sent to your email address.",
        {
          position: "top-right",
          autoClose: 4000,
        }
      );


    //   setTimeout(() => {
    //     if (res?.link) {
    //       const token = new URL(res.link).searchParams.get("token");
    //       navigate(`/reset-password?token=${token}`);
    //     } else {
    //       navigate("/login");
    //     }
      //   }, 1000);
      setTimeout(() => {
        navigate("/login");
      },3000)
    },

    onError: (err) => {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send reset link!";
      toast.error(errorMessage);
      console.error("Reset Password Error:", err);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Forgot Password? <br /> पासवर्ड विसरलात?
        </h2>

        <p className="text-center text-gray-600 text-sm sm:text-base mb-6">
          Enter your email address and we'll send you a link to reset your
          password.
          <br />
          आपला ईमेल पत्ता टाका आणि आम्ही आपल्याला पासवर्ड रीसेट करण्यासाठी लिंक पाठवू.
        </p>

        {/* ✅ Formik Form */}
        <Formik
          initialValues={{ email: "" }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            mutate({ email: values.email });
          }}
        >
          {() => (
            <Form className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 text-sm mb-1">
                  Email / ईमेल
                </label>

                {/* Input Field */}
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-orange-500 focus:outline-none
                             text-sm sm:text-base"
                />

                {/* ❌ Error Message */}
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-orange-500 text-white py-2 rounded-lg mt-4
                           hover:bg-orange-600 transition duration-200 font-semibold text-sm sm:text-base"
              >
                {isPending
                  ? "Sending..."
                  : "Send Reset Link / रीसेट लिंक पाठवा"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-orange-500 hover:text-orange-600 transition-colors"
          >
            Back to Login / लॉगिनवर परत जा
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
