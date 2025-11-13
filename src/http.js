import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor - attach token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const noAuthRoutes = ["register", "password/reset"];

    if (token && !noAuthRoutes.some((path) => config.url.includes(path))) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor - handle unauthorized
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Please login again.");
    }
    return Promise.reject(error);
  }
);

// ---------------------- 🔐 AUTH ----------------------

export const loginUser = async (loginData) => {
  const resp = await http.post("login", loginData);
  return resp.data;
};

// ---------------------- 👤 USER PROFILE ----------------------

export const getUser = async () => {
  const resp = await http.get("profile");
  return resp.data;
};

export const updateUserProfile = async (updatedData) => {
  const resp = await http.post("profile-update", updatedData);
  return resp.data;
};

export const updateProfilePicture = async (data) => {
  const formData = new FormData();
  formData.append("profile_photo", data.profile_photo);

  const resp = await http.post("profile-photo-update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return resp.data;
};

// ---------------------- 🧰 SERVICES & PROVIDERS ----------------------

export const ServiceProvider = async () => {
  const resp = await http.get("service/providers");
  return resp.data;
};

export const services = async (providerId) => {
  const resp = await http.post("services", { provider_id: providerId });
  return resp.data;
};

// ---------------------- 🎟️ TICKETS ----------------------

export const createTicket = async (ticketData) => {
  const resp = await http.post("tickets/create", ticketData);
  return resp.data;
};

export const getTickets = async () => {
  const resp = await http.get("tickets");
  return resp.data;
};

export const ticketlist = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const body = {
    limit: String(limit),
    offset: String(offset),
    search: "",
  };

  const resp = await http.post("ticket/list", body);
  return resp.data;
};

export const deleteTicket = async (ticketId) => {
  const resp = await http.post(`ticket/delete/${ticketId}`);
  return resp.data;
};

export const editTicket = async (ticketId) => {
  const resp = await http.get(`ticket/edit/${ticketId}`);
  return resp.data;
};

export const getTicketDetails = async (ticketId) => {
  const resp = await http.get(`ticket/show/${ticketId}`);
  return resp.data;
};

// ✅ Change password (for logged in users)
export const changePasswordLoggedIn = async (passwordData) => {
  const resp = await http.post("password-change", passwordData);
  return resp.data;
};

// ---------------------- 🔑 PASSWORD ----------------------

// ✅ Dashboard count
export const DashboardCount = async () => {
  const res = await http.get("dashboard/count");
  return res.data;
};

// Step 1: Forgot password (send reset link)
export const forgotPassword = async (data) => {
  const res = await http.post("password/reset", data);
  return res.data;
};

// Step 2: Verify token (optional)
export const verifyResetToken = async (token) => {
  const res = await http.get(`password/reset/verify/${token}`);
  return res.data;
};

// ✅ Password update API
export const resetPassword = async (data) => {
  const resp = await http.post("password/update", data);
  return resp.data;
};