import axios from "axios";

const axiosClient = axios.create({
  // Use an explicit build-time URL when provided; otherwise route through the
  // same origin so the panel also works from another device on the LAN.
  baseURL: import.meta.env.VITE_API_BASE || "/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // Если токен просрочен или недействителен – чистим хранилище и уходим на логин.
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
