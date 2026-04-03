<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { JOB_STATUSES, PRIORITY_CONFIG, customColumns } from '../composables/useJobState'
import DatePicker from '../../components/ui/DatePicker.vue'

const props = defineProps({
  show:    { type: Boolean, default: false },
  initial: { type: Object,  default: null  },
  resumes: { type: Array,   default: () => [] },
})

const emit = defineEmits(['save', 'close'])

const CURRENCIES = ['$', '£', '€', 'CA$', 'AU$', '¥', '₹']

const LANG_FLAG = { 'English':'GB','French':'FR','German':'DE','Spanish':'ES','Italian':'IT','Portuguese':'PT','Dutch':'NL','Japanese':'JP','Chinese':'CN','Korean':'KR','Arabic':'AR','Russian':'RU','Hindi':'HI' }
function flagCode(lang) { return LANG_FLAG[lang] || lang?.slice(0,2).toUpperCase() || 'GB' }

const blank = () => ({
  title: '', company: '', location: '', url: '',
  salary: '', currency: '$', status: 'applied', priority: 'medium',
  appliedDate: new Date().toISOString().split('T')[0],
  resumeId: null, notes: '', attachments: [], customFields: {},
})

const form = ref(blank())
const isEdit = computed(() => !!(props.initial?.id))

watch(() => props.show, (v) => {
  if (v) form.value = props.initial
    ? { ...props.initial, attachments: props.initial.attachments || [], customFields: { ...(props.initial.customFields || {}) } }
    : blank()
})

// ─── Resume picker ────────────────────────────────────────────────────────────
const showResumePicker = ref(false)

function selectedResume() {
  return props.resumes.find(r => r.id === form.value.resumeId) || null
}

function pickResume(id) {
  form.value.resumeId = id
  showResumePicker.value = false
}

// ─── File attachments ─────────────────────────────────────────────────────────
const fileInput = ref(null)

function onFileChange(e) {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      form.value.attachments.push({
        id: Date.now() + Math.random(),
        name: file.name,
        dataUrl: ev.target.result,
        type: file.type,
        size: file.size,
        addedAt: new Date().toISOString(),
      })
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

function removeFile(id) {
  form.value.attachments = form.value.attachments.filter(a => a.id !== id)
}

function fileIcon(type) {
  if (type?.includes('pdf'))   return '📄'
  if (type?.includes('image')) return '🖼'
  if (type?.includes('word') || type?.includes('document')) return '📝'
  return '📎'
}

function fileSize(bytes) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

// ─── Rich notes field — supports image paste ──────────────────────────────────
const notesRef = ref(null)

function onNotesPaste(e) {
  const items = Array.from(e.clipboardData?.items || [])
  const imageItem = items.find(i => i.type.startsWith('image/'))
  if (imageItem) {
    e.preventDefault()
    const file = imageItem.getAsFile()
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = document.createElement('img')
      img.src = ev.target.result
      img.style.cssText = 'max-width:100%;border-radius:6px;margin:4px 0;display:block;'
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        range.deleteContents()
        range.insertNode(img)
        range.setStartAfter(img)
        sel.removeAllRanges()
        sel.addRange(range)
      } else {
        notesRef.value?.appendChild(img)
      }
      syncNotes()
    }
    reader.readAsDataURL(file)
  }
  // Plain text paste — let browser handle naturally
}

function syncNotes() {
  form.value.notes = notesRef.value?.innerHTML || ''
}

function initNotes() {
  if (notesRef.value && form.value.notes !== notesRef.value.innerHTML) {
    notesRef.value.innerHTML = form.value.notes || ''
  }
}

// Watch show to init notes content
watch(() => props.show, (v) => {
  if (v) nextTick(initNotes)
})
function save() {
  if (!form.value.title.trim() || !form.value.company.trim()) return
  emit('save', { ...form.value })
  emit('close')
}

