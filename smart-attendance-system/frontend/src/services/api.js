import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const api = axios.create({ baseURL });
const refreshClient = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("attendance_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("attendance_refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("attendance_access_token");
        localStorage.removeItem("attendance_refresh_token");
        throw error;
      }

      originalRequest._retry = true;
      try {
        const { data } = await refreshClient.post("/auth/refresh", { refreshToken });
        localStorage.setItem("attendance_access_token", data.accessToken);
        localStorage.setItem("attendance_refresh_token", data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("attendance_access_token");
        localStorage.removeItem("attendance_refresh_token");
        throw refreshError;
      }
    }
    throw error;
  }
);

export default api;
