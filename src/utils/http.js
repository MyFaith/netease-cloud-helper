import axios from "axios";
import { useUserStore } from "@/stores/user";

const http = axios.create({
  baseURL: process.env.VITE_API_URL || "https://163musicapi.coolxy.cn",
  params: {}
});

console.log("VITE_API_URL", process.env.VITE_API_URL);

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
