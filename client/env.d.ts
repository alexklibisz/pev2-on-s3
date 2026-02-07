/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "pev2" {
  import type { DefineComponent } from "vue";
  export const Plan: DefineComponent<{
    planSource: string;
    planQuery: string;
  }>;
}
