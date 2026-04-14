<script setup>
import { ref, onUnmounted } from 'vue'
import {
  commitLog, isDirty,
  commitChanges, revertToCommit, checkoutCommit,
  createTag,
} from '../../composables/useVersionControl.js'
import BranchSwitcher from './BranchSwitcher.vue'
import CommitDialog   from './CommitDialog.vue'
import DiffModal      from './DiffModal.vue'

// ─── Commit dialog ────────────────────────────────────────────────────────────
const showCommitDialog = ref(false)
async function handleCommit(message) {
  await commitChanges(message)
}

// ─── Tag dialog ───────────────────────────────────────────────────────────────
const taggingOid = ref(null)
const tagName    = ref('')
async function handleTag(oid) {
  if (!tagName.value.trim()) return
  await createTag(oid, tagName.value.trim())
  taggingOid.value = null
  tagName.value = ''
}

// ─── Revert ───────────────────────────────────────────────────────────────────
async function handleRevert(oid) {
  if (!confirm('Restore this version? A new commit will be created with the previous state.')) return
  await revertToCommit(oid)
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
async function handleCheckout(oid) {
  if (!confirm('View this version? Unsaved changes will be lost.')) return
  await checkoutCommit(oid)
}

// ─── Diff ─────────────────────────────────────────────────────────────────────
const selectedOids = ref([])
const showDiff     = ref(false)
const diffOidA     = ref('')
const diffOidB     = ref('')

function toggleSelect(oid) {
  const idx = selectedOids.value.indexOf(oid)
  if (idx >= 0) selectedOids.value.splice(idx, 1)
  else if (selectedOids.value.length < 2) selectedOids.value.push(oid)
}

function openDiff() {
  if (selectedOids.value.length !== 2) return
  diffOidA.value = selectedOids.value[1]  // older
  diffOidB.value = selectedOids.value[0]  // newer
  showDiff.value = true
}

// ─── Formatted date ──────────────────────────────────────────────────────────
function formatDate(ts) {
  const d = new Date(ts * 1000)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function shortOid(oid) { return oid?.slice(0, 7) ?? '' }

// ─── Resize ───────────────────────────────────────────────────────────────────
const panelWidth = ref(260)
const isResizing = ref(false)
let startX = 0
let startWidth = 0

function onResizeStart(e) {
  isResizing.value = true
  startX = e.clientX
  startWidth = panelWidth.value
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
}

function onResizeMove(e) {
  if (!isResizing.value) return
  const delta = startX - e.clientX  // dragging left = wider
  panelWidth.value = Math.min(480, Math.max(200, startWidth + delta))
}

function onResizeEnd() {
  isResizing.value = false
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})
</script>

<template>
  <aside class="history-panel" :style="{ width: panelWidth + 'px', minWidth: panelWidth + 'px' }">
    <!-- Resize handle -->
    <div class="resize-handle" @mousedown.prevent="onResizeStart" title="Drag to resize"></div>

    <div class="panel-header">
      <span class="panel-title">Version Control</span>
      <BranchSwitcher />
      <button class="commit-btn" @click="showCommitDialog = true">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>
        Commit
      </button>
    </div>

    <!-- Dirty indicator -->
    <div v-if="isDirty" class="dirty-banner">
      Uncommitted changes
    </div>

    <!-- Compare bar -->
    <div v-if="selectedOids.length === 2" class="compare-bar">
      <span>2/2 selected</span>
      <button class="compare-btn" @click="openDiff">Compare</button>
      <button class="clear-btn" @click="selectedOids = []">Clear</button>
    </div>
    <div v-else-if="selectedOids.length === 1" class="compare-bar">
      <span>Select one more to compare</span>
      <button class="clear-btn" @click="selectedOids = []">Clear</button>
    </div>

    <!-- Commit list with git graph -->
    <div class="commit-list">
      <div v-if="!commitLog.length" class="empty">
        No commits yet. Make some changes and click Commit.
      </div>
      <div v-else class="graph-container">
        <!-- SVG git graph column -->
        <svg
          class="git-graph-svg"
          :height="commitLog.length * 56"
          width="24"
          aria-hidden="true"
        >
          <!-- Trunk line -->
          <line
            v-if="commitLog.length > 1"
            x1="12" y1="12"
            x2="12" :y2="commitLog.length * 56 - 44"
            stroke="var(--gold)"
            stroke-width="1.5"
            stroke-dasharray="2 2"
            opacity="0.4"
          />
          <!-- Commit dots -->
          <circle
            v-for="(entry, i) in commitLog"
            :key="entry.oid"
            cx="12"
            :cy="i * 56 + 12"
            r="4"
            :fill="selectedOids.includes(entry.oid) ? 'var(--gold)' : 'var(--bg-surface)'"
            stroke="var(--gold)"
            stroke-width="1.5"
          />
        </svg>

        <!-- Commit items -->
        <div class="commit-items">
          <div
            v-for="entry in commitLog"
            :key="entry.oid"
            class="commit-item"
            :class="{ selected: selectedOids.includes(entry.oid) }"
            @click="toggleSelect(entry.oid)"
          >
            <div class="commit-top">
              <span class="commit-sha">{{ shortOid(entry.oid) }}</span>
              <span class="commit-date">{{ formatDate(entry.commit.author.timestamp) }}</span>
            </div>
            <p class="commit-msg">{{ entry.commit.message }}</p>

            <template v-if="taggingOid === entry.oid">
              <div class="tag-row">
                <input v-model="tagName" class="tag-input" placeholder="v1.0-google" autofocus
                  @keydown.enter="handleTag(entry.oid)" @keydown.escape="taggingOid = null" />
                <button class="tag-save-btn" @click="handleTag(entry.oid)">Save</button>
              </div>
            </template>

            <div class="commit-actions" @click.stop>
              <button title="Revert to this version" @click="handleRevert(entry.oid)">Revert</button>
              <button title="View this version"      @click="handleCheckout(entry.oid)">View</button>
              <button title="Tag this version"       @click="taggingOid = taggingOid === entry.oid ? null : entry.oid">Tag</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CommitDialog v-model="showCommitDialog" @confirm="handleCommit" />
    <DiffModal
      v-model="showDiff"
      :oidA="diffOidA"
      :oidB="diffOidB"
      :labelA="shortOid(diffOidA)"
      :labelB="shortOid(diffOidB)"
    />
  </aside>
</template>

<style scoped>
.history-panel {
  border-left: 1px solid var(--border);
  background: var(--bg-surface);
  display: flex; flex-direction: column;
  height: 100%; overflow: hidden;
  position: relative;
  transition: width 0s;
}

.resize-handle {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  cursor: ew-resize;
  z-index: 10;
  background: transparent;
  transition: background 0.15s;
}
.resize-handle:hover,
.resize-handle:active {
  background: var(--gold);
  opacity: 0.5;
}

.panel-header {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.panel-title { font-size: 0.8125rem; font-weight: 600; color: var(--ink); flex: 1; }
.commit-btn {
  display: flex; align-items: center; gap: 0.3rem;
  font-family: var(--font-sans); font-size: 0.75rem; font-weight: 500;
  padding: 0.3rem 0.6rem; border-radius: 6px;
  border: 1px solid var(--gold); background: var(--gold-bg); color: var(--gold);
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.commit-btn:hover { background: var(--gold); color: #fff; }

.dirty-banner {
  font-size: 0.75rem; color: #d97706;
  background: rgba(217,119,6,0.1); border-bottom: 1px solid rgba(217,119,6,0.2);
  padding: 0.375rem 0.875rem;
}

.compare-bar {
  display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
  padding: 0.375rem 0.875rem; background: var(--bg-subtle);
  border-bottom: 1px solid var(--border); font-size: 0.75rem; color: var(--ink-3);
}
.compare-btn {
  font-size: 0.75rem; font-weight: 500; padding: 0.2rem 0.5rem; border-radius: 5px;
  border: none; background: var(--gold); color: #fff; cursor: pointer;
}
.clear-btn {
  font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 5px;
  border: 1px solid var(--border); background: transparent; color: var(--ink-3); cursor: pointer;
}

.commit-list { flex: 1; overflow-y: auto; }
.empty { font-size: 0.8125rem; color: var(--ink-3); text-align: center; padding: 2rem 1rem; line-height: 1.55; }

.graph-container {
  display: flex;
  align-items: flex-start;
}

.git-graph-svg {
  flex-shrink: 0;
  padding-top: 0;
  overflow: visible;
}

.commit-items {
  flex: 1;
  min-width: 0;
}

.commit-item {
  height: 56px;
  padding: 0.4rem 0.75rem 0.4rem 0.25rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background 0.12s;
  display: flex; flex-direction: column; justify-content: center;
  gap: 0.15rem;
}
.commit-item:hover { background: var(--bg-subtle); }
.commit-item.selected { background: var(--gold-bg); border-left: 2px solid var(--gold); }

.commit-top { display: flex; justify-content: space-between; align-items: center; }
.commit-sha  { font-family: monospace; font-size: 0.6875rem; color: var(--gold); }
.commit-date { font-size: 0.6875rem; color: var(--ink-3); }
.commit-msg  {
  font-size: 0.8125rem; color: var(--ink); margin: 0; line-height: 1.3;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.commit-actions {
  display: flex; gap: 0.25rem;
}
.commit-actions button {
  font-size: 0.6rem; padding: 0.1rem 0.35rem; border-radius: 4px;
  border: 1px solid var(--border); background: transparent; color: var(--ink-3);
  cursor: pointer; transition: all 0.12s; white-space: nowrap;
}
.commit-actions button:hover { background: var(--bg-subtle); color: var(--ink); }

.tag-row { display: flex; gap: 0.3rem; margin: 0.2rem 0; }
.tag-input {
  flex: 1; font-size: 0.75rem; padding: 0.2rem 0.4rem;
  border: 1px solid var(--gold); border-radius: 4px;
  background: var(--bg-base); color: var(--ink); outline: none;
}
.tag-save-btn {
  font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px;
  border: none; background: var(--gold); color: #fff; cursor: pointer;
}
</style>
