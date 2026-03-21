<script setup>
import { ref, inject, nextTick } from 'vue'
import { Plus, MoreHorizontal, Copy, Trash2, Pencil } from 'lucide-vue-next'

const resumes = inject('resumes')
const activeResumeId = inject('activeResumeId')
const setActiveResume = inject('setActiveResume')
const addResume = inject('addResume')
const renameResume = inject('renameResume')
const duplicateResume = inject('duplicateResume')
const deleteResume = inject('deleteResume')

// ─── Kebab menu ───────────────────────────────────────────────────────────────
const openMenuId = ref(null)

function toggleMenu(resumeId, e) {
  e.stopPropagation()
  openMenuId.value = openMenuId.value === resumeId ? null : resumeId
}

function closeMenu() {
  openMenuId.value = null
}

// ─── Inline rename ────────────────────────────────────────────────────────────
const editingId = ref(null)
const editingTitle = ref('')
const inputEl = ref(null)

async function startRename(resume) {
  openMenuId.value = null
  editingId.value = resume.id
  editingTitle.value = resume.title
  await nextTick()
  inputEl.value?.focus()
  inputEl.value?.select()
}

function commitRename(resumeId) {
  renameResume(resumeId, editingTitle.value)
  editingId.value = null
}

function onRenameKeydown(e, resumeId) {
  if (e.key === 'Enter') commitRename(resumeId)
  if (e.key === 'Escape') editingId.value = null
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function onDuplicate(resumeId) {
  openMenuId.value = null
  duplicateResume(resumeId)
}

function onDelete(resumeId) {
  openMenuId.value = null
  deleteResume(resumeId)
}
</script>

<template>
  <div
    class="relative flex items-center gap-1 px-3 pt-2 bg-white border-b border-gray-200 w-full"
    @click="closeMenu"
  >
    <!-- Tabs -->
    <template v-for="resume in resumes" :key="resume.id">
      <div class="relative flex-shrink-0">
        <!-- Tab button -->
        <button
          @click.stop="setActiveResume(resume.id)"
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-t-md text-sm border-b-2 transition-colors whitespace-nowrap',
            activeResumeId === resume.id
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100',
          ]"
        >
          <!-- Inline rename input -->
          <input
            v-if="editingId === resume.id"
            ref="inputEl"
            v-model="editingTitle"
            @blur="commitRename(resume.id)"
            @keydown="onRenameKeydown($event, resume.id)"
            @click.stop
            class="w-24 bg-white border border-indigo-400 rounded px-1 text-sm outline-none text-gray-800"
          />
          <span v-else class="max-w-[120px] truncate">{{ resume.title }}</span>

          <!-- Kebab icon -->
          <span
            @click.stop="toggleMenu(resume.id, $event)"
            :class="[
              'rounded p-0.5 hover:bg-indigo-100 cursor-pointer',
              activeResumeId === resume.id ? 'text-indigo-400' : 'text-gray-400',
            ]"
          >
            <MoreHorizontal :size="14" />
          </span>
        </button>

        <!-- Dropdown -->
        <div
          v-if="openMenuId === resume.id"
          class="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
          @click.stop
        >
          <button
            @click="startRename(resume)"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Pencil :size="14" /> Rename
          </button>
          <button
            @click="onDuplicate(resume.id)"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Copy :size="14" /> Duplicate
          </button>
          <hr class="my-1 border-gray-100" />
          <button
            @click="onDelete(resume.id)"
            :disabled="resumes.length === 1"
            :class="[
              'flex items-center gap-2 w-full px-3 py-2 text-sm',
              resumes.length === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-red-500 hover:bg-red-50',
            ]"
          >
            <Trash2 :size="14" /> Delete
          </button>
        </div>
      </div>
    </template>

    <!-- Add Resume -->
    <button
      @click.stop="addResume"
      class="flex-shrink-0 flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-t-md transition-colors"
    >
      <Plus :size="14" /> Add Resume
    </button>
  </div>
</template>
