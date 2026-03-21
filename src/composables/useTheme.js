import { ref, watch } from 'vue'

const STORAGE_KEY = 'resume_builder_theme'

// ─── Singleton — shared across all components ─────────────────────────────────
const isDark = ref(false)

// ─── Apply theme to <html> element ────────────────────────────────────────────
function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark)
}

// ─── Initialize from localStorage or system preference ────────────────────────
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = saved !== null ? saved === 'dark' : prefersDark
  applyTheme(isDark.value)
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function toggleTheme() {
  isDark.value = !isDark.value
}

// ─── Persist to localStorage when changed ────────────────────────────────────
watch(isDark, (val) => {
  applyTheme(val)
  localStorage.setItem(STORAGE_KEY, val ? 'dark' : 'light')
})

// ─── Export ───────────────────────────────────────────────────────────────────
export function useTheme() {
  return { isDark, toggleTheme, initTheme }
}
