<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'

import NavBar from '../components/ui/NavBar.vue'
import LanguageVariantTabs from '../components/editor/LanguageVariantTabs.vue'
import SectionList from '../components/editor/SectionList.vue'
import PreviewPanel from '../components/preview/PreviewPanel.vue'
import CustomizePanel from '../components/customize/CustomizePanel.vue'
import MobileEditorTabs from '../components/ui/MobileEditorTabs.vue'
import VersionHistoryPanel from '../components/versions/VersionHistoryPanel.vue'
import { usePdfExport } from '../composables/usePdfExport'
import { useBreakpoint } from '../composables/useBreakpoint'

const route = useRoute()
const router = useRouter()

const resumes = inject('resumes')
const activeResumeId = inject('activeResumeId')
const activeMetadata = inject('activeMetadata')
const activePageSize = inject('activePageSize')
const savedIndicator = inject('savedIndicator')
const showMetadataModal = ref(false)

const photoInput = ref(null)
const photoDragOver = ref(false)

function handlePhotoFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => updateMetadata('photo', e.target.result)
  reader.readAsDataURL(file)
}
function onPhotoInputChange(e) { handlePhotoFile(e.target.files[0]) }
function onPhotoDrop(e) { photoDragOver.value = false; handlePhotoFile(e.dataTransfer.files[0]) }
function removePhoto() { updateMetadata('photo', ''); if (photoInput.value) photoInput.value.value = '' }

const SAMPLE_DATA = {
  fullName: 'Alex Johnson', jobTitle: 'Senior Software Engineer',
  email: 'alex.johnson@email.com', phone: '+44 7700 900123',
  location: 'London, UK', linkedin: 'linkedin.com/in/alexjohnson', website: 'alexjohnson.dev',
}

function applyPreset(preset) {
  const fields = preset === 'sample' ? SAMPLE_DATA : {
    fullName: '', jobTitle: '', email: '', phone: '', location: '', linkedin: '', website: '', photo: '',
  }
  Object.entries(fields).forEach(([key, val]) => updateMetadata(key, val))
}

const addSection     = inject('addSection')
const updateMetadata = inject('updateMetadata')
const exportJSON     = inject('exportJSON')
const onFileSelected = inject('onFileSelected')

const undo    = inject('undo')
const redo    = inject('redo')
const canUndo = inject('canUndo')
const canRedo = inject('canRedo')

const showShortcutsModal = ref(false)
useKeyboardShortcuts({ undo, redo, save: () => {}, openShortcuts: () => { showShortcutsModal.value = true } })

const showImportModal = inject('showImportModal')
const importData      = inject('importData')
const importError     = inject('importError')
const importMode      = inject('importMode')
const confirmImport   = inject('confirmImport')
const cancelImport    = inject('cancelImport')

const activeResume = computed(() => resumes.value.find((r) => r.id === activeResumeId.value) ?? null)
const { exportPdf } = usePdfExport(activePageSize, activeResume)

const activeTab        = ref('content')
const mobilePanel      = ref('content')
const showHistoryPanel = ref(false)
const { isDesktop } = useBreakpoint()

const sections = inject('sections')
onMounted(() => {
  const id = route.params.id
  const found = resumes.value.find((r) => String(r.id) === String(id))
  if (!found) { router.push({ name: 'overview' }); return }
  activeResumeId.value = found.id
  sections.value.filter((s) => s.viewIds?.includes(found.id)).forEach((s) => { s.isCollapsed = true })
})
</script>

