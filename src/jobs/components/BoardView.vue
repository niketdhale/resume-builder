<script setup>
import { computed } from 'vue'
import { JOB_STATUSES, PRIORITY_CONFIG } from '../composables/useJobState'

const props = defineProps({
  jobs:    { type: Array, required: true },
  resumes: { type: Array, default: () => [] },
})

const emit = defineEmits(['edit', 'delete', 'status-change', 'add'])

const columns = computed(() =>
  JOB_STATUSES.map((s) => ({
    ...s,
    jobs: props.jobs.filter((j) => j.status === s.value),
  }))
)

function salaryDisplay(job) {
  if (!job.salary) return null
  const n = Number(job.salary)
  return `${job.currency}${n >= 1000 ? (n / 1000).toFixed(0) + 'k' : n}`
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function resumeForJob(job) {
  return props.resumes.find((r) => r.id === job.resumeId) || null
}

const LANG_FLAG = { 'English':'GB','French':'FR','German':'DE','Spanish':'ES','Italian':'IT','Portuguese':'PT','Dutch':'NL','Japanese':'JP','Chinese':'CN','Korean':'KR','Arabic':'AR','Russian':'RU','Hindi':'HI' }
function flagCode(lang) { return LANG_FLAG[lang] || lang?.slice(0,2).toUpperCase() || 'GB' }

function onDragStart(e, job) {
  e.dataTransfer.setData('jobId', job.id)
}

function onDrop(e, status) {
  const jobId = e.dataTransfer.getData('jobId')
  if (jobId) emit('status-change', jobId, status)
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-2">
    <div
      v-for="col in columns" :key="col.value"
      class="flex flex-col flex-shrink-0 w-64"
      @dragover.prevent
      @drop="onDrop($event, col.value)"
    >
      <!-- Column header -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: col.dot }" />
          <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ col.label }}</span>
          <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">{{ col.jobs.length }}</span>
        </div>
      </div>

      <!-- Cards -->
      <div class="flex flex-col gap-2 flex-1 min-h-24">
        <div
          v-for="job in col.jobs" :key="job.id"
          draggable="true"
          @dragstart="onDragStart($event, job)"
          class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow group"
        >
          <!-- Top row: priority + date + actions -->
          <div class="flex items-center justify-between mb-2">
            <div class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: PRIORITY_CONFIG[job.priority]?.color }" />
            <span class="text-[11px] text-gray-400 dark:text-gray-500">{{ formatDate(job.appliedDate) }}</span>
          </div>

          <!-- Title + company -->
          <p class="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">{{ job.title }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ job.company }}</p>

          <!-- Location -->
          <p v-if="job.location" class="text-[11px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
            📍 {{ job.location }}
          </p>

          <!-- Resume link -->
          <p v-if="resumeForJob(job)" class="text-[11px] text-indigo-500 dark:text-indigo-400 mt-1 truncate">
            {{ resumeForJob(job).title }}
            <span class="font-mono opacity-60">{{ flagCode(resumeForJob(job).language) }}</span>
          </p>

          <!-- Salary -->
          <div class="flex items-center justify-between mt-2">
            <span v-if="salaryDisplay(job)" class="text-[11px] font-medium text-gray-600 dark:text-gray-400">
              💰 {{ salaryDisplay(job) }}
            </span>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
              <button @click="$emit('edit', job)" class="text-gray-400 hover:text-indigo-500 text-xs transition">✏️</button>
              <button @click="$emit('delete', job.id)" class="text-gray-400 hover:text-red-500 text-xs transition">🗑</button>
            </div>
          </div>
        </div>

        <!-- Empty drop zone -->
        <div
          v-if="col.jobs.length === 0"
          class="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-xs text-gray-300 dark:text-gray-600"
        >
          Drop here
        </div>

        <!-- Add button on last column only -->
        <button
          @click="$emit('add', col.value)"
          class="flex items-center justify-center gap-1 py-2 text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition border-2 border-dashed border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 mt-1"
        >
          + Add here
        </button>
      </div>
    </div>
  </div>
</template>
