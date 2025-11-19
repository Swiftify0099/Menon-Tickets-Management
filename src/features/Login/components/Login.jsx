// src/features/Auth/Login.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { loginUser } from "../../../http"; // तुम्ही आधीच असं वापरता
import { login, RemberMe } from "../../../redux/slices/login";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "../../../assets/menon-logo.png";

const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch (e) {
    return null;
  }
};

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
    const savedEmail = localStorage.getItem("login") || "";
    const savedPassword = localStorage.getItem("rememberedPassword") || "";
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    setRememberMe(savedRememberMe);
    setInitialValues({
      email: savedEmail,
      password: savedPassword,
    });
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response, variables) => {
      // response format based on what you sent me:
      // { status:200, message:"Login successful.", data: { token, user } }
      const data = response?.data ?? response;
      const token = data?.data?.token ?? data?.token;
      const user = data?.data?.user ?? data?.user;

      if (!token || !user) {
        toast.error("Invalid login response from server.");
        return;
      }

      // ensure user has id: prefer user.id, else try token.sub
      let safeUser = { ...user };
      if (!safeUser.id) {
        const payload = parseJwt(token);
        if (payload && (payload.sub || payload.id)) {
          safeUser.id = payload.sub ?? payload.id;
        }
      }

      // Dispatch to redux (login reducer will persist user & token)
      dispatch(login({ token, user: safeUser }));

      // Remember me
      dispatch(
        RemberMe({
          ReEmail: variables.email,
          RePassword: variables.password,
          Remember: rememberMe,
        })
      );

      toast.success(data?.message || "Login successful!");
      navigate("/");
    },
    onError: (error) => {
      const serverMessage = error?.response?.data?.message;
      const status = error?.response?.status;
      let errMsg = "Something went wrong. Please try again.";
      if (status === 401) errMsg = serverMessage || "Invalid email or password.";
      else if (serverMessage) errMsg = serverMessage;
      toast.error(errMsg);
      console.log("Login Error:", error?.response?.data);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Logo" className="h-16 w-auto object-contain" />
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
          onSubmit={(values) => mutation.mutate(values)}
        >
          {({ errors, touched }) => (
            <Form className="space-y-5">
              <div>
                <label className="block font-medium text-gray-700 text-sm mb-1">Email / ई-मेल</label>
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none transition-all text-sm sm:text-base ${
                    errors.email && touched.email
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label className="block font-medium text-gray-700 text-sm mb-1">Password / पासवर्ड</label>
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none transition-all text-sm sm:text-base ${
                      errors.password && touched.password
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setRememberMe(newValue);
                      localStorage.setItem("rememberMe", newValue.toString());
                    }}
                    className="w-4 h-4 rounded accent-orange-600 focus:ring-orange-500"
                  />
                  <span>Remember me / मला लक्षात ठेवा</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Forgot Password? / पासवर्ड विसरलात?
                </Link>
              </div>

             {/* बटण पूर्णपणे HIDE करण्यासाठी */}
{mutation.isPending ? (
  <div className="w-full py-3 rounded-lg font-semibold text-white text-sm sm:text-base bg-orange-400 cursor-not-allowed flex items-center justify-center gap-2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    Logging in...
  </div>
) : (
  <button
    type="submit"
    className="w-full py-3 rounded-lg font-semibold text-white text-sm sm:text-base bg-[#f57c00] hover:bg-orange-700 active:scale-95 transition-all duration-200 shadow-md"
  >
    Login / लॉगिन
  </button>
)}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