<template>
  <div
    class="editor-root"
    @keydown.esc="showShortcutsModal = false; showMetadataModal = false"
    tabindex="-1"
  >
    <NavBar />

    <!-- ── Title bar ── -->
    <div class="editor-titlebar">
      <button class="back-btn" @click="router.push({ name: 'overview' })">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        <span class="back-label">Resumes</span>
      </button>
      <div class="titlebar-sep"></div>
      <span class="resume-name">{{ activeResume?.title || 'Untitled Resume' }}</span>
      <span v-if="savedIndicator" class="saved-badge">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Saved
      </span>
      <div style="flex:1"></div>
      <div class="undo-redo">
        <button @click="undo" :disabled="!canUndo" class="ud-btn" :class="{ 'ud-btn-disabled': !canUndo }" title="Undo (Ctrl+Z)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <div class="ud-sep"></div>
        <button @click="redo" :disabled="!canRedo" class="ud-btn" :class="{ 'ud-btn-disabled': !canRedo }" title="Redo (Ctrl+Shift+Z)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
        </button>
      </div>
      <button
        @click="showHistoryPanel = !showHistoryPanel"
        class="shortcuts-btn history-toggle-btn"
        :class="{ active: showHistoryPanel }"
        title="Version history"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>
      </button>
      <button @click="showShortcutsModal = true" class="shortcuts-btn" title="Keyboard shortcuts (?)">?</button>
    </div>

    <LanguageVariantTabs />

    <!-- ── Split panels ── -->
    <div class="editor-body">

      <!-- LEFT -->
      <div
        class="editor-left"
        :class="[
          isDesktop ? 'editor-left-desktop' : (mobilePanel !== 'preview' ? 'editor-left-mobile-show' : 'editor-left-mobile-hide'),
        ]"
      >
        <div class="left-tabs">
          <button
            @click="activeTab = 'content'; mobilePanel = 'content'"
            class="left-tab" :class="{ 'left-tab-active': isDesktop ? activeTab === 'content' : mobilePanel === 'content' }"
          >Content</button>
          <button
            @click="activeTab = 'customize'; mobilePanel = 'customize'"
            class="left-tab" :class="{ 'left-tab-active': isDesktop ? activeTab === 'customize' : mobilePanel === 'customize' }"
          >Style</button>
        </div>

        <div v-show="isDesktop ? activeTab === 'content' : mobilePanel === 'content'" class="left-content">
          <div class="content-toolbar">
            <button class="tb-ghost" @click="showMetadataModal = true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Resume Info
            </button>
            <button class="tb-primary" @click="addSection()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Section
            </button>
          </div>
          <div class="sections-scroll"><SectionList /></div>
        </div>

        <div v-show="isDesktop ? activeTab === 'customize' : mobilePanel === 'customize'" class="left-customize">
          <CustomizePanel />
        </div>
      </div>

      <!-- RIGHT -->
      <div
        class="editor-right"
        :class="[
          isDesktop ? 'editor-right-desktop' : (mobilePanel === 'preview' ? 'editor-right-mobile-show' : 'editor-right-mobile-hide'),
        ]"
      >
        <div class="preview-header">
          <h2 class="preview-label">Preview</h2>
          <div class="preview-actions">
            <label class="pv-btn pv-ghost" title="Import JSON">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Import
              <input type="file" accept=".json" class="sr-only" @change="onFileSelected($event)" />
            </label>
            <button class="pv-btn pv-ghost" @click="exportJSON">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
            <button class="pv-btn pv-dark" @click="exportPdf">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
              PDF
            </button>
          </div>
        </div>
        <div class="preview-canvas"><PreviewPanel /></div>
      </div>

      <!-- VERSION HISTORY PANEL -->
      <VersionHistoryPanel v-if="showHistoryPanel && isDesktop" />
    </div>

    <!-- Mobile tabs -->
    <div class="lg:hidden flex-shrink-0">
      <MobileEditorTabs :activePanel="mobilePanel" @update:activePanel="mobilePanel = $event" />
    </div>

    <!-- ══ IMPORT MODAL ══ -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showImportModal" class="modal-backdrop" @click.self="cancelImport">
        <div class="modal-sheet">
          <div class="modal-hd">
            <h2 class="modal-title">Import Resume</h2>
            <button class="modal-x" @click="cancelImport"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div v-if="importError" class="modal-err">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ importError }}
          </div>
          <div v-if="importData" class="import-prev">
            <p class="import-prev-lbl">File Preview</p>
            <p class="import-prev-title">{{ importData.resume.title }}</p>
            <p class="import-prev-sub">{{ importData.resume.metadata.fullName || 'No name' }} · {{ importData.sections.length }} sections</p>
          </div>
          <div v-if="importData" class="import-modes">
            <p class="import-modes-lbl">Import as:</p>
            <label class="import-mode" :class="{ 'import-mode-on': importMode === 'new' }">
              <input type="radio" v-model="importMode" value="new" style="accent-color:var(--gold)" />
              <div><p class="imode-title">Add as new resume</p><p class="imode-desc">Creates an additional resume</p></div>
            </label>
            <label class="import-mode" :class="{ 'import-mode-on': importMode === 'replace' }">
              <input type="radio" v-model="importMode" value="replace" style="accent-color:var(--gold)" />
              <div><p class="imode-title">Replace current resume</p><p class="imode-desc" style="color:#dc2626">Overwrites your current data</p></div>
            </label>
          </div>
          <div class="modal-ft">
            <button class="modal-cancel" @click="cancelImport">Cancel</button>
            <button v-if="importData" class="modal-confirm" @click="confirmImport">Import</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ METADATA MODAL ══ -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-97" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-97">
      <div v-if="showMetadataModal" class="modal-backdrop" @click.self="showMetadataModal = false">
        <div class="modal-sheet modal-lg">
          <div class="modal-hd">
            <h2 class="modal-title">Resume Info</h2>
            <div class="modal-hd-actions">
              <button class="preset-btn" @click="applyPreset('sample')">Sample data</button>
              <button class="preset-btn preset-danger" @click="applyPreset('clear')">Clear</button>
              <button class="modal-x" @click="showMetadataModal = false"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          </div>

          <!-- Photo -->
          <div class="meta-group">
            <p class="meta-group-lbl">Profile Photo</p>
            <div class="photo-row">
              <div v-if="activeMetadata.photo" class="photo-prev-wrap">
                <img :src="activeMetadata.photo" class="photo-prev" />
                <button class="photo-rm" @click="removePhoto"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <div v-else @dragover.prevent="photoDragOver = true" @dragleave="photoDragOver = false" @drop.prevent="onPhotoDrop" @click="photoInput.click()" class="photo-drop" :class="{ 'photo-drop-on': photoDragOver }">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div>
                <button class="tb-ghost" @click="photoInput.click()">{{ activeMetadata.photo ? 'Change photo' : 'Upload photo' }}</button>
                <p class="photo-hint">JPG, PNG or WebP · Drag & drop or click</p>
              </div>
              <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="onPhotoInputChange" />
            </div>
          </div>

          <!-- Fields -->
          <div class="meta-grid">
            <div v-for="f in [
              { key:'fullName', label:'Full Name', ph:'John Doe' },
              { key:'jobTitle', label:'Job Title', ph:'Software Engineer' },
              { key:'email',    label:'Email',     ph:'john@email.com' },
              { key:'phone',    label:'Phone',     ph:'+1 234 567 890' },
              { key:'location', label:'Location',  ph:'New York, USA' },
              { key:'linkedin', label:'LinkedIn',  ph:'linkedin.com/in/you' },
              { key:'website',  label:'Website',   ph:'yoursite.com', full: true },
            ]" :key="f.key" :class="f.full ? 'meta-field-full' : ''">
              <label class="meta-lbl">{{ f.label }}</label>
              <input :value="activeMetadata[f.key]" @input="updateMetadata(f.key, $event.target.value)" :placeholder="f.ph" class="meta-inp" />
            </div>
          </div>

          <div class="modal-ft">
            <div></div>
            <button class="modal-confirm" @click="showMetadataModal = false">Done</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ SHORTCUTS MODAL ══ -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-97" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showShortcutsModal" class="modal-backdrop" @click.self="showShortcutsModal = false">
        <div class="modal-sheet">
          <div class="modal-hd">
            <h2 class="modal-title">Keyboard Shortcuts</h2>
            <button class="modal-x" @click="showShortcutsModal = false"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="sc-list">
            <div v-for="s in [
              { keys:['Ctrl','Z'],           label:'Undo' },
              { keys:['Ctrl','Shift','Z'],   label:'Redo' },
              { keys:['Ctrl','Y'],           label:'Redo (alternate)' },
              { keys:['Ctrl','S'],           label:'Save (auto-saved)' },
              { keys:['?'],                  label:'Show shortcuts' },
              { keys:['Esc'],                label:'Close modal' },
            ]" :key="s.label" class="sc-row">
              <span class="sc-lbl">{{ s.label }}</span>
              <div class="sc-keys"><kbd v-for="k in s.keys" :key="k" class="kbd">{{ k }}</kbd></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.editor-root { display:flex; flex-direction:column; height:100vh; width:100vw; overflow:hidden; background:var(--bg-base); }

