<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../../composables/useTheme.js'
import { useAuth } from '../../composables/useAuth.js'
import { migrationState } from '../../composables/useMigration.js'
import { cloudAdapter } from '../../services/storage/index.js'
import { syncStatus } from '../../composables/useStorage.js'
import { useBreakpoint } from '../../composables/useBreakpoint.js'
import MobileDrawer from './MobileDrawer.vue'

const router = useRouter()
const route  = useRoute()
const { isDark, toggleTheme } = useTheme()
const { isLoggedIn, userInitial, userEmail, signOut } = useAuth()

const showUserMenu = ref(false)
const showDrawer   = ref(false)
useBreakpoint()

const hasQueuedWrites = ref(false)
onMounted(() => { hasQueuedWrites.value = cloudAdapter.hasPendingWrites() })

const effectiveStatus = computed(() => {
  if (syncStatus.value !== 'idle') return syncStatus.value
  return hasQueuedWrites.value ? 'pending' : 'idle'
})

const navItems = [
  { name: 'overview', label: 'My Resumes' },
  { name: 'jobs',     label: 'Job Tracker' },
]

async function handleSignOut() {
  showUserMenu.value = false
  await signOut()
  router.push('/auth')
}

function closeMenu(e) {
  if (!e.target.closest('[data-user-menu]')) showUserMenu.value = false
}
</script>

