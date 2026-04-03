<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../../composables/useTheme.js'
import { useAuth } from '../../composables/useAuth.js'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close'])

const router = useRouter()
const route  = useRoute()
const { isDark, toggleTheme } = useTheme()
const { isLoggedIn, userInitial, userEmail, signOut } = useAuth()

const navItems = [
  { name: 'overview', label: 'My Resumes', icon: '📄' },
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
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex"
      @click.self="emit('close')"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="emit('close')" />

      <!-- Drawer panel -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div
          v-if="open"
          class="relative z-10 w-72 h-full flex flex-col shadow-2xl bg-white dark:bg-gray-900"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">R</div>
              <span class="font-semibold text-sm text-gray-800 dark:text-gray-100">Resume Builder</span>
            </div>
            <button
              @click="emit('close')"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition"
            >✕</button>
          </div>

          <!-- Nav items -->
          <nav class="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
            <button
              v-for="item in navItems"
              :key="item.name"
              @click="navigate(item.name)"
              :class="[
                'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition text-left',
                route.name === item.name
                  ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ]"
            >
              <span class="text-base">{{ item.icon }}</span>
              {{ item.label }}
            </button>

            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <!-- Dark mode toggle -->
              <div class="flex items-center justify-between px-4 py-3">
                <span class="text-sm text-gray-600 dark:text-gray-300">Dark Mode</span>
                <button
                  @click="toggleTheme"
                  class="relative w-12 h-6 rounded-full transition-all duration-300 flex items-center flex-shrink-0"
                  :class="isDark ? 'bg-indigo-600' : 'bg-gray-200'"
                >
                  <span
                    class="absolute w-5 h-5 rounded-full shadow-sm transition-all duration-300 flex items-center justify-center text-xs"
                    :class="isDark ? 'translate-x-6 bg-gray-900' : 'translate-x-0.5 bg-white'"
                  >{{ isDark ? '🌙' : '☀️' }}</span>
                </button>
              </div>
            </div>
          </nav>

          <!-- User section -->
          <div class="border-t border-gray-100 dark:border-gray-800 px-3 py-3">
            <div v-if="isLoggedIn" class="flex items-center gap-3 px-3 py-2 mb-1">
              <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {{ userInitial }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate text-gray-800 dark:text-gray-100">{{ userEmail }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500">Signed in</p>
              </div>
            </div>
            <button
              v-if="isLoggedIn"
              @click="handleSignOut"
              class="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-left transition text-gray-600 hover:bg-red-50 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              → Sign out
            </button>
            <button
              v-else
              @click="navigate('auth')"
              class="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Sign in
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
