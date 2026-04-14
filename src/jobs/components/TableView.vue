<script setup>
import { ref, computed } from 'vue'
import { JOB_STATUSES, PRIORITY_CONFIG, customColumns } from '../composables/useJobState'
import { addCustomColumn, removeCustomColumn, updateCustomField } from '../composables/useJobActions'

const props = defineProps({
  jobs:    { type: Array, required: true },
  resumes: { type: Array, default: () => [] },
})

const emit = defineEmits(['edit', 'delete', 'status-change', 'resume-change'])

// ─── Sorting ──────────────────────────────────────────────────────────────────
const sortKey = ref('appliedDate')
const sortDir = ref('desc')

function setSort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'desc' }
}

const sorted = computed(() =>
  [...props.jobs].sort((a, b) => {
    let av = a[sortKey.value] ?? ''
    let bv = b[sortKey.value] ?? ''
    if (sortKey.value === 'salary') { av = Number(av); bv = Number(bv) }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir.value === 'asc' ? cmp : -cmp
  })
)

// ─── Column visibility ────────────────────────────────────────────────────────
const ALL_COLS = [
  { id: 'company',     label: 'Company',   sortKey: 'company'     },
  { id: 'location',    label: 'Location',  sortKey: 'location'    },
  { id: 'appliedDate', label: 'Applied',   sortKey: 'appliedDate' },
  { id: 'status',      label: 'Status',    sortKey: null          },
  { id: 'salary',      label: 'Salary',    sortKey: 'salary'      },
  { id: 'resume',      label: 'Resume',    sortKey: null          },
  { id: 'notes',       label: 'Notes',     sortKey: null          },
  { id: 'url',         label: 'URL',       sortKey: null          },
  { id: 'priority',    label: 'Priority',  sortKey: 'priority'    },
  { id: 'updatedAt',   label: 'Updated',   sortKey: 'updatedAt'   },
]

const visibleColIds = ref(['company', 'location', 'appliedDate', 'status', 'salary', 'resume', 'updatedAt'])
const showColPicker = ref(false)

const visibleCols = computed(() => [
  ...ALL_COLS.filter(c => visibleColIds.value.includes(c.id)),
  ...customColumns.value.map(c => ({ id: c.id, label: c.label, sortKey: null, custom: true, type: c.type })),
])

function toggleCol(id) {
  if (visibleColIds.value.includes(id)) {
    if (visibleColIds.value.length > 1) visibleColIds.value = visibleColIds.value.filter(c => c !== id)
  } else {
    visibleColIds.value = [...visibleColIds.value, id]
  }
}

const newColLabel = ref('')
const newColType  = ref('text')

function createCustomCol() {
  if (!newColLabel.value.trim()) return
  addCustomColumn(newColLabel.value.trim(), newColType.value)
  newColLabel.value = ''
  newColType.value = 'text'
}

// ─── Status dropdown ──────────────────────────────────────────────────────────
const openStatusFor = ref(null)
function toggleStatus(jobId) { openStatusFor.value = openStatusFor.value === jobId ? null : jobId }
function selectStatus(jobId, status) { emit('status-change', jobId, status); openStatusFor.value = null }

// ─── Resume picker ────────────────────────────────────────────────────────────
const openResumeFor = ref(null)
function toggleResumePicker(jobId) { openResumeFor.value = openResumeFor.value === jobId ? null : jobId }
function selectResume(jobId, resumeId) { emit('resume-change', jobId, resumeId); openResumeFor.value = null }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusCfg(status) { return JOB_STATUSES.find(s => s.value === status) || JOB_STATUSES[0] }

