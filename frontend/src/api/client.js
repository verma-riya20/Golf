import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Backward-compatible alias used by newer API modules.
export const client = api;

let accessToken = localStorage.getItem("accessToken") || "";
let isRefreshing = false;
let queued = [];

const processQueue = (token) => {
  queued.forEach((cb) => cb(token));
  queued = [];
};

export const setAccessToken = (token) => {
  accessToken = token || "";
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        queued.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await api.post("/auth/refresh");
      setAccessToken(data.accessToken);
      processQueue(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken("");
      processQueue("");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
