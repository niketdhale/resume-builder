<script setup>
import { inject } from 'vue'

const activeSettings = inject('activeSettings')
const updateSetting = inject('updateSetting')

const headerLayouts = [
  { value: 'classic', label: 'Classic' },
  { value: 'centered', label: 'Centered' },
  { value: 'compact', label: 'Compact' },
  { value: 'bold', label: 'Bold' },
]

const contactFields = [
  { key: 'showEmail', label: '📧 Email' },
  { key: 'showPhone', label: '📞 Phone' },
  { key: 'showLocation', label: '📍 Location' },
  { key: 'showLinkedin', label: '💼 LinkedIn' },
  { key: 'showWebsite', label: '🌐 Website' },
]
</script>

<template>
  <div class="p-5 flex flex-col gap-6">
    <!-- Header Layout -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Header Layout</h3>
      <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="layout in headerLayouts"
            :key="layout.value"
            @click="updateSetting('headerLayout', layout.value)"
            :class="[
              'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
              activeSettings.headerLayout === layout.value
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
            ]"
          >
            <div class="w-full px-2 flex flex-col gap-1">
              <!-- Classic -->
              <template v-if="layout.value === 'classic'">
                <div class="flex items-center justify-between">
                  <div class="h-2 bg-gray-700 rounded w-2/5" />
                  <div class="flex flex-col gap-0.5 items-end">
                    <div class="h-1 bg-gray-300 rounded w-12" />
                    <div class="h-1 bg-gray-300 rounded w-10" />
                  </div>
                </div>
                <div class="h-1 bg-gray-300 rounded w-1/3" />
                <div class="h-px bg-gray-200 w-full mt-1" />
              </template>

              <!-- Centered -->
              <template v-else-if="layout.value === 'centered'">
                <div class="flex flex-col items-center gap-1">
                  <div class="h-2 bg-gray-700 rounded w-2/5" />
                  <div class="h-1 bg-gray-400 rounded w-1/3" />
                  <div class="flex gap-2 mt-0.5">
                    <div class="h-1 bg-gray-200 rounded w-8" />
                    <div class="h-1 bg-gray-200 rounded w-8" />
                    <div class="h-1 bg-gray-200 rounded w-8" />
                  </div>
                </div>
              </template>

              <!-- Compact -->
              <template v-else-if="layout.value === 'compact'">
                <div class="flex items-center gap-2">
                  <div class="h-2 bg-gray-700 rounded w-1/3" />
                  <div class="h-px bg-gray-300 flex-1" />
                  <div class="h-1 bg-gray-300 rounded w-8" />
                  <div class="h-1 bg-gray-300 rounded w-8" />
                </div>
                <div class="h-1 bg-gray-300 rounded w-1/4 mt-0.5" />
              </template>

              <!-- Bold -->
              <template v-else-if="layout.value === 'bold'">
                <div class="h-3 bg-gray-800 rounded w-3/5" />
                <div class="h-1.5 bg-indigo-400 rounded w-1/4 mt-0.5" />
                <div class="flex gap-2 mt-1">
                  <div class="h-1 bg-gray-200 rounded w-10" />
                  <div class="h-1 bg-gray-200 rounded w-10" />
                  <div class="h-1 bg-gray-200 rounded w-8" />
                </div>
              </template>
            </div>

            <span
              :class="[
                'text-xs font-medium',
                activeSettings.headerLayout === layout.value ? 'text-indigo-600' : 'text-gray-500',
              ]"
            >
              {{ layout.label }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Show in Header -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Show in Header</h3>
      <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <label
          v-for="field in contactFields"
          :key="field.key"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="activeSettings[field.key] !== false"
            @change="updateSetting(field.key, $event.target.checked)"
            class="accent-indigo-600 w-3.5 h-3.5"
          />
          <span class="text-xs text-gray-600">{{ field.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
