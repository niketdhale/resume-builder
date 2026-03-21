<script setup>
import { inject } from 'vue'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'
import EntryItem from './EntryItem.vue'

const props = defineProps({
  section: { type: Object, required: true },
  sectionType: { type: String, default: 'custom' },
})

const updateEntryOrder = inject('updateEntryOrder')

function onDragEnd() {
  updateEntryOrder(props.section.id, props.section.entries)
}
</script>

<template>
  <div>
    <!-- Empty state -->
    <div
      v-if="section.entries.length === 0"
      class="flex flex-col items-center justify-center py-6 text-gray-300"
    >
      <span class="text-2xl mb-1">📝</span>
      <p class="text-xs">No entries yet</p>
    </div>

    <!-- Draggable entries -->
    <Draggable
      v-else
      :list="section.entries"
      handle=".entry-drag-handle"
      item-key="id"
      @end="onDragEnd"
      class="flex flex-col gap-2"
    >
      <EntryItem
        v-for="entry in section.entries"
        :key="entry.id"
        :entry="entry"
        :sectionId="section.id"
        :sectionType="sectionType"
      />
    </Draggable>
  </div>
</template>
