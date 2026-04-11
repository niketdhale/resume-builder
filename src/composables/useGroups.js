/**
 * useGroups — manage company/project groups that resumes can belong to.
 *
 * Groups live as groups/<id>.json in the virtual FS and are also tracked
 * in index.json (resumeToGroup map). Every mutation auto-commits.
 */

import { ref, computed } from 'vue'
import { uid } from '../utils/uid.js'
import * as repo from '../services/git/repo.js'
import { getFs } from '../services/git/fs.js'
import { serializeGroup, deserializeGroup, groupPath, INDEX_PATH, serializeIndex, deserializeIndex } from '../services/git/serialize.js'
import { resumes, activeResumeId } from './useResumeState.js'

// ─── State ────────────────────────────────────────────────────────────────────

export const groups = ref([])
// Map of resumeId → groupId (null = ungrouped)
export const resumeToGroup = ref({})

// ─── Computed ─────────────────────────────────────────────────────────────────

/** Returns [{ group: {id,name,color} | null, resumes: [...] }] — ungrouped last. */
export const groupedResumes = computed(() => {
  const baseResumes = resumes.value.filter(r => !r.variantOf)
  const byGroup = {}

  for (const r of baseResumes) {
    const gid = resumeToGroup.value[r.id] ?? null
    const key = gid ?? '__ungrouped__'
    if (!byGroup[key]) byGroup[key] = []
    byGroup[key].push(r)
  }

  const result = []
  for (const g of groups.value) {
    result.push({ group: g, resumes: byGroup[g.id] ?? [] })
  }
  if (byGroup['__ungrouped__']?.length) {
    result.push({ group: null, resumes: byGroup['__ungrouped__'] })
  }
  return result
})

// ─── Persistence helpers ──────────────────────────────────────────────────────

async function saveGroup(group) {
  await repo.writeFiles({ [groupPath(group.id)]: serializeGroup(group) })
}

async function saveIndex() {
  await repo.writeFiles({ [INDEX_PATH]: serializeIndex(activeResumeId.value, resumeToGroup.value) })
}

async function triggerGroupCommit() {
  await repo.stageAll()
  await repo.commit({ message: 'Update groups', auto: true, reason: 'group-change', staged: true })
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createGroup(name, color = '#B8923A') {
  const group = { id: uid(), name, color, createdAt: new Date().toISOString() }
  groups.value.push(group)
  await saveGroup(group)
  await saveIndex()
  await triggerGroupCommit()
  return group
}

export async function renameGroup(groupId, name) {
  const g = groups.value.find(g => g.id === groupId)
  if (!g) return
  g.name = name
  await saveGroup(g)
  await triggerGroupCommit()
}

export async function deleteGroup(groupId) {
  groups.value = groups.value.filter(g => g.id !== groupId)
  // Unassign all resumes from this group
  for (const [rid, gid] of Object.entries(resumeToGroup.value)) {
    if (gid === groupId) delete resumeToGroup.value[rid]
  }
  try { await repo.removeFile(groupPath(groupId)) } catch (e) { console.warn('[groups] removeFile failed:', e) }
  await saveIndex()
  await triggerGroupCommit()
}

export async function assignResumeToGroup(resumeId, groupId) {
  if (groupId === null) {
    delete resumeToGroup.value[resumeId]
  } else {
    resumeToGroup.value[resumeId] = groupId
  }
  await saveIndex()
  await triggerGroupCommit()
}

// ─── Load from FS ─────────────────────────────────────────────────────────────

export async function hydrateGroups() {
  // Read index.json for resumeToGroup mapping
  try {
    const buf = await repo.readFile(INDEX_PATH)
    if (buf) {
      const idx = deserializeIndex(buf)
      resumeToGroup.value = idx.resumeToGroup ?? {}
    }
  } catch { /* empty repo */ }

  // Read all group files
  try {
    const fs = getFs()
    let entries = []
    try { entries = await fs.promises.readdir('/groups') } catch { /* no groups yet */ }
    const loaded = []
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue
      const buf = await fs.promises.readFile(`/groups/${entry}`)
      const content = typeof buf === 'string' ? buf : new TextDecoder().decode(buf)
      loaded.push(deserializeGroup(content))
    }
    groups.value = loaded
  } catch { /* ok */ }
}
