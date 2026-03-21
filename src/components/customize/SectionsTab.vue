<script setup>
import { inject, ref, watch } from 'vue'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'
import { GripVertical } from 'lucide-vue-next'

const activeSections = inject('activeSections')
const updateSectionOrder = inject('updateSectionOrder')

const localSections = ref([])

watch(
  activeSections,
  (val) => {
    localSections.value = [...val]
  },
  { immediate: true, deep: true },
)

function onDragEnd() {
  updateSectionOrder(localSections.value)
}

function visibleCount(section) {
  return section.entries.filter((e) => e.isVisible).length
}

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
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Section Order</h3>
      <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">Drag to reorder sections in your resume</p>

      <div
        v-if="localSections.length === 0"
        class="flex flex-col items-center py-10 text-gray-300 dark:text-gray-600 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl"
      >
        <span class="text-2xl mb-2">📂</span>
        <p class="text-xs">No sections yet. Add sections in the Content tab.</p>
      </div>

      <div v-else class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <Draggable v-model="localSections" handle=".section-tab-handle" @end="onDragEnd">
          <div
            v-for="(section, index) in localSections"
            :key="section.id"
            :class="[
              'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50',
              index !== localSections.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : '',
            ]"
          >
            <span
              class="section-tab-handle cursor-grab text-gray-300 dark:text-gray-600 hover:text-indigo-400 dark:hover:text-indigo-400 flex-shrink-0"
            >
              <GripVertical :size="14" />
            </span>
            <span class="text-sm">{{ typeEmoji[section.type] || '📄' }}</span>
            <span class="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{{
              section.title
            }}</span>
            <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">
              {{ visibleCount(section) }}/{{ section.entries.length }}
            </span>
            <span
              v-if="section.sharedAcrossViews"
              class="text-xs text-indigo-400 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full flex-shrink-0"
            >
              Shared
            </span>
          </div>
        </Draggable>
      </div>
    </div>
  </div>
</template>
