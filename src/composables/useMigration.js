/**
 * useMigration.js
 *
 * Migrates localStorage data → Supabase on a user's first login.
 *
 * Flow:
 *   1. SIGNED_IN auth event fires
 *   2. Check if user already has cloud data — if yes, skip (2nd device)
 *   3. Read resumes/sections/jobs/customColumns from localAdapter
 *   4. If any local data exists, write it all to cloudAdapter
 *   5. Only after all writes succeed — clear the local keys
 *   6. Trigger hydrateFromStorage() so the app reloads from cloud
 *
 * Edge cases handled:
 *   - No local data → nothing to migrate, skip silently
 *   - Cloud already has data → skip (don't overwrite)
 *   - Partial write failure → don't clear local data (safe retry next login)
 */

import { ref } from 'vue'
import { supabaseAuth } from '../services/auth/supabaseAuth.js'
import { localAdapter, cloudAdapter } from '../services/storage/index.js'

// ── Keys ──────────────────────────────────────────────────────────────────────
const KEYS = {
  resumes:  'resumes',
  sections: 'sections',
  jobs:     'jobs',
  cols:     'jobs_custom_columns',
}

// ── Migration state (reactive — consumed by NavBar toast) ─────────────────────
export const migrationState = ref('idle') // 'idle' | 'migrating' | 'done' | 'error'

// ── Guard: only run once per session ─────────────────────────────────────────
let _migrated = false

// ── Core migration ────────────────────────────────────────────────────────────

async function runMigration(userId, onComplete) {
  if (_migrated) return
  _migrated = true

  // 0. Ensure cloudAdapter has userId before any operation
  cloudAdapter.setUserId(userId)

  // 1. Check if cloud already has data for this user
  const cloudResumes = await cloudAdapter.load(KEYS.resumes)
  if (cloudResumes && cloudResumes.length > 0) {
    // User already has cloud data (returning user / 2nd device) — skip
    onComplete()
    return
  }

  // 2. Read local data
  const [localResumes, localSections, localJobs, localCols] = await Promise.all([
    localAdapter.load(KEYS.resumes),
    localAdapter.load(KEYS.sections),
    localAdapter.load(KEYS.jobs),
    localAdapter.load(KEYS.cols),
  ])

  const hasLocalData = (localResumes?.length > 0) || (localJobs?.length > 0)
  if (!hasLocalData) {
    // Guest had no data — nothing to migrate
    onComplete()
    return
  }

  // 3. Migrate
  migrationState.value = 'migrating'

  try {
    // Stamp all records with the real userId before uploading
    const stamp = (arr) =>
      (arr ?? []).map(item => ({ ...item, userId }))

    const writes = []

    if (localResumes?.length)  writes.push(cloudAdapter.save(KEYS.resumes,  stamp(localResumes)))
    if (localSections?.length) writes.push(cloudAdapter.save(KEYS.sections, stamp(localSections)))
    if (localJobs?.length)     writes.push(cloudAdapter.save(KEYS.jobs,     stamp(localJobs)))
    if (localCols?.length)     writes.push(cloudAdapter.save(KEYS.cols,     stamp(localCols)))

    const results = await Promise.all(writes)
    const allOk = results.every(Boolean)

    if (!allOk) throw new Error('One or more cloud writes failed')

    // 4. Clear local data only after successful cloud write
    await Promise.all([
      localAdapter.delete(KEYS.resumes),
      localAdapter.delete(KEYS.sections),
      localAdapter.delete(KEYS.jobs),
      localAdapter.delete(KEYS.cols),
    ])

    migrationState.value = 'done'

    // Auto-reset done state after 4s
    setTimeout(() => { migrationState.value = 'idle' }, 4000)

  } catch (err) {
    console.error('[useMigration] Migration failed:', err)
    migrationState.value = 'error'
    setTimeout(() => { migrationState.value = 'idle' }, 6000)
    // Local data is NOT cleared — safe to retry on next login
  }

  onComplete()
}

// ── Public composable ─────────────────────────────────────────────────────────

/**
 * Call once in App.vue.
 * @param {() => void} onComplete  Called after migration finishes (triggers hydrateFromStorage)
 */
export function setupMigration(onComplete) {
  supabaseAuth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user?.id) {
      await runMigration(session.user.id, onComplete)
    }
  })
}
