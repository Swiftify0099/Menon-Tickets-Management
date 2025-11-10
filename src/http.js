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
    const noAuthRoutes = ["register", "reset-password"];

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

// ✅ API Calls
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
}
export const services = async (providerId) => {
  const resp = await http.post(`services`, { provider_id: providerId });
  return resp.data;
};
export const createTicket = async (ticketData) => {
  const resp = await http.post("tickets/create", ticketData);
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

export const resetPassword = async (emailData) => {
  const resp = await http.post("forgot-password", emailData);
  return resp.data;
};  
export const changePassword = async (passwordData) => {
  const resp = await http.post("reset-password", passwordData);
  return resp.data;
};  
export const ticketlist = async () => {
  const resp = await http.post("ticket/list", );
  return resp.data;
}
