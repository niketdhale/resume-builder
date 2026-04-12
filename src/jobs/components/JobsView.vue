<script setup>
import { ref, computed, inject } from 'vue'
import NavBar from '../components/ui/NavBar.vue'
import StatsBar from '../jobs/components/StatsBar.vue'
import JobChart from '../jobs/components/JobChart.vue'
import BoardView from '../jobs/components/BoardView.vue'
import TableView from '../jobs/components/TableView.vue'
import AddJobModal from '../jobs/components/AddJobModal.vue'
import { jobs, jobStats, jobsByStatus, JOB_STATUSES, isDummyData } from '../jobs/composables/useJobState'
import { addJob, updateJob, deleteJob, setJobStatus, clearDummyData } from '../jobs/composables/useJobActions'

const resumes = inject('resumes')

const viewMode = ref('table')
const activeFilter = ref('all')

const filteredJobs = computed(() =>
  activeFilter.value === 'all'
    ? jobs.value
    : jobs.value.filter((j) => j.status === activeFilter.value),
)

const showModal  = ref(false)
const editingJob = ref(null)

function openAdd(initialStatus = 'applied') {
  editingJob.value = { status: initialStatus }
  showModal.value  = true
}
function openEdit(job) {
  editingJob.value = { ...job }
  showModal.value  = true
}
function handleSave(fields) {
  if (editingJob.value) updateJob(editingJob.value.id, fields)
  else addJob(fields)
}
function handleDelete(jobId) {
  if (confirm('Delete this application?')) deleteJob(jobId)
}

const filterPills = computed(() => [
  { value: 'all', label: 'All', count: jobs.value.length },
  ...JOB_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
    count: (jobsByStatus.value[s.value] || []).length,
    dot: s.dot,
  })).filter((p) => p.count > 0),
])
</script>

<template>
  <div class="page-wrap">
    <NavBar />

    <div class="page-content">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Job Tracker</h1>
          <p class="page-sub">Track your job applications in one place</p>
        </div>
        <div class="header-actions">
          <!-- Board / Table toggle -->
          <div class="view-toggle">
            <button
              @click="viewMode = 'board'"
              :class="['toggle-btn', viewMode === 'board' ? 'toggle-btn--active' : '']"
            >⊞ Board</button>
            <div class="toggle-divider" />
            <button
              @click="viewMode = 'table'"
              :class="['toggle-btn', viewMode === 'table' ? 'toggle-btn--active' : '']"
            >☰ Table</button>
          </div>
          <button class="add-btn" @click="openAdd()">+ Add Application</button>
        </div>
      </div>

      <!-- Sample data banner -->
      <div v-if="isDummyData" class="dummy-banner">
        <div class="dummy-banner__left">
          <span>⚠️</span>
          <span class="dummy-banner__msg">You're viewing sample data for testing.</span>
          <span class="dummy-banner__sub">Add a real application to replace it, or clear it now.</span>
        </div>
        <button class="dummy-banner__clear" @click="clearDummyData">Clear test data</button>
      </div>

      <!-- Stats -->
      <StatsBar :stats="jobStats" />

      <!-- Chart -->
      <JobChart :jobs="jobs" />

      <!-- Filter pills -->
      <div class="filter-pills">
        <button
          v-for="pill in filterPills" :key="pill.value"
          @click="activeFilter = pill.value"
          :class="['pill', activeFilter === pill.value ? 'pill--active' : '']"
        >
          <div
            v-if="pill.dot"
            class="pill-dot"
            :style="{ backgroundColor: activeFilter === pill.value ? 'var(--bg-base)' : pill.dot }"
          />
          {{ pill.label }} ({{ pill.count }})
        </button>
      </div>

      <!-- Board view -->
      <BoardView
        v-if="viewMode === 'board'"
        :jobs="filteredJobs"
        :resumes="resumes"
        @edit="openEdit"
        @delete="handleDelete"
        @status-change="setJobStatus"
        @add="openAdd"
      />

      <!-- Table view -->
      <TableView
        v-else
        :jobs="filteredJobs"
        :resumes="resumes"
        @edit="openEdit"
        @delete="handleDelete"
        @status-change="setJobStatus"
        @resume-change="(jobId, resumeId) => updateJob(jobId, { resumeId })"
      />
    </div>

    <AddJobModal
      :show="showModal"
      :initial="editingJob"
      :resumes="resumes"
      @save="handleSave"
      @close="showModal = false"
    />
  </div>
</template>

<style scoped>
.page-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
}

.page-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--ink); }
.page-sub   { font-size: 0.875rem; color: var(--ink-3); margin-top: 0.25rem; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-toggle {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-surface);
}
.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: transparent;
  border: none;
  color: var(--ink-3);
  cursor: pointer;
  transition: all 0.15s;
}
.toggle-btn:hover { color: var(--ink); background: var(--bg-subtle); }
.toggle-btn--active { background: var(--bg-subtle); color: var(--ink); }
.toggle-divider { width: 1px; height: 1rem; background: var(--border); }

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--gold);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
}
.add-btn:hover { opacity: 0.88; }

.dummy-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(217,119,6,0.08);
  border: 1px solid rgba(217,119,6,0.25);
  border-radius: 12px;
  font-size: 0.875rem;
  flex-wrap: wrap;
}
.dummy-banner__left  { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.dummy-banner__msg   { font-weight: 500; color: #d97706; }
.dummy-banner__sub   { color: #b45309; }
.dummy-banner__clear {
  font-size: 0.75rem;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(217,119,6,0.35);
  background: transparent;
  color: #d97706;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.15s;
  white-space: nowrap;
}
.dummy-banner__clear:hover { background: rgba(217,119,6,0.1); }

.filter-pills {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.pill {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--border);
  background: var(--bg-surface);
  color: var(--ink-3);
  cursor: pointer;
  transition: all 0.15s;
}
.pill:hover { border-color: var(--gold); color: var(--ink); }
.pill--active {
  background: var(--gold);
  border-color: var(--gold);
  color: #fff;
}
.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
