<script setup>
import { inject, ref, computed, watch } from 'vue'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'
import { GripVertical, EyeOff } from 'lucide-vue-next'

const activeSections = inject('activeSections')
const activeSettings = inject('activeSettings')
const updateSectionOrder = inject('updateSectionOrder')
const updateSetting = inject('updateSetting')
const setSectionColumn = inject('setSectionColumn')

// ─── Mode flags ───────────────────────────────────────────────────────────────

const isTwoCol = computed(() => activeSettings.value?.columns === 'two')
const isMixCol = computed(() => activeSettings.value?.columns === 'mix')
const showColumnZones = computed(() => isTwoCol.value || isMixCol.value)

// ─── Three mutable refs for vue-draggable-next ────────────────────────────────

const localSections = ref([])
const leftList = ref([])
const rightList = ref([])
const fullList = ref([])

function rebuildLists(sections) {
  localSections.value = sections.map((s) => ({ ...s }))
  leftList.value  = sections.filter((s) => s.column === 'left').map((s) => ({ ...s }))
  rightList.value = sections.filter((s) => s.column === 'right').map((s) => ({ ...s }))
  fullList.value  = sections
    .filter((s) => s.column !== 'left' && s.column !== 'right')
    .map((s) => ({ ...s }))
}

watch(activeSections, (val) => rebuildLists(val), { immediate: true, deep: true })

watch(
  () => activeSettings.value?.columns,
  (columns) => {
    if (columns === 'one') {
      activeSections.value.forEach((s) => setSectionColumn(s.id, 'left'))
      updateSetting('columnLayout', { left: [], right: [] })
    } else {
      rebuildLists(activeSections.value)
    }
  },
)

// ─── Sync columnLayout to settings ───────────────────────────────────────────

function syncColumnLayout() {
  if (!showColumnZones.value) return
  updateSetting('columnLayout', {
    left: leftList.value.map((s) => s.id),
    right: rightList.value.map((s) => s.id),
  })
}

// ─── 1-col drag ───────────────────────────────────────────────────────────────

function onDragEnd() {
  updateSectionOrder(localSections.value)
}

// ─── Cross-list drag — @add fires when item arrives from another list ─────────

function onLeftAdd(evt) {
  const item = leftList.value[evt.newIndex]
  if (item) setSectionColumn(item.id, 'left')
  syncColumnLayout()
}

function onRightAdd(evt) {
  const item = rightList.value[evt.newIndex]
  if (item) setSectionColumn(item.id, 'right')
  syncColumnLayout()
}

function onFullAdd(evt) {
  const item = fullList.value[evt.newIndex]
  if (item) setSectionColumn(item.id, 'full')
  syncColumnLayout()
}

function onLeftEnd()  { syncColumnLayout() }
function onRightEnd() { syncColumnLayout() }
function onFullEnd()  { syncColumnLayout() }

// ─── Section type emoji map ───────────────────────────────────────────────────

const typeEmoji = {
  experience: '💼',
  education: '🎓',
  skills: '⚡',
  languages: '🌐',
  certificates: '📜',
  interests: '❤️',
  projects: '🚀',
  courses: '📚',
  awards: '🏆',
  organisations: '🏛️',
  publications: '📰',
  references: '👤',
  declaration: '✍️',
  dob: '🎂',
  custom: '✨',
}
</script>

