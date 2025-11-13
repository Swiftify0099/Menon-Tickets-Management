import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from "../../../http";
import { login, RemberMe } from "../../../redux/slices/login";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import Logo from "../../../assets/menon-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const mutation = useMutation({
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
  });

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img
              src={Logo}
              alt="Menon Initiator Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, <span className="text-orange-600">Menon Initiator</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">Please log in to your account</p>
        </div>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={(values, { setErrors }) => {
            mutation.mutate(values, {
              onError: (error) => {
                setErrors({
                  password:
                    error?.response?.data?.message ||
                    "Wrong email or password",
                });
              },
            });
          }}
        >
          <Form className="space-y-5">

            {/* Email */}
            <div>
              <label className="block font-medium text-gray-700 text-sm mb-1">
                Email
              </label>
              <Field
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                           focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                           focus:outline-none transition-all text-sm sm:text-base"
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

              <div className="relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                             focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                             focus:outline-none transition-all text-sm sm:text-base"
                />

                {/* Show/Hide Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Backend Error + Yup Error */}
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-orange-600 focus:ring-orange-500"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`w-full py-3 rounded-lg font-semibold text-white text-sm sm:text-base 
                transition-all duration-200 shadow-md ${
                  mutation.isPending
                    ? "bg-orange-400 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700 active:scale-95"
                }`}
            >
              {mutation.isPending ? "Logging in..." : "Login"}
            </button>

          </Form>
        </Formik>

      </div>
    </div>
  );
};

export default Login;
