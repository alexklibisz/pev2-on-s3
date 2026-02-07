<template>
  <div class="d-flex flex-column h-100">
    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="alert alert-danger mt-3 container">{{ error }}</div>
    <template v-else-if="planData">
      <div class="mb-2 px-3">
        <h5 v-if="planData.title" class="mb-0">{{ planData.title }}</h5>
      </div>
      <div class="flex-grow-1 overflow-auto d-flex px-3">
        <Plan :plan-source="planData.plan" :plan-query="planData.query" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Plan } from "pev2";

interface PlanData {
  id: string;
  title: string;
  plan: string;
  query: string;
  createdAt: string;
}

const route = useRoute();
const planData = ref<PlanData | null>(null);
const loading = ref(true);
const error = ref("");


onMounted(async () => {
  try {
    const res = await fetch(`/api/plans/${route.params.id}`);
    if (!res.ok) {
      throw new Error(res.status === 404 ? "Plan not found" : "Failed to load plan");
    }
    planData.value = await res.json();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
