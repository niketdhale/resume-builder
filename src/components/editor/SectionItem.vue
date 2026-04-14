<script setup>
import { ref, inject, computed, nextTick } from 'vue'
import { GripVertical, ChevronDown, ChevronRight, Link2, Pencil, Trash2, Plus } from 'lucide-vue-next'
import EntryList from './EntryList.vue'

const props = defineProps({
  section: { type: Object, required: true },
})

const renameSection = inject('renameSection')
const deleteSection = inject('deleteSection')
const toggleSectionCollapse = inject('toggleSectionCollapse')
const toggleSectionSharing = inject('toggleSectionSharing')
const addEntry = inject('addEntry')

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

const visibleCount = computed(() => props.section.entries.filter((e) => e.isVisible).length)
const totalCount = computed(() => props.section.entries.length)
</script>

<template>
  <div class="section-card">
    <!-- Section Header -->
    <div class="section-header">
      <span class="drag-handle section-drag-handle">
        <GripVertical :size="15" />
      </span>

      <button class="icon-btn" @click="toggleSectionCollapse(section.id)">
        <ChevronDown v-if="!section.isCollapsed" :size="15" />
        <ChevronRight v-else :size="15" />
      </button>

      <input
        v-if="isRenaming"
        ref="renameInput"
        v-model="draftTitle"
        @blur="commitRename"
        @keydown="onRenameKeydown"
        class="rename-input"
      />
      <span
        v-else
        @dblclick="startRename"
        class="section-title"
        title="Double click to rename"
      >
        {{ section.title }}
      </span>

      <span v-if="section.sharedAcrossViews" class="shared-badge">
        <Link2 :size="10" /> Shared
      </span>

      <span class="count-badge">{{ visibleCount }}/{{ totalCount }}</span>

      <button class="icon-btn" @click="startRename" title="Rename">
        <Pencil :size="13" />
      </button>

      <button class="icon-btn icon-btn--danger" @click="deleteSection(section.id)" title="Delete section">
        <Trash2 :size="13" />
      </button>

      <label class="share-label">
        <input
          type="checkbox"
          :checked="section.sharedAcrossViews"
          @change="toggleSectionSharing(section.id)"
          class="share-checkbox"
        />
        Share
      </label>
    </div>

    <!-- Section body -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out overflow-hidden"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-active-class="transition-all duration-150 ease-in overflow-hidden"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="!section.isCollapsed">
        <div v-if="section.description" class="section-desc">
          <p>{{ section.description }}</p>
        </div>
        <div class="section-body">
          <EntryList :section="section" :sectionType="section.type" />
          <button class="add-entry-btn" @click="addEntry(section.id)">
            <Plus :size="13" /> Add Entry
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.15s;
}
.section-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 0.875rem;
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border);
}

.drag-handle {
  color: var(--ink-3);
  cursor: grab;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  transition: color 0.12s;
}
.drag-handle:hover { color: var(--gold); }

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  background: transparent;
  border: none;
  color: var(--ink-3);
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
  transition: color 0.12s, background 0.12s;
}
.icon-btn:hover { color: var(--gold); background: var(--gold-bg); }
.icon-btn--danger:hover { color: #ef4444; background: rgba(239,68,68,0.08); }

.section-title {
  flex: 1;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink);
  truncate: true;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  min-width: 0;
}

.rename-input {
  flex: 1;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid var(--gold);
  border-radius: 5px;
  padding: 0.2rem 0.4rem;
  outline: none;
  background: var(--bg-base);
  color: var(--ink);
  min-width: 0;
}

.shared-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--gold);
  background: var(--gold-bg);
  padding: 0.125rem 0.5rem;
  border-radius: 99px;
  flex-shrink: 0;
  border: 1px solid rgba(0,94,180,0.2);
}

.count-badge {
  font-size: 0.6875rem;
  color: var(--ink-3);
  background: var(--bg-base);
  border: 1px solid var(--border);
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
  white-space: nowrap;
  flex-shrink: 0;
}

.share-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6875rem;
  color: var(--ink-3);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.share-checkbox {
  accent-color: var(--gold);
  width: 12px;
  height: 12px;
}

.section-desc {
  padding: 0.625rem 0.875rem 0;
}
.section-desc p {
  font-size: 0.75rem;
  color: var(--ink-3);
  font-style: italic;
  line-height: 1.5;
  margin: 0;
}

.section-body {
  padding: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.add-entry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gold);
  background: transparent;
  border: 1px dashed rgba(0,94,180,0.35);
  border-radius: 7px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.15s;
}
.add-entry-btn:hover {
  background: var(--gold-bg);
  border-color: var(--gold);
}
</style>
