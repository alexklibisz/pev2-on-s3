import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import PlanView from "./views/PlanView.vue";
import ExamplesView from "./views/ExamplesView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/examples", component: ExamplesView },
    { path: "/plan/:id", component: PlanView },
    { path: "/example/:name", component: PlanView, meta: { isExample: true } },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

export default router;
