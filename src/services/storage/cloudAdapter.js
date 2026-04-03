/**
 * cloudAdapter.js
 * Supabase storage adapter — mirrors localAdapter interface.
 *
 * Supported keys:
 *   resume_builder_resumes              → resumes table
 *   resume_builder_sections             → sections + entries tables
 *   resume_builder_active               → localStorage only (no cloud table)
 *   resume_builder_jobs                 → jobs table
 *   resume_builder_jobs_custom_columns  → custom_columns table
 *
 * Offline queue:
 *   Writes that fail due to network are stored in localStorage under
 *   'rb_offline_queue' and replayed on the next successful online save.
 */

import { supabase, hasSupabaseConfig } from '../../lib/supabase.js'

// ── Queue helpers ─────────────────────────────────────────────────────────────
const QUEUE_KEY = 'rb_offline_queue'

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') }
  catch { return [] }
}

function writeQueue(q) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
}

function enqueue(op) {
  const q = readQueue()
  const filtered = q.filter(item => item.key !== op.key)
  filtered.push({ ...op, queuedAt: Date.now() })
  writeQueue(filtered)
}

async function flushQueue(userId) {
  const q = readQueue()
  if (!q.length) return
  const remaining = []
  for (const op of q) {
    try { await _save(op.key, op.data, userId) }
    catch { remaining.push(op) }
  }
  writeQueue(remaining)
}

// ── Key constants ─────────────────────────────────────────────────────────────
// Accept both short keys ('resumes') and full keys ('resume_builder_resumes')
// to stay compatible with localAdapter callers.
const PREFIX = 'resume_builder_'
function normalise(key) {
  return key.startsWith(PREFIX) ? key : PREFIX + key
}

const RESUME_KEY         = 'resume_builder_resumes'
const SECTIONS_KEY       = 'resume_builder_sections'
const JOBS_KEY           = 'resume_builder_jobs'
const CUSTOM_COLUMNS_KEY = 'resume_builder_jobs_custom_columns'

function keyToTable(key) {
  const k = normalise(key)
  if (k === RESUME_KEY)         return 'resumes'
  if (k === SECTIONS_KEY)       return 'sections'
  if (k === JOBS_KEY)           return 'jobs'
  if (k === CUSTOM_COLUMNS_KEY) return 'custom_columns'
  return null
}

// ── Field mappers ─────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function toIso(v) {
  return v ?? new Date().toISOString()
}