<template>
  <MobileDrawer :open="showDrawer" @close="showDrawer = false" />

  <header
    class="flex items-center justify-between px-5 md:px-8 flex-shrink-0"
    style="height: var(--nav-h); border-bottom: 1px solid var(--border); background: var(--bg-surface);"
    @click="closeMenu"
  >
    <!-- Left: Hamburger + Wordmark + Nav -->
    <div class="flex items-center gap-6">
      <!-- Hamburger mobile -->
      <button
        class="md:hidden flex flex-col gap-1.5 p-1"
        style="color: var(--ink-2);"
        @click.stop="showDrawer = true"
        aria-label="Open menu"
      >
        <span class="block w-5 h-px bg-current rounded-full"></span>
        <span class="block w-5 h-px bg-current rounded-full"></span>
        <span class="block w-3.5 h-px bg-current rounded-full"></span>
      </button>

      <!-- Wordmark — goes to landing when guest, dashboard when logged in -->
      <button
        class="flex items-center gap-2.5 group"
        @click.stop="router.push({ name: isLoggedIn ? 'overview' : 'landing' })"
        style="text-decoration: none;"
      >
        <div
          class="flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-semibold flex-shrink-0"
          style="background: var(--gold); font-family: var(--font-display); font-style: italic; font-size: 1rem; font-weight: 500; letter-spacing: -0.01em;"
        >R</div>
        <span
          class="hidden sm:block text-sm font-medium tracking-tight"
          style="font-family: var(--font-display); font-size: 1.0625rem; font-weight: 500; color: var(--ink); letter-spacing: -0.01em;"
        >Résumé Builder</span>
      </button>

      <!-- Desktop nav links -->
      <nav class="hidden md:flex items-center gap-5">
        <button
          v-for="item in navItems"
          :key="item.name"
          @click.stop="router.push({ name: item.name })"
          class="rb-nav-link"
          :class="{ active: route.name === item.name }"
        >
          {{ item.label }}
        </button>
      </nav>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-3">

      <!-- Sync badge — logged in only -->
      <Transition name="rb-fade">
        <div
          v-if="isLoggedIn"
          class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium select-none"
          :title="{
            idle:    'Connected — all changes saved',
            saving:  'Saving to cloud…',
            synced:  'All changes synced',
            pending: 'Changes pending sync',
          }[effectiveStatus]"
          :style="{
            background: effectiveStatus === 'synced'  ? 'rgba(34,197,94,0.08)'  :
                        effectiveStatus === 'pending' ? 'rgba(245,158,11,0.08)' :
                        'var(--bg-subtle)',
            color:      effectiveStatus === 'synced'  ? '#16a34a' :
                        effectiveStatus === 'pending' ? '#b45309' :
                        'var(--ink-3)',
            border:     effectiveStatus === 'synced'  ? '1px solid rgba(34,197,94,0.18)'  :
                        effectiveStatus === 'pending' ? '1px solid rgba(245,158,11,0.18)' :
                        '1px solid var(--border)',
          }"
        >
          <!-- Cloud icon -->
          <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
          </svg>
          <span v-if="effectiveStatus === 'idle'">Cloud</span>
          <span v-else-if="effectiveStatus === 'saving'" class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block"></span>Syncing
          </span>
          <span v-else-if="effectiveStatus === 'synced'">Synced</span>
          <span v-else-if="effectiveStatus === 'pending'" class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block"></span>Pending
          </span>
        </div>
      </Transition>

      <!-- Theme toggle — desktop -->
      <button
        @click.stop="toggleTheme"
        :title="isDark ? 'Light mode' : 'Dark mode'"
        class="hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200"
        style="color: var(--ink-3); border: 1px solid var(--border);"
        :style="{ background: 'var(--bg-subtle)' }"
      >
        <svg v-if="isDark" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <!-- Sign In button — guest only, desktop -->
      <button
        v-if="!isLoggedIn"
        @click.stop="router.push('/auth')"
        class="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style="border: 1px solid var(--border); background: var(--bg-subtle); color: var(--ink-2);"
        onmouseover="this.style.borderColor='var(--gold)';this.style.color='var(--gold)'"
        onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--ink-2)'"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        Sign In
      </button>

      <!-- User avatar / menu — logged in only -->
      <div class="relative" data-user-menu>
        <button
          @click.stop="isLoggedIn ? (showUserMenu = !showUserMenu) : router.push('/auth')"
          :title="isLoggedIn ? userEmail : 'Sign in'"
          class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium transition-opacity"
          :style="{ background: isLoggedIn ? 'var(--gold)' : 'var(--bg-subtle)', border: isLoggedIn ? 'none' : '1px solid var(--border)' }"
        >
          <span v-if="isLoggedIn">{{ userInitial }}</span>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>

        <!-- Dropdown -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showUserMenu && isLoggedIn"
            class="absolute right-0 top-11 w-52 rounded-xl shadow-xl overflow-hidden z-50"
            style="background: var(--bg-surface); border: 1px solid var(--border);"
          >
            <div class="px-4 py-3" style="border-bottom: 1px solid var(--border);">
              <p class="text-xs font-medium truncate" style="color: var(--ink);">{{ userEmail }}</p>
              <p class="text-xs mt-0.5" style="color: var(--ink-3);">Signed in · Cloud sync active</p>
            </div>
            <button
              @click.stop="handleSignOut"
              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors"
              style="color: var(--ink-2);"
              onmouseover="this.style.background='var(--bg-subtle)';this.style.color='var(--ink)'"
              onmouseout="this.style.background='';this.style.color='var(--ink-2)'"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>

  <!-- Migration toast -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="migrationState !== 'idle'"
        class="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2.5 pointer-events-none"
        :style="{
          background: migrationState === 'migrating' ? 'var(--gold)' :
                      migrationState === 'done'      ? '#16a34a'     : '#dc2626',
          color: '#fff',
        }"
      >
        <svg v-if="migrationState === 'migrating'" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <span v-if="migrationState === 'migrating'">Syncing your data to the cloud…</span>
        <span v-else-if="migrationState === 'done'">✓ All data synced to cloud</span>
        <span v-else-if="migrationState === 'error'">⚠ Sync failed — local data is safe</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rb-fade-enter-active, .rb-fade-leave-active { transition: opacity 0.2s ease; }
.rb-fade-enter-from, .rb-fade-leave-to { opacity: 0; }
</style>
