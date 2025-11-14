// src/http.js
import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const noAuthRoutes = ["register", "reset-password", "login"];

    if (token && !noAuthRoutes.some((path) => config.url.includes(path))) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes("login") && window.location.pathname !== "/login") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (loginData) => {
  const resp = await http.post("login", loginData);
  return resp.data;
};

export const getUser = async () => {
  const resp = await http.get("profile");
  return resp.data;
};

export const updateUserProfile = async (updatedData) => {
  const resp = await http.post("profile-update", updatedData);
  return resp.data;
};

export const changepassword = async (passwordData) => {
  const resp = await http.post("password-change", passwordData);
  return resp.data;
};

export const ServiceProvider = async () => {
  const resp = await http.get("service/providers");
  return resp.data;
};

export const updateProfilePicture = async (formData) => {
  const resp = await http.post("profile-photo-update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return resp.data;
};

export const services = async (providerId) => {
  const resp = await http.get("services", {
    params: { provider_id: providerId },
  });
  return resp.data;
};

export const createTicket = async (ticketData) => {
  const resp = await http.post("ticket/add", ticketData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data;
};

export const getTickets = async () => {
  const resp = await http.get("tickets");
  return resp.data;
};

export const getTicketDetails = async (ticketId) => {
  const resp = await http.get(`ticket/show/${ticketId}`);
  return resp.data;
};

export const verifyResetToken = async (token) => {
  const resp = await http.post("password/verify", { reset_token: token });
  return resp.data;
};

export const resetPassword = async (data) => {
  const resp = await http.post("password/update", data);
  return resp.data;
};

export const forgotPassword = async (data) => {
  const resp = await http.post("password/reset", data);
  return resp.data;
};

export const ticketlist = async (page = 1, limit = 10, status = null, user_id = null) => {
  const offset = (page - 1) * limit;

  // Get user ID from localStorage if not provided
  let finalUserId = user_id;
  if (!finalUserId) {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    finalUserId = currentUser?.id;
  }

  const body = {
    limit,
    offset,
    search: "",
    user_id: finalUserId, // Use the user ID
    ...(status && { status }),
  };

  const resp = await http.post("ticket/list", body);
  return resp.data;
};

export const deleteDocument = async (documentId) => {
  const resp = await http.get(`ticket/documents/delete/${documentId}`);
  return resp.data;
};

export const updateTicket = async (ticketData) => {
  const resp = await http.post("ticket/update", ticketData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data;
};

export const DashbordCount = async () => {
  const resp = await http.get("dashboard/count");
  return resp.data;
}