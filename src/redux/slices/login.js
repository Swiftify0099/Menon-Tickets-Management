import { createSlice } from "@reduxjs/toolkit";

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
      const { user, token } = action.payload;
      state.isLoggedIn = true;
      state.user = user;
      state.token = token;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      state.profile = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("profile");
    },
    updateUser: (state, action) => {
      const updatedProfile = { ...state.profile, ...action.payload };
      state.profile = updatedProfile;
      localStorage.setItem("profile", JSON.stringify(updatedProfile));
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
