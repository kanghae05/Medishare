import axios from "axios";

const dpartApi = axios.create({
  baseURL: "http://localhost",
});

dpartApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers["X-AUTH-TOKEN"] = token;
  }

  return config;
});

export default dpartApi;