<template>
  <div class="p-5 flex flex-col gap-4">
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
        {{ showColumnZones ? 'Column Layout' : 'Section Order' }}
      </h3>
      <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">
        {{
          showColumnZones
            ? 'Drag sections between columns to assign them'
            : 'Drag to reorder sections in your resume'
        }}
      </p>

      <!-- Empty state -->
      <div
        v-if="localSections.length === 0"
        class="flex flex-col items-center py-10 text-gray-300 dark:text-gray-600 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl"
      >
        <span class="text-2xl mb-2">📂</span>
        <p class="text-xs">No sections yet. Add sections in the Content tab.</p>
      </div>

      <!-- ── 1-col: flat ordered list ── -->
      <div
        v-else-if="!showColumnZones"
        class="rounded-xl shadow-sm overflow-hidden"
        style="background: var(--bg-surface); border: 1px solid var(--border);"
      >
        <Draggable v-model="localSections" handle=".section-tab-handle" @end="onDragEnd">
          <div
            v-for="(section, index) in localSections"
            :key="section.id"
            :class="[
              'flex items-center gap-3 px-4 py-3 transition-all section-row',
              index !== localSections.length - 1 ? 'section-row-border' : '',
              section.isHidden ? 'opacity-40' : '',
            ]"
          >
            <span class="section-tab-handle cursor-grab flex-shrink-0" style="color: var(--ink-3);">
              <GripVertical :size="14" />
            </span>
            <span class="text-sm">{{ typeEmoji[section.type] || '📄' }}</span>
            <span
              class="flex-1 text-sm font-medium truncate"
              :style="section.isHidden ? 'color: var(--ink-3); text-decoration: line-through;' : 'color: var(--ink);'"
            >
              {{ section.title }}
            </span>
            <EyeOff v-if="section.isHidden" :size="12" class="text-amber-400 flex-shrink-0" />
          </div>
        </Draggable>
      </div>

      <!-- ── 2-col / mix: three drop zones ── -->
      <div v-else class="flex flex-col gap-3">

        <div class="grid grid-cols-2 gap-3">
          <!-- Left column -->
          <div class="flex flex-col gap-1">
            <span class="text-xs font-medium px-1" style="color: var(--ink-3);">Left</span>
            <div class="min-h-[120px] rounded-xl overflow-hidden" style="background: var(--bg-surface); border: 1px solid var(--border);">
              <Draggable
                v-model="leftList"
                group="col-sections"
                class="flex flex-col min-h-[110px] p-1 gap-1"
                @add="onLeftAdd"
                @end="onLeftEnd"
              >
                <div
                  v-for="section in leftList"
                  :key="section.id"
                  :class="['flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-grab col-section-card', section.isHidden ? 'opacity-40' : '']"
                >
                  <GripVertical :size="13" class="flex-shrink-0" style="color: var(--ink-3);" />
                  <span class="text-sm">{{ typeEmoji[section.type] || '📄' }}</span>
                  <span
                    class="flex-1 text-xs font-medium truncate"
                    :style="section.isHidden ? 'color: var(--ink-3); text-decoration: line-through;' : 'color: var(--ink);'"
                  >{{ section.title }}</span>
                  <EyeOff v-if="section.isHidden" :size="11" class="text-amber-400 flex-shrink-0" />
                </div>
              </Draggable>
              <div
                v-if="leftList.length === 0"
                class="mx-2 mb-2 flex items-center justify-center h-[72px] text-xs rounded-lg pointer-events-none"
                style="color: var(--ink-3); border: 2px dashed var(--border);"
              >
                Drop here
              </div>
            </div>
          </div>

          <!-- Right column -->
          <div class="flex flex-col gap-1">
            <span class="text-xs font-medium px-1" style="color: var(--ink-3);">Right</span>
            <div class="min-h-[120px] rounded-xl overflow-hidden" style="background: var(--bg-surface); border: 1px solid var(--border);">
              <Draggable
                v-model="rightList"
                group="col-sections"
                class="flex flex-col min-h-[110px] p-1 gap-1"
                @add="onRightAdd"
                @end="onRightEnd"
              >
                <div
                  v-for="section in rightList"
                  :key="section.id"
                  :class="['flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-grab col-section-card', section.isHidden ? 'opacity-40' : '']"
                >
                  <GripVertical :size="13" class="flex-shrink-0" style="color: var(--ink-3);" />
                  <span class="text-sm">{{ typeEmoji[section.type] || '📄' }}</span>
                  <span
                    class="flex-1 text-xs font-medium truncate"
                    :style="section.isHidden ? 'color: var(--ink-3); text-decoration: line-through;' : 'color: var(--ink);'"
                  >{{ section.title }}</span>
                  <EyeOff v-if="section.isHidden" :size="11" class="text-amber-400 flex-shrink-0" />
                </div>
              </Draggable>
              <div
                v-if="rightList.length === 0"
                class="mx-2 mb-2 flex items-center justify-center h-[72px] text-xs rounded-lg pointer-events-none"
                style="color: var(--ink-3); border: 2px dashed var(--border);"
              >
                Drop here
              </div>
            </div>
          </div>
        </div>

        <!-- Full width zone -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium px-1" style="color: var(--ink-3);">Full width</span>
          <div class="rounded-xl overflow-hidden" style="background: var(--bg-surface); border: 1px solid var(--border);">
            <Draggable
              v-model="fullList"
              group="col-sections"
              class="flex flex-col p-1 gap-1 min-h-[52px]"
              @add="onFullAdd"
              @end="onFullEnd"
            >
              <div
                v-for="section in fullList"
                :key="section.id"
                :class="['flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-grab col-section-card', section.isHidden ? 'opacity-40' : '']"
              >
                <GripVertical :size="13" class="flex-shrink-0" style="color: var(--ink-3);" />
                <span class="text-sm">{{ typeEmoji[section.type] || '📄' }}</span>
                <span
                  class="flex-1 text-xs font-medium truncate"
                  :style="section.isHidden ? 'color: var(--ink-3); text-decoration: line-through;' : 'color: var(--ink);'"
                >{{ section.title }}</span>
                <EyeOff v-if="section.isHidden" :size="11" class="text-amber-400 flex-shrink-0" />
              </div>
            </Draggable>
            <div
              v-if="fullList.length === 0"
              class="mx-2 mb-2 flex items-center justify-center h-[44px] text-xs rounded-lg pointer-events-none"
              style="color: var(--ink-3); border: 2px dashed var(--border);"
            >
              Drop here — spans both columns
            </div>
          </div>
        </div>

        <p class="text-xs text-center" style="color: var(--ink-3);">
          Drag sections between zones to assign columns
        </p>
      </div>

      <!-- Page break placeholder -->
      <div class="mt-4 pt-4" style="border-top: 1px solid var(--border);">
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg opacity-50" style="background: var(--bg-subtle); border: 1px dashed var(--border-2);">
          <GripVertical :size="14" style="color: var(--ink-3);" />
          <span class="text-sm" style="color: var(--ink-3);">Page break</span>
        </div>
        <p class="text-xs mt-1" style="color: var(--ink-3);">Page break feature coming soon</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-row { transition: background 0.12s; }
.section-row:hover { background: var(--bg-subtle); }
.section-row-border { border-bottom: 1px solid var(--border); }

.col-section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
}
.col-section-card:hover { border-color: var(--gold); }
</style>