function resumeToRow(r, userId) {
  return {
    id: r.id, user_id: userId,
    title: r.title ?? 'My Resume', page_size: r.pageSize ?? 'A4',
    variant_of: r.variantOf ?? null, language: r.language ?? 'English',
    settings: r.settings ?? {}, metadata: r.metadata ?? {},
    created_at: toIso(r.createdAt), updated_at: toIso(r.updatedAt),
  }
}
function rowToResume(row) {
  return {
    id: row.id, userId: row.user_id,
    title: row.title, pageSize: row.page_size,
    variantOf: row.variant_of, language: row.language,
    settings: row.settings, metadata: row.metadata,
    createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

function sectionToRow(s, userId) {
  return {
    id: s.id, user_id: userId, resume_id: s.resumeId,
    title: s.title ?? '', type: s.type ?? 'generic',
    col: s.column ?? 'full',
    is_hidden: s.isHidden ?? false, is_collapsed: s.isCollapsed ?? false,
    shared_across_views: s.sharedAcrossViews ?? false,
    // Filter to valid UUIDs only — legacy local IDs (e.g. 'resume_001') would
    // fail the uuid[] column type cast and cause a 400 from PostgREST.
    view_ids: (s.viewIds ?? []).filter(id => UUID_RE.test(id)),
    order_index: s.orderIndex ?? 0,
    created_at: toIso(s.createdAt), updated_at: toIso(s.updatedAt),
  }
}
function rowToSection(row) {
  return {
    id: row.id, userId: row.user_id, resumeId: row.resume_id,
    title: row.title, type: row.type, column: row.col,
    isHidden: row.is_hidden, isCollapsed: row.is_collapsed,
    sharedAcrossViews: row.shared_across_views,
    viewIds: row.view_ids, orderIndex: row.order_index,
    entries: [],
    createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

function jobToRow(j, userId) {
  return {
    id: j.id, user_id: userId,
    title: j.title ?? '', company: j.company ?? '',
    location: j.location ?? '', salary: String(j.salary ?? ''),
    currency: j.currency ?? 'USD', status: j.status ?? 'applied',
    priority: j.priority ?? 'medium', applied_date: j.appliedDate ?? null,
    resume_id: j.resumeId ?? null, notes: j.notes ?? '',
    url: j.url ?? '', attachments: j.attachments ?? [],
    custom_fields: j.customFields ?? {},
    created_at: toIso(j.createdAt), updated_at: toIso(j.updatedAt),
  }
}
function rowToJob(row) {
  return {
    id: row.id, userId: row.user_id,
    title: row.title, company: row.company,
    location: row.location, salary: row.salary,
    currency: row.currency, status: row.status,
    priority: row.priority, appliedDate: row.applied_date,
    resumeId: row.resume_id, notes: row.notes,
    url: row.url, attachments: row.attachments,
    customFields: row.custom_fields,
    createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

function customColToRow(c, userId, i) {
  return { id: c.id, user_id: userId, label: c.label ?? '', type: c.type ?? 'text', order_index: i }
}
function rowToCustomCol(row) {
  return { id: row.id, userId: row.user_id, label: row.label, type: row.type, orderIndex: row.order_index }
}

// ── Upsert + orphan cleanup ───────────────────────────────────────────────────

async function upsertRows(table, rows) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' })
  if (error) throw error
}

async function deleteOrphans(table, userId, ids) {
  if (!ids.length) return
  const { error } = await supabase.from(table).delete()
    .eq('user_id', userId).not('id', 'in', `(${ids.join(',')})`)
  if (error) throw error
}

async function upsertEntries(sections, userId) {
  const allEntries = sections.flatMap((s) =>
    (s.entries ?? []).map((e, i) => ({
      id: e.id, user_id: userId, section_id: s.id,
      data: e.data ?? e,
      is_visible: e.isVisible ?? true,
      order_index: e.orderIndex ?? i,
      created_at: e.createdAt, updated_at: e.updatedAt,
    }))
  )
  if (!allEntries.length) return
  await upsertRows('entries', allEntries)
  await deleteOrphans('entries', userId, allEntries.map(e => e.id))
}

// ── Internal save ─────────────────────────────────────────────────────────────

async function _save(rawKey, data, userId) {
  const arr = data ?? []

  const key = normalise(rawKey)
  if (key === RESUME_KEY) {
    const rows = arr.map(r => resumeToRow(r, userId))
    if (rows.length) await upsertRows('resumes', rows)
    await deleteOrphans('resumes', userId, rows.map(r => r.id))
  }
  else if (key === SECTIONS_KEY) {
    const rows = arr.map(s => sectionToRow(s, userId))
    if (rows.length) await upsertRows('sections', rows)
    await deleteOrphans('sections', userId, rows.map(r => r.id))
    await upsertEntries(arr, userId)
  }
  else if (key === JOBS_KEY) {
    const rows = arr.map(j => jobToRow(j, userId))
    if (rows.length) await upsertRows('jobs', rows)
    await deleteOrphans('jobs', userId, rows.map(r => r.id))
  }
  else if (key === CUSTOM_COLUMNS_KEY) {
    const rows = arr.map((c, i) => customColToRow(c, userId, i))
    if (rows.length) await upsertRows('custom_columns', rows)
    await deleteOrphans('custom_columns', userId, rows.map(r => r.id))
  }
}

// ── Public adapter ────────────────────────────────────────────────────────────

export const cloudAdapter = {
  _userId: null,

  setUserId(id) { this._userId = id },

  async save(key, data) {
    const userId = this._userId
    if (!userId || !hasSupabaseConfig) return false

    if (!navigator.onLine) {
      enqueue({ key, data })
      return true  // optimistic
    }
    try {
      await _save(key, data, userId)
      await flushQueue(userId)
      return true
    } catch (err) {
      console.warn('[cloudAdapter] save failed, queuing:', err.message)
      enqueue({ key, data })
      return false
    }
  },

  async load(rawKey) {
    const userId = this._userId
    if (!userId || !hasSupabaseConfig) return null

    try {
      const key = normalise(rawKey)
  if (key === RESUME_KEY) {
        const { data, error } = await supabase.from('resumes').select('*').eq('user_id', userId)
        if (error) throw error
        return (data ?? []).map(rowToResume)
      }

      if (key === SECTIONS_KEY) {
        const [sectRes, entRes] = await Promise.all([
          supabase.from('sections').select('*').eq('user_id', userId),
          supabase.from('entries').select('*').eq('user_id', userId),
        ])
        if (sectRes.error) throw sectRes.error
        if (entRes.error)  throw entRes.error

        const entryMap = {}
        for (const row of (entRes.data ?? [])) {
          if (!entryMap[row.section_id]) entryMap[row.section_id] = []
          entryMap[row.section_id].push({
            id: row.id, userId: row.user_id, sectionId: row.section_id,
            ...row.data,
            isVisible: row.is_visible, orderIndex: row.order_index,
            createdAt: row.created_at, updatedAt: row.updated_at,
          })
        }

        return (sectRes.data ?? []).map(row => ({
          ...rowToSection(row),
          entries: (entryMap[row.id] ?? []).sort((a, b) => a.orderIndex - b.orderIndex),
        }))
      }

      if (key === JOBS_KEY) {
        const { data, error } = await supabase.from('jobs').select('*').eq('user_id', userId)
        if (error) throw error
        return (data ?? []).map(rowToJob)
      }

      if (key === CUSTOM_COLUMNS_KEY) {
        const { data, error } = await supabase.from('custom_columns').select('*')
          .eq('user_id', userId).order('order_index')
        if (error) throw error
        return (data ?? []).map(rowToCustomCol)
      }

      return null
    } catch (err) {
      console.error('[cloudAdapter] load error:', err.message)
      return null
    }
  },

  async delete(key) {
    const userId = this._userId
    if (!userId || !hasSupabaseConfig) return false
    const table = keyToTable(key)
    if (!table) return false
    try {
      const { error } = await supabase.from(table).delete().eq('user_id', userId)
      if (error) throw error
      return true
    } catch (err) {
      console.error('[cloudAdapter] delete error:', err.message)
      return false
    }
  },

  async list() { return [] },

  hasPendingWrites() { return readQueue().length > 0 },

  async flush() {
    if (!this._userId || !navigator.onLine) return
    await flushQueue(this._userId)
  },
}
