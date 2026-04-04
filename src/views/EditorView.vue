<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'

import NavBar from '../components/ui/NavBar.vue'
import SectionList from '../components/editor/SectionList.vue'
import PreviewPanel from '../components/preview/PreviewPanel.vue'
import CustomizePanel from '../components/customize/CustomizePanel.vue'
import MobileEditorTabs from '../components/ui/MobileEditorTabs.vue'
import { usePdfExport } from '../composables/usePdfExport'
import { useBreakpoint } from '../composables/useBreakpoint'

const route = useRoute()
const router = useRouter()

// ─── Injected state ───────────────────────────────────────────────────────────
const resumes = inject('resumes')
const activeResumeId = inject('activeResumeId')
const activeMetadata = inject('activeMetadata')
const activePageSize = inject('activePageSize')
const savedIndicator = inject('savedIndicator')
const lastSavedTime = inject('lastSavedTime')
const formatSavedTime = inject('formatSavedTime')
const syncStatus = inject('syncStatus')
const showMetadataModal = ref(false)

// ─── Photo upload ─────────────────────────────────────────────────────────────
const photoInput = ref(null)
const photoDragOver = ref(false)

function handlePhotoFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => updateMetadata('photo', e.target.result)
  reader.readAsDataURL(file)
}

function onPhotoInputChange(e) {
  handlePhotoFile(e.target.files[0])
}

function onPhotoDrop(e) {
  photoDragOver.value = false
  handlePhotoFile(e.dataTransfer.files[0])
}

function removePhoto() {
  updateMetadata('photo', '')
  if (photoInput.value) photoInput.value.value = ''
}
const SAMPLE_DATA = {
  fullName: 'Alex Johnson',
  jobTitle: 'Senior Software Engineer',
  email: 'alex.johnson@email.com',
  phone: '+44 7700 900123',
  location: 'London, UK',
  linkedin: 'linkedin.com/in/alexjohnson',
  website: 'alexjohnson.dev',
}

function applyPreset(preset) {
  const fields = preset === 'sample' ? SAMPLE_DATA : {
    fullName: '', jobTitle: '', email: '', phone: '',
    location: '', linkedin: '', website: '', photo: '',
  }
  Object.entries(fields).forEach(([key, val]) => updateMetadata(key, val))
}

// ─── Injected actions ─────────────────────────────────────────────────────────
const addSection = inject('addSection')
const updateMetadata = inject('updateMetadata')
const exportJSON = inject('exportJSON')
const onFileSelected = inject('onFileSelected')

// ─── Undo / Redo ──────────────────────────────────────────────────────────────
const undo    = inject('undo')
const redo    = inject('redo')
const canUndo = inject('canUndo')
const canRedo = inject('canRedo')

// ─── Shortcuts modal ──────────────────────────────────────────────────────────
const showShortcutsModal = ref(false)

useKeyboardShortcuts({
  undo,
  redo,
  save: () => {},
  openShortcuts: () => { showShortcutsModal.value = true },
})

// ─── Import modal state ───────────────────────────────────────────────────────
const showImportModal = inject('showImportModal')
const importData = inject('importData')
const importError = inject('importError')
const importMode = inject('importMode')
const confirmImport = inject('confirmImport')
const cancelImport = inject('cancelImport')

// ─── Active resume (for PDF filename) ────────────────────────────────────────
const activeResume = computed(() =>
  resumes.value.find((r) => r.id === activeResumeId.value) ?? null,
)

// ─── PDF Export ───────────────────────────────────────────────────────────────
const { exportPdf } = usePdfExport(activePageSize, activeResume)

// ─── Active tab (desktop left panel) ────────────────────────────────────────
const activeTab = ref('content')

// ─── Mobile panel switcher ───────────────────────────────────────────────────
// 'content' | 'customize' | 'preview'
const mobilePanel = ref('content')
const { isDesktop } = useBreakpoint()

