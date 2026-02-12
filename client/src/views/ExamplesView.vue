<template>
  <div class="container pb-4">
    <h4 class="mb-3">Examples</h4>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="examples.length === 0" class="text-body-secondary">
      No examples available.
    </div>
    <ul v-else class="list-group">
      <li
        v-for="ex in examples"
        :key="ex.name"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <span>{{ ex.title }}</span>
        <span class="d-flex gap-2">
          <router-link
            :to="`/example/${ex.name}`"
            class="btn btn-sm btn-outline-primary"
          >
            View
          </router-link>
          <router-link
            :to="{ path: '/', query: { example: ex.name } }"
            class="btn btn-sm btn-outline-secondary"
          >
            Load
          </router-link>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

interface ExamplePlan {
  name: string;
  title: string;
}

const router = useRouter();
const examples = ref<ExamplePlan[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch("/api/examples");
    if (!res.ok) {
      router.replace("/");
      return;
    }
    examples.value = await res.json();
  } catch {
    router.replace("/");
    return;
  } finally {
    loading.value = false;
  }
});
</script>
