<script setup>
import { ref } from 'vue'

defineProps({ modelValue: Boolean })
const emit   = defineEmits(['update:modelValue', 'confirm'])

const message = ref('')

function submit() {
  if (!message.value.trim()) return
  emit('confirm', message.value.trim())
  message.value = ''
  emit('update:modelValue', false)
}

function cancel() {
  message.value = ''
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="dialog-backdrop" @click.self="cancel">
      <div class="dialog">
        <h2 class="dialog-title">Save version</h2>
        <p class="dialog-desc">Describe what you changed in this version.</p>
        <input
          v-model="message"
          class="dialog-input"
          placeholder="e.g. Tailored for Google SWE role"
          autofocus
          @keydown.enter="submit"
          @keydown.escape="cancel"
        />
        <div class="dialog-actions">
          <button class="btn-cancel" @click="cancel">Cancel</button>
          <button class="btn-confirm" :disabled="!message.trim()" @click="submit">Save version</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
}
.dialog {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.75rem;
  width: min(420px, 92vw);
  display: flex; flex-direction: column; gap: 1rem;
  box-shadow: 0 24px 64px -12px rgba(0,0,0,0.18);
}
.dialog-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 400; color: var(--ink); margin: 0; }
.dialog-desc  { font-size: 0.8125rem; color: var(--ink-3); margin: 0; }
.dialog-input {
  font-family: var(--font-sans); font-size: 0.875rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border); border-radius: 8px;
  background: var(--bg-base); color: var(--ink);
  outline: none;
  transition: border-color 0.15s;
}
.dialog-input:focus { border-color: var(--gold); }
.dialog-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }
.btn-cancel {
  font-family: var(--font-sans); font-size: 0.8125rem; font-weight: 500;
  padding: 0.5rem 1rem; border-radius: 7px;
  border: 1px solid var(--border); background: transparent; color: var(--ink-2);
  cursor: pointer;
}
.btn-cancel:hover { background: var(--bg-subtle); }
.btn-confirm {
  font-family: var(--font-sans); font-size: 0.8125rem; font-weight: 500;
  padding: 0.5rem 1rem; border-radius: 7px;
  border: none; background: var(--gold); color: #fff;
  cursor: pointer; transition: background 0.15s;
}
.btn-confirm:hover:not(:disabled) { background: var(--gold-hover); }
.btn-confirm:disabled { opacity: 0.45; cursor: default; }
</style>
