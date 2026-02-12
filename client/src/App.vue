<template>
  <div class="d-flex flex-column h-100">
    <div v-if="customBanner" v-html="customBanner" class="custom-banner"></div>
    <nav class="navbar navbar-expand-sm bg-body-tertiary border-bottom mb-3">
      <div class="container d-flex justify-content-between align-items-center">
        <router-link class="navbar-brand" to="/">{{ siteTitle }}</router-link>
        <div class="d-flex gap-2 align-items-center">
          <router-link to="/" class="btn btn-sm btn-outline-secondary">Home</router-link>
          <router-link v-if="showExamples" to="/examples" class="btn btn-sm btn-outline-secondary">Examples</router-link>
          <button class="btn btn-sm btn-outline-secondary" @click="toggleTheme">
            {{ theme === "dark" ? "Light" : "Dark" }}
          </button>
          <template v-if="showShare">
            <button class="btn btn-sm btn-outline-primary" @click="copyCurrentUrl">Share</button>
            <span v-if="copied" class="ms-2 text-success small">Copied!</span>
          </template>
        </div>
      </div>
    </nav>
    <div class="flex-grow-1 overflow-auto" style="min-height: 0">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const siteTitle = ref("pev2");
const customBanner = ref("");
const showExamples = ref(false);

const route = useRoute();
const copied = ref(false);
const showShare = computed(() => route.path.startsWith("/plan/"));

async function copyCurrentUrl() {
  const url = window.location.href;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      fallbackCopyTextToClipboard(url);
    }
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // ignore errors here
  }
}

function fallbackCopyTextToClipboard(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

onMounted(async () => {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const config = await res.json();
      siteTitle.value = config.siteTitle;
      customBanner.value = config.customBanner || "";
      showExamples.value = !!config.showExamples;
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
