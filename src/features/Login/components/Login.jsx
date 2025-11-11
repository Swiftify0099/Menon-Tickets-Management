import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { loginUser } from "../../../http";
import { login, RemberMe } from "../../../redux/slices/login";

// Replace with your actual logo path
import Logo from "../../../assets/menon-logo.png";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [rememberMe, setRememberMe] = useState(false);

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
      .email(t('login.invalid_email', 'Invalid email format'))
      .required(t('login.email_required', 'Email is required')),
    password: Yup.string().required(t('login.password_required', 'Password is required')),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (response, variables) => {
      const { token, user } = response?.data || {};

      if (!token) {
        toast.error(t('login.invalid_response', 'Invalid login response'));
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

      toast.success(t('login.success', 'Login successful!'));
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || t('login.failed', 'Login failed'));
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={2000} />
   {/* Language Switcher – Top-Left */}
      <div className="absolute top-6 left-6 z-10">
        <LanguageSwitcher />
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        {/* Logo & Welcome Section */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img
              src={Logo}
              alt={t('login.logo_alt', 'Menon Initiator Logo')}
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {t('login.welcome', 'Welcome,')} <span className="text-orange-600">{t('login.menon_initiator', 'Menon Initiator')}</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {t('login.please_login', 'Please log in to your account')}
          </p>
        </div>

        {/* Form */}
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={(values) => {
            mutate(values);
          }}
        >
          <Form className="space-y-5">
            {/* Email */}
            <div>
              <label className="block font-medium text-gray-700 text-sm mb-1">
                {t('login.email', 'Email')}
              </label>
              <Field
                type="email"
                name="email"
                placeholder={t('login.email_placeholder', 'Enter your email')}
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
                {t('login.password', 'Password')}
              </label>
              <Field
                type="password"
                name="password"
                placeholder={t('login.password_placeholder', 'Enter your password')}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                           focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                           focus:outline-none transition-all text-sm sm:text-base"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-orange-600 focus:ring-orange-500"
                />
                <span>{t('login.remember_me', 'Remember me')}</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                {t('login.forgot_password', 'Forgot Password?')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-3 rounded-lg font-semibold text-white text-sm sm:text-base 
                transition-all duration-200 shadow-md ${
                  isPending
                    ? "bg-orange-400 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700 active:scale-95"
                }`}
            >
              {isPending ? t('login.logging_in', 'Logging in...') : t('login.login', 'Login')}
            </button>
          </Form>
        </Formik>

        {/* Optional Footer */}
        {/* <p className="text-center text-sm text-gray-600 mt-6">
          {t('login.no_account', "Don't have an account?")}{" "}
          <Link
            to="/signup"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            {t('login.sign_up', 'Sign Up')}
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default Login;