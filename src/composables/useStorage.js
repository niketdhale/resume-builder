import { ref, watch } from 'vue'
import { resumes, sections, activeResumeId } from './useResumeState'

const STORAGE_KEY_RESUMES = 'resume_builder_resumes'
const STORAGE_KEY_SECTIONS = 'resume_builder_sections'
const STORAGE_KEY_ACTIVE = 'resume_builder_active'

// ─── Save ─────────────────────────────────────────────────────────────────────

export function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(resumes.value))
    localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(sections.value))
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(activeResumeId.value))
  } catch (e) {
    console.warn('Failed to save to localStorage', e)
  }
}

// ─── Load ─────────────────────────────────────────────────────────────────────

export function loadFromStorage() {
  try {
    const savedResumes = localStorage.getItem(STORAGE_KEY_RESUMES)
    const savedSections = localStorage.getItem(STORAGE_KEY_SECTIONS)
    const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE)
    return {
      resumes: savedResumes ? JSON.parse(savedResumes) : null,
      sections: savedSections ? JSON.parse(savedSections) : null,
      active: savedActive ? JSON.parse(savedActive) : null,
    }
  } catch (e) {
    console.warn('Failed to load from localStorage', e)
    return { resumes: null, sections: null, active: null }
  }
}

// ─── Hydrate state from storage on startup ────────────────────────────────────

export function hydrateFromStorage() {
  const saved = loadFromStorage()
  if (saved.resumes) resumes.value = saved.resumes
  if (saved.sections) sections.value = saved.sections
  if (saved.active && resumes.value.find((r) => r.id === saved.active)) {
    activeResumeId.value = saved.active
  } else {
    activeResumeId.value = resumes.value[0].id
  }
}

// ─── Auto-save indicator ──────────────────────────────────────────────────────

export const savedIndicator = ref(false)
export const lastSavedTime = ref(null)

let saveTimer = null

export function triggerSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveToStorage()
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

// ─── Setup watchers ───────────────────────────────────────────────────────────

export function setupStorageWatchers() {
  watch(resumes, () => triggerSave(), { deep: true })
  watch(sections, () => triggerSave(), { deep: true })
  watch(activeResumeId, () => saveToStorage())
}