/* Title bar */
.editor-titlebar { display:flex; align-items:center; gap:0.5rem; padding:0 1rem; height:40px; border-bottom:1px solid var(--border); background:var(--bg-surface); flex-shrink:0; }
.back-btn { display:flex; align-items:center; gap:0.25rem; font-family:var(--font-sans); font-size:0.75rem; color:var(--ink-3); background:none; border:none; cursor:pointer; padding:0.25rem 0.375rem; border-radius:5px; transition:color .15s,background .15s; flex-shrink:0; }
.back-btn:hover { color:var(--ink); background:var(--bg-subtle); }
.back-label { display:none; }
@media (min-width:480px) { .back-label { display:inline; } }
.titlebar-sep { width:1px; height:16px; background:var(--border); flex-shrink:0; }
.resume-name { font-size:0.8125rem; font-weight:500; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; flex:1; }
.saved-badge { display:flex; align-items:center; gap:0.3rem; font-size:0.6875rem; font-weight:500; color:#16a34a; background:rgba(34,197,94,.07); border:1px solid rgba(34,197,94,.15); border-radius:99px; padding:0.125rem 0.5rem; flex-shrink:0; }
.undo-redo { display:flex; align-items:center; border:1px solid var(--border); border-radius:7px; overflow:hidden; flex-shrink:0; }
.ud-btn { display:flex; align-items:center; justify-content:center; width:30px; height:28px; background:var(--bg-surface); border:none; cursor:pointer; color:var(--ink-2); transition:background .15s,color .15s; }
.ud-btn:hover:not(.ud-btn-disabled) { background:var(--bg-subtle); color:var(--ink); }
.ud-btn-disabled { color:var(--border-2); cursor:not-allowed; }
.ud-sep { width:1px; height:16px; background:var(--border); flex-shrink:0; }
.shortcuts-btn { width:26px; height:26px; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:600; border-radius:6px; border:1px solid var(--border); background:var(--bg-surface); color:var(--ink-3); cursor:pointer; flex-shrink:0; transition:all .15s; font-family:var(--font-sans); }
.shortcuts-btn:hover { color:var(--ink); background:var(--bg-subtle); }
.history-toggle-btn.active { background: var(--gold-bg); color: var(--gold); border-color: var(--gold-border); }

/* Body */
.editor-body { display:flex; flex:1; overflow:hidden; }

/* Left */
.editor-left { display:flex; flex-direction:column; border-right:1px solid var(--border); background:var(--bg-surface); overflow:hidden; }
.editor-left-desktop { width:40%; flex-shrink:0; }
.editor-left-mobile-show { width:100%; }
.editor-left-mobile-hide { display:none; }

.left-tabs { display:flex; padding:0 1rem; border-bottom:1px solid var(--border); flex-shrink:0; background:var(--bg-surface); }
.left-tab { font-family:var(--font-sans); font-size:0.8125rem; font-weight:400; color:var(--ink-3); background:none; border:none; border-bottom:2px solid transparent; padding:0.625rem 0.75rem; cursor:pointer; transition:color .15s,border-color .15s; margin-bottom:-1px; }
.left-tab:hover { color:var(--ink); }
.left-tab-active { color:var(--ink) !important; border-bottom-color:var(--gold) !important; font-weight:500; }

.left-content { display:flex; flex-direction:column; flex:1; overflow:hidden; }
.content-toolbar { display:flex; align-items:center; justify-content:space-between; padding:0.625rem 1rem; border-bottom:1px solid var(--border); flex-shrink:0; gap:0.5rem; }
.tb-ghost { display:flex; align-items:center; gap:0.375rem; font-family:var(--font-sans); font-size:0.75rem; font-weight:400; color:var(--ink-2); background:var(--bg-surface); border:1px solid var(--border); border-radius:6px; padding:0.375rem 0.625rem; cursor:pointer; white-space:nowrap; transition:all .15s; }
.tb-ghost:hover { background:var(--bg-subtle); color:var(--ink); border-color:var(--border-2); }
.tb-primary { display:flex; align-items:center; gap:0.375rem; font-family:var(--font-sans); font-size:0.75rem; font-weight:500; color:#fff; background:var(--gold); border:none; border-radius:6px; padding:0.375rem 0.75rem; cursor:pointer; white-space:nowrap; transition:background .15s; }
.tb-primary:hover { background:var(--gold-hover); }
.sections-scroll { flex:1; overflow-y:auto; padding:1rem; }
.left-customize { flex:1; overflow:hidden; display:flex; flex-direction:column; }

/* Right */
.editor-right { display:flex; flex-direction:column; overflow:hidden; background:var(--bg-editor-preview); }
.editor-right-desktop { flex:1; }
.editor-right-mobile-show { width:100%; }
.editor-right-mobile-hide { display:none; }
.preview-header { display:flex; align-items:center; justify-content:space-between; padding:0.5rem 1rem; border-bottom:1px solid var(--border); background:var(--bg-surface); flex-shrink:0; gap:0.75rem; flex-wrap:wrap; }
.preview-label { font-size:0.6875rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-3); margin:0; }
.preview-actions { display:flex; align-items:center; gap:0.375rem; }
.pv-btn { display:flex; align-items:center; gap:0.375rem; font-family:var(--font-sans); font-size:0.6875rem; font-weight:500; border-radius:6px; padding:0.3125rem 0.625rem; cursor:pointer; white-space:nowrap; transition:all .15s; }
.pv-ghost { color:var(--ink-2); background:var(--bg-surface); border:1px solid var(--border); }
.pv-ghost:hover { background:var(--bg-subtle); color:var(--ink); border-color:var(--border-2); }
.pv-dark { color:#fff; background:var(--ink); border:none; }
.pv-dark:hover { opacity:.85; }
.preview-canvas { flex:1; overflow-y:auto; padding:1.5rem; }

/* Modals */
.modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:50; display:flex; align-items:flex-end; justify-content:center; }
@media (min-width:640px) { .modal-backdrop { align-items:center; } }
.modal-sheet { background:var(--bg-surface); border:1px solid var(--border); border-radius:16px 16px 0 0; box-shadow:0 -8px 40px rgba(0,0,0,.15); width:100%; max-height:90vh; overflow-y:auto; padding:1.5rem; display:flex; flex-direction:column; gap:1.25rem; }
@media (min-width:640px) { .modal-sheet { max-width:460px; border-radius:16px; } .modal-lg { max-width:560px; } }
.modal-hd { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
.modal-title { font-family:var(--font-display); font-size:1.25rem; font-weight:400; color:var(--ink); margin:0; letter-spacing:-.01em; }
.modal-hd-actions { display:flex; align-items:center; gap:0.5rem; }
.modal-x { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; border:1px solid var(--border); background:var(--bg-subtle); color:var(--ink-3); cursor:pointer; transition:all .15s; }
.modal-x:hover { color:var(--ink); border-color:var(--border-2); }
.modal-err { display:flex; align-items:center; gap:0.5rem; font-size:0.8125rem; color:#dc2626; background:rgba(220,38,38,.06); border:1px solid rgba(220,38,38,.15); border-radius:8px; padding:0.625rem 0.75rem; }

.import-prev { background:var(--bg-subtle); border:1px solid var(--border); border-radius:10px; padding:1rem; display:flex; flex-direction:column; gap:0.25rem; }
.import-prev-lbl { font-size:0.6875rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-3); margin:0; }
.import-prev-title { font-size:0.9375rem; font-weight:500; color:var(--ink); margin:0; }
.import-prev-sub { font-size:0.8125rem; color:var(--ink-3); margin:0; }
.import-modes { display:flex; flex-direction:column; gap:0.5rem; }
.import-modes-lbl { font-size:0.75rem; font-weight:500; color:var(--ink-2); margin:0; }
.import-mode { display:flex; align-items:flex-start; gap:0.75rem; padding:0.875rem; border:1.5px solid var(--border); border-radius:10px; cursor:pointer; transition:all .15s; }
.import-mode:hover { border-color:var(--border-2); background:var(--bg-subtle); }
.import-mode-on { border-color:var(--gold) !important; background:var(--gold-bg) !important; }
.imode-title { font-size:0.875rem; font-weight:500; color:var(--ink); margin:0; }
.imode-desc { font-size:0.75rem; color:var(--ink-3); margin:0.2rem 0 0; }

.meta-group { display:flex; flex-direction:column; gap:0.625rem; }
.meta-group-lbl { font-size:0.6875rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-3); }
.photo-row { display:flex; align-items:center; gap:0.875rem; }
.photo-prev-wrap { position:relative; flex-shrink:0; }
.photo-prev { width:56px; height:56px; border-radius:10px; object-fit:cover; border:1px solid var(--border); display:block; }
.photo-rm { position:absolute; top:-6px; right:-6px; width:18px; height:18px; border-radius:50%; background:#dc2626; color:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.photo-drop { width:56px; height:56px; border-radius:10px; border:1.5px dashed var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--ink-3); transition:all .15s; flex-shrink:0; }
.photo-drop:hover, .photo-drop-on { border-color:var(--gold); color:var(--gold); background:var(--gold-bg); }
.photo-hint { font-size:0.6875rem; color:var(--ink-3); margin:0.375rem 0 0; }

.meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.875rem; }
.meta-field-full { grid-column:1/-1; }
.meta-lbl { font-size:0.6875rem; font-weight:500; color:var(--ink-2); letter-spacing:.01em; margin-bottom:0.3rem; display:block; }
.meta-inp { font-family:var(--font-sans); font-size:0.875rem; width:100%; padding:0.5rem 0.75rem; border:1px solid var(--border); border-radius:7px; background:var(--bg-surface); color:var(--ink); outline:none; transition:border-color .18s,box-shadow .18s; box-sizing:border-box; }
.meta-inp::placeholder { color:var(--ink-3); }
.meta-inp:focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-bg); }

