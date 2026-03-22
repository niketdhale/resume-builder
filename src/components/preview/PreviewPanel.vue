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

// ─── columnLayout reactive ────────────────────────────────────────────────────
const columnLayout = computed(
  () => activeSettings.value?.columnLayout || { left: [], right: [] },
)

// ─── Filtered sections (only sections with at least one visible entry) ────────
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

// ─── Zoom modal ───────────────────────────────────────────────────────────────
const showZoomModal = ref(false)
function openZoom() { showZoomModal.value = true }
function closeZoom() { showZoomModal.value = false }
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- ══ EMPTY STATE ══ -->
    <div
      v-if="!hasMetadata && previewSections.length === 0"
      class="bg-white dark:bg-gray-800 shadow-md rounded-xl flex flex-col items-center justify-center py-24 text-gray-300 dark:text-gray-600"
    >
      <span class="text-5xl mb-4">📄</span>
      <p class="text-sm font-medium text-gray-400 dark:text-gray-500">
        Your resume preview will appear here
      </p>
      <p class="text-xs text-gray-300 dark:text-gray-600 mt-1">
        Fill in Resume Info and add entries to get started
      </p>
    </div>

    <!-- ══ PAGES ══ -->
    <div class="preview-pages-wrapper flex flex-col gap-4">
      <div v-for="(page, index) in pages" :key="index" class="cursor-zoom-in" @click="openZoom">
        <ResumePage
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
          :columnLayout="columnLayout"
          :show="show"
          :sectionContentProps="sectionContentProps"
        />
      </div>
    </div>

    <!-- ══ ZOOM MODAL ══ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showZoomModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          @click.self="closeZoom"
        >
          <div class="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-hide p-8">
            <button
              @click="closeZoom"
              class="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 shadow-lg text-gray-600 hover:text-gray-900 hover:bg-white transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="flex flex-col gap-6 items-center">
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
                :columnLayout="columnLayout"
                :show="show"
                :sectionContentProps="sectionContentProps"
                class="shadow-2xl"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ HIDDEN MEASUREMENT CONTAINER ══
         Renders each section individually at page width so usePagination
         can measure real heights. Do NOT render full ResumePage here —
         that creates a circular dependency (pages depends on heights,
         heights measured from pages).
    ══ -->
    <div
      ref="measureContainer"
      class="fixed top-0 left-0 opacity-0 pointer-events-none"
      style="z-index: -1"
      :style="{
        width: activePageSize === 'A3' ? '420px' : activePageSize === 'Letter' ? '384px' : '360px',
        fontSize: s.fontSize + 'pt',
        fontFamily: s.fontFamily + ', sans-serif',
        lineHeight: s.lineHeight,
      }"
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

      <!-- Measure each section individually -->
      <div
        v-for="section in previewSections"
        :key="section.id"
        :data-measure="`section-${section.id}`"
        style="padding-bottom: 4px"
      >
        <!-- Section heading -->
        <span :style="headingStyle">{{ section.title }}</span>
        <!-- Section content at actual width -->
        <SectionContent :section="section" v-bind="sectionContentProps" />
      </div>
    </div>

  </div>
</template>
