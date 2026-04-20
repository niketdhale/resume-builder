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

function onDragStart(e, job) { e.dataTransfer.setData('jobId', job.id) }
function onDrop(e, status) {
  const jobId = e.dataTransfer.getData('jobId')
  if (jobId) emit('status-change', jobId, status)
}
</script>

<template>
  <div class="board">
    <div
      v-for="col in columns" :key="col.value"
      class="board-col"
      @dragover.prevent
      @drop="onDrop($event, col.value)"
    >
      <!-- Column header -->
      <div class="col-header">
        <div class="col-header__left">
          <div class="col-dot" :style="{ backgroundColor: col.dot }" />
          <span class="col-label">{{ col.label }}</span>
          <span class="col-count">{{ col.jobs.length }}</span>
        </div>
      </div>

      <!-- Cards -->
      <div class="col-cards">
        <div
          v-for="job in col.jobs" :key="job.id"
          draggable="true"
          @dragstart="onDragStart($event, job)"
          class="job-card"
        >
          <div class="job-card__top">
            <div class="priority-dot" :style="{ backgroundColor: PRIORITY_CONFIG[job.priority]?.color }" />
            <span class="job-card__date">{{ formatDate(job.appliedDate) }}</span>
          </div>

          <p class="job-card__title">{{ job.title }}</p>
          <p class="job-card__company">{{ job.company }}</p>

          <p v-if="job.location" class="job-card__location">📍 {{ job.location }}</p>

          <p v-if="resumeForJob(job)" class="job-card__resume">
            {{ resumeForJob(job).title }}
            <span class="job-card__flag">{{ flagCode(resumeForJob(job).language) }}</span>
          </p>

          <div class="job-card__footer">
            <span v-if="salaryDisplay(job)" class="job-card__salary">💰 {{ salaryDisplay(job) }}</span>
            <div class="job-card__actions">
              <button @click="$emit('edit', job)" class="card-action-btn" title="Edit">✏️</button>
              <button @click="$emit('delete', job.id)" class="card-action-btn card-action-btn--danger" title="Delete">🗑</button>
            </div>
          </div>
        </div>

        <!-- Empty drop zone -->
        <div v-if="col.jobs.length === 0" class="drop-zone">Drop here</div>

        <!-- Add button -->
        <button class="add-card-btn" @click="$emit('add', col.value)">+ Add here</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.board-col {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 256px;
}

.col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.col-header__left { display: flex; align-items: center; gap: 0.5rem; }
.col-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.col-label { font-size: 0.75rem; font-weight: 600; color: var(--ink-2); }
.col-count {
  font-size: 0.6875rem; color: var(--ink-3);
  background: var(--bg-subtle); padding: 0.1rem 0.4rem;
  border-radius: 99px; border: 1px solid var(--border);
}

.col-cards { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-height: 6rem; }

.job-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.75rem;
  cursor: grab;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.job-card:hover { border-color: rgba(0,94,180,0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.job-card:active { cursor: grabbing; }

.job-card__top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.5rem;
}
.priority-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.job-card__date { font-size: 0.6875rem; color: var(--ink-3); }

.job-card__title   { font-size: 0.75rem; font-weight: 600; color: var(--ink); line-height: 1.35; }
.job-card__company { font-size: 0.75rem; color: var(--ink-3); margin-top: 0.125rem; }
.job-card__location { font-size: 0.6875rem; color: var(--ink-3); margin-top: 0.25rem; }
.job-card__resume  { font-size: 0.6875rem; color: var(--gold); margin-top: 0.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.job-card__flag    { font-family: monospace; opacity: 0.6; }

.job-card__footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 0.5rem;
}
.job-card__salary  { font-size: 0.6875rem; font-weight: 500; color: var(--ink-2); }
.job-card__actions { display: flex; gap: 0.25rem; opacity: 0; transition: opacity 0.15s; }
.job-card:hover .job-card__actions { opacity: 1; }

.card-action-btn {
  font-size: 0.6875rem; padding: 0.2rem;
  background: transparent; border: none; cursor: pointer;
  border-radius: 4px; transition: background 0.12s;
  color: var(--ink-3);
}
.card-action-btn:hover { background: var(--bg-subtle); }
.card-action-btn--danger:hover { background: rgba(239,68,68,0.08); }

.drop-zone {
  display: flex; align-items: center; justify-content: center;
  height: 4rem; border-radius: 12px;
  border: 2px dashed var(--border);
  font-size: 0.75rem; color: var(--ink-3);
}

.add-card-btn {
  display: flex; align-items: center; justify-content: center;
  padding: 0.5rem; margin-top: 0.25rem;
  font-size: 0.75rem; color: var(--ink-3);
  background: transparent; border: 2px dashed transparent;
  border-radius: 12px; cursor: pointer;
  transition: all 0.15s;
}
.add-card-btn:hover {
  color: var(--gold);
  border-color: rgba(0,94,180,0.35);
  background: var(--gold-bg);
}
</style>
