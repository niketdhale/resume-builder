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

    <div class="max-w-7xl mx-auto px-6 py-8 w-full flex flex-col gap-6">

      <!-- Header -->
      <div class="flex items-end justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50">Job Tracker</h1>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Track your job applications in one place</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Board / Table toggle -->
          <div class="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
            <button
              @click="viewMode = 'board'"
              :class="['flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition', viewMode === 'board' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300']"
            >⊞ Board</button>
            <div class="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <button
              @click="viewMode = 'table'"
              :class="['flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition', viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300']"
            >☰ Table</button>
          </div>
          <!-- Add button -->
          <button
            @click="openAdd()"
            class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >+ Add Application</button>
        </div>
      </div>

      <!-- Stats -->
      <div
        v-if="isDummyData"
        class="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm"
      >
        <div class="flex items-center gap-2">
          <span class="text-amber-500">⚠️</span>
          <span class="text-amber-700 dark:text-amber-400 font-medium">You're viewing sample data for testing.</span>
          <span class="text-amber-600 dark:text-amber-500">Add a real application to replace it, or clear it now.</span>
        </div>
        <button
          @click="clearDummyData"
          class="text-xs px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition font-medium"
        >Clear test data</button>
      </div>

      <!-- Stats -->
      <StatsBar :stats="jobStats" />

      <!-- Chart -->
      <JobChart :jobs="jobs" />

      <!-- Filter pills -->
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="pill in filterPills" :key="pill.value"
          @click="activeFilter = pill.value"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition',
            activeFilter === pill.value
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
          ]"
        >
          <div v-if="pill.dot" class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: activeFilter === pill.value ? 'white' : pill.dot }" />
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
