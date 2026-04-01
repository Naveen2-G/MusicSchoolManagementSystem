import axios from "axios";

export const API = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

if (!API) {
  throw new Error("VITE_API_URL is required. Set it in your Vercel environment variables.");
}

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
    if (!error.response) {
      error.message = "Unable to reach backend API. Check VITE_API_URL and deployment status.";
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


