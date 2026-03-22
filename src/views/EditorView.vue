<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NavBar from '../components/ui/NavBar.vue'
import SectionList from '../components/editor/SectionList.vue'
import PreviewPanel from '../components/preview/PreviewPanel.vue'
import CustomizePanel from '../components/customize/CustomizePanel.vue'
import { usePdfExport } from '../composables/usePdfExport'

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

// ─── Injected actions ─────────────────────────────────────────────────────────
const addSection = inject('addSection')
const updateMetadata = inject('updateMetadata')
const exportJSON = inject('exportJSON')
const onFileSelected = inject('onFileSelected')
const addLanguageVariant = inject('addLanguageVariant')
const setBaseResume = inject('setBaseResume')
const deleteResume = inject('deleteResume')
const setActiveResume = inject('setActiveResume')

// ─── Import modal ─────────────────────────────────────────────────────────────
const showImportModal = inject('showImportModal')
const importData = inject('importData')
const importError = inject('importError')
const importMode = inject('importMode')
const confirmImport = inject('confirmImport')
const cancelImport = inject('cancelImport')

// ─── Active resume ────────────────────────────────────────────────────────────
const activeResume = computed(() =>
  resumes.value.find((r) => r.id === activeResumeId.value) ?? null,
)

// ─── Language helpers ─────────────────────────────────────────────────────────

const LANG_FLAG = {
  'English': 'GB', 'French': 'FR', 'German': 'DE', 'Spanish': 'ES',
  'Italian': 'IT', 'Portuguese': 'PT', 'Dutch': 'NL', 'Japanese': 'JP',
  'Chinese': 'CN', 'Korean': 'KR', 'Arabic': 'AR', 'Russian': 'RU', 'Hindi': 'HI',
}

const COMMON_LANGUAGES = [
  'English', 'French', 'German', 'Spanish', 'Italian', 'Portuguese',
  'Dutch', 'Japanese', 'Chinese', 'Korean', 'Arabic', 'Russian', 'Hindi',
]

function flagCode(language) {
  return LANG_FLAG[language] || language?.slice(0, 2).toUpperCase() || 'GB'
}

// Root resume of current group
const rootId = computed(() => activeResume.value?.variantOf ?? activeResume.value?.id ?? null)
const baseResume = computed(() => resumes.value.find((r) => r.id === rootId.value) ?? null)

// All tabs: base first, then variants by creation order
const languageTabs = computed(() => {
  if (!rootId.value) return []
  const base = resumes.value.find((r) => r.id === rootId.value)
  const variants = resumes.value
    .filter((r) => r.variantOf === rootId.value)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  return base ? [base, ...variants] : variants
})

const isVariant = computed(() => !!activeResume.value?.variantOf)
const usedLanguages = computed(() => languageTabs.value.map((r) => r.language))

// ─── PDF Export ───────────────────────────────────────────────────────────────
const { exportPdf } = usePdfExport(activePageSize, activeResume)

// ─── UI state ─────────────────────────────────────────────────────────────────
const activeTab = ref('content')
const showMetadataModal = ref(false)

// ─── Add Language modal ───────────────────────────────────────────────────────
const showAddLanguage = ref(false)
const selectedLanguage = ref('')
const customLanguage = ref('')
const autoTranslate = ref(false)  // placeholder — AI feature Phase 6.2

const isCustom = computed(() => selectedLanguage.value === '__custom__')
const finalLanguage = computed(() =>
  isCustom.value ? customLanguage.value.trim() : selectedLanguage.value,
)

function openAddLanguage() {
  selectedLanguage.value = ''
  customLanguage.value = ''
  autoTranslate.value = false
  showAddLanguage.value = true
}

function confirmAddLanguage() {
  if (!finalLanguage.value) return
  addLanguageVariant(activeResumeId.value, finalLanguage.value)
  showAddLanguage.value = false
}

// ─── Tab context menu (right-click) ──────────────────────────────────────────
const contextMenu = ref({ show: false, resumeId: null, x: 0, y: 0 })

