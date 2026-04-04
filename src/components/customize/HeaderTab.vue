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

    <!-- Header Position -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Header Position</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-3 gap-2">
          <button
            @click="updateSetting('headerPosition', 'top')"
            :class="[
              'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all',
              activeSettings.headerPosition === 'top'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
            ]"
          >
            <div class="w-full flex flex-col gap-1 px-1">
              <div class="h-2 bg-gray-400 dark:bg-gray-500 rounded-sm w-full" />
              <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full w-full" />
              <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full w-3/4" />
            </div>
            <span :class="['text-xs font-medium', activeSettings.headerPosition === 'top' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400']">Top</span>
          </button>

          <button
            @click="updateSetting('headerPosition', 'left')"
            :class="[
              'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all',
              activeSettings.headerPosition === 'left'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
            ]"
          >
            <div class="w-full flex gap-1 px-1">
              <div class="w-2/5 flex flex-col gap-1">
                <div class="h-2 bg-gray-400 dark:bg-gray-500 rounded-sm w-full" />
                <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full w-full" />
              </div>
              <div class="w-3/5 flex flex-col gap-1">
                <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full" />
                <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full" />
                <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full w-2/3" />
              </div>
            </div>
            <span :class="['text-xs font-medium', activeSettings.headerPosition === 'left' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400']">Left</span>
          </button>

          <button
            @click="updateSetting('headerPosition', 'right')"
            :class="[
              'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all',
              activeSettings.headerPosition === 'right'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
            ]"
          >
            <div class="w-full flex gap-1 px-1">
              <div class="w-3/5 flex flex-col gap-1">
                <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full" />
                <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full" />
                <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full w-2/3" />
              </div>
              <div class="w-2/5 flex flex-col gap-1">
                <div class="h-2 bg-gray-400 dark:bg-gray-500 rounded-sm w-full" />
                <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full w-full" />
              </div>
            </div>
            <span :class="['text-xs font-medium', activeSettings.headerPosition === 'right' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400']">Right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Header Layout -->
    <div v-if="activeSettings.headerPosition === 'top' || !activeSettings.headerPosition">
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

    <!-- Photo settings -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Profile Photo</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col gap-4">

        <!-- Show toggle -->
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="activeSettings.showPhoto !== false"
            @change="updateSetting('showPhoto', $event.target.checked)"
            class="accent-indigo-600 w-3.5 h-3.5"
          />
          <span class="text-xs text-gray-600 dark:text-gray-400">Show photo in preview</span>
        </label>

        <!-- Shape -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Shape</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="shape in ['circle', 'rounded', 'square']"
              :key="shape"
              @click="updateSetting('photoShape', shape)"
              :class="[
                'flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 transition-all',
                activeSettings.photoShape === shape
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              <div
                class="w-7 h-7 bg-gray-300 dark:bg-gray-500"
                :style="{
                  borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' ? '6px' : '2px'
                }"
              />
              <span class="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{{ shape }}</span>
            </button>
          </div>
        </div>

        <!-- Size -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Size</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="size in ['S', 'M', 'L']"
              :key="size"
              @click="updateSetting('photoSize', size)"
              :class="[
                'py-1.5 text-xs rounded-lg border-2 font-semibold transition-all',
                activeSettings.photoSize === size
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              {{ size }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
