<script setup>
import { ref, inject, computed, nextTick } from 'vue'
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Link2,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-vue-next'
import EntryList from './EntryList.vue'

const props = defineProps({
  section: { type: Object, required: true },
})

const renameSection = inject('renameSection')
const deleteSection = inject('deleteSection')
const toggleSectionCollapse = inject('toggleSectionCollapse')
const toggleSectionSharing = inject('toggleSectionSharing')
const addEntry = inject('addEntry')

// ─── Inline rename ────────────────────────────────────────────────────────────
const isRenaming = ref(false)
const renameInput = ref(null)
const draftTitle = ref('')

async function startRename() {
  draftTitle.value = props.section.title
  isRenaming.value = true
  await nextTick()
  renameInput.value?.focus()
  renameInput.value?.select()
}

function commitRename() {
  renameSection(props.section.id, draftTitle.value)
  isRenaming.value = false
}

function onRenameKeydown(e) {
  if (e.key === 'Enter') commitRename()
  if (e.key === 'Escape') isRenaming.value = false
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const visibleCount = computed(() => props.section.entries.filter((e) => e.isVisible).length)
const totalCount = computed(() => props.section.entries.length)
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
  >
    <!-- Section Header -->
    <div
      class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100"
    >
      <!-- Drag handle -->
      <span
        class="section-drag-handle cursor-grab text-gray-300 hover:text-indigo-400 transition-colors flex-shrink-0"
      >
        <GripVertical :size="15" />
      </span>

      <!-- Collapse toggle -->
      <button
        @click="toggleSectionCollapse(section.id)"
        class="text-gray-400 hover:text-indigo-500 transition-colors flex-shrink-0"
      >
        <ChevronDown v-if="!section.isCollapsed" :size="15" />
        <ChevronRight v-else :size="15" />
      </button>

      <!-- Title / Rename -->
      <input
        v-if="isRenaming"
        ref="renameInput"
        v-model="draftTitle"
        @blur="commitRename"
        @keydown="onRenameKeydown"
        class="flex-1 text-sm font-semibold border border-indigo-300 rounded-md px-2 py-0.5 outline-none bg-white"
      />
      <span
        v-else
        @dblclick="startRename"
        class="flex-1 text-sm font-semibold text-gray-800 truncate cursor-pointer select-none"
        title="Double click to rename"
      >
        {{ section.title }}
      </span>

      <!-- Shared badge -->
      <span
        v-if="section.sharedAcrossViews"
        class="flex items-center gap-1 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full flex-shrink-0"
        title="Shared across all resumes"
      >
        <Link2 :size="10" /> Shared
      </span>

      <!-- Visible count badge -->
      <span
        class="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 bg-gray-100 px-2 py-0.5 rounded-full"
      >
        {{ visibleCount }}/{{ totalCount }}
      </span>

      <!-- Rename -->
      <button
        @click="startRename"
        class="p-1 text-gray-300 hover:text-indigo-500 transition-colors flex-shrink-0"
        title="Rename"
      >
        <Pencil :size="13" />
      </button>

      <!-- Delete -->
      <button
        @click="deleteSection(section.id)"
        class="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
        title="Delete section"
      >
        <Trash2 :size="13" />
      </button>

      <!-- Share checkbox -->
      <label
        class="flex items-center gap-1 text-xs text-gray-400 cursor-pointer whitespace-nowrap flex-shrink-0"
      >
        <input
          type="checkbox"
          :checked="section.sharedAcrossViews"
          @change="toggleSectionSharing(section.id)"
          class="accent-indigo-600"
        />
        Share
      </label>
    </div>

    <!-- Section description -->
    <div v-if="section.description && !section.isCollapsed" class="px-4 pt-3 pb-0">
      <p class="text-xs text-gray-400 italic leading-relaxed">{{ section.description }}</p>
    </div>

    <!-- Section Body -->
    <div v-if="!section.isCollapsed" class="p-4 flex flex-col gap-3">
      <EntryList :section="section" :sectionType="section.type" />
      <button
        @click="addEntry(section.id)"
        class="flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-2 rounded-lg border border-dashed border-indigo-200 hover:border-indigo-400 transition-all w-full justify-center"
      >
        <Plus :size="13" /> Add Entry
      </button>
    </div>
  </div>
</template>
