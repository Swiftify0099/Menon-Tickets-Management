// src/hooks/useLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/LoginApi";

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const login = async (email, password) => {
        setLoading(true);
        setError("");

        try {
            const data = await loginUser({ email, password });

            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            console.log("LOGIN SUCCESS! Token saved as token");

            navigate("/", { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || "Invalid email or password";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
};