<script setup>
import { inject } from 'vue'

const activeSettings = inject('activeSettings')
const updateSetting = inject('updateSetting')

const fontCategories = [
  { value: 'serif', label: 'Serif', style: 'font-serif' },
  { value: 'sans', label: 'Sans', style: 'font-sans' },
  { value: 'mono', label: 'Mono', style: 'font-mono' },
]

const fontFamilies = {
  serif: ['Georgia', 'Merriweather', 'Playfair Display', 'Lora', 'EB Garamond', 'Libre Baskerville'],
  sans: ['Source Sans Pro', 'Karla', 'Mulish', 'Lato', 'Roboto', 'Titillium Web', 'Barlow', 'Jost', 'Fira Sans', 'Rubik', 'Nunito', 'Open Sans'],
  mono: ['Fira Code', 'JetBrains Mono', 'IBM Plex Mono', 'Courier Prime', 'Space Mono'],
}

const colorThemes = [
  { name: 'Indigo',    accent: '#6366f1', border: '#e5e7eb' },
  { name: 'Ocean',     accent: '#0E7490', border: '#cffafe' },
  { name: 'Forest',    accent: '#15803d', border: '#dcfce7' },
  { name: 'Rose',      accent: '#be185d', border: '#fce7f3' },
  { name: 'Slate',     accent: '#334155', border: '#e2e8f0' },
  { name: 'Amber',     accent: '#b45309', border: '#fef3c7' },
  { name: 'Crimson',   accent: '#b91c1c', border: '#fee2e2' },
  { name: 'Violet',    accent: '#7c3aed', border: '#ede9fe' },
  { name: 'Teal',      accent: '#0f766e', border: '#ccfbf1' },
  { name: 'Graphite',  accent: '#374151', border: '#f3f4f6' },
]

function applyTheme(theme) {
  updateSetting('accentColor', theme.accent)
  updateSetting('borderColor', theme.border)
}

const presetColors = [
  '#111827', '#374151', '#4B5563', '#0F766E', '#0E7490',
  '#1D4ED8', '#4338CA', '#6D28D9', '#7C3AED', '#0EA5E9',
  '#7C2D12', '#9F1239', '#BE185D', '#DC2626', '#D97706',
]

const accentApplyOptions = [
  { key: 'accentName', label: 'Name' },
  { key: 'accentJobTitle', label: 'Job Title' },
  { key: 'accentHeadings', label: 'Headings' },
  { key: 'accentHeadingLine', label: 'Heading Line' },
  { key: 'accentDots', label: 'Dots/Bars' },
  { key: 'accentDates', label: 'Dates' },
  { key: 'accentSubtitle', label: 'Entry Subtitle' },
  { key: 'accentLinkIcons', label: 'Link Icons' },
  { key: 'accentHeaderIcons', label: 'Header Icons' },
]

const headingStyles = [
  { value: 'plain', label: 'Plain' },
  { value: 'underline', label: 'Underline' },
  { value: 'leftbar', label: 'Left Bar' },
  { value: 'bold', label: 'Bold' },
  { value: 'filled', label: 'Filled' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'centered', label: 'Centered' },
  { value: 'wavy', label: 'Wavy' },
]
</script>

