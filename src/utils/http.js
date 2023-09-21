import axios from "axios";
import { useUserStore } from "@/stores/user";

const http = axios.create({
  baseURL: process.env.API || "https://163musicapi.coolxy.cn",
  params: {}
});

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
