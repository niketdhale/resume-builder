<script setup>
import { computed } from 'vue'
import { inject } from 'vue'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'

const activeSettings = inject('activeSettings')
const updateSetting  = inject('updateSetting')

const headerLayouts = [
  { value: 'classic',  label: 'Classic'  },
  { value: 'centered', label: 'Centered' },
  { value: 'compact',  label: 'Compact'  },
  { value: 'bold',     label: 'Bold'     },
]

const FIELD_META = {
  email:    { label: 'Email',    icon: '✉' },
  phone:    { label: 'Phone',    icon: '📞' },
  location: { label: 'Location', icon: '📍' },
  linkedin: { label: 'LinkedIn', icon: '💼' },
  website:  { label: 'Website',  icon: '🌐' },
}

const SHOW_KEY = {
  email:    'showEmail',
  phone:    'showPhone',
  location: 'showLocation',
  linkedin: 'showLinkedin',
  website:  'showWebsite',
}

// Ordered list of field keys — synced to settings
const orderedFields = computed({
  get: () => activeSettings.value.headerFieldOrder || ['email', 'phone', 'location', 'linkedin', 'website'],
  set: (val) => updateSetting('headerFieldOrder', val),
})
</script>

<template>
  <div class="p-5 flex flex-col gap-6">

    <!-- Header Layout -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Header Layout</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="layout in headerLayouts"
            :key="layout.value"
            @click="updateSetting('headerLayout', layout.value)"
            :class="[
              'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
              activeSettings.headerLayout === layout.value
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50',
            ]"
          >
            <div class="w-full px-2 flex flex-col gap-1">
              <template v-if="layout.value === 'classic'">
                <div class="flex items-center justify-between">
                  <div class="h-2 bg-gray-700 dark:bg-gray-300 rounded w-2/5" />
                  <div class="flex flex-col gap-0.5 items-end">
                    <div class="h-1 bg-gray-300 dark:bg-gray-600 rounded w-12" />
                    <div class="h-1 bg-gray-300 dark:bg-gray-600 rounded w-10" />
                  </div>
                </div>
                <div class="h-1 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
                <div class="h-px bg-gray-200 dark:bg-gray-600 w-full mt-1" />
              </template>
              <template v-else-if="layout.value === 'centered'">
                <div class="flex flex-col items-center gap-1">
                  <div class="h-2 bg-gray-700 dark:bg-gray-300 rounded w-2/5" />
                  <div class="h-1 bg-gray-400 dark:bg-gray-500 rounded w-1/3" />
                  <div class="flex gap-2 mt-0.5">
                    <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded w-8" />
                    <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded w-8" />
                    <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded w-8" />
                  </div>
                </div>
              </template>
              <template v-else-if="layout.value === 'compact'">
                <div class="flex items-center gap-2">
                  <div class="h-2 bg-gray-700 dark:bg-gray-300 rounded w-1/3" />
                  <div class="h-px bg-gray-300 dark:bg-gray-600 flex-1" />
                  <div class="h-1 bg-gray-300 dark:bg-gray-600 rounded w-8" />
                  <div class="h-1 bg-gray-300 dark:bg-gray-600 rounded w-8" />
                </div>
                <div class="h-1 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mt-0.5" />
              </template>
              <template v-else-if="layout.value === 'bold'">
                <div class="h-3 bg-gray-800 dark:bg-gray-200 rounded w-3/5" />
                <div class="h-1.5 bg-indigo-400 rounded w-1/4 mt-0.5" />
                <div class="flex gap-2 mt-1">
                  <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded w-10" />
                  <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded w-10" />
                  <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded w-8" />
                </div>
              </template>
            </div>
            <span :class="['text-xs font-medium', activeSettings.headerLayout === layout.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400']">
              {{ layout.label }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contact Fields — visibility + order -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Contact Fields</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col gap-1">
        <p class="text-xs text-gray-400 dark:text-gray-500 mb-2">Drag to reorder · Toggle to show/hide</p>
        <Draggable v-model="orderedFields" handle=".field-drag" item-key="key" animation="150">
          <div
            v-for="key in orderedFields"
            :key="key"
            class="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <!-- Drag handle -->
            <span class="field-drag cursor-grab text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-400 select-none text-xs leading-none">⠿</span>
            <!-- Icon -->
            <span class="text-sm w-5 text-center leading-none">{{ FIELD_META[key].icon }}</span>
            <!-- Label -->
            <span class="flex-1 text-xs text-gray-600 dark:text-gray-400">{{ FIELD_META[key].label }}</span>
            <!-- Toggle -->
            <input
              type="checkbox"
              :checked="activeSettings[SHOW_KEY[key]] !== false"
              @change="updateSetting(SHOW_KEY[key], $event.target.checked)"
              class="accent-indigo-600 w-3.5 h-3.5"
            />
          </div>
        </Draggable>
      </div>
    </div>

    <!-- Icon toggle -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Icons</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="activeSettings.showHeaderIcons !== false"
            @change="updateSetting('showHeaderIcons', $event.target.checked)"
            class="accent-indigo-600 w-3.5 h-3.5"
          />
          <span class="text-xs text-gray-600 dark:text-gray-400">Show icons next to contact fields</span>
        </label>
      </div>
    </div>

  </div>
</template>
