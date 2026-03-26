<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../../composables/useTheme.js'
import { useAuth } from '../../composables/useAuth.js'
import { migrationState } from '../../composables/useMigration.js'
import { cloudAdapter } from '../../services/storage/index.js'

const router = useRouter()
const route  = useRoute()
const { isDark, toggleTheme } = useTheme()
const { isLoggedIn, userInitial, userEmail, signOut } = useAuth()

const showUserMenu = ref(false)

// ── Offline queue indicator ────────────────────────────────────────────────────
const hasPendingWrites = ref(false)
let _queueInterval = null

function checkQueue() {
  hasPendingWrites.value = cloudAdapter.hasPendingWrites()
}

onMounted(() => {
  checkQueue()
  _queueInterval = setInterval(checkQueue, 3000)
  window.addEventListener('online', checkQueue)
})

onUnmounted(() => {
  clearInterval(_queueInterval)
  window.removeEventListener('online', checkQueue)
})

const navItems = [
  { name: 'overview', label: 'My Resumes', icon: '📄' },
  { name: 'jobs',     label: 'Job Tracker', icon: '💼' },
]

async function handleSignOut() {
  showUserMenu.value = false
  await signOut()
  router.push('/auth')
}

function closeMenu(e) {
  // Close on outside click
  if (!e.target.closest('[data-user-menu]')) showUserMenu.value = false
}
</script>

<template>
  <div
    class="flex items-center justify-between px-6 py-3 border-b flex-shrink-0 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800"
    @click="closeMenu"
  >
    <!-- Left: Logo + Nav -->
    <div class="flex items-center gap-6">
      <div
        class="flex items-center gap-2 cursor-pointer"
        @click.stop="router.push({ name: 'overview' })"
      >
        <div class="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
          R
        </div>
        <span class="font-semibold text-sm text-gray-800 dark:text-gray-100">Resume Builder</span>
      </div>

      <div class="flex items-center gap-1">
        <button
          v-for="item in navItems"
          :key="item.name"
          @click.stop="router.push({ name: item.name })"
          :class="[
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition',
            route.name === item.name
              ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
          ]"
        >
          {{ item.icon }} {{ item.label }}
        </button>
      </div>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-3">
      <!-- Offline / pending-writes badge -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
      >
        <div
          v-if="isLoggedIn && hasPendingWrites"
          title="Some changes couldn't reach the cloud — they'll sync when you're back online"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 cursor-default select-none"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block"></span>
          Pending sync
        </div>
      </Transition>
      <!-- Theme toggle -->
      <button
        @click.stop="toggleTheme"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        class="relative w-12 h-6 rounded-full transition-all duration-300 flex items-center flex-shrink-0"
        :class="isDark ? 'bg-indigo-600' : 'bg-gray-200'"
      >
        <span
          class="absolute w-5 h-5 rounded-full shadow-sm transition-all duration-300 flex items-center justify-center text-xs"
          :class="isDark ? 'translate-x-6 bg-gray-900' : 'translate-x-0.5 bg-white'"
        >
          {{ isDark ? '🌙' : '☀️' }}
        </span>
      </button>

      <!-- User avatar / menu -->
      <div class="relative" data-user-menu>
        <!-- Avatar button -->
        <button
          @click.stop="isLoggedIn ? (showUserMenu = !showUserMenu) : router.push('/auth')"
          :title="isLoggedIn ? userEmail : 'Sign in'"
          class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition"
          :class="isLoggedIn
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-gray-400 hover:bg-gray-500'"
        >
          {{ userInitial }}
        </button>

        <!-- Dropdown -->
        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showUserMenu && isLoggedIn"
            class="absolute right-0 top-10 w-52 rounded-xl shadow-lg border overflow-hidden z-50"
            :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
          >
            <!-- Email -->
            <div class="px-4 py-3 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-100'">
              <p class="text-xs font-medium truncate" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                {{ userEmail }}
              </p>
              <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Signed in</p>
            </div>

            <!-- Sign out -->
            <button
              @click.stop="handleSignOut"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition text-left"
              :class="isDark
                ? 'text-gray-300 hover:bg-gray-800 hover:text-red-400'
                : 'text-gray-600 hover:bg-gray-50 hover:text-red-500'"
            >
              <span>→</span> Sign out
            </button>
          </div>
        </Transition>
      </div>
    </div>
  <!-- Migration toast -->
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
      class="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2.5 pointer-events-none"
      :class="{
        'bg-indigo-600 text-white':          migrationState === 'migrating',
        'bg-green-600 text-white':           migrationState === 'done',
        'bg-red-500 text-white':             migrationState === 'error',
      }"
    >
      <span v-if="migrationState === 'migrating'">
        <svg class="animate-spin w-4 h-4 inline -mt-0.5 mr-1" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Syncing your data to the cloud…
      </span>
      <span v-else-if="migrationState === 'done'">✓ Data synced to cloud</span>
      <span v-else-if="migrationState === 'error'">⚠ Sync failed — your local data is safe</span>
    </div>
  </Transition>
  </div>
</template>
