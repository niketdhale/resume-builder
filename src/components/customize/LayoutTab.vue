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
      <h3 class="text-xs font-bold uppercase tracking-widest text-[var(--ink-3)] mb-3">Layout</h3>
      <div class="rounded-xl p-4 shadow-sm flex flex-col gap-5" style="background: var(--bg-surface); border: 1px solid var(--border);">
        <!-- Columns -->
        <div>
          <label class="text-xs font-medium text-[var(--ink-2)] mb-2 block">Columns</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="updateSetting('columns', 'one')"
              :class="[
                'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all',
                activeSettings.columns === 'one'
                  ? 'border-[var(--gold)] bg-[var(--gold-bg)]'
                  : 'border-[var(--border)] hover:bg-[var(--bg-subtle)]',
              ]"
            >
              <div class="w-full flex flex-col gap-1 px-1">
                <div class="h-1.5 bg-[var(--border)] rounded-full w-full" />
                <div class="h-1.5 bg-[var(--border)] rounded-full w-full" />
                <div class="h-1.5 bg-[var(--border)] rounded-full w-3/4" />
              </div>
              <span
                :class="[
                  'text-xs font-medium',
                  activeSettings.columns === 'one' ? 'text-[var(--gold)]' : 'text-[var(--ink-2)]',
                ]"
                >One</span
              >
            </button>

            <button
              @click="updateSetting('columns', 'two')"
              :class="[
                'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all',
                activeSettings.columns === 'two'
                  ? 'border-[var(--gold)] bg-[var(--gold-bg)]'
                  : 'border-[var(--border)] hover:bg-[var(--bg-subtle)]',
              ]"
            >
              <div class="w-full flex gap-1 px-1">
                <div class="flex-1 flex flex-col gap-1">
                  <div class="h-1.5 bg-[var(--border)] rounded-full" />
                  <div class="h-1.5 bg-[var(--border)] rounded-full" />
                  <div class="h-1.5 bg-[var(--border)] rounded-full w-2/3" />
                </div>
                <div class="flex-1 flex flex-col gap-1">
                  <div class="h-1.5 bg-[var(--border)] rounded-full" />
                  <div class="h-1.5 bg-[var(--border)] rounded-full" />
                  <div class="h-1.5 bg-[var(--border)] rounded-full w-2/3" />
                </div>
              </div>
              <span
                :class="[
                  'text-xs font-medium',
                  activeSettings.columns === 'two' ? 'text-[var(--gold)]' : 'text-[var(--ink-2)]',
                ]"
                >Two</span
              >
            </button>

            <button
              @click="updateSetting('columns', 'mix')"
              :class="[
                'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all',
                activeSettings.columns === 'mix'
                  ? 'border-[var(--gold)] bg-[var(--gold-bg)]'
                  : 'border-[var(--border)] hover:bg-[var(--bg-subtle)]',
              ]"
            >
              <div class="w-full flex gap-1 px-1">
                <div class="w-2/5 flex flex-col gap-1">
                  <div class="h-1.5 bg-[var(--border)] rounded-full" />
                  <div class="h-1.5 bg-[var(--border)] rounded-full" />
                  <div class="h-1.5 bg-[var(--border)] rounded-full" />
                </div>
                <div class="w-3/5 flex flex-col gap-1">
                  <div class="h-1.5 bg-[var(--border)] rounded-full" />
                  <div class="h-1.5 bg-[var(--border)] rounded-full" />
                  <div class="h-1.5 bg-[var(--border)] rounded-full w-2/3" />
                </div>
              </div>
              <span
                :class="[
                  'text-xs font-medium',
                  activeSettings.columns === 'mix' ? 'text-[var(--gold)]' : 'text-[var(--ink-2)]',
                ]"
                >Mix</span
              >
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Spacing -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-[var(--ink-3)] mb-3">Spacing</h3>
      <div class="rounded-xl p-4 shadow-sm flex flex-col gap-5" style="background: var(--bg-surface); border: 1px solid var(--border);">
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
              <label class="text-xs font-medium text-[var(--ink-2)]">{{ slider.label }}</label>
              <span class="text-xs font-mono text-[var(--gold)] bg-[var(--gold-bg)] px-2 py-0.5 rounded-md">
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
              class="w-full accent-[var(--gold)]"
            />
            <div class="flex justify-between text-xs text-[var(--ink-3)] mt-0.5">
              <span>{{ slider.min }}{{ slider.unit }}</span>
              <span>{{ slider.max }}{{ slider.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
