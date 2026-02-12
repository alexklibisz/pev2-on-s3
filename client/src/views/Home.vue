<template>
  <div class="container">
    <div class="row">
      <div class="col-md-8">
        <h4 class="mb-3">New Plan</h4>
        <form @submit.prevent="submit">
          <div class="mb-3">
            <label class="form-label">Title (optional)</label>
            <input v-model="title" class="form-control" placeholder="My query plan" />
          </div>
          <div class="mb-3">
            <label class="form-label">Plan <span class="text-danger">*</span></label>
            <textarea
              v-model="plan"
              class="form-control font-monospace"
              rows="10"
              placeholder="Paste EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) output here"
              required
            ></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Query (optional)</label>
            <textarea
              v-model="query"
              class="form-control font-monospace"
              rows="4"
              placeholder="SELECT ..."
            ></textarea>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? "Submitting..." : "Submit" }}
          </button>
          <span v-if="error" class="text-danger ms-3">{{ error }}</span>
        </form>
      </div>
      <div class="col-md-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Recent Plans</h5>
          <button
            v-if="recentPlans.length > 0"
            class="btn btn-sm btn-outline-danger"
            @click="clearHistory"
          >
            Clear all
          </button>
        </div>
        <div v-if="recentPlans.length === 0" class="text-body-secondary">
          No plans yet.
        </div>
        <ul class="list-group">
          <li
            v-for="rp in recentPlans"
            :key="rp.id"
            class="list-group-item d-flex justify-content-between align-items-start"
          >
            <div class="me-auto text-truncate">
              <router-link :to="`/plan/${rp.id}`">
                {{ rp.title || rp.id.slice(0, 8) }}
              </router-link>
              <br />
              <small class="text-body-secondary">{{ formatDate(rp.createdAt) }}</small>
            </div>
            <button
              class="btn btn-sm btn-outline-danger ms-2 flex-shrink-0"
              title="Remove"
              @click="removePlan(rp)"
            >
              &times;
            </button>
          </li>
        </ul>
        <div v-if="examples.length > 0" class="mt-4">
          <h5 class="mb-3">Example Plans</h5>
          <ul class="list-group">
            <li
              v-for="ex in examples"
              :key="ex.name"
              class="list-group-item"
            >
              <router-link :to="`/example/${ex.name}`">{{ ex.title }}</router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

interface ExamplePlan {
  name: string;
  title: string;
}

interface RecentPlan {
  id: string;
  title: string;
  createdAt: string;
  deleteKey: string;
}

const router = useRouter();
const title = ref("");
const plan = ref("");
const query = ref("");
const submitting = ref(false);
const error = ref("");
const recentPlans = ref<RecentPlan[]>([]);
const examples = ref<ExamplePlan[]>([]);

const STORAGE_KEY = "pev2-recent-plans";

function loadRecent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    recentPlans.value = raw ? JSON.parse(raw) : [];
  } catch {
    recentPlans.value = [];
  }
}

function saveRecent() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recentPlans.value));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

async function submit() {
  error.value = "";
  submitting.value = true;
  try {
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.value,
        plan: plan.value,
        query: query.value,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create plan");
    }
    const { id, deleteKey } = await res.json();

    recentPlans.value.unshift({
      id,
      title: title.value,
      createdAt: new Date().toISOString(),
      deleteKey,
    });
    saveRecent();

    router.push(`/plan/${id}`);
  } catch (err: any) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
}

async function removePlan(rp: RecentPlan) {
  // Try to delete from server using the stored deleteKey
  try {
    await fetch(`/api/plans/${rp.id}`, {
      method: "DELETE",
      headers: { "x-delete-key": rp.deleteKey },
    });
  } catch {
    // Ignore server errors — still remove locally
  }
  recentPlans.value = recentPlans.value.filter((p) => p.id !== rp.id);
  saveRecent();
}

function clearHistory() {
  recentPlans.value = [];
  saveRecent();
}

async function loadExamples() {
  try {
    const res = await fetch("/api/examples");
    if (res.ok) {
      examples.value = await res.json();
    }
  } catch {
    // ignore — examples just won't show
  }
}

onMounted(() => {
  loadRecent();
  loadExamples();
});
</script>
