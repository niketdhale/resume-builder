/**
 * useMigration.js
 * Migrates localStorage data → Supabase on first login.
 * Remaps all local IDs to proper UUIDs (Supabase requires uuid type).
 */

import { ref } from 'vue'
import { supabaseAuth } from '../services/auth/supabaseAuth.js'
import { localAdapter, cloudAdapter } from '../services/storage/index.js'
import { setStorageUserId } from '../services/storage/index.js'

const KEYS = {
  resumes:  'resumes',
  sections: 'sections',
  jobs:     'jobs',
  cols:     'jobs_custom_columns',
}

export const migrationState = ref('idle') // 'idle' | 'migrating' | 'done' | 'error'

let _migrated = false

function uuid() {
  return crypto.randomUUID()
}

function remapIds(resumes, sections, jobs, cols, userId) {
  const resumeIdMap  = {}
  const sectionIdMap = {}
  const jobIdMap     = {}
  const colIdMap     = {}

  ;(resumes  ?? []).forEach(r => { resumeIdMap[r.id]  = uuid() })
  ;(sections ?? []).forEach(s => { sectionIdMap[s.id] = uuid() })
  ;(jobs     ?? []).forEach(j => { jobIdMap[j.id]     = uuid() })
  ;(cols     ?? []).forEach(c => { colIdMap[c.id]     = uuid() })

  const mappedResumes = (resumes ?? []).map(r => ({
    ...r,
    id:        resumeIdMap[r.id],
    userId,
    variantOf: r.variantOf ? (resumeIdMap[r.variantOf] ?? null) : null,
  }))

  const mappedSections = (sections ?? []).map(s => ({
    ...s,
    id:       sectionIdMap[s.id],
    userId,
    resumeId: resumeIdMap[s.resumeId] ?? s.resumeId,
    viewIds:  (s.viewIds ?? []).map(vid => resumeIdMap[vid] ?? vid),
    entries:  (s.entries ?? []).map(e => ({
      ...e,
      id:        uuid(),
      userId,
      sectionId: sectionIdMap[s.id],
    })),
  }))

  const mappedJobs = (jobs ?? []).map(j => ({
    ...j,
    id:       jobIdMap[j.id],
    userId,
    resumeId: j.resumeId ? (resumeIdMap[j.resumeId] ?? null) : null,
  }))

  const mappedCols = (cols ?? []).map(c => ({
    ...c,
    id:     colIdMap[c.id],
    userId,
  }))

  return { mappedResumes, mappedSections, mappedJobs, mappedCols }
}

async function runMigration(userId, onComplete) {
  if (_migrated) return
  _migrated = true

  // Ensure storage layer routes to cloud — don't wait for Vue watch microtask
  setStorageUserId(userId)

  // 1. Skip if cloud already has data (returning user / 2nd device)
  const cloudResumes = await cloudAdapter.load(KEYS.resumes)
  if (cloudResumes && cloudResumes.length > 0) {
    onComplete(); return
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
    onComplete(); return
  }

  // 3. Remap non-UUID local IDs → proper UUIDs
  const { mappedResumes, mappedSections, mappedJobs, mappedCols } =
    remapIds(localResumes, localSections, localJobs, localCols, userId)

  // 4. Upload to Supabase
  migrationState.value = 'migrating'
  try {
    const writes = []
    if (mappedResumes.length)  writes.push(cloudAdapter.save(KEYS.resumes,  mappedResumes))
    if (mappedSections.length) writes.push(cloudAdapter.save(KEYS.sections, mappedSections))
    if (mappedJobs.length)     writes.push(cloudAdapter.save(KEYS.jobs,     mappedJobs))
    if (mappedCols.length)     writes.push(cloudAdapter.save(KEYS.cols,     mappedCols))

    const results = await Promise.all(writes)
    if (!results.every(Boolean)) throw new Error('One or more cloud writes failed')

    // 5. Clear local only after successful upload
    await Promise.all([
      localAdapter.delete(KEYS.resumes),
      localAdapter.delete(KEYS.sections),
      localAdapter.delete(KEYS.jobs),
      localAdapter.delete(KEYS.cols),
    ])
    // Also clear stale offline queue
    localStorage.removeItem('rb_offline_queue')

    migrationState.value = 'done'
    setTimeout(() => { migrationState.value = 'idle' }, 4000)
    onComplete()
  } catch (err) {
    console.error('[useMigration] Migration failed:', err)
    // Revert to local adapter so user still sees their localStorage data
    setStorageUserId('local')
    migrationState.value = 'error'
    setTimeout(() => { migrationState.value = 'idle' }, 6000)
  }
}

export function setupMigration(onComplete) {
  supabaseAuth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user?.id) {
      await runMigration(session.user.id, onComplete)
    }
  })
}
