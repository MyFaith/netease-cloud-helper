import { createApp } from "vue";

// App
import App from "./App.vue";
const app = createApp(App);

// Styles
import "./style.css";
import "./normalize.css";

// Pinia
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// Vue Router
import router from "./router";
app.use(router);

// Naive UI
import NaiveUI from "naive-ui";
app.use(NaiveUI);

// Mount
app.mount("#app");