function showTabMenu(e, resumeId) {
  e.preventDefault()
  e.stopPropagation()
  contextMenu.value = { show: true, resumeId, x: e.clientX, y: e.clientY }
}

function closeContextMenu() {
  contextMenu.value.show = false
}

function handleSetBase(resumeId) {
  setBaseResume(resumeId)
  closeContextMenu()
}

function handleDeleteVariant(resumeId) {
  if (activeResumeId.value === resumeId) {
    setActiveResume(rootId.value)
  }
  deleteResume(resumeId)
  closeContextMenu()
}

function switchToTab(resumeId) {
  setActiveResume(resumeId)
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  const id = parseFloat(route.params.id)
  const found = resumes.value.find((r) => r.id === id)
  if (!found) { router.push({ name: 'overview' }); return }
  activeResumeId.value = id
})
</script>

<template>
  <div
    class="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-950"
    @click="closeContextMenu"
  >
    <NavBar />

    <!-- ── Title bar + language tabs ── -->
    <div class="flex items-center gap-2 px-4 border-b flex-shrink-0 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 min-h-[44px]">
      <button
        @click="router.push({ name: 'overview' })"
        class="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 flex-shrink-0"
      >
        ← Overview
      </button>
      <div class="h-4 w-px bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

      <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
        {{ baseResume?.title || activeResume?.title || 'Resume' }}
      </span>
      <div class="h-4 w-px bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

      <!-- Language tabs -->
      <div class="flex items-center gap-0.5 overflow-x-auto flex-1 py-1 scrollbar-hide">
        <button
          v-for="tab in languageTabs"
          :key="tab.id"
          @click="switchToTab(tab.id)"
          @contextmenu="showTabMenu($event, tab.id)"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap flex-shrink-0',
            activeResumeId === tab.id
              ? 'bg-indigo-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
        >
          <span class="font-mono text-[10px] opacity-75">{{ flagCode(tab.language) }}</span>
          {{ tab.language }}
          <span
            v-if="!tab.variantOf"
            :class="[
              'text-[9px] px-1 py-0.5 rounded font-semibold',
              activeResumeId === tab.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
            ]"
          >Base</span>
          <span
            v-if="tab.variantOf"
            @click.stop="handleDeleteVariant(tab.id)"
            class="ml-0.5 opacity-60 hover:opacity-100 leading-none"
          >×</span>
        </button>

        <button
          @click.stop="openAddLanguage"
          class="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap flex-shrink-0 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
        >
          + Add Language
        </button>
      </div>

      <!-- Saved indicator -->
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <span v-if="savedIndicator" class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0 text-green-500 bg-green-50 dark:text-green-400 dark:bg-green-950/40">
          ✓ Saved at {{ formatSavedTime(lastSavedTime) }}
        </span>
      </Transition>

      <span v-if="activeResume" class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap">
        Editing: <span class="font-medium text-gray-600 dark:text-gray-300">{{ flagCode(activeResume.language) }} {{ activeResume.language }}</span>
      </span>
    </div>

    <!-- ── Split Panel ── -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left panel -->
      <div class="flex flex-col w-2/5 border-r overflow-hidden bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800">

        <!-- Variant info banner -->
        <div
          v-if="isVariant"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900 text-xs text-indigo-600 dark:text-indigo-400 flex-shrink-0"
        >
          <span class="font-mono text-[10px]">{{ flagCode(activeResume?.language) }}</span>
          Editing <strong>{{ activeResume?.language }}</strong> copy — changes only affect this language
        </div>

        <!-- Content / Customize tabs -->
        <div class="flex items-center border-b px-3 pt-2 gap-1 border-gray-200 dark:border-gray-800">
          <button
            @click="activeTab = 'content'"
            :class="['px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors', activeTab === 'content' ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800']"
          >Content</button>
          <button
            @click="activeTab = 'customize'"
            :class="['px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors', activeTab === 'customize' ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800']"
          >Customize</button>
        </div>

        <!-- Content tab -->
        <div v-if="activeTab === 'content'" class="flex flex-col flex-1 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <button @click="showMetadataModal = true" class="text-sm px-3 py-1.5 border rounded-md transition border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              ✏️ Resume Info
            </button>
            <button @click="addSection()" class="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
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

      <!-- Right: Preview -->
      <div class="flex flex-col w-3/5 overflow-hidden bg-gray-100 dark:bg-gray-950">
        <div class="flex items-center justify-between px-4 py-3 border-b gap-2 flex-wrap bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <h2 class="text-sm font-semibold uppercase tracking-wide whitespace-nowrap text-gray-600 dark:text-gray-400">
            Preview
            <span v-if="activeResume" class="ml-2 font-mono text-xs font-normal text-gray-400 dark:text-gray-500 normal-case tracking-normal">
              {{ flagCode(activeResume.language) }} {{ activeResume.language }}
            </span>
          </h2>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <label class="flex items-center gap-1 text-xs px-2.5 py-1.5 border rounded-md transition cursor-pointer whitespace-nowrap border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
              📂 Import
              <input type="file" accept=".json" class="hidden" @change="onFileSelected($event)" />
            </label>
            <button @click="exportJSON" class="text-xs px-2.5 py-1.5 border rounded-md transition whitespace-nowrap border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
              📤 Export JSON
            </button>
            <button @click="exportPdf" class="text-xs px-2.5 py-1.5 rounded-md transition whitespace-nowrap bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600">
              🖨️ Export PDF
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <PreviewPanel />
        </div>
      </div>
    </div>

    <!-- ── Tab context menu ── -->
    <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
      <div
        v-if="contextMenu.show"
        class="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[170px]"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
        @click.stop
      >
        <button @click="handleSetBase(contextMenu.resumeId)" class="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          ⭐ Set as base language
        </button>
        <div class="h-px bg-gray-100 dark:bg-gray-700 my-1" />
        <button @click="handleDeleteVariant(contextMenu.resumeId)" class="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
          🗑 Remove this language
        </button>
      </div>
    </Transition>

    <!-- ── Add Language modal ── -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showAddLanguage" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" @click.self="showAddLanguage = false">
        <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
          <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Add Language Variant</h2>
          <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">A full copy of this resume will be created for you to translate.</p>

          <!-- Language grid -->
          <div class="grid grid-cols-3 gap-2 mb-3">
            <button
              v-for="lang in COMMON_LANGUAGES"
              :key="lang"
              :disabled="usedLanguages.includes(lang)"
              @click="selectedLanguage = lang"
              :class="[
                'px-2 py-2 rounded-lg text-xs font-medium border transition text-center',
                usedLanguages.includes(lang)
                  ? 'opacity-30 cursor-not-allowed border-gray-100 dark:border-gray-700 text-gray-400'
                  : selectedLanguage === lang
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600',
              ]"
            >
              <span class="font-mono text-[10px] block opacity-60 mb-0.5">{{ flagCode(lang) }}</span>
              {{ lang }}
            </button>

            <!-- Custom -->
            <button
              @click="selectedLanguage = '__custom__'"
              :class="[
                'px-2 py-2 rounded-lg text-xs font-medium border transition text-center',
                selectedLanguage === '__custom__'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600',
              ]"
            >
              <span class="font-mono text-[10px] block opacity-60 mb-0.5">+</span>
              Custom
            </button>
          </div>

          <!-- Custom input -->
          <input
            v-if="isCustom"
            v-model="customLanguage"
            placeholder="e.g. Swedish, Thai..."
            class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 mb-3"
            @keydown.enter="confirmAddLanguage"
          />

          <!-- Auto Translate checkbox — placeholder for Phase 6.2 AI feature -->
          <label class="flex items-start gap-3 mt-2 mb-4 cursor-pointer group">
            <input
              type="checkbox"
              v-model="autoTranslate"
              disabled
              class="mt-0.5 accent-indigo-600 cursor-not-allowed"
            />
            <div>
              <p class="text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-gray-500 flex items-center gap-1.5">
                Auto Translate using AI
                <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-400 font-semibold">Coming soon</span>
              </p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                Automatically translate all content to {{ finalLanguage || 'the selected language' }} using Claude AI
              </p>
            </div>
          </label>

          <div class="flex justify-end gap-2">
            <button @click="showAddLanguage = false" class="px-4 py-2 text-sm border rounded-lg transition border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button
              @click="confirmAddLanguage"
              :disabled="!finalLanguage"
              :class="['px-4 py-2 text-sm rounded-lg transition', finalLanguage ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed']"
            >
              Add {{ finalLanguage || 'Language' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Import Modal ── -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showImportModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" @click.self="cancelImport">
        <div class="rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 bg-white dark:bg-gray-900">
          <h2 class="text-base font-semibold mb-1 text-gray-800 dark:text-gray-100">Import Resume</h2>
          <div v-if="importError" class="mb-4 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">⚠️ {{ importError }}</div>
          <div v-if="importData" class="mb-4 rounded-xl p-4 bg-gray-50 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <p class="text-xs mb-2 font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">File Preview</p>
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ importData.resume.title }}</p>
            <p class="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{{ importData.resume.metadata.fullName || 'No name' }}</p>
            <p class="text-xs mt-1 text-gray-400 dark:text-gray-500">{{ importData.sections.length }} sections</p>
          </div>
          <div v-if="importData" class="mb-5 flex flex-col gap-2">
            <p class="text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">Import as:</p>
            <label :class="['flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all', importMode === 'new' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700']">
              <input type="radio" v-model="importMode" value="new" class="accent-indigo-600 mt-0.5" />
              <div><p class="text-sm font-medium text-gray-700 dark:text-gray-200">Add as new resume</p><p class="text-xs text-gray-400 dark:text-gray-500">Creates a new resume tab</p></div>
            </label>
            <label :class="['flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all', importMode === 'replace' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700']">
              <input type="radio" v-model="importMode" value="replace" class="accent-indigo-600 mt-0.5" />
              <div><p class="text-sm font-medium text-gray-700 dark:text-gray-200">Replace current resume</p><p class="text-xs text-red-400">⚠️ This will overwrite your current resume data</p></div>
            </label>
          </div>
          <div class="flex justify-end gap-2">
            <button @click="cancelImport" class="px-4 py-2 text-sm border rounded-lg transition border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
            <button v-if="importData" @click="confirmImport" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Import</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Metadata Modal ── -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showMetadataModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" @click.self="showMetadataModal = false">
        <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
          <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Resume Info</h2>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Full Name</label><input :value="activeMetadata.fullName" @input="updateMetadata('fullName', $event.target.value)" placeholder="John Doe" class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600" /></div>
            <div><label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Job Title</label><input :value="activeMetadata.jobTitle" @input="updateMetadata('jobTitle', $event.target.value)" placeholder="Software Engineer" class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600" /></div>
            <div><label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Email</label><input :value="activeMetadata.email" @input="updateMetadata('email', $event.target.value)" placeholder="john@email.com" class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600" /></div>
            <div><label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Phone</label><input :value="activeMetadata.phone" @input="updateMetadata('phone', $event.target.value)" placeholder="+1 234 567 890" class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600" /></div>
            <div><label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Location</label><input :value="activeMetadata.location" @input="updateMetadata('location', $event.target.value)" placeholder="New York, USA" class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600" /></div>
            <div><label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">LinkedIn</label><input :value="activeMetadata.linkedin" @input="updateMetadata('linkedin', $event.target.value)" placeholder="linkedin.com/in/johndoe" class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600" /></div>
            <div class="col-span-2"><label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Website</label><input :value="activeMetadata.website" @input="updateMetadata('website', $event.target.value)" placeholder="johndoe.com" class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600" /></div>
          </div>
          <div class="flex justify-end mt-5">
            <button @click="showMetadataModal = false" class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">Done</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
