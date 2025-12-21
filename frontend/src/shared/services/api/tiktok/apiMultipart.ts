import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const axiosMultipartInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosMultipartInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
