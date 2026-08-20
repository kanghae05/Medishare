import axios from "axios";

const apiBaseURL =
  import.meta.env.VITE_DPART_API_BASE_URL ||
  `http://${window.location.hostname}`;

const dpartApi = axios.create({
  baseURL: apiBaseURL,
});

dpartApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers["X-AUTH-TOKEN"] = token;
  }

  return config;
});

export default dpartApi;
