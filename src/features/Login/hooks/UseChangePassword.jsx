// src/hooks/useChangePassword.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../api/LoginApi";


export const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const submit = async (oldPassword, newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        localStorage.clear();
        navigate("/signin", { replace: true });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error, success };
};