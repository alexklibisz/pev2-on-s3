import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import PlanView from "./views/PlanView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/plan/:id", component: PlanView },
    { path: "/example/:name", component: PlanView, meta: { isExample: true } },
  ],
});

export default router;
