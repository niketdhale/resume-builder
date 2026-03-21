<script setup>
import { inject } from 'vue'

const activeSettings = inject('activeSettings')
const updateSetting = inject('updateSetting')
const activePageSize = inject('activePageSize')
const updatePageSize = inject('updatePageSize')

const languages = [
  'English (UK)',
  'English (US)',
  'French',
  'German',
  'Spanish',
  'Italian',
  'Portuguese',
  'Dutch',
  'Arabic',
]

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'MMM YYYY', label: 'MMM YYYY' },
]

const pageSizes = [
  { value: 'A4', label: 'A4', dimensions: '210 × 297 mm' },
  { value: 'A3', label: 'A3', dimensions: '297 × 420 mm' },
  { value: 'Letter', label: 'Letter', dimensions: '216 × 279 mm' },
  { value: 'Legal', label: 'Legal', dimensions: '216 × 356 mm' },
]
</script>

<template>
  <div class="p-5 flex flex-col gap-6">
    <!-- Language & Region -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
        Language & Region
      </h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Language</label>
          <select
            :value="activeSettings.language"
            @change="updateSetting('language', $event.target.value)"
            class="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Date Format</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="fmt in dateFormats"
              :key="fmt.value"
              @click="updateSetting('dateFormat', fmt.value)"
              :class="[
                'text-xs px-3 py-2 rounded-lg border-2 transition-all font-medium',
                activeSettings.dateFormat === fmt.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700',
              ]"
            >
              {{ fmt.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Page Format -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Page Format</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="size in pageSizes"
            :key="size.value"
            @click="updatePageSize(size.value)"
            :class="[
              'flex flex-col items-center justify-center gap-1.5 border-2 rounded-xl py-4 transition-all',
              activePageSize === size.value
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50',
            ]"
          >
            <div
              :class="[
                'border-2 rounded-sm bg-white',
                activePageSize === size.value ? 'border-indigo-400' : 'border-gray-300 dark:border-gray-500',
                size.value === 'A3' ? 'w-6 h-8' : size.value === 'Legal' ? 'w-5 h-8' : 'w-6 h-7',
              ]"
            />
            <span
              :class="[
                'text-sm font-semibold',
                activePageSize === size.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300',
              ]"
            >
              {{ size.label }}
            </span>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ size.dimensions }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
