/**
 * useDebugLogger — Resume Builder Debug Utility
 *
 * HOW TO ENABLE (in browser console):
 *   localStorage.setItem('rb_debug', '1'); location.reload()
 *
 * HOW TO DISABLE:
 *   localStorage.removeItem('rb_debug'); location.reload()
 *
 * HOW TO GET A SNAPSHOT (paste in console, then share the output):
 *   copy(window.__rbDebug.snapshot())
 *
 * HOW TO SEE LIVE STATE:
 *   window.__rbDebug.state()
 */

const IS_ENABLED = localStorage.getItem('rb_debug') === '1'

// ─── Internal log store (last 200 entries) ────────────────────────────────────
const LOG_LIMIT = 200
const _logs = []

function ts() {
  return new Date().toISOString().slice(11, 23) // HH:MM:SS.mmm
}

function push(category, level, ...args) {
  if (!IS_ENABLED) return
  const entry = { t: ts(), cat: category, level, msg: args }
  _logs.push(entry)
  if (_logs.length > LOG_LIMIT) _logs.shift()

  const styles = {
    info:  'color:#6366f1;font-weight:600',
    warn:  'color:#f59e0b;font-weight:600',
    error: 'color:#ef4444;font-weight:600',
    ok:    'color:#10b981;font-weight:600',
  }
  console.groupCollapsed(`%c[${category}] ${ts()}`, styles[level] || styles.info, ...args)
  console.trace('stack')
  console.groupEnd()
}

// ─── Public logger API ────────────────────────────────────────────────────────

export const logger = {
  enabled: IS_ENABLED,

  info:  (cat, ...args) => push(cat, 'info', ...args),
  warn:  (cat, ...args) => push(cat, 'warn', ...args),
  error: (cat, ...args) => push(cat, 'error', ...args),
  ok:    (cat, ...args) => push(cat, 'ok', ...args),

  // Pagination specific
  pagination: {
    measured: (sectionCount, headerH, heights) =>
      push('Pagination', 'info', `measured ${sectionCount} sections`, { headerH, heights }),
    pages: (pages) =>
      push('Pagination', 'ok', `${pages.length} pages`, pages.map((p, i) =>
        `page${i}: ${p.sections.length} sections [${p.sections.map(s => s.title).join(', ')}]`
      )),
    fallback: (sectionId, title) =>
      push('Pagination', 'warn', `fallback height for "${title}" (${sectionId}) — not measured`),
  },

  // Resume / variant specific
  variant: {
    creating: (language, rootId) =>
      push('Variant', 'info', `creating "${language}" variant of ${rootId}`),
    created: (newId, sectionCount) =>
      push('Variant', 'ok', `created variant ${newId} with ${sectionCount} sections`),
    setBase: (resumeId) =>
      push('Variant', 'info', `setting ${resumeId} as base`),
  },

  // Sections
  sections: {
    activated: (sections) =>
      push('Sections', 'info', `activeSections: ${sections.length}`,
        sections.map(s => `${s.title} col=${s.column} hidden=${s.isHidden} entries=${s.entries?.length}`)),
    preview: (sections) =>
      push('Sections', 'info', `previewSections: ${sections.length}`,
        sections.map(s => `${s.title} ve=${s.visibleEntries?.length}`)),
  },

  // ResumePage
  page: {
    render: (sectionsLen, isTwoCol, isMixCol, columnLayout) =>
      push('ResumePage', 'info', `render sections=${sectionsLen} twoCol=${isTwoCol} mixCol=${isMixCol}`, columnLayout),
    emptyColumns: (left, right, full) =>
      push('ResumePage', 'warn', `columns — left=${left} right=${right} full=${full}`),
  },

  // Storage
  storage: {
    hydrated: (resumeCount, sectionCount) =>
      push('Storage', 'ok', `hydrated ${resumeCount} resumes, ${sectionCount} sections`),
    migrated: (field, count) =>
      push('Storage', 'info', `migrated field "${field}" on ${count} sections`),
    saved: () =>
      push('Storage', 'ok', 'saved to localStorage'),
  },

  // Column assignment
  columns: {
    assigned: (sectionTitle, column) =>
      push('Columns', 'info', `"${sectionTitle}" → ${column}`),
    reset: (count) =>
      push('Columns', 'warn', `reset ${count} sections to column=left (1-col mode)`),
    layout: (left, right) =>
      push('Columns', 'ok', `columnLayout updated left=${left.length} right=${right.length}`),
  },
}

// ─── Snapshot — dumps full state as JSON for sharing ─────────────────────────

export function setupDebugGlobal(stateRefs) {
  if (!IS_ENABLED) return

  window.__rbDebug = {
    // Paste output of this in GitHub issue / chat
    snapshot() {
      const { resumes, sections, activeResumeId, activeSettings } = stateRefs
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        activeResumeId: activeResumeId?.value,
        resumeCount: resumes?.value?.length,
        sectionCount: sections?.value?.length,
        activeSettings: activeSettings?.value,
        resumes: resumes?.value?.map(r => ({
          id: r.id, title: r.title, language: r.language,
          variantOf: r.variantOf, columns: r.settings?.columns,
          columnLayout: r.settings?.columnLayout,
        })),
        sections: sections?.value?.map(s => ({
          id: s.id, title: s.title, resumeId: s.resumeId,
          column: s.column, isHidden: s.isHidden,
          entriesCount: s.entries?.length,
          viewIds: s.viewIds,
        })),
        logs: _logs,
      }, null, 2)
    },

    // Quick live state view
    state() {
      const { resumes, sections, activeResumeId } = stateRefs
      console.table(resumes?.value?.map(r => ({
        id: r.id, title: r.title, language: r.language, variantOf: r.variantOf,
      })))
      console.table(sections?.value
        ?.filter(s => s.resumeId === activeResumeId?.value)
        ?.map(s => ({ title: s.title, column: s.column, isHidden: s.isHidden, entries: s.entries?.length }))
      )
    },

    // Print all logs
    logs() {
      console.table(_logs.map(l => ({ time: l.t, category: l.cat, level: l.level, msg: JSON.stringify(l.msg) })))
    },

    // Clear log buffer
    clear() { _logs.length = 0; console.log('Debug logs cleared') },
  }

  console.log(
    '%c🔍 Resume Builder Debug Mode ON',
    'background:#6366f1;color:white;padding:4px 8px;border-radius:4px;font-weight:bold',
    '\n  window.__rbDebug.snapshot() — copy full state to share',
    '\n  window.__rbDebug.state()    — view live tables',
    '\n  window.__rbDebug.logs()     — view all log entries',
  )
}
