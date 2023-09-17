import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    // 是否显示登录弹窗
    showLogin: false,
    // Cookie
    cookie: "",
    // 账号信息
    account: {},
    // 资料
    profile: {}
  }),
  getters: {},
  actions: {},
  persist: true
});
