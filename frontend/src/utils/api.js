import axios from "axios";

const deployedApiOrigin = "https://musicschoolmanagementsystembackend.onrender.com";

const explicitApiOrigin = import.meta.env.VITE_API_URL?.trim();

const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const fallbackOrigin = isLocalHost ? "http://localhost:5000" : deployedApiOrigin;

export const API = (explicitApiOrigin || fallbackOrigin).replace(/\/+$/, "");

const baseURL = `${API}/api`;

export const api = axios.create({
  baseURL
});

// Add token to all requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized) - logout user
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


