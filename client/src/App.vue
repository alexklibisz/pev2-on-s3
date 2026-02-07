<template>
  <div class="d-flex flex-column h-100">
    <nav class="navbar navbar-expand-sm bg-body-tertiary border-bottom mb-3">
      <div class="container d-flex justify-content-between align-items-center">
        <router-link class="navbar-brand" to="/">{{ siteTitle }}</router-link>
        <div class="d-flex gap-2">
          <router-link to="/" class="btn btn-sm btn-outline-secondary">Home</router-link>
          <button class="btn btn-sm btn-outline-secondary" @click="toggleTheme">
            {{ theme === "dark" ? "Light" : "Dark" }}
          </button>
        </div>
      </div>
    </nav>
    <router-view class="flex-grow-1 overflow-auto" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

const siteTitle = ref("pev2");

onMounted(async () => {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const config = await res.json();
      siteTitle.value = config.siteTitle;
      document.title = `${config.siteTitle} — PostgreSQL EXPLAIN Visualizer`;
    }
  } catch {
    // keep defaults
  }
});

const stored = localStorage.getItem("theme");
const theme = ref<"light" | "dark">(
  stored === "dark" || stored === "light" ? stored : "light"
);

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
}

function applyTheme(val: string) {
  document.documentElement.setAttribute("data-bs-theme", val);
  localStorage.setItem("theme", val);
}

applyTheme(theme.value);
watch(theme, (val) => applyTheme(val));
</script>
