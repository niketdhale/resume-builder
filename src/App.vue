<script setup>
import { provide, watch } from 'vue'

import {
  resumes, sections, activeResumeId, activeSections,
  activeMetadata, activeSettings, activePageSize,
} from './composables/useResumeState'

import {
  hydrateFromStorage, setupStorageWatchers,
  savedIndicator, lastSavedTime, formatSavedTime,
} from './composables/useStorage'

import {
  addResume, renameResume, duplicateResume, deleteResume,
  setActiveResume, updateMetadata, updateSetting, updatePageSize,
  addLanguageVariant, setBaseResume,
} from './composables/useResumeActions'

import {
  addSection, renameSection, deleteSection,
  toggleSectionCollapse, toggleSectionHidden, toggleSectionSharing,
  updateSectionOrder, setSectionColumn,
} from './composables/useSectionActions'

import {
  addEntry, updateEntry, deleteEntry, duplicateEntry,
  toggleEntryVisibility, updateEntryOrder,
} from './composables/useEntryActions'

import {
  showImportModal, importData, importError, importMode,
  exportJSON, onFileSelected, confirmImport, cancelImport,
} from './composables/useImportExport'

import { setupDebugGlobal } from './utils/useDebugLogger'
import { undo, redo, canUndo, canRedo } from './composables/useHistory'
import { hydrateJobs, setupJobStorageWatcher } from './jobs/composables/useJobStorage'
import { useAuth } from './composables/useAuth.js'
import { setStorageUserId } from './services/storage/index.js'

// Keep storage adapter in sync with the logged-in user
const { userId } = useAuth()
watch(userId, (id) => setStorageUserId(id), { immediate: true })

hydrateFromStorage()
setupStorageWatchers()
hydrateJobs()
setupJobStorageWatcher()
setupDebugGlobal({ resumes, sections, activeResumeId, activeSettings })

provide('undo', undo)
provide('redo', redo)
provide('canUndo', canUndo)
provide('canRedo', canRedo)

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
provide('addLanguageVariant', addLanguageVariant)
provide('setBaseResume', setBaseResume)

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
  <RouterView v-slot="{ Component, route }">
    <Transition
      :name="route.meta.transition || 'fade'"
      mode="out-in"
    >
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
