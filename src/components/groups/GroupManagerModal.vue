<script setup>
import { ref } from 'vue'
import { groups, createGroup, renameGroup, deleteGroup } from '../../composables/useGroups.js'

const emit = defineEmits(['update:modelValue'])
defineProps({ modelValue: Boolean })

const newGroupName  = ref('')
const editingId     = ref(null)
const editingName   = ref('')

async function handleCreate() {
  if (!newGroupName.value.trim()) return
  await createGroup(newGroupName.value.trim())
  newGroupName.value = ''
}

function startEdit(g) {
  editingId.value   = g.id
  editingName.value = g.name
}

async function saveEdit() {
  if (!editingName.value.trim()) return
  await renameGroup(editingId.value, editingName.value.trim())
  editingId.value = null
}

async function handleDelete(id) {
  if (!confirm('Delete this group? Resumes inside will become ungrouped.')) return
  await deleteGroup(id)
}

function close() { emit('update:modelValue', false) }
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="backdrop" @click.self="close">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Manage groups</h2>
          <button class="close-btn" @click="close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- New group row -->
          <div class="new-row">
            <input
              v-model="newGroupName"
              class="new-input"
              placeholder="Company or project name…"
              @keydown.enter="handleCreate"
            />
            <button class="add-btn" :disabled="!newGroupName.trim()" @click="handleCreate">Add</button>
          </div>

          <!-- Existing groups -->
          <div v-if="!groups.length" class="empty">No groups yet.</div>
          <div class="group-list">
            <div v-for="g in groups" :key="g.id" class="group-row">
              <span class="group-dot" :style="{ background: g.color }" />
              <template v-if="editingId === g.id">
                <input
                  v-model="editingName"
                  class="edit-input"
                  autofocus
                  @keydown.enter="saveEdit"
                  @keydown.escape="editingId = null"
                />
                <button class="save-btn" @click="saveEdit">Save</button>
              </template>
              <template v-else>
                <span class="group-name">{{ g.name }}</span>
                <div class="group-actions">
                  <button @click="startEdit(g)" title="Rename">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button @click="handleDelete(g.id)" title="Delete" class="del-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
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
.backdrop {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
}
.modal {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 14px;
  width: min(440px, 94vw);
  box-shadow: 0 24px 64px -12px rgba(0,0,0,0.18);
}
.modal-header {
  display: flex; align-items: center; padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border); gap: 0.75rem;
}
.modal-title { font-family: var(--font-display); font-size: 1rem; font-weight: 400; color: var(--ink); margin: 0; flex: 1; }
.close-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; border: none; background: transparent; color: var(--ink-3); cursor: pointer; }
.close-btn:hover { background: var(--bg-subtle); }
.modal-body { padding: 1.25rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.new-row { display: flex; gap: 0.5rem; }
.new-input {
  flex: 1; font-size: 0.875rem; padding: 0.5rem 0.75rem;
  border: 1px solid var(--border); border-radius: 8px;
  background: var(--bg-base); color: var(--ink); outline: none;
}
.new-input:focus { border-color: var(--gold); }
.add-btn {
  font-size: 0.8125rem; font-weight: 500; padding: 0.5rem 1rem; border-radius: 8px;
  border: none; background: var(--gold); color: #fff; cursor: pointer; white-space: nowrap;
}
.add-btn:disabled { opacity: 0.45; cursor: default; }
.empty { font-size: 0.8125rem; color: var(--ink-3); text-align: center; padding: 1rem 0; }
.group-list { display: flex; flex-direction: column; gap: 0.5rem; }
.group-row {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: 8px;
  background: var(--bg-base);
}
.group-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.group-name { font-size: 0.875rem; color: var(--ink); flex: 1; }
.group-actions { display: flex; gap: 0.25rem; }
.group-actions button {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  border-radius: 5px; border: 1px solid var(--border); background: transparent; color: var(--ink-3); cursor: pointer;
}
.group-actions button:hover { background: var(--bg-subtle); color: var(--ink); }
.del-btn:hover { background: rgba(220,38,38,0.06) !important; color: #dc2626 !important; border-color: rgba(220,38,38,0.2) !important; }
.edit-input {
  flex: 1; font-size: 0.875rem; padding: 0.25rem 0.5rem;
  border: 1px solid var(--gold); border-radius: 5px;
  background: var(--bg-base); color: var(--ink); outline: none;
}
.save-btn {
  font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 5px;
  border: none; background: var(--gold); color: #fff; cursor: pointer;
}
</style>
