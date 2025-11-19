// src/redux/slices/login.js
import { createSlice } from "@reduxjs/toolkit";
import { QueryClient } from "@tanstack/react-query";

// helper to parse JWT and extract payload safely
const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch (e) {
    return null;
  }
};

const initialState = {
  isLoggedIn: false,
  token: null,
  user: null,
  profile: null,
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, user } = action.payload;

      // ensure we have an id on user: try user.id || token.sub
      let safeUser = { ...user };
      if (!safeUser.id && token) {
        const payload = parseJwt(token);
        if (payload && (payload.sub || payload.id)) {
          safeUser.id = payload.sub ?? payload.id;
        }
      }

      state.isLoggedIn = true;
      state.user = safeUser;
      state.token = token;

      // persist
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(safeUser));
      localStorage.setItem("profile", JSON.stringify(safeUser));
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      state.profile = null;

      try {
        // clear react-query cache (if you use a client instance elsewhere, call it there)
        QueryClient.clear();
      } catch (e) {}

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("profile");
    },
    updateUser: (state, action) => {
      const updatedProfile = { ...state.profile, ...action.payload };
      state.profile = updatedProfile;
      localStorage.setItem("profile", JSON.stringify(updatedProfile));
      // keep user in sync as well if id matches
      if (state.user) {
        const merged = { ...state.user, ...action.payload };
        state.user = merged;
        localStorage.setItem("user", JSON.stringify(merged));
      }
    },
    RemberMe: (state, action) => {
      const { ReEmail, RePassword, Remember } = action.payload;
      if (Remember) {
        localStorage.setItem("login", ReEmail);
        localStorage.setItem("rememberedPassword", RePassword);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("login");
        localStorage.removeItem("rememberedPassword");
        localStorage.removeItem("rememberMe");
      }
    },
  },
});

export const { login, logout, updateUser, RemberMe } = loginSlice.actions;
export default loginSlice.reducer;
