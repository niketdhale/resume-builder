<script setup>
import { ref, watch } from 'vue'
import { diffCommits } from '../../composables/useVersionControl.js'

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

function friendlyPath(path) {
  return path
    .replace('/resumes/', '')
    .replace('/sections/', ' › ')
    .replace('.json', '')
    .replace('photo.txt', 'photo')
}

function flattenDiff(parsed, prefix = '') {
  if (!parsed) return []
  const rows = []
  for (const [k, v] of Object.entries(parsed)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && ('before' in v || 'after' in v)) {
      rows.push({ key, before: v.before, after: v.after })
    } else if (v && typeof v === 'object') {
      rows.push(...flattenDiff(v, key))
    }
  }
  return rows
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
                {{ friendlyPath(change.path) }}
              </div>
              <template v-if="change.parsed">
                <div class="diff-table">
                  <div
                    v-for="row in flattenDiff(change.parsed)"
                    :key="row.key"
                    class="diff-row"
                  >
                    <span class="diff-key">{{ row.key }}</span>
                    <span class="diff-before">{{ row.before ?? '—' }}</span>
                    <span class="diff-arrow">→</span>
                    <span class="diff-after">{{ row.after ?? '—' }}</span>
                  </div>
                </div>
              </template>
              <template v-else-if="change.type === 'added'">
                <pre class="diff-raw added">{{ change.after }}</pre>
              </template>
              <template v-else-if="change.type === 'removed'">
                <pre class="diff-raw removed">{{ change.before }}</pre>
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
.label { font-size: 0.75rem; font-weight: 500; padding: 0.2rem 0.5rem; border-radius: 4px; }
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
  font-size: 0.8125rem; color: var(--ink-2); font-family: monospace;
  border-bottom: 1px solid var(--border);
}
.badge {
  font-size: 0.6875rem; font-weight: 600; text-transform: uppercase;
  padding: 0.125rem 0.4rem; border-radius: 3px;
}
.badge.added    { background: rgba(34,197,94,0.12);  color: #16a34a; }
.badge.removed  { background: rgba(220,38,38,0.1);   color: #dc2626; }
.badge.modified { background: rgba(184,146,58,0.12); color: var(--gold); }
.diff-table { padding: 0.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.3rem; }
.diff-row {
  display: grid; grid-template-columns: 1fr 1fr auto 1fr;
  align-items: start; gap: 0.5rem; font-size: 0.8rem;
}
.diff-key { color: var(--ink-3); font-family: monospace; grid-column: 1; }
.diff-before { color: #dc2626; background: rgba(220,38,38,0.06); padding: 0.1rem 0.3rem; border-radius: 3px; word-break: break-all; }
.diff-arrow  { color: var(--ink-3); }
.diff-after  { color: #16a34a; background: rgba(34,197,94,0.07); padding: 0.1rem 0.3rem; border-radius: 3px; word-break: break-all; }
.diff-raw { font-size: 0.75rem; padding: 0.5rem 0.75rem; margin: 0; overflow: auto; max-height: 200px; }
.diff-raw.added   { background: rgba(34,197,94,0.06);  color: #166534; }
.diff-raw.removed { background: rgba(220,38,38,0.05); color: #991b1b; }
</style>
