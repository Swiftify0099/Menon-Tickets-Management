import httpClient from "../../../services/httpClient";


export const getProfile = async () => {
  const response = await httpClient.get("/profile"); 
  return response.data;
};


export const updateprofile = async () => {
  const response = await httpClient.post("/profile-photo-update"); 
  return response.data;
};