function timeAgo(iso) {
  if (!iso) return ''
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return '1d ago'
  if (d < 30) return `${d}d ago`
  return `${Math.floor(d / 30)}mo ago`
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function salaryDisplay(job) {
  if (!job.salary) return '—'
  const n = Number(job.salary)
  return `${job.currency}${n >= 1000 ? (n / 1000).toFixed(0) + 'k' : n}`
}

function resumeForJob(job) { return props.resumes.find(r => r.id === job.resumeId) || null }

const LANG_FLAG = { 'English':'GB','French':'FR','German':'DE','Spanish':'ES','Italian':'IT','Portuguese':'PT','Dutch':'NL','Japanese':'JP','Chinese':'CN','Korean':'KR','Arabic':'AR','Russian':'RU','Hindi':'HI' }
function flagCode(lang) { return LANG_FLAG[lang] || lang?.slice(0, 2).toUpperCase() || 'GB' }

function onOutsideClick() { openStatusFor.value = null; openResumeFor.value = null; showColPicker.value = false }
</script>

<template>
  <div @click.self="onOutsideClick">
    <!-- Column toggle bar -->
    <div class="col-toggle-bar">
      <div class="relative">
        <button
          @click.stop="showColPicker = !showColPicker; openStatusFor = null; openResumeFor = null"
          class="col-toggle-btn"
        >⚙ Columns</button>

        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
          <div v-if="showColPicker" class="col-picker" @click.stop>
            <p class="col-picker__heading">Show / hide columns</p>
            <label v-for="col in ALL_COLS" :key="col.id" class="col-picker__row">
              <input type="checkbox" :checked="visibleColIds.includes(col.id)" @change="toggleCol(col.id)" class="col-picker__checkbox" />
              <span class="col-picker__label">{{ col.label }}</span>
            </label>

            <template v-if="customColumns.length > 0">
              <div class="col-picker__divider">
                <p class="col-picker__heading">Custom columns</p>
              </div>
              <div v-for="col in customColumns" :key="col.id" class="col-picker__custom-row">
                <span class="col-picker__label flex-1">{{ col.label }}</span>
                <span class="col-picker__type">{{ col.type }}</span>
                <button @click="removeCustomColumn(col.id)" class="col-picker__remove">✕</button>
              </div>
            </template>

            <div class="col-picker__divider">
              <p class="col-picker__heading">Add custom column</p>
            </div>
            <input
              v-model="newColLabel"
              placeholder="Column name"
              @keydown.enter="createCustomCol"
              class="col-picker__input"
            />
            <div class="col-type-btns">
              <button
                v-for="t in ['text','number']" :key="t"
                @click="newColType = t"
                :class="['col-type-btn', newColType === t ? 'col-type-btn--active' : '']"
              >{{ t }}</button>
            </div>
            <button
              @click="createCustomCol"
              :disabled="!newColLabel.trim()"
              :class="['col-picker__add-btn', newColLabel.trim() ? 'col-picker__add-btn--enabled' : 'col-picker__add-btn--disabled']"
            >+ Add column</button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr class="table-head-row">
            <th class="th th--dot" />
            <th class="th">
              <button @click="setSort('title')" class="sort-btn">
                Job Title
                <span class="sort-icon">{{ sortKey === 'title' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </button>
            </th>
            <th v-for="col in visibleCols" :key="col.id" class="th">
              <button v-if="col.sortKey" @click="setSort(col.sortKey)" class="sort-btn">
                {{ col.label }}
                <span class="sort-icon">{{ sortKey === col.sortKey ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </button>
              <span v-else class="sort-btn">{{ col.label }}</span>
            </th>
            <th class="th th--sticky" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in sorted" :key="job.id" class="table-row">
            <!-- Priority dot -->
            <td class="td td--dot">
              <div class="priority-dot" :style="{ backgroundColor: PRIORITY_CONFIG[job.priority]?.color || 'var(--ink-3)' }" :title="PRIORITY_CONFIG[job.priority]?.label" />
            </td>

            <!-- Title -->
            <td class="td">
              <a v-if="job.url" :href="job.url" target="_blank" class="cell-link">{{ job.title }}</a>
              <span v-else class="cell-title">{{ job.title }}</span>
            </td>

            <template v-for="col in visibleCols" :key="col.id">
              <td v-if="col.id === 'company'" class="td cell-text">{{ job.company }}</td>

              <td v-else-if="col.id === 'location'" class="td cell-muted">📍 {{ job.location || '—' }}</td>

              <td v-else-if="col.id === 'appliedDate'" class="td cell-muted">{{ formatDate(job.appliedDate) }}</td>

              <!-- Status dropdown -->
              <td v-else-if="col.id === 'status'" class="td td--relative">
                <button
                  @click.stop="toggleStatus(job.id)"
                  class="status-badge"
                  :style="{ backgroundColor: statusCfg(job.status).bg, color: statusCfg(job.status).color }"
                >
                  <span class="status-dot" :style="{ backgroundColor: statusCfg(job.status).dot }" />
                  {{ statusCfg(job.status).label }}
                  <span class="status-arrow">▾</span>
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
                  <div v-if="openStatusFor === job.id" class="dropdown" @click.stop>
                    <button
                      v-for="s in JOB_STATUSES" :key="s.value"
                      @click="selectStatus(job.id, s.value)"
                      class="dropdown-item"
                      :class="job.status === s.value ? 'dropdown-item--active' : ''"
                    >
                      <span class="status-dot" :style="{ backgroundColor: s.dot }" />
                      <span :style="{ color: s.color }">{{ s.label }}</span>
                      <span v-if="job.status === s.value" class="dropdown-check">✓</span>
                    </button>
                  </div>
                </Transition>
              </td>

              <td v-else-if="col.id === 'salary'" class="td cell-text-sm">{{ salaryDisplay(job) }}</td>

              <!-- Resume picker -->
              <td v-else-if="col.id === 'resume'" class="td td--relative">
                <button
                  @click.stop="toggleResumePicker(job.id)"
                  :class="['resume-btn', resumeForJob(job) ? 'resume-btn--linked' : 'resume-btn--empty']"
                >
                  <span class="truncate">{{ resumeForJob(job) ? resumeForJob(job).title : '+ Link resume' }}</span>
                  <span v-if="resumeForJob(job)" class="resume-flag">{{ flagCode(resumeForJob(job).language) }}</span>
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
                  <div v-if="openResumeFor === job.id" class="dropdown dropdown--wide" @click.stop>
                    <p class="dropdown-heading">Link a resume</p>
                    <button
                      v-for="r in resumes" :key="r.id"
                      @click="selectResume(job.id, r.id)"
                      class="dropdown-item"
                      :class="job.resumeId === r.id ? 'dropdown-item--active' : ''"
                    >
                      <span class="resume-flag">{{ flagCode(r.language) }}</span>
                      <span class="truncate cell-text">{{ r.title }}</span>
                      <span v-if="job.resumeId === r.id" class="dropdown-check">✓</span>
                    </button>
                    <div class="dropdown-divider">
                      <button @click="selectResume(job.id, null)" class="dropdown-item dropdown-item--danger">
                        ✕ Remove link
                      </button>
                    </div>
                  </div>
                </Transition>
              </td>

              <td v-else-if="col.id === 'notes'" class="td cell-muted">
                <span class="truncate block max-w-[180px]">{{ job.notes || '—' }}</span>
              </td>

              <td v-else-if="col.id === 'url'" class="td">
                <a v-if="job.url" :href="job.url" target="_blank" class="cell-link truncate block max-w-[140px]">🔗 Link</a>
                <span v-else class="cell-muted">—</span>
              </td>

              <td v-else-if="col.id === 'priority'" class="td cell-text-sm" :style="{ color: PRIORITY_CONFIG[job.priority]?.color }">
                {{ PRIORITY_CONFIG[job.priority]?.label || '—' }}
              </td>

              <td v-else-if="col.id === 'updatedAt'" class="td cell-muted">{{ timeAgo(job.updatedAt) }}</td>

              <td v-else-if="col.custom" class="td">
                <input
                  :value="job.customFields?.[col.id] || ''"
                  @change="updateCustomField(job.id, col.id, $event.target.value)"
                  :type="col.type === 'number' ? 'number' : 'text'"
                  placeholder="—"
                  class="custom-field-input"
                />
              </td>
            </template>

            <!-- Actions -->
            <td class="td td--sticky td--actions">
              <button @click="$emit('edit', job)" class="action-btn" title="Edit">✏️</button>
              <button @click="$emit('delete', job.id)" class="action-btn action-btn--danger" title="Delete">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="jobs.length === 0" class="table-empty">
        <span class="table-empty__icon">📭</span>
        <p class="table-empty__text">No applications match this filter</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Column toggle */
.col-toggle-bar { display: flex; justify-content: flex-end; margin-bottom: 0.5rem; }
.col-toggle-btn {
  display: flex; align-items: center; gap: 0.375rem;
  font-size: 0.75rem; padding: 0.35rem 0.75rem; border-radius: 8px;
  border: 1px solid var(--border); background: var(--bg-surface);
  color: var(--ink-3); cursor: pointer; transition: all 0.15s;
}
.col-toggle-btn:hover { border-color: var(--gold); color: var(--gold); }

.col-picker {
  position: absolute; right: 0; top: 2rem; z-index: 30;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  padding: 0.75rem; min-width: 170px;
}
.col-picker__heading {
  font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--ink-3); margin-bottom: 0.375rem;
}
.col-picker__row { display: flex; align-items: center; gap: 0.5rem; padding: 0.2rem 0; cursor: pointer; }
.col-picker__row:hover .col-picker__label { color: var(--ink); }
.col-picker__checkbox { accent-color: var(--gold); width: 14px; height: 14px; }
.col-picker__label { font-size: 0.75rem; color: var(--ink-2); }
.col-picker__divider { border-top: 1px solid var(--border); margin: 0.5rem 0 0.375rem; }
.col-picker__custom-row { display: flex; align-items: center; gap: 0.25rem; padding: 0.2rem 0; }
.col-picker__type { font-size: 0.625rem; color: var(--ink-3); }
.col-picker__remove { font-size: 0.75rem; color: var(--ink-3); background: none; border: none; cursor: pointer; }
.col-picker__remove:hover { color: #ef4444; }
.col-picker__input {
  width: 100%; font-size: 0.75rem; border: 1px solid var(--border); border-radius: 8px;
  padding: 0.3rem 0.5rem; margin-bottom: 0.375rem; outline: none;
  background: var(--bg-base); color: var(--ink);
}
.col-picker__input:focus { border-color: var(--gold); }
.col-type-btns { display: flex; gap: 0.25rem; margin-bottom: 0.375rem; }
.col-type-btn {
  flex: 1; font-size: 0.625rem; padding: 0.25rem; border-radius: 6px;
  border: 1px solid var(--border); background: transparent; color: var(--ink-3);
  cursor: pointer; text-transform: capitalize; transition: all 0.12s;
}
.col-type-btn--active { border-color: var(--gold); background: var(--gold-bg); color: var(--gold); }
.col-picker__add-btn {
  width: 100%; font-size: 0.75rem; padding: 0.35rem; border-radius: 8px;
  border: none; cursor: pointer; transition: all 0.12s;
}
.col-picker__add-btn--enabled { background: var(--gold); color: #fff; }
.col-picker__add-btn--disabled { background: var(--bg-subtle); color: var(--ink-3); cursor: not-allowed; }

/* Table */
.table-wrap { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; overflow-x: auto; }
.table { width: 100%; font-size: 0.875rem; min-width: 800px; border-collapse: collapse; }

.table-head-row { border-bottom: 1px solid var(--border); }
.th { padding: 0.75rem; text-align: left; }
.th--dot  { width: 2rem; padding: 0.75rem 1rem; }
.th--sticky { width: 4rem; position: sticky; right: 0; background: var(--bg-surface); }

.sort-btn {
  display: flex; align-items: center; gap: 0.25rem;
  font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--ink-3); background: none; border: none; cursor: pointer; transition: color 0.12s;
  white-space: nowrap;
}
.sort-btn:hover { color: var(--ink); }
.sort-icon { color: var(--border); }

.table-row {
  border-bottom: 1px solid var(--border);
  transition: background 0.12s;
}
.table-row:hover { background: var(--bg-subtle); }
.table-row:hover .td--sticky { background: var(--bg-subtle); }
.table-row:last-child { border-bottom: none; }

.td           { padding: 0.75rem; vertical-align: middle; }
.td--dot      { padding: 0.75rem 1rem; }
.td--relative { position: relative; }
.td--sticky   { position: sticky; right: 0; background: var(--bg-surface); border-left: 1px solid var(--border); transition: background 0.12s; }
.td--actions  { }

.cell-title   { font-weight: 600; font-size: 0.875rem; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; display: block; }
.cell-link    { font-weight: 600; font-size: 0.875rem; color: var(--gold); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; display: block; transition: opacity 0.12s; }
.cell-link:hover { opacity: 0.75; }
.cell-text    { font-size: 0.875rem; color: var(--ink-2); }
.cell-text-sm { font-size: 0.75rem; font-weight: 500; color: var(--ink-2); }
.cell-muted   { font-size: 0.75rem; color: var(--ink-3); }

.priority-dot { width: 8px; height: 8px; border-radius: 50%; }

.status-badge {
  display: inline-flex; align-items: center; gap: 0.375rem;
  font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.625rem;
  border-radius: 99px; border: none; cursor: pointer; transition: opacity 0.12s; white-space: nowrap;
}
.status-badge:hover { opacity: 0.85; }
.status-dot   { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.status-arrow { font-size: 0.625rem; opacity: 0.6; }

.resume-btn {
  display: flex; align-items: center; gap: 0.25rem;
  font-size: 0.75rem; max-width: 130px; background: none; border: none; cursor: pointer; transition: color 0.12s;
}
.resume-btn--linked { color: var(--gold); font-weight: 500; }
.resume-btn--empty  { color: var(--ink-3); }
.resume-btn--empty:hover { color: var(--gold); }
.resume-flag { font-family: monospace; font-size: 0.625rem; opacity: 0.6; flex-shrink: 0; }

.dropdown {
  position: absolute; left: 0.75rem; top: 2.5rem; z-index: 20;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  padding: 0.25rem 0; min-width: 140px;
}
.dropdown--wide { min-width: 200px; }
.dropdown-heading { font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-3); padding: 0.5rem 0.75rem 0.25rem; }
.dropdown-item {
  display: flex; align-items: center; gap: 0.5rem;
  width: 100%; padding: 0.4rem 0.75rem; font-size: 0.75rem; text-align: left;
  background: none; border: none; cursor: pointer; color: var(--ink-2);
  transition: background 0.1s;
}
.dropdown-item:hover { background: var(--bg-subtle); }
.dropdown-item--active { font-weight: 600; }
.dropdown-item--danger { color: #ef4444; }
.dropdown-item--danger:hover { background: rgba(239,68,68,0.06); }
.dropdown-check { margin-left: auto; font-size: 0.6875rem; color: var(--gold); }
.dropdown-divider { border-top: 1px solid var(--border); padding-top: 0.25rem; margin-top: 0.25rem; }

.custom-field-input {
  width: 100%; font-size: 0.75rem; background: transparent; outline: none;
  color: var(--ink-2); border: 1px solid transparent;
  border-radius: 4px; padding: 0.15rem 0.3rem; min-width: 80px; transition: border-color 0.12s;
}
.custom-field-input:focus { background: var(--bg-subtle); border-color: var(--border); }
.custom-field-input::placeholder { color: var(--ink-3); }

.action-btn {
  font-size: 0.6875rem; padding: 0.3rem; border-radius: 6px;
  background: transparent; border: none; cursor: pointer; transition: background 0.12s;
}
.action-btn:hover { background: var(--bg-subtle); }
.action-btn--danger:hover { background: rgba(239,68,68,0.08); }

.table-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; }
.table-empty__icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.table-empty__text { font-size: 0.875rem; color: var(--ink-3); }
</style>
