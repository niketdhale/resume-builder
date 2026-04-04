import { ref, onMounted, onUnmounted } from 'vue'

const isMobile  = ref(false)  // < 768px
const isTablet  = ref(false)  // 768px – 1023px
const isDesktop = ref(false)  // >= 1024px

function update() {
  const w = window.innerWidth
  isMobile.value  = w < 768
  isTablet.value  = w >= 768 && w < 1024
  isDesktop.value = w >= 1024
}

let _listeners = 0

export function useBreakpoint() {
  onMounted(() => {
    if (_listeners === 0) {
      update()
      window.addEventListener('resize', update)
    }
    _listeners++
    update()
  })

  onUnmounted(() => {
    _listeners--
    if (_listeners === 0) {
      window.removeEventListener('resize', update)
    }
  })

  return { isMobile, isTablet, isDesktop }
}
