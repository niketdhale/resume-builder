// Polyfill for isomorphic-git in browser
import { Buffer } from 'buffer'
window.Buffer = Buffer

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { initTheme } from './composables/useTheme.js'
import './style.css'

// Initialize theme before app mounts to avoid flash
initTheme()

const app = createApp(App)

// Register v-click-outside directive
app.directive('click-outside', {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
})

app.use(router).mount('#app')
