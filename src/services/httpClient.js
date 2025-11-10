// services/httpClient.js
import axios from 'axios';

const httpClient = axios.create({
  baseURL: 'https://menonticketsystem.neosao.co.in/api/v1/',
});

// Add request interceptor to include token
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // Add response interceptor to handle auth errors
// httpClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token is invalid, clear storage and redirect to login
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('user');
//       window.location.href = '/signin';
//     }
//     return Promise.reject(error);
//   }
// );

export default httpClient;