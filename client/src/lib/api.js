import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 15000;

axios.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !config.headers["Idempotency-Key"]) {
    config.headers["Idempotency-Key"] = crypto.randomUUID();
  }
  return config;
});

export const api = axios;
