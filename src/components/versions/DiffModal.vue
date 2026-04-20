<script setup>
import { ref, watch, computed } from 'vue'
import { diffCommits } from '../../composables/useVersionControl.js'
import { sections } from '../../composables/useResumeState.js'

const props = defineProps({
  modelValue: Boolean,
  oidA: String,
  oidB: String,
  labelA: { type: String, default: 'A' },
  labelB: { type: String, default: 'B' },
})
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const changes = ref([])

watch(() => props.modelValue, async (open) => {
  if (!open || !props.oidA || !props.oidB) return
  loading.value = true
  changes.value = await diffCommits(props.oidA, props.oidB)
  loading.value = false
})

function close() { emit('update:modelValue', false) }

// Build a lookup: sectionId → section title
const sectionTitleById = computed(() => {
  const map = {}
  for (const s of sections.value) {
    map[s.id] = s.title
  }
  return map
})

// Fields to hide (noise)
const NOISE_KEYS = new Set(['updatedAt', 'createdAt', 'syncedAt', 'id', 'resumeId'])

// Convert a raw dot-path like "entries.2.content" to "Entry 3 › Content"
function formatKey(key) {
  const parts = key.split('.')
  const result = []
  let i = 0
  while (i < parts.length) {
    const p = parts[i]
    // numeric index: combine with previous label
    if (/^\d+$/.test(p)) {
      const num = parseInt(p, 10) + 1
      if (result.length) {
        result[result.length - 1] += ` ${num}`
      } else {
        result.push(`Item ${num}`)
      }
    } else {
      result.push(humanize(p))
    }
    i++
  }
  return result.join(' › ')
}

