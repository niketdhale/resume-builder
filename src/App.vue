<script setup>
import { ref, provide } from 'vue'

// ─── Components ───────────────────────────────────────────────────────────────
import ViewTabs from './components/resume/ViewTabs.vue'
import SectionList from './components/editor/SectionList.vue'
import PreviewPanel from './components/preview/PreviewPanel.vue'
import CustomizePanel from './components/customize/CustomizePanel.vue'

// ─── State ────────────────────────────────────────────────────────────────────
import {
  resumes,
  sections,
  activeResumeId,
  activeSections,
  activeMetadata,
  activeSettings,
  activePageSize,
} from './composables/useResumeState'

// ─── Storage ──────────────────────────────────────────────────────────────────
import {
  hydrateFromStorage,
  setupStorageWatchers,
  savedIndicator,
  lastSavedTime,
  formatSavedTime,
} from './composables/useStorage'

// ─── Resume actions ───────────────────────────────────────────────────────────
import {
  addResume,
  renameResume,
  duplicateResume,
  deleteResume,
  setActiveResume,
  updateMetadata,
  updateSetting,
  updatePageSize,
} from './composables/useResumeActions'

// ─── Section actions ──────────────────────────────────────────────────────────
import {
  addSection,
  renameSection,
  deleteSection,
  toggleSectionCollapse,
  toggleSectionSharing,
  updateSectionOrder,
} from './composables/useSectionActions'

// ─── Entry actions ────────────────────────────────────────────────────────────
import {
  addEntry,
  updateEntry,
  deleteEntry,
  duplicateEntry,
  toggleEntryVisibility,
  updateEntryOrder,
} from './composables/useEntryActions'

// ─── Import / Export ──────────────────────────────────────────────────────────
import {
  showImportModal,
  importData,
  importError,
  importMode,
  exportJSON,
  onFileSelected,
  confirmImport,
  cancelImport,
} from './composables/useImportExport'

// ─── Startup ──────────────────────────────────────────────────────────────────
hydrateFromStorage()
setupStorageWatchers()

// ─── Local UI state ───────────────────────────────────────────────────────────
const activeTab = ref('content')
const showMetadataModal = ref(false)

// ─── Print ────────────────────────────────────────────────────────────────────
function printResume() {
  const size = activePageSize.value || 'A4'
  const existing = document.getElementById('__print_size__')
  if (existing) existing.remove()
  const style = document.createElement('style')
  style.id = '__print_size__'
  style.innerHTML = `@media print { @page { size: ${size}; margin: 0; } }`
  document.head.appendChild(style)
  setTimeout(() => window.print(), 100)
}

// ─── Provide ──────────────────────────────────────────────────────────────────

// State
provide('resumes', resumes)
provide('sections', sections)
provide('activeResumeId', activeResumeId)
provide('activeSections', activeSections)
provide('activeMetadata', activeMetadata)
provide('activeSettings', activeSettings)
provide('activePageSize', activePageSize)

// Storage
provide('savedIndicator', savedIndicator)
provide('lastSavedTime', lastSavedTime)
provide('formatSavedTime', formatSavedTime)

// Resume actions
provide('addResume', addResume)
provide('renameResume', renameResume)
provide('duplicateResume', duplicateResume)
provide('deleteResume', deleteResume)
provide('setActiveResume', setActiveResume)
provide('updateMetadata', updateMetadata)
provide('updateSetting', updateSetting)
provide('updatePageSize', updatePageSize)

// Section actions
provide('addSection', addSection)
provide('renameSection', renameSection)
provide('deleteSection', deleteSection)
provide('toggleSectionCollapse', toggleSectionCollapse)
provide('toggleSectionSharing', toggleSectionSharing)
provide('updateSectionOrder', updateSectionOrder)

// Entry actions
provide('addEntry', addEntry)
provide('updateEntry', updateEntry)
provide('deleteEntry', deleteEntry)
provide('duplicateEntry', duplicateEntry)
provide('toggleEntryVisibility', toggleEntryVisibility)
provide('updateEntryOrder', updateEntryOrder)

// Modals
provide('showMetadataModal', showMetadataModal)
</script>

