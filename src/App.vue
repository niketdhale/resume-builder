<script setup>
import { provide } from 'vue'

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

// ─── Actions ──────────────────────────────────────────────────────────────────
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

import {
  addSection,
  renameSection,
  deleteSection,
  toggleSectionCollapse,
  toggleSectionHidden,
  toggleSectionSharing,
  updateSectionOrder,
  setSectionColumn,
} from './composables/useSectionActions'

import {
  addEntry,
  updateEntry,
  deleteEntry,
  duplicateEntry,
  toggleEntryVisibility,
  updateEntryOrder,
} from './composables/useEntryActions'

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

// ─── Provide everything to child components ───────────────────────────────────
provide('resumes', resumes)
provide('sections', sections)
provide('activeResumeId', activeResumeId)
provide('activeSections', activeSections)
provide('activeMetadata', activeMetadata)
provide('activeSettings', activeSettings)
provide('activePageSize', activePageSize)
provide('savedIndicator', savedIndicator)
provide('lastSavedTime', lastSavedTime)
provide('formatSavedTime', formatSavedTime)

provide('addResume', addResume)
provide('renameResume', renameResume)
provide('duplicateResume', duplicateResume)
provide('deleteResume', deleteResume)
provide('setActiveResume', setActiveResume)
provide('updateMetadata', updateMetadata)
provide('updateSetting', updateSetting)
provide('updatePageSize', updatePageSize)

provide('addSection', addSection)
provide('renameSection', renameSection)
provide('deleteSection', deleteSection)
provide('toggleSectionCollapse', toggleSectionCollapse)
provide('toggleSectionHidden', toggleSectionHidden)
provide('toggleSectionSharing', toggleSectionSharing)
provide('updateSectionOrder', updateSectionOrder)
provide('setSectionColumn', setSectionColumn)

provide('addEntry', addEntry)
provide('updateEntry', updateEntry)
provide('deleteEntry', deleteEntry)
provide('duplicateEntry', duplicateEntry)
provide('toggleEntryVisibility', toggleEntryVisibility)
provide('updateEntryOrder', updateEntryOrder)

provide('showImportModal', showImportModal)
provide('importData', importData)
provide('importError', importError)
provide('importMode', importMode)
provide('exportJSON', exportJSON)
provide('onFileSelected', onFileSelected)
provide('confirmImport', confirmImport)
provide('cancelImport', cancelImport)
</script>

<template>
  <!-- All UI is handled by RouterView → views/ -->
  <RouterView />
</template>
