import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://social-app-production-3828.up.railway.app/api/v1",
  withCredentials: true,
});

api.defaults.headers.common["Accept"] = "application/json";

export default api;
