import httpClient from "../../../services/httpClient";


export const loginUser = async (credentials) => {
  const response = await httpClient.post("/login", credentials);
  return response.data; // { token, user }
};


export const changePassword = async (data) => {
  const response = await httpClient.post("/password-change", data);
  return response.data;
};