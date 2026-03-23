/**
 * useHistory — snapshot-based undo/redo for resume + sections state.
 *
 * Strategy:
 * - Snapshots are taken BEFORE each action (pre-action state).
 * - Photos (base64) are stripped from snapshots to keep memory light.
 * - Max 50 snapshots; oldest dropped when exceeded.
 * - 500ms debounce prevents typing from creating hundreds of entries.
 * - isRestoring flag prevents storage watchers from double-firing.
 */

import { ref, computed } from 'vue'
import { resumes, sections } from './useResumeState'

const HISTORY_LIMIT = 50
const PHOTO_SENTINEL = '__photo__'

// ─── State ────────────────────────────────────────────────────────────────────
const past   = ref([])   // array of snapshots (oldest → newest)
const future = ref([])   // array of snapshots for redo

export const isRestoring = ref(false)

// ─── Computed ─────────────────────────────────────────────────────────────────
export const canUndo = computed(() => past.value.length > 0)
export const canRedo = computed(() => future.value.length > 0)

// ─── Snapshot helpers ─────────────────────────────────────────────────────────

function stripPhotos(resumeList) {
  return resumeList.map((r) => ({
    ...r,
    metadata: {
      ...r.metadata,
      photo: r.metadata?.photo ? PHOTO_SENTINEL : '',
    },
    settings: { ...r.settings },
  }))
}

function restorePhotos(snapResumes, liveResumes) {
  return snapResumes.map((sr) => {
    const live = liveResumes.find((lr) => lr.id === sr.id)
    return {
      ...sr,
      metadata: {
        ...sr.metadata,
        // Restore actual photo from live state — photo changes are handled separately
        photo: sr.metadata.photo === PHOTO_SENTINEL ? (live?.metadata?.photo || '') : sr.metadata.photo,
      },
    }
  })
}

function takeSnapshot() {
  return {
    resumes:  stripPhotos(JSON.parse(JSON.stringify(resumes.value))),
    sections: JSON.parse(JSON.stringify(sections.value)),
  }
}

// ─── Debounce ─────────────────────────────────────────────────────────────────
let debounceTimer = null

export function pushHistory(immediate = false) {
  if (isRestoring.value) return

  const commit = () => {
    const snap = takeSnapshot()
    past.value.push(snap)
    if (past.value.length > HISTORY_LIMIT) past.value.shift()
    future.value = []  // clear redo stack on new action
  }

  if (immediate) {
    clearTimeout(debounceTimer)
    commit()
  } else {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(commit, 500)
  }
}

// ─── Undo ─────────────────────────────────────────────────────────────────────
export function undo() {
  if (!canUndo.value) return

  isRestoring.value = true

  // Save current state to redo stack
  future.value.push(takeSnapshot())

  // Restore previous state
  const snap = past.value.pop()
  resumes.value  = restorePhotos(snap.resumes,  resumes.value)
  sections.value = snap.sections

  isRestoring.value = false
}

// ─── Redo ─────────────────────────────────────────────────────────────────────
export function redo() {
  if (!canRedo.value) return

  isRestoring.value = true

  // Save current state to undo stack
  past.value.push(takeSnapshot())

  // Restore next state
  const snap = future.value.pop()
  resumes.value  = restorePhotos(snap.resumes,  resumes.value)
  sections.value = snap.sections

  isRestoring.value = false
}

// ─── Clear (used on resume switch) ───────────────────────────────────────────
export function clearHistory() {
  past.value   = []
  future.value = []
  clearTimeout(debounceTimer)
}
