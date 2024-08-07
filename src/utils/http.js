import axios from "axios";
import { useUserStore } from "@/stores/user";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://myfaith.cc:4004",
  params: {}
});

console.log("env:", import.meta.env);

http.interceptors.request.use((config) => {
  const userStore = useUserStore();
  config.params["time"] = Date.now();
  if (userStore.cookie) config.params["cookie"] = userStore.cookie;
  return config;
});

http.interceptors.response.use((response) => {
  if (response.status === 200) {
    return response.data;
  }
  return Promise.reject(response.statusText);
});

export default http;
