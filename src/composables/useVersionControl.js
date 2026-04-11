/**
 * useVersionControl — Vue-facing wrapper over src/services/git/repo.js.
 *
 * Exposes reactive state (currentBranch, commitLog, tags, isDirty)
 * and actions (commit, revert, branch ops, tags, diff, checkout).
 *
 * Auto-commits are debounced per resume (2 s) and coalesce multiple
 * events into a single commit.
 */

import { ref, watch } from 'vue'
import * as repo from '../services/git/repo.js'
import { resumeToFiles, filesToResume, deserializeIndex } from '../services/git/serialize.js'
import { resumes, sections, activeResumeId } from './useResumeState.js'
import { clearHistory, isRestoring } from './useHistory.js'
import { getStorageAdapter } from '../services/storage/index.js'

// ─── Reactive state ───────────────────────────────────────────────────────────

export const currentBranch = ref('main')
export const commitLog     = ref([])  // commits for the current branch
export const allTags       = ref([])
export const isDirty       = ref(false)  // uncommitted changes exist
export const vcReady       = ref(false)  // repo initialised

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function initVersionControl() {
  await repo.ensureRepo()
  await refreshBranch()
  await refreshLog()
  await refreshTags()

  // Track dirty state when resumes/sections change
  watch([resumes, sections], () => {
    if (!isRestoring.value) {
      isDirty.value = true
    }
  }, { deep: true })

  vcReady.value = true
}

/**
 * Clean up version control resources (e.g., on sign-out).
 * Clears pending auto-commit timers.
 */
