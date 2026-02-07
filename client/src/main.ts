import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "pev2/dist/pev2.css";

createApp(App).use(router).mount("#app");
