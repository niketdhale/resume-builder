import { ref, watch } from 'vue'
import { getStorageAdapter } from '../services/storage/index.js'
import { resumes, sections, activeResumeId, resetResumeState } from './useResumeState'
import { isRestoring } from './useHistory'

// Set to true during migration to prevent stale in-memory data from writing to new user's cloud
export const suppressSaves = ref(false)

const KEYS = {
  resumes: 'resumes',
  sections: 'sections',
  active: 'active_resume_id',
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export async function saveToStorage() {
  await getStorageAdapter().save(KEYS.resumes, resumes.value)
  await getStorageAdapter().save(KEYS.sections, sections.value)
  await getStorageAdapter().save(KEYS.active, activeResumeId.value)
}

// ─── Load ─────────────────────────────────────────────────────────────────────

export async function hydrateFromStorage() {
  const savedResumes = await getStorageAdapter().load(KEYS.resumes)
  const savedSections = await getStorageAdapter().load(KEYS.sections)
  const savedActive = await getStorageAdapter().load(KEYS.active)

  if (!savedResumes?.length) {
    // Nothing in storage (e.g. after sign-out with empty local storage) — reset to defaults
    // so cloud data isn't left visible in guest mode.
    resetResumeState()
    return
  }

  resumes.value = savedResumes
  if (savedSections?.length) {
    // Migration: assign column to any section that doesn't have one yet
    savedSections.forEach((s, i) => {
      if (!s.column) s.column = i % 2 === 0 ? 'left' : 'right'
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
  watch(resumes, () => { if (!isRestoring.value && !suppressSaves.value) triggerSave() }, { deep: true })
  watch(sections, () => { if (!isRestoring.value && !suppressSaves.value) triggerSave() }, { deep: true })
  watch(activeResumeId, () => { if (!suppressSaves.value) saveToStorage() })
}
