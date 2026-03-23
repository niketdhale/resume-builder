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

const sorted = computed(() => {
  return [...props.jobs].sort((a, b) => {
    let av = a[sortKey.value] ?? ''
    let bv = b[sortKey.value] ?? ''
    if (sortKey.value === 'salary') { av = Number(av); bv = Number(bv) }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

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

// New custom column form
const newColLabel = ref('')
const newColType  = ref('text')

function createCustomCol() {
  if (!newColLabel.value.trim()) return
  addCustomColumn(newColLabel.value.trim(), newColType.value)
  newColLabel.value = ''
  newColType.value = 'text'
}

// ─── Custom status dropdown ───────────────────────────────────────────────────
const openStatusFor = ref(null)

function toggleStatus(jobId) {
  openStatusFor.value = openStatusFor.value === jobId ? null : jobId
}

function selectStatus(jobId, status) {
  emit('status-change', jobId, status)
  openStatusFor.value = null
}

// ─── Resume picker ────────────────────────────────────────────────────────────
const openResumeFor = ref(null)

function toggleResumePicker(jobId) {
  openResumeFor.value = openResumeFor.value === jobId ? null : jobId
}

function selectResume(jobId, resumeId) {
  emit('resume-change', jobId, resumeId)
  openResumeFor.value = null
}

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

function resumeForJob(job) {
  return props.resumes.find(r => r.id === job.resumeId) || null
}

const LANG_FLAG = { 'English':'GB','French':'FR','German':'DE','Spanish':'ES','Italian':'IT','Portuguese':'PT','Dutch':'NL','Japanese':'JP','Chinese':'CN','Korean':'KR','Arabic':'AR','Russian':'RU','Hindi':'HI' }
function flagCode(lang) { return LANG_FLAG[lang] || lang?.slice(0, 2).toUpperCase() || 'GB' }

// Close dropdowns on outside click
function onOutsideClick() {
  openStatusFor.value = null
  openResumeFor.value = null
  showColPicker.value = false
}
</script>

<template>
  <div @click.self="onOutsideClick">
    <!-- Column toggle bar -->
    <div class="flex items-center justify-end mb-2 gap-2">
      <div class="relative">
        <button
          @click.stop="showColPicker = !showColPicker; openStatusFor = null; openResumeFor = null"
          class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          ⚙ Columns
        </button>
        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
          <div
            v-if="showColPicker"
            class="absolute right-0 top-8 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 min-w-[160px]"
            @click.stop
          >
            <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Show / hide columns</p>
            <label
              v-for="col in ALL_COLS" :key="col.id"
              class="flex items-center gap-2 py-1 cursor-pointer hover:text-gray-800 dark:hover:text-gray-100"
            >
              <input
                type="checkbox"
                :checked="visibleColIds.includes(col.id)"
                @change="toggleCol(col.id)"
                class="accent-indigo-600 w-3.5 h-3.5"
              />
              <span class="text-xs text-gray-600 dark:text-gray-400">{{ col.label }}</span>
            </label>

            <!-- Custom columns -->
            <template v-if="customColumns.length > 0">
              <div class="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2 mb-1">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Custom columns</p>
              </div>
              <div v-for="col in customColumns" :key="col.id" class="flex items-center gap-1 py-1">
                <span class="text-xs text-gray-600 dark:text-gray-400 flex-1">{{ col.label }}</span>
                <span class="text-[10px] text-gray-300 dark:text-gray-600">{{ col.type }}</span>
                <button @click="removeCustomColumn(col.id)" class="text-gray-300 dark:text-gray-600 hover:text-red-500 text-xs ml-1">✕</button>
              </div>
            </template>

            <!-- Add new custom column -->
            <div class="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Add custom column</p>
              <input
                v-model="newColLabel"
                placeholder="Column name"
                @keydown.enter="createCustomCol"
                class="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 mb-1.5 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              />
              <div class="flex gap-1 mb-1.5">
                <button
                  v-for="t in ['text','number']" :key="t"
                  @click="newColType = t"
                  :class="['flex-1 text-[10px] py-1 rounded border transition capitalize', newColType === t ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'border-gray-200 dark:border-gray-600 text-gray-400']"
                >{{ t }}</button>
              </div>
              <button
                @click="createCustomCol"
                :disabled="!newColLabel.trim()"
                :class="['w-full text-xs py-1.5 rounded-lg transition', newColLabel.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed']"
              >+ Add column</button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-x-auto">
      <table class="w-full text-sm min-w-[800px]">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <!-- Priority dot col -->
            <th class="w-8 px-4 py-3" />
            <!-- Title always visible -->
            <th class="px-3 py-3 text-left">
              <button @click="setSort('title')" class="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition">
                Job Title
                <span class="text-gray-300 dark:text-gray-600">{{ sortKey === 'title' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </button>
            </th>
            <!-- Dynamic cols -->
            <th v-for="col in visibleCols" :key="col.id" class="px-3 py-3 text-left">
              <button v-if="col.sortKey" @click="setSort(col.sortKey)" class="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition">
                {{ col.label }}
                <span class="text-gray-300 dark:text-gray-600">{{ sortKey === col.sortKey ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </button>
              <span v-else class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{{ col.label }}</span>
            </th>
            <th class="px-3 py-3 w-16 sticky right-0 bg-white dark:bg-gray-900" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="job in sorted" :key="job.id"
            class="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
          >
            <!-- Priority dot -->
            <td class="px-4 py-3">
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: PRIORITY_CONFIG[job.priority]?.color || '#9ca3af' }" :title="PRIORITY_CONFIG[job.priority]?.label" />
            </td>

            <!-- Title (always) -->
            <td class="px-3 py-3">
              <a v-if="job.url" :href="job.url" target="_blank" class="font-semibold text-gray-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate max-w-[160px] block transition">
                {{ job.title }}
              </a>
              <span v-else class="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[160px] block">{{ job.title }}</span>
            </td>

            <!-- Dynamic cols -->
            <template v-for="col in visibleCols" :key="col.id">

              <!-- Company -->
              <td v-if="col.id === 'company'" class="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">{{ job.company }}</td>

              <!-- Location -->
              <td v-else-if="col.id === 'location'" class="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs">
                <span class="flex items-center gap-1">📍 {{ job.location || '—' }}</span>
              </td>

              <!-- Applied date -->
              <td v-else-if="col.id === 'appliedDate'" class="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs">{{ formatDate(job.appliedDate) }}</td>

              <!-- Status — custom dropdown -->
              <td v-else-if="col.id === 'status'" class="px-3 py-3 relative">
                <button
                  @click.stop="toggleStatus(job.id)"
                  class="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition"
                  :style="{ backgroundColor: statusCfg(job.status).bg, color: statusCfg(job.status).color }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: statusCfg(job.status).dot }" />
                  {{ statusCfg(job.status).label }}
                  <span class="opacity-60 text-[10px]">▾</span>
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
                  <div
                    v-if="openStatusFor === job.id"
                    class="absolute left-3 top-10 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[140px]"
                    @click.stop
                  >
                    <button
                      v-for="s in JOB_STATUSES" :key="s.value"
                      @click="selectStatus(job.id, s.value)"
                      class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      :class="job.status === s.value ? 'font-semibold' : ''"
                    >
                      <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: s.dot }" />
                      <span :style="{ color: s.color }">{{ s.label }}</span>
                      <span v-if="job.status === s.value" class="ml-auto text-[10px]">✓</span>
                    </button>
                  </div>
                </Transition>
              </td>

              <!-- Salary -->
              <td v-else-if="col.id === 'salary'" class="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs font-medium">{{ salaryDisplay(job) }}</td>

              <!-- Resume — inline picker -->
              <td v-else-if="col.id === 'resume'" class="px-3 py-3 relative">
                <button
                  @click.stop="toggleResumePicker(job.id)"
                  class="flex items-center gap-1 text-xs transition max-w-[130px]"
                  :class="resumeForJob(job) ? 'text-indigo-500 dark:text-indigo-400 font-medium' : 'text-gray-300 dark:text-gray-600 hover:text-indigo-400'"
                >
                  <span class="truncate">{{ resumeForJob(job) ? resumeForJob(job).title : '+ Link resume' }}</span>
                  <span v-if="resumeForJob(job)" class="font-mono text-[10px] opacity-60 flex-shrink-0">{{ flagCode(resumeForJob(job).language) }}</span>
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
                  <div
                    v-if="openResumeFor === job.id"
                    class="absolute left-0 top-10 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[200px]"
                    @click.stop
                  >
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 px-3 pt-2 pb-1">Link a resume</p>
                    <button
                      v-for="r in resumes" :key="r.id"
                      @click="selectResume(job.id, r.id)"
                      class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <span class="font-mono text-[10px] text-gray-400 flex-shrink-0">{{ flagCode(r.language) }}</span>
                      <span class="truncate text-gray-700 dark:text-gray-300" :class="job.resumeId === r.id ? 'font-semibold text-indigo-600 dark:text-indigo-400' : ''">{{ r.title }}</span>
                      <span v-if="job.resumeId === r.id" class="ml-auto text-indigo-500 text-[10px]">✓</span>
                    </button>
                    <div class="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                      <button
                        @click="selectResume(job.id, null)"
                        class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      >
                        ✕ Remove link
                      </button>
                    </div>
                  </div>
                </Transition>
              </td>

              <!-- Notes -->
              <td v-else-if="col.id === 'notes'" class="px-3 py-3 text-gray-400 dark:text-gray-500 text-xs max-w-[180px]">
                <span class="truncate block">{{ job.notes || '—' }}</span>
              </td>

              <!-- URL -->
              <td v-else-if="col.id === 'url'" class="px-3 py-3 text-xs">
                <a v-if="job.url" :href="job.url" target="_blank" class="text-indigo-400 hover:text-indigo-600 transition truncate block max-w-[140px]">🔗 Link</a>
                <span v-else class="text-gray-300 dark:text-gray-600">—</span>
              </td>

              <!-- Priority -->
              <td v-else-if="col.id === 'priority'" class="px-3 py-3 text-xs font-medium" :style="{ color: PRIORITY_CONFIG[job.priority]?.color }">
                {{ PRIORITY_CONFIG[job.priority]?.label || '—' }}
              </td>

              <!-- Updated -->
              <td v-else-if="col.id === 'updatedAt'" class="px-3 py-3 text-xs text-gray-400 dark:text-gray-500">{{ timeAgo(job.updatedAt) }}</td>

              <!-- Custom column -->
              <td v-else-if="col.custom" class="px-3 py-3">
                <input
                  :value="job.customFields?.[col.id] || ''"
                  @change="updateCustomField(job.id, col.id, $event.target.value)"
                  :type="col.type === 'number' ? 'number' : 'text'"
                  placeholder="—"
                  class="w-full text-xs bg-transparent outline-none text-gray-600 dark:text-gray-400 placeholder-gray-300 dark:placeholder-gray-600 focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-1 py-0.5 border border-transparent focus:border-gray-200 dark:focus:border-gray-700 transition min-w-[80px]"
                />
              </td>

            </template>

            <!-- Actions — sticky right so always reachable regardless of table width -->
            <td class="px-3 py-3 sticky right-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 border-l border-gray-50 dark:border-gray-800 transition-colors">
              <div class="flex items-center gap-1">
                <button @click="$emit('edit', job)" class="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition" title="Edit">✏️</button>
                <button @click="$emit('delete', job.id)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition" title="Delete">🗑</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="jobs.length === 0" class="flex flex-col items-center justify-center py-16">
        <span class="text-4xl mb-3">📭</span>
        <p class="text-sm text-gray-400 dark:text-gray-500">No applications match this filter</p>
      </div>
    </div>
  </div>
</template>
