import { ref, watch } from 'vue'
import { getStorageAdapter } from '../services/storage/index.js'
import { resumes, sections, activeResumeId } from './useResumeState'

const storage = getStorageAdapter()

const KEYS = {
  resumes: 'resumes',
  sections: 'sections',
  active: 'active_resume_id',
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export async function saveToStorage() {
  await storage.save(KEYS.resumes, resumes.value)
  await storage.save(KEYS.sections, sections.value)
  await storage.save(KEYS.active, activeResumeId.value)
}

// ─── Load ─────────────────────────────────────────────────────────────────────

export async function hydrateFromStorage() {
  const savedResumes = await storage.load(KEYS.resumes)
  const savedSections = await storage.load(KEYS.sections)
  const savedActive = await storage.load(KEYS.active)

  if (savedResumes) {
    savedResumes.forEach((r) => {
      // Migration: language variant fields (phase 3.2)
      if (r.variantOf === undefined) r.variantOf = null
      if (!r.language) r.language = 'English'
    })
    resumes.value = savedResumes
  }

  if (savedSections) {
    savedSections.forEach((s, i) => {
      // Migration: column field (phase 3.1)
      if (!s.column) s.column = i % 2 === 0 ? 'left' : 'right'
      // Migration: isHidden field (phase 3.3)
      if (s.isHidden === undefined) s.isHidden = false
    })
    sections.value = savedSections
  }

  if (savedActive && resumes.value.find((r) => r.id === savedActive)) {
    activeResumeId.value = savedActive
  } else {
    activeResumeId.value = resumes.value[0]?.id
  }
}

// ─── Auto-save indicator ──────────────────────────────────────────────────────

export const savedIndicator = ref(false)
export const lastSavedTime = ref(null)
let saveTimer = null

export function triggerSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    await saveToStorage()
    lastSavedTime.value = new Date()
    savedIndicator.value = true
  }, 500)
}

export function formatSavedTime(date) {
  if (!date) return ''
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

export function setupStorageWatchers() {
  watch(resumes, () => triggerSave(), { deep: true })
  watch(sections, () => triggerSave(), { deep: true })
  watch(activeResumeId, () => saveToStorage())
}
