import { watch } from 'vue'

const loadedFonts = new Set()

function loadFont(fontFamily) {
  if (!fontFamily || loadedFonts.has(fontFamily)) return
  loadedFonts.add(fontFamily)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700;900&display=swap`
  document.head.appendChild(link)
}

export function useFontLoader(activeSettings) {
  watch(
    () => activeSettings.value?.fontFamily,
    (fontFamily) => loadFont(fontFamily),
    { immediate: true },
  )
}
