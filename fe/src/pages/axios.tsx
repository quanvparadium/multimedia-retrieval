import axios from 'axios'
const BACKEND_URL = 'http://localhost:3000'
const SEARCH_URL = 'http://localhost:4000'

export const axiosBase = axios.create({
    baseURL: `${BACKEND_URL}`, // Đặt baseURL của API của bạn
  });

export const axiosSearch = axios.create({
  baseURL: `${SEARCH_URL}`, // Đặt baseURL của API của bạn
});
  
export const axiosAuth = axios.create({
    baseURL: `${BACKEND_URL}`, // Đặt baseURL của API của bạn
    headers: {
        // Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
    }
});
  
axiosAuth.interceptors.request.use(
    (config) => {
      const accessToken = localStorage.getItem('accesstoken');
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);