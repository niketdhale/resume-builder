<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../../composables/useTheme.js'

const router = useRouter()
const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const navItems = [
  { name: 'overview', label: 'My Resumes', icon: '📄' },
  { name: 'jobs', label: 'Job Tracker', icon: '💼' },
]
</script>

<template>
  <div
    class="flex items-center justify-between px-6 py-3 border-b flex-shrink-0 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800"
  >
    <!-- Left: Logo + Nav -->
    <div class="flex items-center gap-6">
      <!-- Logo -->
      <div
        class="flex items-center gap-2 cursor-pointer"
        @click="router.push({ name: 'overview' })"
      >
        <div
          class="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold"
        >
          R
        </div>
        <span class="font-semibold text-sm text-gray-800 dark:text-gray-100"> Resume Builder </span>
      </div>

      <!-- Nav items -->
      <div class="flex items-center gap-1">
        <button
          v-for="item in navItems"
          :key="item.name"
          @click="router.push({ name: item.name })"
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

    <!-- Right: Theme toggle + Avatar -->
    <div class="flex items-center gap-3">
      <!-- Theme toggle -->
      <button
        @click="toggleTheme"
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

      <!-- Avatar placeholder -->
      <div
        class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
      >
        G
      </div>
    </div>
  </div>
</template>
