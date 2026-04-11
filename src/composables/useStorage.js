import { ref, watch } from 'vue'
import { getStorageAdapter } from '../services/storage/index.js'
import { resumes, sections, activeResumeId, resetResumeState } from './useResumeState'
import { isRestoring } from './useHistory'
import { initVersionControl, teardownVersionControl } from './useVersionControl.js'
import { hydrateGroups } from './useGroups.js'
import * as repo from '../services/git/repo.js'

// Set to true during migration to prevent stale in-memory data from writing to new user's cloud
export const suppressSaves = ref(false)

const KEYS = {
  resumes: 'resumes',
  sections: 'sections',
  active: 'active_resume_id',
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export async function saveToStorage() {
  const adapter = getStorageAdapter()
  const r1 = await adapter.save(KEYS.resumes, resumes.value)
  const r2 = await adapter.save(KEYS.sections, sections.value)
  await adapter.save(KEYS.active, activeResumeId.value)
  return r1 !== false && r2 !== false
}

// ─── Load ─────────────────────────────────────────────────────────────────────

/**
 * Restore git history from cloud storage for logged-in users.
 * Non-blocking; logs errors but doesn't throw.
 */
async function restoreGitFromCloud() {
  try {
    const adapter = getStorageAdapter()
    if (!adapter.loadBlob) return  // Not a cloud adapter
    const gitJson = await adapter.loadBlob('git-repo')
    if (!gitJson) return  // No backup exists
    const gitMap = JSON.parse(gitJson)
    await repo.importGitDir(gitMap)
  } catch (e) {
    console.warn('[storage] git restore failed:', e.message)
  }
}

export async function hydrateFromStorage() {
  // Restore git history from cloud (if available) before initializing VC
  try {
    await restoreGitFromCloud()
  } catch (e) {
    console.warn('[storage] git restore failed:', e)
  }

  // Bootstrap the git repo
  try {
    await initVersionControl()
    await hydrateGroups()
  } catch (e) {
    console.warn('[storage] git init failed:', e)
  }

  const savedResumes = await getStorageAdapter().load(KEYS.resumes)
  const savedSections = await getStorageAdapter().load(KEYS.sections)
  const savedActive = await getStorageAdapter().load(KEYS.active)

  if (!savedResumes?.length) {
    // Nothing in storage (e.g. after sign-out with empty local storage) — reset to defaults
    // so cloud data isn't left visible in guest mode.
    teardownVersionControl()
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

// ─── Sync status ─────────────────────────────────────────────────────────────
// 'idle'    — no recent activity
// 'saving'  — debounce fired, write in-flight
// 'synced'  — last write succeeded (resets to idle after 3s)
// 'pending' — last write failed, data queued for retry

export const syncStatus = ref('idle')
export const lastSavedTime = ref(null)

// kept for backward-compat with anything still injecting savedIndicator
export const savedIndicator = ref(false)

let saveTimer = null

export function triggerSave() {
  syncStatus.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    const ok = await saveToStorage()
    lastSavedTime.value = new Date()
    savedIndicator.value = ok
    syncStatus.value = ok ? 'synced' : 'pending'
    // Reset to idle after 3s
    if (ok) {
      setTimeout(() => {
        syncStatus.value = 'idle'
      }, 3000)
    }
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
