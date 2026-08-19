import axios from "axios";

const dpartApi = axios.create({
  baseURL: "http://10.15.21.45:8080",
});

dpartApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers["X-AUTH-TOKEN"] = token;
  }

  return config;
});

export default dpartApi;
