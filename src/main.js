import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { initTheme } from './composables/useTheme.js'
import './style.css'

// Initialize theme before app mounts to avoid flash
initTheme()

createApp(App).use(router).mount('#app')
