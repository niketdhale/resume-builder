import { ref } from 'vue'
import { uid } from '../utils/uid'
import { defaultMetadata, defaultSettings } from '../constants/sectionDefaults'
import { resumes, sections, activeResumeId } from './useResumeState'

// ─── State ────────────────────────────────────────────────────────────────────

export const showImportModal = ref(false)
export const importError = ref('')
export const importData = ref(null)
export const importMode = ref('new') // 'new' | 'replace'

// ─── Export ───────────────────────────────────────────────────────────────────

export function exportJSON() {
  const resume = resumes.value.find((r) => r.id === activeResumeId.value)
  const resumeSections = sections.value.filter(
    (s) => s.sharedAcrossViews || s.viewIds.includes(activeResumeId.value),
  )
  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    resume: { ...resume },
    sections: resumeSections.map((s) => ({ ...s })),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${resume.title.replace(/\s+/g, '_')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Import — file selection ──────────────────────────────────────────────────

export function onFileSelected(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result)
      if (!parsed.resume || !parsed.sections) {
        importError.value = 'Invalid file: missing resume or sections data.'
        importData.value = null
        return
      }
      if (!parsed.resume.title || !parsed.resume.metadata) {
        importError.value = 'Invalid file: resume data is incomplete.'
        importData.value = null
        return
      }
      importError.value = ''
      importData.value = parsed
      showImportModal.value = true
    } catch {
      importError.value = 'Invalid JSON file. Please select a valid resume export.'
      importData.value = null
      showImportModal.value = true
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

// ─── Import — confirm ─────────────────────────────────────────────────────────

export function confirmImport() {
  if (!importData.value) return
  const data = importData.value
  const newId = uid()

  if (importMode.value === 'replace') {
    const r = resumes.value.find((r) => r.id === activeResumeId.value)
    if (r) {
      r.title = data.resume.title
      r.pageSize = data.resume.pageSize || 'A4'
      r.settings = { ...defaultSettings(), ...data.resume.settings }
      r.metadata = { ...defaultMetadata(), ...data.resume.metadata }
    }
    sections.value = sections.value.filter(
      (s) => s.sharedAcrossViews || !s.viewIds.includes(activeResumeId.value),
    )
    data.sections.forEach((s) => {
      sections.value.push({
        ...s,
        id: uid(),
        viewIds: [activeResumeId.value],
        sharedAcrossViews: false,
        entries: (s.entries || []).map((e) => ({ ...e, id: uid() })),
      })
    })
  } else {
    resumes.value.push({
      id: newId,
      title: data.resume.title + ' (Imported)',
      pageSize: data.resume.pageSize || 'A4',
      settings: { ...defaultSettings(), ...data.resume.settings },
      metadata: { ...defaultMetadata(), ...data.resume.metadata },
    })
    data.sections.forEach((s) => {
      sections.value.push({
        ...s,
        id: uid(),
        viewIds: [newId],
        sharedAcrossViews: false,
        entries: (s.entries || []).map((e) => ({ ...e, id: uid() })),
      })
    })
    activeResumeId.value = newId
  }

  cancelImport()
}

// ─── Import — cancel ──────────────────────────────────────────────────────────

export function cancelImport() {
  showImportModal.value = false
  importData.value = null
  importError.value = ''
}
