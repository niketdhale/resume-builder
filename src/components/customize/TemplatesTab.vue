<script setup>
import { inject, computed } from 'vue'
import { TEMPLATES } from '../../constants/templates'

const activeSettings = inject('activeSettings')
const updateSetting  = inject('updateSetting')

function applyTemplate(template) {
  const keys = [
    'accentColor', 'borderColor', 'fontCategory', 'fontFamily',
    'fontSize', 'lineHeight', 'marginX', 'marginY',
    'headingStyle', 'headingCapitalization', 'headingSize',
    'headerLayout', 'headerPosition', 'accentHeadings', 'accentHeadingLine',
    'accentName', 'accentJobTitle', 'columns',
    'sidebarBgColor', 'sidebarTextColor', 'contactLayout',
    'headerBgColor', 'headerTextColor',
  ]
  keys.forEach((key) => {
    if (template[key] !== undefined) updateSetting(key, template[key])
  })
}

// Detect active template — all controlled keys must match
const activeTemplateId = computed(() => {
  const s = activeSettings.value
  const match = TEMPLATES.find((t) =>
    t.accentColor    === s.accentColor &&
    t.fontFamily     === s.fontFamily  &&
    t.headingStyle   === s.headingStyle &&
    t.columns        === s.columns &&
    (t.headerPosition || 'top') === (s.headerPosition || 'top') &&
    (t.sidebarBgColor || '') === (s.sidebarBgColor || '') &&
    (t.headerBgColor  || '') === (s.headerBgColor  || ''),
  )
  return match?.id ?? null
})

// ─── Mini preview helpers ─────────────────────────────────────────────────────

function headingPreviewStyle(t) {
  const base = { fontSize: '7px', fontWeight: '700', letterSpacing: '0.05em', lineHeight: '1', color: '#374151' }
  if (t.headingCapitalization === 'uppercase') base.textTransform = 'uppercase'
  if (t.headingStyle === 'underline')  return { ...base, borderBottom: `1.5px solid ${t.accentColor}`, paddingBottom: '1px' }
  if (t.headingStyle === 'leftbar')    return { ...base, borderLeft: `2px solid ${t.accentColor}`, paddingLeft: '3px' }
  if (t.headingStyle === 'filled')     return { ...base, background: t.accentColor, color: '#fff', padding: '1px 3px', borderRadius: '1px' }
  if (t.headingStyle === 'bold')       return { ...base, fontWeight: '900' }
  if (t.headingStyle === 'centered')   return { ...base, textAlign: 'center', borderBottom: `1px solid ${t.accentColor}`, paddingBottom: '1px' }
  return base
}
</script>