const canSave = computed(() => form.value.title.trim() && form.value.company.trim())
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
      @click.self="$emit('close')"
    >
      <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 max-h-[90vh] flex flex-col">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100">
            {{ isEdit ? 'Edit Application' : 'Add Application' }}
          </h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none">✕</button>
        </div>

        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto px-6 pb-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <!-- Title -->
            <div class="col-span-2">
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Job Title *</label>
              <input v-model="form.title" placeholder="Senior Frontend Engineer"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
            </div>

            <!-- Company -->
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Company *</label>
              <input v-model="form.company" placeholder="Google"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
            </div>

            <!-- Location -->
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Location</label>
              <input v-model="form.location" placeholder="London, UK"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
            </div>

            <!-- Salary — fixed layout -->
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Salary</label>
              <div class="flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden focus-within:border-indigo-400 bg-white dark:bg-gray-800">
                <select v-model="form.currency"
                  class="text-sm px-2 py-2 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 outline-none flex-shrink-0 w-16">
                  <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
                </select>
                <input
                  v-model="form.salary"
                  placeholder="80000"
                  type="number"
                  min="0"
                  max="99999999"
                  @input="form.salary = Math.max(0, Math.min(99999999, Number(form.salary) || 0)) || ''"
                  class="flex-1 min-w-0 text-sm px-3 py-2 outline-none bg-transparent text-gray-800 dark:text-gray-100" />
              </div>
            </div>

            <!-- Applied Date -->
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Applied Date</label>
              <DatePicker v-model="form.appliedDate" placeholder="Pick a date" />
            </div>

            <!-- Status -->
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Status</label>
              <select v-model="form.status"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                <option v-for="s in JOB_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>

            <!-- Priority -->
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Priority</label>
              <div class="flex gap-2">
                <button
                  v-for="(cfg, key) in PRIORITY_CONFIG" :key="key"
                  @click="form.priority = key"
                  :class="['flex-1 text-xs py-2 rounded-lg border-2 font-medium transition', form.priority === key ? 'border-current' : 'border-gray-200 dark:border-gray-600 text-gray-400']"
                  :style="form.priority === key ? { borderColor: cfg.color, color: cfg.color, background: cfg.color + '15' } : {}"
                >{{ cfg.label }}</button>
              </div>
            </div>

            <!-- Resume link -->
            <div class="col-span-2">
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Linked Resume</label>
              <div class="relative">
                <button
                  @click.stop="showResumePicker = !showResumePicker"
                  class="w-full flex items-center justify-between text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-left transition hover:border-indigo-300 dark:hover:border-indigo-700"
                >
                  <span v-if="selectedResume()" class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                    <span class="font-mono text-xs opacity-60">{{ flagCode(selectedResume().language) }}</span>
                    {{ selectedResume().title }}
                  </span>
                  <span v-else class="text-gray-400 dark:text-gray-500">Select a resume...</span>
                  <span class="text-gray-400 text-xs ml-2">▾</span>
                </button>

                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
                  <div
                    v-if="showResumePicker"
                    class="absolute top-10 left-0 right-0 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1"
                    @click.stop
                  >
                    <button
                      v-for="r in resumes" :key="r.id"
                      @click="pickResume(r.id)"
                      class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <span class="font-mono text-xs text-gray-400">{{ flagCode(r.language) }}</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300" :class="form.resumeId === r.id ? 'font-semibold text-indigo-600 dark:text-indigo-400' : ''">{{ r.title }}</span>
                      <span v-if="form.resumeId === r.id" class="text-indigo-500 text-xs">✓</span>
                    </button>
                    <div v-if="resumes.length === 0" class="px-3 py-2 text-xs text-gray-400">No resumes yet</div>
                    <div v-if="form.resumeId" class="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                      <button @click="pickResume(null)" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
                        ✕ Remove link
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Job URL -->
            <div class="col-span-2">
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Job URL</label>
              <input v-model="form.url" placeholder="https://company.com/jobs/..."
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
            </div>

            <!-- Notes — supports image paste -->
            <div class="col-span-2">
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs text-gray-500 dark:text-gray-400">Notes</label>
                <span class="text-[10px] text-gray-300 dark:text-gray-600">supports image paste</span>
              </div>
              <div
                ref="notesRef"
                contenteditable="true"
                @input="syncNotes"
                @paste="onNotesPaste"
                @blur="syncNotes"
                data-placeholder="Recruiter name, interview notes, next steps..."
                class="notes-field w-full min-h-[72px] text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                style="white-space: pre-wrap; word-break: break-word; line-height: 1.5;"
              />
            </div>

            <!-- Custom columns -->
            <template v-if="customColumns.length > 0">
              <div class="col-span-2">
                <div class="border-t border-gray-100 dark:border-gray-800 pt-3 mb-3">
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Custom Fields</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    v-for="col in customColumns" :key="col.id"
                    :class="col.type === 'file' ? 'col-span-2' : ''"
                  >
                    <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{{ col.label }}</label>

                    <!-- Number type -->
                    <input
                      v-if="col.type === 'number'"
                      type="number"
                      :value="form.customFields?.[col.id] || ''"
                      @input="form.customFields = { ...form.customFields, [col.id]: $event.target.value }"
                      :placeholder="col.label"
                      class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    />

                    <!-- Text type -->
                    <input
                      v-else
                      type="text"
                      :value="form.customFields?.[col.id] || ''"
                      @input="form.customFields = { ...form.customFields, [col.id]: $event.target.value }"
                      :placeholder="col.label"
                      class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            </template>

            <!-- Attachments -->
            <div class="col-span-2">
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs text-gray-500 dark:text-gray-400">Attachments</label>
                <button
                  @click="fileInput.click()"
                  class="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
                >+ Add file</button>
              </div>

              <input ref="fileInput" type="file" multiple class="hidden" @change="onFileChange"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt,.csv" />

              <!-- File list -->
              <div v-if="form.attachments.length > 0" class="flex flex-col gap-1.5 mb-2">
                <div
                  v-for="file in form.attachments" :key="file.id"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                  <span class="text-base flex-shrink-0">{{ fileIcon(file.type) }}</span>
                  <span class="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">{{ file.name }}</span>
                  <span class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{{ fileSize(file.size) }}</span>
                  <button @click="removeFile(file.id)" class="text-gray-300 dark:text-gray-600 hover:text-red-500 transition flex-shrink-0 text-xs">✕</button>
                </div>
              </div>

              <!-- Drop zone -->
              <div
                @dragover.prevent
                @drop.prevent="(e) => { const dt = e.dataTransfer; if (dt.files.length) { const fakeEvt = { target: { files: dt.files, value: '' } }; onFileChange(fakeEvt) } }"
                @click="fileInput.click()"
                class="flex items-center justify-center gap-2 h-10 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-500 cursor-pointer transition"
              >
                📎 Drop files or click to browse
              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button @click="$emit('close')"
            class="px-4 py-2 text-sm border rounded-lg transition border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button @click="save" :disabled="!canSave"
            :class="['px-4 py-2 text-sm rounded-lg transition', canSave ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed']">
            {{ isEdit ? 'Save Changes' : 'Add Application' }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>