<template>
  <div class="p-5 flex flex-col gap-6">
    <!-- Font -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Font</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="cat in fontCategories"
            :key="cat.value"
            @click="updateSetting('fontCategory', cat.value)"
            :class="[
              'flex flex-col items-center py-3 rounded-xl border-2 transition-all',
              activeSettings.fontCategory === cat.value
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
            ]"
          >
            <span
              :class="[
                'text-xl font-bold',
                cat.style,
                activeSettings.fontCategory === cat.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400',
              ]"
              >Aa</span
            >
            <span
              :class="[
                'text-xs mt-1',
                activeSettings.fontCategory === cat.value ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500',
              ]"
              >{{ cat.label }}</span
            >
          </button>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="font in fontFamilies[activeSettings.fontCategory]"
            :key="font"
            @click="updateSetting('fontFamily', font)"
            :class="[
              'text-xs px-2 py-2 rounded-lg border-2 transition-all truncate',
              activeSettings.fontFamily === font
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700',
            ]"
            :style="{ fontFamily: font }"
          >
            {{ font }}
          </button>
        </div>
      </div>
    </div>

    <!-- Colors -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Colors</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <!-- Theme palettes -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Theme</label>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="theme in colorThemes"
              :key="theme.name"
              @click="applyTheme(theme)"
              :title="theme.name"
              :class="[
                'flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg border-2 transition-all',
                activeSettings.accentColor === theme.accent
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              <div class="flex gap-0.5">
                <div class="w-3.5 h-3.5 rounded-full" :style="{ backgroundColor: theme.accent }" />
                <div class="w-3.5 h-3.5 rounded-full border border-gray-200" :style="{ backgroundColor: theme.border }" />
              </div>
              <span class="text-[10px] text-gray-500 dark:text-gray-400 leading-none">{{ theme.name }}</span>
            </button>
          </div>
        </div>

        <!-- Accent color -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Accent Color</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <button
              v-for="color in presetColors"
              :key="color"
              @click="updateSetting('accentColor', color)"
              :style="{ backgroundColor: color }"
              :class="[
                'w-6 h-6 rounded-full border-2 transition-all',
                activeSettings.accentColor === color
                  ? 'border-indigo-400 scale-110'
                  : 'border-transparent',
              ]"
            />
            <label
              class="relative w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 overflow-hidden cursor-pointer flex items-center justify-center"
              title="Custom color"
            >
              <input
                type="color"
                :value="activeSettings.accentColor"
                @input="updateSetting('accentColor', $event.target.value)"
                class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <span class="text-gray-400 dark:text-gray-500 text-xs pointer-events-none">+</span>
            </label>
          </div>
          <div class="flex items-center gap-2 mt-1">
            <div
              class="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600"
              :style="{ backgroundColor: activeSettings.accentColor }"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ activeSettings.accentColor }}</span>
          </div>
        </div>

        <!-- Border color -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Border Color</label>
          <div class="flex items-center gap-2">
            <input
              type="color"
              :value="activeSettings.borderColor"
              @input="updateSetting('borderColor', $event.target.value)"
              class="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-600"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ activeSettings.borderColor }}</span>
          </div>
        </div>

        <!-- Apply accent to -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Apply Accent Color To</label>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <label
              v-for="opt in accentApplyOptions"
              :key="opt.key"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="activeSettings[opt.key]"
                @change="updateSetting(opt.key, $event.target.checked)"
                class="accent-indigo-600 w-3.5 h-3.5"
              />
              <span class="text-xs text-gray-600 dark:text-gray-400">{{ opt.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Headings -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
        Section Headings
      </h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <!-- Style -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Style</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="style in headingStyles"
              :key="style.value"
              @click="updateSetting('headingStyle', style.value)"
              :class="[
                'flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg border-2 transition-all',
                activeSettings.headingStyle === style.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              <div class="w-full flex flex-col items-start px-1">
                <div
                  class="text-xs w-full text-gray-600 dark:text-gray-300 leading-none"
                  :style="{
                    borderBottom: ['underline', 'dotted'].includes(style.value)
                      ? `2px ${style.value === 'dotted' ? 'dotted' : 'solid'} currentColor`
                      : '',
                    borderLeft: style.value === 'leftbar' ? '3px solid #6366f1' : '',
                    paddingLeft: style.value === 'leftbar' ? '3px' : '',
                    background: style.value === 'filled' ? '#6366f1' : '',
                    color: style.value === 'filled' ? 'white' : '',
                    padding: style.value === 'filled' ? '1px 3px' : '',
                    textAlign: style.value === 'centered' ? 'center' : '',
                    fontWeight: style.value === 'bold' ? '900' : '',
                    textDecoration: style.value === 'wavy' ? 'underline wavy' : '',
                  }"
                >
                  HEADING
                </div>
              </div>
              <span class="text-xs text-gray-400 dark:text-gray-500">{{ style.label }}</span>
            </button>
          </div>
        </div>

        <!-- Capitalization -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Capitalization</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="cap in ['capitalize', 'uppercase']"
              :key="cap"
              @click="updateSetting('headingCapitalization', cap)"
              :class="[
                'py-2 text-xs rounded-lg border-2 font-medium transition-all',
                activeSettings.headingCapitalization === cap
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              {{ cap.charAt(0).toUpperCase() + cap.slice(1) }}
            </button>
          </div>
        </div>

        <!-- Size -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Size</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="size in ['S', 'M', 'L', 'XL']"
              :key="size"
              @click="updateSetting('headingSize', size)"
              :class="[
                'py-2 text-xs rounded-lg border-2 font-semibold transition-all',
                activeSettings.headingSize === size
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Icons -->
        <div>
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Icons</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="icon in ['none', 'outline', 'filled']"
              :key="icon"
              @click="updateSetting('headingIcons', icon)"
              :class="[
                'py-2 text-xs rounded-lg border-2 font-medium transition-all capitalize',
                activeSettings.headingIcons === icon
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              {{ icon }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Link Styling -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Link Styling</h3>
      <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <label
          v-for="opt in [
            { key: 'linkUnderline', label: 'Underline links' },
            { key: 'linkBlueColor', label: 'Blue color' },
            { key: 'linkIcon', label: 'Show link icon' },
          ]"
          :key="opt.key"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="activeSettings[opt.key]"
            @change="updateSetting(opt.key, $event.target.checked)"
            class="accent-indigo-600 w-3.5 h-3.5"
          />
          <span class="text-xs text-gray-600 dark:text-gray-400">{{ opt.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
