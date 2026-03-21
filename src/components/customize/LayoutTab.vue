<script setup>
import { inject } from 'vue'

const activeSettings = inject('activeSettings')
const updateSetting = inject('updateSetting')

function onSlider(key, e) {
  updateSetting(key, parseFloat(e.target.value))
}
</script>

<template>
  <div class="p-5 flex flex-col gap-6">
    <!-- Layout -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Layout</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col gap-5">
        <!-- Columns -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Columns</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="updateSetting('columns', 'one')"
              :class="[
                'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all',
                activeSettings.columns === 'one'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              <div class="w-full flex flex-col gap-1 px-1">
                <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full w-full" />
                <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full w-full" />
                <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full w-3/4" />
              </div>
              <span
                :class="[
                  'text-xs font-medium',
                  activeSettings.columns === 'one' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400',
                ]"
                >One</span
              >
            </button>

            <button
              @click="updateSetting('columns', 'two')"
              :class="[
                'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all',
                activeSettings.columns === 'two'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              <div class="w-full flex gap-1 px-1">
                <div class="flex-1 flex flex-col gap-1">
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full w-2/3" />
                </div>
                <div class="flex-1 flex flex-col gap-1">
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full w-2/3" />
                </div>
              </div>
              <span
                :class="[
                  'text-xs font-medium',
                  activeSettings.columns === 'two' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400',
                ]"
                >Two</span
              >
            </button>

            <button
              @click="updateSetting('columns', 'mix')"
              :class="[
                'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all',
                activeSettings.columns === 'mix'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              <div class="w-full flex gap-1 px-1">
                <div class="w-2/5 flex flex-col gap-1">
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
                <div class="w-3/5 flex flex-col gap-1">
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div class="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full w-2/3" />
                </div>
              </div>
              <span
                :class="[
                  'text-xs font-medium',
                  activeSettings.columns === 'mix' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400',
                ]"
                >Mix</span
              >
            </button>
          </div>
        </div>

        <!-- Header Position -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Header Position</label>
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
              <span
                :class="[
                  'text-xs font-medium',
                  activeSettings.headerPosition === 'top' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400',
                ]"
                >Top</span
              >
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
              <span
                :class="[
                  'text-xs font-medium',
                  activeSettings.headerPosition === 'left' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400',
                ]"
                >Left</span
              >
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
              <span
                :class="[
                  'text-xs font-medium',
                  activeSettings.headerPosition === 'right' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400',
                ]"
                >Right</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Spacing -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Spacing</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col gap-5">
        <div
          v-for="slider in [
            { key: 'fontSize', label: 'Font Size', min: 7, max: 14, step: 0.5, unit: 'pt' },
            { key: 'lineHeight', label: 'Line Height', min: 1, max: 2, step: 0.05, unit: '' },
            { key: 'marginX', label: 'Left & Right Margin', min: 0, max: 30, step: 1, unit: 'mm' },
            { key: 'marginY', label: 'Top & Bottom Margin', min: 0, max: 30, step: 1, unit: 'mm' },
            { key: 'entrySpacing', label: 'Space Between Entries', min: 2, max: 24, step: 1, unit: 'px' },
          ]"
          :key="slider.key"
        >
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ slider.label }}</label>
              <span class="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                {{ activeSettings[slider.key] }}{{ slider.unit }}
              </span>
            </div>
            <input
              type="range"
              :min="slider.min"
              :max="slider.max"
              :step="slider.step"
              :value="activeSettings[slider.key]"
              @input="onSlider(slider.key, $event)"
              class="w-full accent-indigo-600"
            />
            <div class="flex justify-between text-xs text-gray-300 dark:text-gray-600 mt-0.5">
              <span>{{ slider.min }}{{ slider.unit }}</span>
              <span>{{ slider.max }}{{ slider.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
