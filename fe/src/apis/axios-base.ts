import axios from "axios";

export const axiosWithoutToken = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BE_URL}`, // Đặt baseURL của API của bạn
});

axiosWithoutToken.interceptors.response.use(
  (res) => {
    return res?.data;
  },
  (error) => {
    return error;
  },
);

export const axiosWithToken = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BE_URL}`, // Đặt baseURL của API của bạn
});

axiosWithToken.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) throw new Error("Couldn't find accessToken");
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosWithToken.interceptors.response.use(
  (res) => {
    return res?.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);
