<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../../composables/useTheme.js'
import { useAuth } from '../../composables/useAuth.js'

defineProps({ open: Boolean })
const emit = defineEmits(['close'])

const router = useRouter()
const route  = useRoute()
const { isDark, toggleTheme } = useTheme()
const { isLoggedIn, userInitial, userEmail, signOut } = useAuth()

const navItems = [
  { name: 'overview', label: 'My Resumes',  icon: '📄' },
  { name: 'jobs',     label: 'Job Tracker', icon: '💼' },
]

function navigate(name) {
  router.push({ name })
  emit('close')
}

async function handleSignOut() {
  emit('close')
  await signOut()
  router.push('/auth')
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="open" class="drawer-overlay" @click.self="emit('close')">
      <div class="drawer-backdrop" @click="emit('close')" />

      <Transition
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div v-if="open" class="drawer-panel">

          <!-- Header -->
          <div class="drawer-header">
            <button class="drawer-wordmark" @click="navigate(isLoggedIn ? 'overview' : 'landing')">
              <div class="drawer-icon">R</div>
              <span class="drawer-name">Résumé Builder</span>
            </button>
            <button class="drawer-close" @click="emit('close')" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Nav items -->
          <nav class="drawer-nav">
            <!-- Home link for guests -->
            <button
              v-if="!isLoggedIn"
              @click="navigate('landing')"
              :class="['drawer-item', route.name === 'landing' ? 'drawer-item--active' : '']"
            >
              <span class="drawer-item-icon">🏠</span>
              Home
            </button>

            <button
              v-for="item in navItems"
              :key="item.name"
              @click="navigate(item.name)"
              :class="['drawer-item', route.name === item.name ? 'drawer-item--active' : '']"
            >
              <span class="drawer-item-icon">{{ item.icon }}</span>
              {{ item.label }}
            </button>

            <!-- Dark mode -->
            <div class="drawer-divider" />
            <div class="drawer-toggle-row">
              <span class="drawer-toggle-label">Dark Mode</span>
              <button
                @click="toggleTheme"
                class="drawer-toggle-switch"
                :class="isDark ? 'drawer-toggle-switch--on' : ''"
              >
                <span class="drawer-toggle-knob" :class="isDark ? 'drawer-toggle-knob--on' : ''">
                  {{ isDark ? '🌙' : '☀️' }}
                </span>
              </button>
            </div>
          </nav>

          <!-- User section -->
          <div class="drawer-footer">
            <div v-if="isLoggedIn" class="drawer-user">
              <div class="drawer-avatar">{{ userInitial }}</div>
              <div class="drawer-user-info">
                <p class="drawer-user-email">{{ userEmail }}</p>
                <p class="drawer-user-status">Signed in · Cloud sync active</p>
              </div>
            </div>

            <button
              v-if="isLoggedIn"
              @click="handleSignOut"
              class="drawer-signout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>

            <button
              v-else
              @click="navigate('auth')"
              class="drawer-signin"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign in to sync across devices
            </button>
          </div>

        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-overlay {
  position: fixed; inset: 0; z-index: 50; display: flex;
}
.drawer-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
}

.drawer-panel {
  position: relative; z-index: 10;
  width: 288px; height: 100%;
  display: flex; flex-direction: column;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  box-shadow: 4px 0 32px rgba(0,0,0,0.2);
}

/* Header */
.drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.drawer-wordmark {
  display: flex; align-items: center; gap: 0.625rem;
  background: none; border: none; cursor: pointer; padding: 0;
}
.drawer-icon {
  width: 28px; height: 28px;
  background: var(--gold); border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-style: italic;
  font-size: 1rem; font-weight: 500; color: #fff;
  flex-shrink: 0;
}
.drawer-name {
  font-family: var(--font-display);
  font-size: 1rem; font-weight: 500;
  color: var(--ink); letter-spacing: -0.01em;
}
.drawer-close {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; border: 1px solid var(--border);
  background: transparent; color: var(--ink-3); cursor: pointer;
  transition: all 0.15s;
}
.drawer-close:hover { background: var(--bg-subtle); color: var(--ink); }

/* Nav */
.drawer-nav {
  flex: 1; overflow-y: auto;
  padding: 0.75rem;
  display: flex; flex-direction: column; gap: 0.125rem;
}

.drawer-item {
  display: flex; align-items: center; gap: 0.75rem;
  width: 100%; padding: 0.625rem 0.875rem;
  border-radius: 10px; border: none;
  font-size: 0.875rem; font-weight: 500;
  color: var(--ink-2); background: transparent;
  cursor: pointer; transition: all 0.15s; text-align: left;
}
.drawer-item:hover { background: var(--bg-subtle); color: var(--ink); }
.drawer-item--active {
  background: var(--gold-bg);
  color: var(--gold);
  border: 1px solid rgba(184,146,58,0.2);
}
.drawer-item-icon { font-size: 1rem; flex-shrink: 0; }

.drawer-divider {
  height: 1px; background: var(--border);
  margin: 0.5rem 0;
}

.drawer-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.5rem 0.875rem;
}
.drawer-toggle-label { font-size: 0.875rem; color: var(--ink-2); }
.drawer-toggle-switch {
  position: relative; width: 44px; height: 24px;
  border-radius: 99px; border: none; cursor: pointer;
  background: var(--bg-subtle); border: 1px solid var(--border);
  transition: background 0.2s;
}
.drawer-toggle-switch--on { background: var(--gold-bg); border-color: rgba(184,146,58,0.3); }
.drawer-toggle-knob {
  position: absolute; top: 2px; left: 2px;
  width: 18px; height: 18px;
  border-radius: 50%; background: var(--bg-surface);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.625rem;
  transition: transform 0.2s; border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.drawer-toggle-knob--on { transform: translateX(20px); }

/* Footer */
.drawer-footer {
  border-top: 1px solid var(--border);
  padding: 0.875rem;
  display: flex; flex-direction: column; gap: 0.5rem;
}
.drawer-user {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.5rem 0.625rem;
  background: var(--bg-subtle); border-radius: 10px;
}
.drawer-avatar {
  width: 32px; height: 32px;
  border-radius: 50%; background: var(--gold);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 600; color: #fff; flex-shrink: 0;
}
.drawer-user-info { min-width: 0; }
.drawer-user-email  { font-size: 0.8125rem; font-weight: 500; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.drawer-user-status { font-size: 0.6875rem; color: var(--ink-3); margin-top: 1px; }

.drawer-signout {
  display: flex; align-items: center; gap: 0.5rem;
  width: 100%; padding: 0.625rem 0.875rem;
  border-radius: 10px; border: 1px solid var(--border);
  background: transparent; color: var(--ink-3);
  font-size: 0.875rem; cursor: pointer; transition: all 0.15s; text-align: left;
}
.drawer-signout:hover { background: rgba(239,68,68,0.06); color: #ef4444; border-color: rgba(239,68,68,0.2); }

.drawer-signin {
  display: flex; align-items: center; gap: 0.5rem;
  width: 100%; padding: 0.625rem 0.875rem;
  border-radius: 10px; border: none;
  background: var(--gold); color: #fff;
  font-size: 0.875rem; font-weight: 500; cursor: pointer;
  transition: opacity 0.15s; text-align: left;
}
.drawer-signin:hover { opacity: 0.88; }
</style>
