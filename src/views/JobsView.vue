<script setup>
import { ref, computed, inject } from 'vue'
import NavBar from '../components/ui/NavBar.vue'
import StatsBar from '../jobs/components/StatsBar.vue'
import JobChartsPanel from '../jobs/components/JobChartsPanel.vue'
import BoardView from '../jobs/components/BoardView.vue'
import TableView from '../jobs/components/TableView.vue'
import AddJobModal from '../jobs/components/AddJobModal.vue'
import { jobs, jobStats, jobsByStatus, JOB_STATUSES } from '../jobs/composables/useJobState'
import { addJob, updateJob, deleteJob, setJobStatus } from '../jobs/composables/useJobActions'

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

function openAdd(status = 'applied') {
  editingJob.value = null
  showModal.value = true
}
function openEdit(job) {
  editingJob.value = { ...job }
  showModal.value = true
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
          <!-- Board / Table toggle — always horizontal -->
          <div class="view-toggle sm-only">
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
          <button class="add-btn sm-only" @click="openAdd()">+ Add Application</button>
        </div>
      </div>

      <!-- Stats -->
      <StatsBar :stats="jobStats" />

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
            :style="{ backgroundColor: activeFilter === pill.value ? 'rgba(255,255,255,0.8)' : pill.dot }"
          />
          {{ pill.label }} ({{ pill.count }})
        </button>
      </div>

      <!-- Mobile card list -->
      <div class="mobile-cards">
        <div v-if="filteredJobs.length === 0" class="mobile-empty">No applications yet</div>
        <div
          v-for="job in filteredJobs" :key="job.id"
          class="mobile-card"
          @click="openEdit(job)"
        >
          <div class="mobile-card__top">
            <div class="mobile-card__info">
              <p class="mobile-card__company">{{ job.company || '—' }}</p>
              <p class="mobile-card__role">{{ job.role || 'No role' }}</p>
            </div>
            <span
              class="mobile-card__status"
              :style="{ backgroundColor: JOB_STATUSES.find(s => s.value === job.status)?.bg || 'var(--bg-subtle)', color: JOB_STATUSES.find(s => s.value === job.status)?.dot || 'var(--ink-3)' }"
            >{{ JOB_STATUSES.find(s => s.value === job.status)?.label || job.status }}</span>
          </div>
          <div class="mobile-card__footer">
            <span>{{ job.salary || 'No salary' }}</span>
            <span>{{ job.appliedDate || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Board view — wrapped so display:none doesn't override component's flex -->
      <div v-if="viewMode === 'board'" class="sm-only">
        <BoardView
          :jobs="filteredJobs"
          :resumes="resumes"
          @edit="openEdit"
          @delete="handleDelete"
          @status-change="setJobStatus"
          @add="openAdd"
        />
      </div>

      <!-- Table view -->
      <div v-if="viewMode === 'table'" class="sm-only">
        <TableView
          :jobs="filteredJobs"
          :resumes="resumes"
          @edit="openEdit"
          @delete="handleDelete"
          @status-change="setJobStatus"
        />
      </div>

      <!-- Charts panel — below table/board -->
      <JobChartsPanel :jobs="jobs" />
    </div>

    <!-- FAB: mobile only -->
    <button class="fab" @click="openAdd()" aria-label="Add Application">+</button>

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
  padding: 1.5rem 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
@media (min-width: 640px) {
  .page-content { padding: 2rem 1.5rem; gap: 1.5rem; }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.page-title { font-size: 1.25rem; font-weight: 700; color: var(--ink); }
@media (min-width: 640px) { .page-title { font-size: 1.5rem; } }
.page-sub   { font-size: 0.875rem; color: var(--ink-3); margin-top: 0.25rem; }

.header-actions {
  display: flex;
  flex-direction: row;    /* force horizontal */
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Toggle — always a horizontal row */
.view-toggle {
  display: flex;
  flex-direction: row;    /* explicit */
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-surface);
}
.toggle-btn {
  display: flex;
  flex-direction: row;
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
  white-space: nowrap;
}
.toggle-btn:hover { color: var(--ink); background: var(--bg-subtle); }
.toggle-btn--active { background: var(--bg-subtle); color: var(--ink); }
.toggle-divider { width: 1px; height: 1rem; background: var(--border); flex-shrink: 0; }

.add-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1rem;
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

.filter-pills {
  display: flex; align-items: center; gap: 0.5rem;
  overflow-x: auto; padding-bottom: 2px;
}
.pill {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.3rem 0.75rem; border-radius: 99px;
  font-size: 0.75rem; font-weight: 500;
  border: 1px solid var(--border); background: var(--bg-surface);
  color: var(--ink-3); cursor: pointer; transition: all 0.15s;
  flex-shrink: 0;
}
.pill:hover { border-color: var(--gold); color: var(--ink); }
.pill--active { background: var(--gold); border-color: var(--gold); color: #fff; }
.pill-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

/* Mobile-only cards */
.mobile-cards { display: flex; flex-direction: column; gap: 0.75rem; }
@media (min-width: 640px) { .mobile-cards { display: none; } }
.mobile-empty { text-align: center; padding: 3rem 1rem; font-size: 0.875rem; color: var(--ink-3); }
.mobile-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 1rem; cursor: pointer;
}
.mobile-card__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
.mobile-card__info { min-width: 0; }
.mobile-card__company { font-weight: 600; font-size: 0.875rem; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mobile-card__role    { font-size: 0.75rem; color: var(--ink-3); margin-top: 0.125rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mobile-card__status  { flex-shrink: 0; font-size: 0.6875rem; font-weight: 500; padding: 0.2rem 0.5rem; border-radius: 99px; }
.mobile-card__footer  {
  display: flex; justify-content: space-between;
  margin-top: 0.75rem; padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  font-size: 0.75rem; color: var(--ink-3);
}

/* Desktop-only wrapper — display:block so component flex is NOT overridden */
.sm-only { display: none; }
@media (min-width: 640px) { .sm-only { display: block; } }

/* FAB */
.fab {
  display: flex; align-items: center; justify-content: center;
  position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 30;
  width: 3.5rem; height: 3.5rem;
  background: var(--gold); color: #fff;
  font-size: 1.5rem; border: none; border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(184,146,58,0.4);
  cursor: pointer; transition: opacity 0.15s;
}
.fab:hover { opacity: 0.88; }
@media (min-width: 640px) { .fab { display: none; } }
</style>