.preset-btn { font-family:var(--font-sans); font-size:0.6875rem; font-weight:500; color:var(--ink-2); background:var(--bg-subtle); border:1px solid var(--border); border-radius:6px; padding:0.25rem 0.625rem; cursor:pointer; transition:all .15s; }
.preset-btn:hover { color:var(--ink); border-color:var(--border-2); }
.preset-danger:hover { color:#dc2626; border-color:rgba(220,38,38,.2); background:rgba(220,38,38,.05); }

.modal-ft { display:flex; justify-content:flex-end; gap:0.625rem; padding-top:0.25rem; border-top:1px solid var(--border); }
.modal-cancel { font-family:var(--font-sans); font-size:0.875rem; font-weight:400; color:var(--ink-2); background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; padding:0.5rem 1rem; cursor:pointer; transition:all .15s; }
.modal-cancel:hover { background:var(--bg-subtle); }
.modal-confirm { font-family:var(--font-sans); font-size:0.875rem; font-weight:500; color:#fff; background:var(--gold); border:none; border-radius:8px; padding:0.5rem 1.25rem; cursor:pointer; transition:background .15s; }
.modal-confirm:hover { background:var(--gold-hover); }

.sc-list { display:flex; flex-direction:column; }
.sc-row { display:flex; align-items:center; justify-content:space-between; padding:0.625rem 0; border-bottom:1px solid var(--border); }
.sc-row:last-child { border-bottom:none; }
.sc-lbl { font-size:0.8125rem; color:var(--ink-2); }
.sc-keys { display:flex; align-items:center; gap:0.25rem; }
.kbd { font-size:0.6875rem; font-family:var(--font-sans),monospace; padding:0.125rem 0.375rem; border-radius:4px; background:var(--bg-subtle); color:var(--ink-2); border:1px solid var(--border); }

.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
</style>
