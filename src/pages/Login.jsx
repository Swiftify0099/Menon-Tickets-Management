import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from "../http";
import { login, RemberMe } from "../redux/slices/login";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ Prefill if RememberMe active
  const [initialValues, setInitialValues] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("login");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedRememberMe && savedEmail) {
      setInitialValues({
        email: savedEmail,
        password: savedPassword || "",
      });
      setRememberMe(true);
    }
  }, []);

  // ✅ Validation Schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  // ✅ React Query Login Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (response, variables) => {
      const { token, user } = response?.data || {};

      if (!token) {
        toast.error("Invalid login response");
        return;
      }

      dispatch(login({ token, user }));
      dispatch(
        RemberMe({
          ReEmail: variables.email,
          RePassword: variables.password,
          Remember: rememberMe,
        })
      );

      toast.success("Login successful!");
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Login failed");
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-600 text-sm sm:text-base mb-6">
          Please log in to your account
        </p>

        {/* ✅ Formik Form */}
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={(values) => {
            mutate(values);
          }}
        >
          <Form className="space-y-4">
            {/* Email */}
            <div>
              <label className="block font-medium text-gray-700 text-sm mb-1">
                Email
              </label>
              <Field
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg border border-gray-300
                           focus:ring-2 focus:ring-orange-500 focus:outline-none
                           text-sm sm:text-base"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-medium text-gray-700 text-sm mb-1">
                Password
              </label>
              <Field
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 rounded-lg border border-gray-300
                           focus:ring-2 focus:ring-orange-500 focus:outline-none
                           text-sm sm:text-base"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm mt-2">
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-orange-500"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-orange-500 hover:text-orange-600 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full text-white py-2 rounded-lg mt-4 font-semibold text-sm sm:text-base transition duration-200 ${
                isPending
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </Form>
        </Formik>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-orange-500 hover:text-orange-600 transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
