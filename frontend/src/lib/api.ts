import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9000/api/v1",
  withCredentials: true,
});

api.defaults.headers.common["Accept"] = "application/json";

export default api;