<template>
  <div class="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden">
    <!-- Resume Tabs -->
    <ViewTabs />

    <!-- Split Panel -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left: Content / Customize (40%) -->
      <div class="flex flex-col w-2/5 border-r border-gray-200 bg-white overflow-hidden">
        <!-- Tab bar -->
        <div class="flex items-center border-b border-gray-200 px-3 pt-2 gap-1">
          <button
            @click="activeTab = 'content'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors',
              activeTab === 'content'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100',
            ]"
          >
            Content
          </button>
          <button
            @click="activeTab = 'customize'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors',
              activeTab === 'customize'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100',
            ]"
          >
            Customize
          </button>
        </div>

        <!-- Content tab -->
        <div v-if="activeTab === 'content'" class="flex flex-col flex-1 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <button
              @click="showMetadataModal = true"
              class="text-sm px-3 py-1.5 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-100 transition"
            >
              ✏️ Resume Info
            </button>
            <button
              @click="addSection()"
              class="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              + Add Section
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <SectionList />
          </div>
        </div>

        <!-- Customize tab -->
        <div v-if="activeTab === 'customize'" class="flex-1 overflow-hidden flex flex-col">
          <CustomizePanel />
        </div>
      </div>

      <!-- Right: Preview (60%) -->
      <div class="flex flex-col w-3/5 bg-gray-50 overflow-hidden">
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-gray-200 gap-2 flex-wrap"
        >
          <div class="flex items-center gap-2 min-w-0">
            <h2
              class="text-sm font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap"
            >
              Preview
            </h2>
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-300 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span
                v-if="savedIndicator"
                class="flex items-center gap-1 text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap"
              >
                ✓ Saved at {{ formatSavedTime(lastSavedTime) }}
              </span>
            </Transition>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <label
              class="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-100 transition cursor-pointer whitespace-nowrap"
            >
              📂 Import
              <input type="file" accept=".json" class="hidden" @change="onFileSelected($event)" />
            </label>
            <button
              @click="exportJSON"
              class="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-100 transition whitespace-nowrap"
            >
              📤 Export JSON
            </button>
            <button
              @click="printResume"
              class="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition whitespace-nowrap"
            >
              🖨️ Export PDF
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <PreviewPanel />
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showImportModal"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
        @click.self="cancelImport"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
          <h2 class="text-base font-semibold text-gray-800 mb-1">Import Resume</h2>

          <div
            v-if="importError"
            class="mb-4 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
          >
            ⚠️ {{ importError }}
          </div>

          <div v-if="importData" class="mb-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
              File Preview
            </p>
            <p class="text-sm font-semibold text-gray-800">{{ importData.resume.title }}</p>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ importData.resume.metadata.fullName || 'No name' }} —
              {{ importData.resume.metadata.jobTitle || 'No title' }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ importData.sections.length }} sections · Exported
              {{
                importData.exportedAt
                  ? new Date(importData.exportedAt).toLocaleDateString()
                  : 'Unknown date'
              }}
            </p>
          </div>

          <div v-if="importData" class="mb-5 flex flex-col gap-2">
            <p class="text-xs font-medium text-gray-600 mb-1">Import as:</p>
            <label
              class="flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all"
              :class="
                importMode === 'new'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              "
            >
              <input
                type="radio"
                v-model="importMode"
                value="new"
                class="accent-indigo-600 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-gray-700">Add as new resume</p>
                <p class="text-xs text-gray-400">Creates a new resume tab with the imported data</p>
              </div>
            </label>
            <label
              class="flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all"
              :class="
                importMode === 'replace'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              "
            >
              <input
                type="radio"
                v-model="importMode"
                value="replace"
                class="accent-indigo-600 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-gray-700">Replace current resume</p>
                <p class="text-xs text-red-400">⚠️ This will overwrite your current resume data</p>
              </div>
            </label>
          </div>

          <div class="flex justify-end gap-2">
            <button
              @click="cancelImport"
              class="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              v-if="importData"
              @click="confirmImport"
              class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Metadata Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showMetadataModal"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
        @click.self="showMetadataModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
          <h2 class="text-base font-semibold text-gray-800 mb-4">Resume Info</h2>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Full Name</label>
              <input
                :value="activeMetadata.fullName"
                @input="updateMetadata('fullName', $event.target.value)"
                placeholder="John Doe"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Job Title</label>
              <input
                :value="activeMetadata.jobTitle"
                @input="updateMetadata('jobTitle', $event.target.value)"
                placeholder="Software Engineer"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                :value="activeMetadata.email"
                @input="updateMetadata('email', $event.target.value)"
                placeholder="john@email.com"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Phone</label>
              <input
                :value="activeMetadata.phone"
                @input="updateMetadata('phone', $event.target.value)"
                placeholder="+1 234 567 890"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Location</label>
              <input
                :value="activeMetadata.location"
                @input="updateMetadata('location', $event.target.value)"
                placeholder="New York, USA"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">LinkedIn</label>
              <input
                :value="activeMetadata.linkedin"
                @input="updateMetadata('linkedin', $event.target.value)"
                placeholder="linkedin.com/in/johndoe"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
              />
            </div>
            <div class="col-span-2">
              <label class="text-xs text-gray-500 mb-1 block">Website</label>
              <input
                :value="activeMetadata.website"
                @input="updateMetadata('website', $event.target.value)"
                placeholder="johndoe.com"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <div class="flex justify-end mt-5">
            <button
              @click="showMetadataModal = false"
              class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
