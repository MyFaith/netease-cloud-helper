import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/home/index.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/playlist",
      name: "playlist",
      component: () => import("@/views/playlist/index.vue")
    },
    {
      path: "/cloud",
      name: "cloud",
      component: () => import("@/views/cloud/index.vue")
    }
  ]
});

export default router;
