import { http } from "../../../http";

export const loginUser = async (credentials) => {
  const response = await http.post("/login", credentials);
  return response.data; 
};


export const changePassword = async (data) => {
  const response = await http.post("/password-change", data);
  return response.data;
};