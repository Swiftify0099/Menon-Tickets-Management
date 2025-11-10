// // services/httpClient.js
// import axios from 'axios';

// const httpClient = axios.create({
//   baseURL: 'https://menonticketsystem.neosao.co.in/api/v1/',
// });

// // Add request interceptor to include token
// httpClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );


// export default httpClient;