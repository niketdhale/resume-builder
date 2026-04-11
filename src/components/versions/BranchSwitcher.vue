<script setup>
import { ref, onMounted } from 'vue'
import {
  currentBranch, branches, switchBranch, createBranch, refreshBranches
} from '../../composables/useVersionControl.js'

const showDropdown = ref(false)
const creating     = ref(false)
const newBranchName = ref('')

onMounted(() => refreshBranches())

async function handleSwitch(name) {
  if (name === currentBranch.value) { showDropdown.value = false; return }
  await switchBranch(name)
  showDropdown.value = false
}

async function handleCreate() {
  if (!newBranchName.value.trim()) return
  await createBranch(newBranchName.value.trim())
  await handleSwitch(newBranchName.value.trim())
  newBranchName.value = ''
  creating.value = false
}
</script>

<template>
  <div class="branch-switcher" v-click-outside="() => showDropdown = false">
    <button class="branch-btn" @click="showDropdown = !showDropdown">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
      {{ currentBranch }}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
    </button>

    <div v-if="showDropdown" class="branch-dropdown">
      <div class="branch-list">
        <button
          v-for="b in branches"
          :key="b"
          class="branch-item"
          :class="{ active: b === currentBranch }"
          @click="handleSwitch(b)"
        >
          <svg v-if="b === currentBranch" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span v-else style="width:11px; display:inline-block"/>
          {{ b }}
        </button>
      </div>
      <div class="branch-divider"/>
      <div v-if="creating" class="branch-create">
        <input
          v-model="newBranchName"
          class="branch-input"
          placeholder="branch-name"
          autofocus
          @keydown.enter="handleCreate"
          @keydown.escape="creating = false"
        />
        <button class="branch-create-btn" @click="handleCreate">Create</button>
      </div>
      <button v-else class="branch-new-btn" @click="creating = true">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New branch
      </button>
    </div>
  </div>
</template>

<style scoped>
.branch-switcher { position: relative; }
.branch-btn {
  display: flex; align-items: center; gap: 0.35rem;
  font-family: var(--font-sans); font-size: 0.75rem; font-weight: 500;
  color: var(--ink-2); background: var(--bg-subtle);
  border: 1px solid var(--border); border-radius: 6px;
  padding: 0.3rem 0.6rem; cursor: pointer;
  transition: all 0.15s;
}
.branch-btn:hover { background: var(--bg-surface); color: var(--ink); }
.branch-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 0.375rem;
  min-width: 180px; z-index: 50;
  box-shadow: 0 8px 24px -4px rgba(0,0,0,0.12);
}
.branch-list { display: flex; flex-direction: column; gap: 1px; }
.branch-item {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.8125rem; color: var(--ink-2);
  padding: 0.375rem 0.5rem; border-radius: 6px;
  border: none; background: transparent; cursor: pointer; width: 100%; text-align: left;
}
.branch-item:hover { background: var(--bg-subtle); color: var(--ink); }
.branch-item.active { color: var(--gold); font-weight: 500; }
.branch-divider { height: 1px; background: var(--border); margin: 0.375rem 0; }
.branch-new-btn {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.8125rem; color: var(--ink-3);
  padding: 0.375rem 0.5rem; border-radius: 6px;
  border: none; background: transparent; cursor: pointer; width: 100%; text-align: left;
}
.branch-new-btn:hover { background: var(--bg-subtle); color: var(--gold); }
.branch-create { display: flex; gap: 0.375rem; padding: 0.25rem 0; }
.branch-input {
  flex: 1; font-size: 0.8125rem; padding: 0.3rem 0.5rem;
  border: 1px solid var(--gold); border-radius: 5px;
  background: var(--bg-base); color: var(--ink); outline: none;
}
.branch-create-btn {
  font-size: 0.75rem; font-weight: 500; padding: 0.3rem 0.6rem;
  border: none; border-radius: 5px; background: var(--gold); color: #fff;
  cursor: pointer;
}
</style>
