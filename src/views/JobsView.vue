<script setup>
import { ref, computed, inject } from 'vue'
import NavBar from '../components/ui/NavBar.vue'
import StatsBar from '../jobs/components/StatsBar.vue'
import JobChart from '../jobs/components/JobChart.vue'
import BoardView from '../jobs/components/BoardView.vue'
import TableView from '../jobs/components/TableView.vue'
import AddJobModal from '../jobs/components/AddJobModal.vue'
import { jobs, jobStats, jobsByStatus, JOB_STATUSES } from '../jobs/composables/useJobState'
import { addJob, updateJob, deleteJob, setJobStatus } from '../jobs/composables/useJobActions'

// Link to resumes for the resume column
const resumes = inject('resumes')

// ─── View mode ────────────────────────────────────────────────────────────────
const viewMode = ref('table')

// ─── Status filter ────────────────────────────────────────────────────────────
const activeFilter = ref('all')

const filteredJobs = computed(() =>
  activeFilter.value === 'all'
    ? jobs.value
    : jobs.value.filter((j) => j.status === activeFilter.value),
)

// ─── Add / Edit modal ─────────────────────────────────────────────────────────
const showModal = ref(false)
const editingJob = ref(null)

function openAdd(status = 'applied') {
  editingJob.value = null
  showModal.value = true
  console.log('Opening add modal with status:', status)
}

function openEdit(job) {
  editingJob.value = { ...job }
  showModal.value = true
}

function handleSave(fields) {
  if (editingJob.value) {
    updateJob(editingJob.value.id, fields)
  } else {
    addJob(fields)
  }
}

function handleDelete(jobId) {
  if (confirm('Delete this application?')) deleteJob(jobId)
}

// ─── Filter pill counts ───────────────────────────────────────────────────────
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
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
    <NavBar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full flex flex-col gap-4 sm:gap-6">
      <!-- Header -->
      <div class="flex items-start sm:items-end justify-between gap-3">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">Job Tracker</h1>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Track your job applications in one place
          </p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Board / Table toggle — hidden on mobile (card list is used) -->
          <div
            class="hidden sm:flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900"
          >
            <button
              @click="viewMode = 'board'"
              :class="[
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition',
                viewMode === 'board'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
              ]"
            >⊞ Board</button>
            <div class="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <button
              @click="viewMode = 'table'"
              :class="[
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition',
                viewMode === 'table'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
              ]"
            >☰ Table</button>
          </div>
          <!-- Add button — desktop only (FAB for mobile) -->
          <button
            @click="openAdd()"
            class="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >+ Add Application</button>
        </div>
      </div>

      <!-- Stats: 2-col on mobile, 4-col on sm+ -->
      <StatsBar :stats="jobStats" />

      <!-- Chart -->
      <JobChart :jobs="jobs" />

      <!-- Filter pills — horizontally scrollable on mobile -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="pill in filterPills"
          :key="pill.value"
          @click="activeFilter = pill.value"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition flex-shrink-0',
            activeFilter === pill.value
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
          ]"
        >
          <div
            v-if="pill.dot"
            class="w-1.5 h-1.5 rounded-full flex-shrink-0"
            :style="{ backgroundColor: activeFilter === pill.value ? 'white' : pill.dot }"
          />
          {{ pill.label }} ({{ pill.count }})
        </button>
      </div>

      <!-- Mobile: card list. sm+: Board or Table view -->
      <!-- Card list (mobile only) -->
      <div class="flex flex-col gap-3 sm:hidden">
        <div
          v-if="filteredJobs.length === 0"
          class="text-center py-12 text-gray-400 dark:text-gray-600 text-sm"
        >No applications yet</div>
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          @click="openEdit(job)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{{ job.company || '—' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{{ job.role || 'No role' }}</p>
            </div>
            <span
              class="flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full"
              :style="{ backgroundColor: JOB_STATUSES.find(s => s.value === job.status)?.bg || '#f3f4f6', color: JOB_STATUSES.find(s => s.value === job.status)?.dot || '#6b7280' }"
            >{{ JOB_STATUSES.find(s => s.value === job.status)?.label || job.status }}</span>
          </div>
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ job.salary || 'No salary' }}</span>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ job.appliedDate || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Board view (sm+) -->
      <BoardView
        v-if="viewMode === 'board'"
        class="hidden sm:block"
        :jobs="filteredJobs"
        :resumes="resumes"
        @edit="openEdit"
        @delete="handleDelete"
        @status-change="setJobStatus"
        @add="openAdd"
      />

      <!-- Table view (sm+) -->
      <TableView
        v-if="viewMode === 'table'"
        class="hidden sm:block"
        :jobs="filteredJobs"
        :resumes="resumes"
        @edit="openEdit"
        @delete="handleDelete"
        @status-change="setJobStatus"
      />
    </div>

    <!-- FAB: mobile only -->
    <button
      @click="openAdd()"
      class="sm:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-2xl rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center transition"
      aria-label="Add Application"
    >+</button>

    <!-- Add / Edit modal -->
    <AddJobModal
      :show="showModal"
      :initial="editingJob"
      :resumes="resumes"
      @save="handleSave"
      @close="showModal = false"
    />
  </div>
</template>
