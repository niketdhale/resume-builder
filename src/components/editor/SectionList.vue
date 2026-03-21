<script setup>
import { inject } from 'vue'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'
import SectionItem from './SectionItem.vue'

const activeSections = inject('activeSections')
const updateSectionOrder = inject('updateSectionOrder')

function onDragEnd() {
  updateSectionOrder(activeSections.value)
}
</script>

<template>
  <div>
    <!-- Empty state -->
    <div
      v-if="activeSections.length === 0"
      class="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600"
    >
      <span class="text-4xl mb-3">📂</span>
      <p class="text-sm font-medium">No sections yet</p>
      <p class="text-xs mt-1">Click "Add Section" to get started</p>
    </div>

    <!-- Draggable sections -->
    <Draggable
      v-else
      :list="activeSections"
      handle=".section-drag-handle"
      item-key="id"
      @end="onDragEnd"
      class="flex flex-col gap-3"
    >
      <SectionItem v-for="section in activeSections" :key="section.id" :section="section" />
    </Draggable>
  </div>
</template>