<template>
  <div class="p-5 flex flex-col gap-4">
    <p class="text-xs text-gray-400 dark:text-gray-500">
      Applying a template overwrites fonts, colors, spacing, and heading style. Your content stays untouched.
    </p>

    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="t in TEMPLATES"
        :key="t.id"
        @click="applyTemplate(t)"
        :class="[
          'flex flex-col text-left rounded-xl border-2 overflow-hidden transition-all',
          activeTemplateId === t.id
            ? 'border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-indigo-950/40'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm',
        ]"
      >
        <!-- Mini resume preview card -->
        <div class="w-full overflow-hidden" :style="{ backgroundColor: '#fff', minHeight: '88px' }">

          <!-- ── SIDEBAR preview ── -->
          <div v-if="t.sidebarBgColor" class="flex h-full" style="min-height: 88px;">
            <div class="flex flex-col items-center gap-1 flex-shrink-0" style="width: 38%; padding: 6px 4px;" :style="{ backgroundColor: t.sidebarBgColor }">
              <div class="rounded-full" style="width: 16px; height: 16px; background: rgba(255,255,255,0.25); border: 1.5px solid rgba(255,255,255,0.4); flex-shrink: 0;" />
              <div class="rounded-sm" style="height: 4px; width: 70%; background: rgba(255,255,255,0.85);" />
              <div class="rounded-sm" style="height: 2.5px; width: 55%; background: rgba(255,255,255,0.5);" />
              <div style="width: 80%; height: 1px; background: rgba(255,255,255,0.2); margin: 1px 0;" />
              <div class="rounded-sm" style="height: 2px; width: 80%; background: rgba(255,255,255,0.4);" />
              <div class="rounded-sm" style="height: 2px; width: 80%; background: rgba(255,255,255,0.4);" />
              <div class="rounded-sm" style="height: 2px; width: 75%; background: rgba(255,255,255,0.4);" />
            </div>
            <div class="flex-1 flex flex-col gap-1" style="padding: 6px;">
              <div :style="headingPreviewStyle(t)">Experience</div>
              <div class="rounded-sm" :style="{ height: '2.5px', width: '90%', backgroundColor: '#d1d5db' }" />
              <div class="rounded-sm" :style="{ height: '2px', width: '70%', backgroundColor: '#e5e7eb' }" />
              <div class="rounded-sm" :style="{ height: '2px', width: '80%', backgroundColor: '#e5e7eb' }" />
              <div :style="{ ...headingPreviewStyle(t), marginTop: '4px' }">Education</div>
              <div class="rounded-sm" :style="{ height: '2px', width: '75%', backgroundColor: '#e5e7eb' }" />
            </div>
          </div>

          <!-- ── TWO-TONE header preview ── -->
          <div v-else-if="t.headerBgColor" class="flex flex-col" style="min-height: 88px;">
            <div class="flex items-end justify-between flex-shrink-0" style="padding: 6px 8px 5px;" :style="{ backgroundColor: t.headerBgColor }">
              <div class="flex flex-col gap-1">
                <div class="rounded-sm" style="height: 5px; width: 65px; background: rgba(255,255,255,0.9);" />
                <div class="rounded-sm" style="height: 3px; width: 50px; background: rgba(255,255,255,0.55);" />
              </div>
              <div class="flex flex-col gap-1 items-end">
                <div class="rounded-sm" style="height: 2px; width: 36px; background: rgba(255,255,255,0.45);" />
                <div class="rounded-sm" style="height: 2px; width: 28px; background: rgba(255,255,255,0.45);" />
              </div>
            </div>
            <div class="flex-1 flex flex-col gap-1" style="padding: 5px 8px;">
              <div :style="headingPreviewStyle(t)">Experience</div>
              <div class="rounded-sm" :style="{ height: '2.5px', width: '88%', backgroundColor: '#d1d5db' }" />
              <div class="rounded-sm" :style="{ height: '2px', width: '72%', backgroundColor: '#e5e7eb' }" />
              <div class="rounded-sm" :style="{ height: '2px', width: '80%', backgroundColor: '#e5e7eb' }" />
            </div>
          </div>

          <!-- ── DEFAULT preview ── -->
          <div v-else class="w-full p-3 flex flex-col gap-1.5">
            <!-- Name bar -->
            <div class="flex items-center justify-between gap-1">
              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <div class="rounded-sm" :style="{ height: '5px', width: '55%', backgroundColor: t.accentColor }" />
                <div class="rounded-sm" :style="{ height: '3px', width: '38%', backgroundColor: '#9ca3af' }" />
              </div>
              <!-- Column indicator -->
              <div v-if="t.columns === 'two'" class="flex gap-0.5 flex-shrink-0">
                <div class="w-4 h-7 rounded-sm" :style="{ backgroundColor: t.borderColor || '#e5e7eb' }" />
                <div class="w-4 h-7 rounded-sm" :style="{ backgroundColor: t.borderColor || '#e5e7eb' }" />
              </div>
              <div v-else-if="t.columns === 'mix'" class="flex gap-0.5 flex-shrink-0">
                <div class="w-3 h-7 rounded-sm" :style="{ backgroundColor: t.borderColor || '#e5e7eb' }" />
                <div class="w-5 h-7 rounded-sm" :style="{ backgroundColor: t.borderColor || '#e5e7eb' }" />
              </div>
            </div>
            <!-- Divider -->
            <div class="w-full h-px" :style="{ backgroundColor: t.borderColor || '#e5e7eb' }" />
            <!-- Sample heading -->
            <div :style="headingPreviewStyle(t)">Experience</div>
            <!-- Sample content lines -->
            <div class="flex flex-col gap-0.5">
              <div class="rounded-sm" :style="{ height: '3px', width: '70%', backgroundColor: '#d1d5db' }" />
              <div class="rounded-sm" :style="{ height: '2.5px', width: '55%', backgroundColor: '#e5e7eb' }" />
              <div class="rounded-sm" :style="{ height: '2.5px', width: '80%', backgroundColor: '#e5e7eb' }" />
            </div>
          </div>

        </div>

        <!-- Template info -->
        <div
          class="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-gray-800 dark:text-gray-100">{{ t.name }}</span>
            <span
              v-if="activeTemplateId === t.id"
              class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400"
            >Active</span>
          </div>
          <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{{ t.description }}</p>
        </div>
      </button>
    </div>
  </div>
</template>
