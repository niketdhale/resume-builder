<script setup>
import { inject, computed, ref, onMounted } from 'vue'
import ResumePage from './ResumePage.vue'
import ResumeHeader from './ResumeHeader.vue'
import SectionContent from './SectionContent.vue'
import { usePreviewStyles } from './usePreviewStyles'
import { usePagination } from '../../composables/usePagination'

// ─── Injected state ───────────────────────────────────────────────────────────
const activeSections = inject('activeSections')
const activeMetadata = inject('activeMetadata')
const activePageSize = inject('activePageSize')
const activeSettings = inject('activeSettings')

// ─── Styles ───────────────────────────────────────────────────────────────────
const {
  s,
  headingStyle,
  nameStyle,
  jobTitleStyle,
  iconStyle,
  headerPos,
  headerLayout,
  isTwoCol,
  isMixCol,
  show,
  sectionContentProps,
} = usePreviewStyles(activeSettings)

// ─── Filtered sections ────────────────────────────────────────────────────────
const previewSections = computed(() =>
  activeSections.value
    .map((sec) => ({ ...sec, visibleEntries: sec.entries.filter((e) => e.isVisible) }))
    .filter((sec) => sec.visibleEntries.length > 0),
)

const hasMetadata = computed(() => {
  const m = activeMetadata.value
  return (
    m && (m.fullName || m.jobTitle || m.email || m.phone || m.location || m.linkedin || m.website)
  )
})

// ─── Measurement container ref ────────────────────────────────────────────────
const measureContainer = ref(null)

// ─── Pagination ───────────────────────────────────────────────────────────────
const { pages, measureAndSplit } = usePagination(
  previewSections,
  activePageSize,
  activeSettings,
  measureContainer,
)

onMounted(() => measureAndSplit())
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- ══════════════════════════════════════
         EMPTY STATE
    ══════════════════════════════════════ -->
    <div
      v-if="!hasMetadata && previewSections.length === 0"
      class="bg-white shadow-md rounded-xl flex flex-col items-center justify-center py-24 text-gray-300"
    >
      <span class="text-5xl mb-4">📄</span>
      <p class="text-sm font-medium text-gray-400">Your resume preview will appear here</p>
      <p class="text-xs text-gray-300 mt-1">Fill in Resume Info and add entries to get started</p>
    </div>

    <!-- ══════════════════════════════════════
         PAGES
    ══════════════════════════════════════ -->
    <ResumePage
      v-for="(page, index) in pages"
      :key="index"
      :pageSize="activePageSize"
      :isFirstPage="page.isFirstPage"
      :sections="page.sections"
      :metadata="activeMetadata"
      :s="s"
      :headingStyle="headingStyle"
      :nameStyle="nameStyle"
      :jobTitleStyle="jobTitleStyle"
      :iconStyle="iconStyle"
      :headerPos="headerPos"
      :headerLayout="headerLayout"
      :isTwoCol="isTwoCol"
      :isMixCol="isMixCol"
      :show="show"
      :sectionContentProps="sectionContentProps"
    />

    <!-- ══════════════════════════════════════
         HIDDEN MEASUREMENT CONTAINER
         Renders all sections invisibly so
         usePagination can measure real heights
    ══════════════════════════════════════ -->
    <div
      ref="measureContainer"
      class="fixed top-0 left-0 opacity-0 pointer-events-none"
      style="width: 60vw; z-index: -1"
      aria-hidden="true"
    >
      <!-- Measure header -->
      <div data-measure="header">
        <ResumeHeader
          :metadata="activeMetadata"
          :s="s"
          :nameStyle="nameStyle"
          :jobTitleStyle="jobTitleStyle"
          :iconStyle="iconStyle"
          :headerLayout="headerLayout"
          :show="show"
        />
      </div>

      <!-- Measure each section -->
      <div
        v-for="section in previewSections"
        :key="section.id"
        :data-measure="`section-${section.id}`"
        class="mb-4"
      >
        <span :style="headingStyle">{{ section.title }}</span>
        <SectionContent :section="section" v-bind="sectionContentProps" />
      </div>
    </div>
  </div>
</template>