export function teardownVersionControl() {
  for (const resumeId of Object.keys(autoTimers)) {
    clearTimeout(autoTimers[resumeId])
    delete autoTimers[resumeId]
  }
  isDirty.value = false
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function refreshBranch() {
  currentBranch.value = (await repo.currentBranch()) || 'main'
}

async function refreshLog() {
  commitLog.value = await repo.log({ depth: 200 })
}

async function refreshTags() {
  allTags.value = await repo.listTags()
}

/** Serialise a single resume + its sections to the virtual FS. */
async function writeResumeToFs(resumeId) {
  const resume = resumes.value.find(r => r.id === resumeId)
  if (!resume) return
  const resumeSections = sections.value.filter(
    s => s.viewIds?.includes(resumeId) || s.resumeId === resumeId
  )
  const files = resumeToFiles(resume, resumeSections)
  await repo.writeFiles(files)
}

/** Serialise ALL resumes + sections to the FS (used on first init). */
async function writeAllToFs() {
  for (const resume of resumes.value) {
    await writeResumeToFs(resume.id)
  }
}

/**
 * Sync git directory to cloud storage for logged-in users.
 * Non-blocking; logs errors but doesn't throw.
 */
async function syncGitToCloud() {
  try {
    const adapter = getStorageAdapter()
    if (!adapter.saveBlob) return  // Not a cloud adapter
    const gitMap = await repo.exportGitDir()
    const gitJson = JSON.stringify(gitMap)
    await adapter.saveBlob('git-repo', gitJson)
  } catch (e) {
    console.warn('[vc] git sync failed:', e.message)
  }
}

// ─── Manual commit ────────────────────────────────────────────────────────────

/**
 * Stage all working-tree changes and create a named commit.
 * @param {string} message
 * @returns {string|null} commit OID or null if nothing changed
 */
export async function commitChanges(message) {
  await writeAllToFs()
  const oid = await repo.commit({ message, auto: false, reason: 'manual' })
  if (oid) {
    isDirty.value = false
    await refreshLog()
    await refreshTags()
    // Sync to cloud in background (non-blocking)
    syncGitToCloud().catch(() => {})
  }
  return oid
}

// ─── Auto-commit ──────────────────────────────────────────────────────────────

const autoTimers = {}  // keyed by resumeId

/**
 * Trigger a debounced auto-commit for the given resume.
 * Multiple events within 2 s are coalesced into one commit.
 */
export function scheduleAutoCommit(resumeId, reason) {
  if (isRestoring.value) return
  clearTimeout(autoTimers[resumeId])
  autoTimers[resumeId] = setTimeout(async () => {
    await writeResumeToFs(resumeId)
    const resume = resumes.value.find(r => r.id === resumeId)
    const title = resume?.title || resumeId
    const oid = await repo.commit({
      message: `Auto-save "${title}"`,
      auto: true,
      reason,
    })
    if (oid) {
      isDirty.value = false
      await refreshLog()
      // Sync to cloud in background (non-blocking)
      syncGitToCloud().catch(() => {})
    }
  }, 2000)
}

// ─── Revert ───────────────────────────────────────────────────────────────────

/**
 * Restore state to a prior commit (non-destructive: creates a new commit).
 * Rebuilds Vue state from the commit's file tree.
 */
export async function revertToCommit(oid) {
  const message = `Revert to ${oid.slice(0, 7)}`
  await repo.revertToCommit(oid, message)
  await _loadStateFromHead()
  await refreshLog()
}

/**
 * Checkout a specific commit (read-only time-travel, detached HEAD).
 * Rebuilds Vue state from the commit's file tree without committing.
 */
export async function checkoutCommit(oid) {
  await repo.checkoutCommit(oid)
  await _loadStateFromHead()
  clearHistory()
}

// ─── Branch ops ───────────────────────────────────────────────────────────────

export const branches = ref([])

export async function refreshBranches() {
  branches.value = await repo.listBranches()
}

export async function createBranch(name, fromOid) {
  await repo.createBranch(name, fromOid)
  await refreshBranches()
}

export async function switchBranch(name) {
  // Ensure working tree is clean before switching
  await writeAllToFs()
  await repo.stageAll()
  await repo.checkout(name)
  await refreshBranch()
  await refreshLog()
  await _loadStateFromHead()
  clearHistory()
}

export async function removeBranch(name) {
  await repo.deleteBranch(name)
  await refreshBranches()
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function createTag(oid, name) {
  await repo.createTag(oid, name)
  await refreshTags()
}

export async function removeTag(name) {
  await repo.deleteTag(name)
  await refreshTags()
}

// ─── Diff ─────────────────────────────────────────────────────────────────────

/**
 * Returns a structured diff between two commits.
 * Each entry: { path, type, before, after, parsed }
 * where `parsed` is the JSON-diffed object for .json files.
 */
export async function diffCommits(oidA, oidB) {
  const raw = await repo.diff(oidA, oidB)
  return raw.map(entry => {
    let parsed = null
    if (entry.path.endsWith('.json') && entry.before && entry.after) {
      try {
        const a = JSON.parse(entry.before)
        const b = JSON.parse(entry.after)
        parsed = buildObjectDiff(a, b)
      } catch { /* non-JSON */ }
    }
    return { ...entry, parsed }
  })
}

function buildObjectDiff(a, b, depth = 0) {
  if (depth > 3) return null  // don't recurse too deep
  const result = {}
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})])
  for (const k of keys) {
    const av = a?.[k]
    const bv = b?.[k]
    if (JSON.stringify(av) === JSON.stringify(bv)) continue
    if (av !== null && bv !== null && typeof av === 'object' && typeof bv === 'object') {
      const nested = buildObjectDiff(av, bv, depth + 1)
      if (nested && Object.keys(nested).length) result[k] = nested
    } else {
      result[k] = { before: av, after: bv }
    }
  }
  return result
}

// ─── Rebuild Vue state from HEAD ──────────────────────────────────────────────

async function _loadStateFromHead() {
  let headOid
  try {
    const refs = await repo.log({ depth: 1 })
    if (!refs.length) return
    headOid = refs[0].oid
  } catch { return }

  const files = await repo.readCommitFiles(headOid)

  const resumeIds = Object.keys(files)
    .filter(p => p.match(/^\/resumes\/[^/]+\.json$/))
    .map(p => p.replace('/resumes/', '').replace('.json', ''))

  const newResumes = []
  const newSections = []

  for (const id of resumeIds) {
    const result = filesToResume(id, files)
    if (result) {
      newResumes.push(result.resume)
      newSections.push(...result.sections)
    }
  }

  if (newResumes.length) {
    isRestoring.value = true
    resumes.value = newResumes
    sections.value = newSections
    isRestoring.value = false
  }

  const indexContent = files['/index.json']
  if (indexContent) {
    const idx = deserializeIndex(indexContent)
    if (idx.activeResumeId && newResumes.find(r => r.id === idx.activeResumeId)) {
      activeResumeId.value = idx.activeResumeId
    }
  }
}
