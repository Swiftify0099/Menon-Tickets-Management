import httpClient from "../../../services/httpClient";


export const logoutcall = async (credentials) => {
  const response = await httpClient.post("/logged-out", credentials);
  return response.data; 
};