// ─── Set active resume from route ─────────────────────────────────────────────
onMounted(() => {
  const id = route.params.id
  const found = resumes.value.find((r) => String(r.id) === String(id))
  if (!found) {
    router.push({ name: 'overview' })
    return
  }
  activeResumeId.value = found.id
})
</script>

<template>
  <div
    class="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-950"
    @keydown.esc="showShortcutsModal = false; showMetadataModal = false"
    tabindex="-1"
  >
    <!-- Top NavBar -->
    <NavBar />

    <!-- Resume title + saved indicator bar -->
    <div
      class="flex items-center gap-2 px-3 md:px-4 py-2 border-b flex-shrink-0 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800"
    >
      <button
        @click="router.push({ name: 'overview' })"
        class="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 flex-shrink-0"
      >
        ←<span class="hidden sm:inline"> Overview</span>
      </button>
      <div class="h-4 w-px bg-gray-200 dark:bg-gray-700" />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1 min-w-0">
        {{ activeResume?.title || 'Resume' }}
      </span>
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <span
          v-if="syncStatus === 'saving'"
          class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ml-1 text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-800"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse inline-block"></span>
          Saving…
        </span>
        <span
          v-else-if="syncStatus === 'synced'"
          class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ml-1 text-green-500 bg-green-50 dark:text-green-400 dark:bg-green-950/40"
        >
          ✓ Synced at {{ formatSavedTime(lastSavedTime) }}
        </span>
        <span
          v-else-if="syncStatus === 'pending'"
          class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ml-1 text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block"></span>
          Pending sync
        </span>
      </Transition>

      <div class="flex-1" />

      <!-- Undo / Redo — pill joined button -->
      <div class="flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <button
          @click="undo"
          :disabled="!canUndo"
          :class="[
            'flex items-center justify-center w-8 h-8 transition text-base',
            canUndo
              ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
          ]"
          title="Undo (Ctrl+Z)"
        >↩</button>
        <div class="w-px h-4 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <button
          @click="redo"
          :disabled="!canRedo"
          :class="[
            'flex items-center justify-center w-8 h-8 transition text-base',
            canRedo
              ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
          ]"
          title="Redo (Ctrl+Shift+Z)"
        >↪</button>
      </div>

      <!-- Shortcuts hint -->
      <button
        @click="showShortcutsModal = true"
        class="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800"
        title="Keyboard shortcuts (?)"
      >?</button>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         RESPONSIVE SPLIT PANEL
         Desktop (lg+): side-by-side 40/60
         Mobile/Tablet: full-screen panels switched by bottom tab bar
    ═══════════════════════════════════════════════════════════════ -->
    <div class="flex flex-1 overflow-hidden">

      <!-- ── LEFT PANEL: Content / Customize ── -->
      <div
        :class="[
          'flex-col border-r overflow-hidden bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800',
          isDesktop ? 'flex w-2/5' : (mobilePanel !== 'preview' ? 'flex w-full' : 'hidden'),
        ]"
      >
        <!-- Tab bar (desktop: Content/Customize tabs; mobile: synced to mobilePanel) -->
        <div class="flex items-center border-b px-3 pt-2 gap-1 border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button
            @click="activeTab = 'content'; mobilePanel = 'content'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors',
              (isDesktop ? activeTab === 'content' : mobilePanel === 'content')
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
            ]"
          >
            Content
          </button>
          <button
            @click="activeTab = 'customize'; mobilePanel = 'customize'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors',
              (isDesktop ? activeTab === 'customize' : mobilePanel === 'customize')
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
            ]"
          >
            Style
          </button>
        </div>

        <!-- Content tab -->
        <div
          v-show="isDesktop ? activeTab === 'content' : mobilePanel === 'content'"
          class="flex flex-col flex-1 overflow-hidden"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <button
              @click="showMetadataModal = true"
              class="text-sm px-3 py-1.5 border rounded-md transition border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
        <div
          v-show="isDesktop ? activeTab === 'customize' : mobilePanel === 'customize'"
          class="flex-1 overflow-hidden flex flex-col"
        >
          <CustomizePanel />
        </div>
      </div>

      <!-- ── RIGHT PANEL: Preview ── -->
      <div
        :class="[
          'flex-col overflow-hidden bg-gray-100 dark:bg-gray-950',
          isDesktop ? 'flex w-3/5' : (mobilePanel === 'preview' ? 'flex w-full' : 'hidden'),
        ]"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b gap-2 flex-wrap bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex-shrink-0">
          <h2 class="text-sm font-semibold uppercase tracking-wide whitespace-nowrap text-gray-600 dark:text-gray-400">
            Preview
          </h2>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <label class="flex items-center gap-1 text-xs px-2.5 py-1.5 border rounded-md transition cursor-pointer whitespace-nowrap border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
              📂 Import
              <input type="file" accept=".json" class="hidden" @change="onFileSelected($event)" />
            </label>
            <button
              @click="exportJSON"
              class="text-xs px-2.5 py-1.5 border rounded-md transition whitespace-nowrap border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              📤 JSON
            </button>
            <button
              @click="exportPdf"
              class="text-xs px-2.5 py-1.5 rounded-md transition whitespace-nowrap bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              🖨️ PDF
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4 md:p-6">
          <PreviewPanel />
        </div>
      </div>
    </div>

    <!-- Bottom tab bar — mobile/tablet only (hidden lg+) -->
    <div class="lg:hidden flex-shrink-0">
      <MobileEditorTabs :activePanel="mobilePanel" @update:activePanel="mobilePanel = $event" />
    </div>

    <!-- ── Import Modal ── -->
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
        class="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
        @click.self="cancelImport"
      >
        <div class="rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 p-6 bg-white dark:bg-gray-900">
          <h2 class="text-base font-semibold mb-1 text-gray-800 dark:text-gray-100">
            Import Resume
          </h2>
          <div
            v-if="importError"
            class="mb-4 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2"
          >
            ⚠️ {{ importError }}
          </div>
          <div
            v-if="importData"
            class="mb-4 rounded-xl p-4 bg-gray-50 border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
          >
            <p
              class="text-xs mb-2 font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              File Preview
            </p>
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {{ importData.resume.title }}
            </p>
            <p class="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
              {{ importData.resume.metadata.fullName || 'No name' }}
            </p>
            <p class="text-xs mt-1 text-gray-400 dark:text-gray-500">
              {{ importData.sections.length }} sections
            </p>
          </div>
          <div v-if="importData" class="mb-5 flex flex-col gap-2">
            <p class="text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">Import as:</p>
            <label
              class="flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all"
              :class="
                importMode === 'new'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              "
            >
              <input type="radio" v-model="importMode" value="new" class="accent-indigo-600 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-200">Add as new resume</p>
                <p class="text-xs text-gray-400 dark:text-gray-500">Creates a new resume tab</p>
              </div>
            </label>
            <label
              class="flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all"
              :class="
                importMode === 'replace'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              "
            >
              <input type="radio" v-model="importMode" value="replace" class="accent-indigo-600 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-200">Replace current resume</p>
                <p class="text-xs text-red-400">⚠️ This will overwrite your current resume data</p>
              </div>
            </label>
          </div>
          <div class="flex justify-end gap-2">
            <button
              @click="cancelImport"
              class="px-4 py-2 text-sm border rounded-lg transition border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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

    <!-- ── Metadata Modal ── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showMetadataModal"
        class="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
        @click.self="showMetadataModal = false"
      >
        <div
          class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 p-6 max-h-[90vh] overflow-y-auto"
        >
          <!-- Header + presets -->
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100">Resume Info</h2>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 dark:text-gray-500">Presets:</span>
              <button
                @click="applyPreset('sample')"
                class="text-xs px-2.5 py-1 rounded-lg border transition border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                📋 Sample Data
              </button>
              <button
                @click="applyPreset('clear')"
                class="text-xs px-2.5 py-1 rounded-lg border transition border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-800 hover:text-red-500"
              >
                🗑 Clear
              </button>
            </div>
          </div>

          <!-- Photo upload -->
          <div class="mb-4">
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Profile Photo</label>
            <div class="flex items-center gap-3">
              <!-- Preview / drop zone -->
              <div
                v-if="activeMetadata.photo"
                class="relative flex-shrink-0"
              >
                <img
                  :src="activeMetadata.photo"
                  class="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-600"
                />
                <button
                  @click="removePhoto"
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition leading-none"
                >✕</button>
              </div>

              <div
                v-else
                @dragover.prevent="photoDragOver = true"
                @dragleave="photoDragOver = false"
                @drop.prevent="onPhotoDrop"
                @click="photoInput.click()"
                :class="[
                  'flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors',
                  photoDragOver
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800',
                ]"
              >
                <span class="text-xl">📷</span>
              </div>

              <div class="flex-1 min-w-0">
                <button
                  @click="photoInput.click()"
                  class="text-xs px-3 py-1.5 rounded-lg border transition border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {{ activeMetadata.photo ? 'Change photo' : 'Upload photo' }}
                </button>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  JPG, PNG or WebP · drag & drop or click
                </p>
              </div>

              <input
                ref="photoInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="onPhotoInputChange"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Full Name</label>
              <input
                :value="activeMetadata.fullName"
                @input="updateMetadata('fullName', $event.target.value)"
                placeholder="John Doe"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Job Title</label>
              <input
                :value="activeMetadata.jobTitle"
                @input="updateMetadata('jobTitle', $event.target.value)"
                placeholder="Software Engineer"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Email</label>
              <input
                :value="activeMetadata.email"
                @input="updateMetadata('email', $event.target.value)"
                placeholder="john@email.com"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Phone</label>
              <input
                :value="activeMetadata.phone"
                @input="updateMetadata('phone', $event.target.value)"
                placeholder="+1 234 567 890"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Location</label>
              <input
                :value="activeMetadata.location"
                @input="updateMetadata('location', $event.target.value)"
                placeholder="New York, USA"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">LinkedIn</label>
              <input
                :value="activeMetadata.linkedin"
                @input="updateMetadata('linkedin', $event.target.value)"
                placeholder="linkedin.com/in/johndoe"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
              />
            </div>
            <div class="col-span-2">
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Website</label>
              <input
                :value="activeMetadata.website"
                @input="updateMetadata('website', $event.target.value)"
                placeholder="johndoe.com"
                class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
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

    <!-- ── Keyboard Shortcuts Modal ── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showShortcutsModal"
        class="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
        @click.self="showShortcutsModal = false"
      >
        <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm sm:mx-4 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100">Keyboard Shortcuts</h2>
            <button @click="showShortcutsModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none">✕</button>
          </div>
          <div class="flex flex-col gap-1">
            <div v-for="s in [
              { keys: ['Ctrl', 'Z'],        label: 'Undo'                },
              { keys: ['Ctrl', 'Shift', 'Z'], label: 'Redo'             },
              { keys: ['Ctrl', 'Y'],        label: 'Redo (alternate)'    },
              { keys: ['Ctrl', 'S'],        label: 'Save (auto-saved)'   },
              { keys: ['?'],               label: 'Show this help'        },
              { keys: ['Esc'],             label: 'Close modal'           },
            ]" :key="s.label"
              class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <span class="text-xs text-gray-600 dark:text-gray-400">{{ s.label }}</span>
              <div class="flex items-center gap-1">
                <kbd
                  v-for="k in s.keys" :key="k"
                  class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                >{{ k }}</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
