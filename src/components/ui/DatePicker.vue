<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue:  { type: String, default: '' }, // YYYY-MM-DD
  placeholder: { type: String, default: 'Select date' },
})

const emit = defineEmits(['update:modelValue'])

const open       = ref(false)
const triggerRef = ref(null)
const calPos     = ref({ top: 'auto', bottom: 'auto', left: '0px' })

// ─── Position calendar using fixed coords from getBoundingClientRect ──────────
// This escapes overflow:hidden/auto containers like scrollable modals.
function positionCalendar() {
  if (!triggerRef.value) return
  const rect        = triggerRef.value.getBoundingClientRect()
  const CALENDAR_H  = 340
  const CALENDAR_W  = 288
  const spaceBelow  = window.innerHeight - rect.bottom
  const spaceAbove  = rect.top

  let left = rect.left
  // Prevent right overflow
  if (left + CALENDAR_W > window.innerWidth - 8) {
    left = window.innerWidth - CALENDAR_W - 8
  }

  if (spaceBelow >= CALENDAR_H || spaceBelow >= spaceAbove) {
    // Open downward
    calPos.value = { top: rect.bottom + 4 + 'px', bottom: 'auto', left: left + 'px' }
  } else {
    // Open upward
    calPos.value = { top: 'auto', bottom: window.innerHeight - rect.top + 4 + 'px', left: left + 'px' }
  }
}

function toggleOpen() {
  if (!open.value) positionCalendar()
  open.value = !open.value
}

// Reposition on scroll/resize while open
function onScroll() { if (open.value) positionCalendar() }
window.addEventListener('scroll', onScroll, true)
window.addEventListener('resize', onScroll)
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', onScroll)
})

// ─── Parsed value ─────────────────────────────────────────────────────────────
const parsed = computed(() => {
  if (!props.modelValue) return null
  const d = new Date(props.modelValue + 'T00:00:00')
  return isNaN(d) ? null : d
})

const viewYear  = ref(parsed.value?.getFullYear()  ?? new Date().getFullYear())
const viewMonth = ref(parsed.value?.getMonth()      ?? new Date().getMonth())

watch(() => props.modelValue, () => {
  if (parsed.value) {
    viewYear.value  = parsed.value.getFullYear()
    viewMonth.value = parsed.value.getMonth()
  }
})

// ─── Display ──────────────────────────────────────────────────────────────────
const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_SHORT  = ['Mo','Tu','We','Th','Fr','Sa','Su']

const displayValue = computed(() => {
  if (!parsed.value) return ''
  return parsed.value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
})

// ─── Calendar grid (Mon–Sun) ──────────────────────────────────────────────────
const calendarDays = computed(() => {
  const firstDay    = new Date(viewYear.value, viewMonth.value, 1)
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const daysInPrev  = new Date(viewYear.value, viewMonth.value, 0).getDate()
  // Mon=0 … Sun=6
  const startDow = (firstDay.getDay() + 6) % 7

  const cells = []
  for (let i = startDow - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, month: 'prev', date: null })

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    cells.push({ day: d, month: 'current', date: dateStr })
  }

  const remaining = (7 - (cells.length % 7)) % 7
  for (let d = 1; d <= remaining; d++)
    cells.push({ day: d, month: 'next', date: null })

  return cells
})

const today = new Date().toISOString().split('T')[0]

const isSelected = (cell) => cell.date === props.modelValue
const isToday    = (cell) => cell.date === today

function selectDate(cell) {
  if (!cell.date) return
  emit('update:modelValue', cell.date)
  open.value = false
}

function prevMonth() {
  viewMonth.value === 0 ? (viewMonth.value = 11, viewYear.value--) : viewMonth.value--
}
function nextMonth() {
  viewMonth.value === 11 ? (viewMonth.value = 0, viewYear.value++) : viewMonth.value++
}
function setToday() { emit('update:modelValue', today); open.value = false }
function clear()    { emit('update:modelValue', '');    open.value = false }
</script>

<template>
  <div class="relative" @keydown.esc="open = false">
    <!-- Trigger -->
    <button
      ref="triggerRef"
      type="button"
      @click="toggleOpen"
      class="w-full flex items-center justify-between text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-left transition hover:border-indigo-300 dark:hover:border-indigo-700 focus:outline-none focus:border-indigo-400"
    >
      <span :class="displayValue ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'">
        {{ displayValue || placeholder }}
      </span>
      <svg class="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </button>

    <!-- Backdrop -->
    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />

    <!-- Calendar — fixed position to escape overflow containers -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="open"
          class="fixed z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4"
          :style="{ width: '288px', top: calPos.top, bottom: calPos.bottom, left: calPos.left }"
          @click.stop
        >
          <!-- Month nav -->
          <div class="flex items-center justify-between mb-3">
            <button @click="prevMonth"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-base leading-none">‹</button>
            <span class="text-sm font-semibold text-gray-800 dark:text-gray-100 select-none">
              {{ MONTHS_LONG[viewMonth] }} {{ viewYear }}
            </span>
            <button @click="nextMonth"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-base leading-none">›</button>
          </div>

          <!-- Day headers -->
          <div class="grid grid-cols-7 mb-1">
            <div v-for="d in DAYS_SHORT" :key="d"
              class="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1 select-none">
              {{ d }}
            </div>
          </div>

          <!-- Day cells -->
          <div class="grid grid-cols-7">
            <button
              v-for="(cell, i) in calendarDays" :key="i"
              type="button"
              @click="selectDate(cell)"
              :disabled="!cell.date"
              :class="[
                'h-9 w-full text-xs rounded-lg transition select-none',
                !cell.date
                  ? 'cursor-default text-gray-200 dark:text-gray-800'
                  : cell.month !== 'current'
                    ? 'text-gray-300 dark:text-gray-700 cursor-default'
                    : isSelected(cell)
                      ? 'bg-indigo-600 text-white font-bold'
                      : isToday(cell)
                        ? 'ring-1 ring-inset ring-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium',
              ]"
            >{{ cell.day }}</button>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button @click="clear"
              class="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition">
              Clear
            </button>
            <button @click="setToday"
              class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 transition">
              Today
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
