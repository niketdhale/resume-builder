/**
 * useKeyboardShortcuts — global keyboard handler.
 * Register once in App.vue via setupKeyboardShortcuts().
 */

import { onMounted, onUnmounted } from 'vue'

export function useKeyboardShortcuts({ undo, redo, save, openShortcuts }) {
  function handler(e) {
    const ctrl = e.ctrlKey || e.metaKey
    const tag  = document.activeElement?.tagName

    // Never hijack shortcuts while typing in an input / textarea
    const isTyping = ['INPUT', 'TEXTAREA'].includes(tag) || document.activeElement?.isContentEditable

    // Ctrl+Z — undo
    if (ctrl && !e.shiftKey && e.key === 'z') {
      e.preventDefault()
      undo?.()
      return
    }

    // Ctrl+Shift+Z or Ctrl+Y — redo
    if ((ctrl && e.shiftKey && e.key === 'Z') || (ctrl && e.key === 'y')) {
      e.preventDefault()
      redo?.()
      return
    }

    // Ctrl+S — manual save
    if (ctrl && e.key === 's') {
      e.preventDefault()
      save?.()
      return
    }

    // ? — open shortcuts modal (only when not typing)
    if (e.key === '?' && !isTyping && !ctrl) {
      e.preventDefault()
      openShortcuts?.()
      return
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}