function humanize(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

// Parse the file path into a readable label
function friendlyPath(path) {
  // /resumes/<id>/sections/<sid>.json  → section name
  const secMatch = path.match(/\/resumes\/[^/]+\/sections\/([^/]+)\.json$/)
  if (secMatch) {
    const sid = secMatch[1]
    const title = sectionTitleById.value[sid] || sectionTitleById.value[parseFloat(sid)]
    return title ? `Section: ${title}` : `Section (${sid.slice(0, 8)}…)`
  }
  // /resumes/<id>.json
  if (path.match(/\/resumes\/[^/]+\.json$/)) return 'Resume settings'
  // /resumes/<id>/photo.txt
  if (path.match(/\/photo\.txt$/)) return 'Profile photo'
  // /index.json
  if (path === '/index.json') return 'Index'
  // /groups/<id>.json
  if (path.match(/\/groups\//)) return 'Group'
  return path
}

// Flatten parsed diff, filtering noise fields
function flattenDiff(parsed, prefix = '') {
  if (!parsed) return []
  const rows = []
  for (const [k, v] of Object.entries(parsed)) {
    if (NOISE_KEYS.has(k)) continue
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && ('before' in v || 'after' in v)) {
      rows.push({ key, before: v.before, after: v.after })
    } else if (v && typeof v === 'object') {
      rows.push(...flattenDiff(v, key))
    }
  }
  return rows
}

function truncate(val, len = 120) {
  const s = val == null ? '—' : String(val)
  return s.length > len ? s.slice(0, len) + '…' : s
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop" @click.self="close">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Compare versions</h2>
          <div class="modal-labels">
            <span class="label label-a">{{ labelA }}</span>
            <span class="label-arrow">→</span>
            <span class="label label-b">{{ labelB }}</span>
          </div>
          <button class="close-btn" @click="close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="loading" class="loading">Loading diff…</div>
          <div v-else-if="!changes.length" class="empty">No differences found between these versions.</div>
          <div v-else class="change-list">
            <div v-for="(change, i) in changes" :key="i" class="change-item">
              <div class="change-path">
                <span class="badge" :class="change.type">{{ change.type }}</span>
                <span class="path-label">{{ friendlyPath(change.path) }}</span>
              </div>

              <template v-if="change.parsed">
                <div class="diff-table">
                  <template v-for="row in flattenDiff(change.parsed)" :key="row.key">
                    <div class="diff-row">
                      <span class="diff-key">{{ formatKey(row.key) }}</span>
                      <div class="diff-values">
                        <span class="diff-before">{{ truncate(row.before) }}</span>
                        <svg class="diff-arrow-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        <span class="diff-after">{{ truncate(row.after) }}</span>
                      </div>
                    </div>
                  </template>
                  <div v-if="flattenDiff(change.parsed).length === 0" class="no-visible-changes">
                    Only metadata fields changed (timestamps, IDs).
                  </div>
                </div>
              </template>
              <template v-else-if="change.type === 'added'">
                <div class="diff-summary added-summary">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  New item added
                </div>
              </template>
              <template v-else-if="change.type === 'removed'">
                <div class="diff-summary removed-summary">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Item removed
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 210;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 14px;
  width: min(680px, 96vw); max-height: 80vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 64px -12px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border);
}
.modal-title { font-family: var(--font-display); font-size: 1rem; font-weight: 400; color: var(--ink); margin: 0; flex: 1; }
.modal-labels { display: flex; align-items: center; gap: 0.375rem; }
.label { font-size: 0.75rem; font-weight: 500; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: monospace; }
.label-a { background: rgba(220,38,38,0.1); color: #dc2626; }
.label-b { background: rgba(34,197,94,0.1); color: #16a34a; }
.label-arrow { font-size: 0.75rem; color: var(--ink-3); }
.close-btn {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; border: none; background: transparent; color: var(--ink-3); cursor: pointer;
}
.close-btn:hover { background: var(--bg-subtle); color: var(--ink); }
.modal-body { overflow-y: auto; padding: 1rem 1.5rem 1.5rem; }
.loading, .empty { font-size: 0.875rem; color: var(--ink-3); text-align: center; padding: 2rem 0; }
.change-list { display: flex; flex-direction: column; gap: 1rem; }
.change-item { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }

.change-path {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.75rem; background: var(--bg-subtle);
  border-bottom: 1px solid var(--border);
}
.path-label { font-size: 0.8125rem; color: var(--ink-2); font-weight: 500; }

.badge {
  font-size: 0.6875rem; font-weight: 600; text-transform: uppercase;
  padding: 0.125rem 0.4rem; border-radius: 3px; flex-shrink: 0;
}
.badge.added    { background: rgba(34,197,94,0.12);  color: #16a34a; }
.badge.removed  { background: rgba(220,38,38,0.1);   color: #dc2626; }
.badge.modified { background: rgba(0,94,180,0.12); color: var(--gold); }

.diff-table { padding: 0.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }

.diff-row {
  display: flex; flex-direction: column; gap: 0.2rem;
}
.diff-key {
  font-size: 0.6875rem; font-weight: 600; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.03em;
}
.diff-values {
  display: flex; align-items: flex-start; gap: 0.5rem;
  font-size: 0.8125rem;
}
.diff-before {
  flex: 1; color: #dc2626; background: rgba(220,38,38,0.06);
  padding: 0.2rem 0.4rem; border-radius: 4px; word-break: break-word; min-width: 0;
}
.diff-after {
  flex: 1; color: #16a34a; background: rgba(34,197,94,0.07);
  padding: 0.2rem 0.4rem; border-radius: 4px; word-break: break-word; min-width: 0;
}
.diff-arrow-icon { flex-shrink: 0; color: var(--ink-3); margin-top: 0.3rem; }

.no-visible-changes {
  font-size: 0.8125rem; color: var(--ink-3); font-style: italic; padding: 0.25rem 0;
}

.diff-summary {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.8125rem; padding: 0.625rem 0.75rem;
}
.added-summary   { color: #16a34a; }
.removed-summary { color: #dc2626; }
</style>
