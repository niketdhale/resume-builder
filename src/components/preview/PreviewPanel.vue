<script setup>
import { inject, computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import ResumePage from './ResumePage.vue'
import ResumeHeader from './ResumeHeader.vue'
import SectionContent from './SectionContent.vue'
import { usePreviewStyles } from './usePreviewStyles'
import { usePagination } from '../../composables/usePagination'

const activeSections = inject('activeSections')
const activeMetadata = inject('activeMetadata')
const activePageSize = inject('activePageSize')
const activeSettings = inject('activeSettings')

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

const columnLayout = computed(
  () => activeSettings.value?.columnLayout || { left: [], right: [] },
)

const previewSections = computed(() =>
  activeSections.value
    .filter((sec) => !sec.isHidden)
    .map((sec) => ({ ...sec, visibleEntries: sec.entries.filter((e) => e.isVisible) }))
    .filter((sec) => sec.visibleEntries.length > 0),
)

const hasMetadata = computed(() => {
  const m = activeMetadata.value
  return m && (m.fullName || m.jobTitle || m.email || m.phone || m.location || m.linkedin || m.website)
})

const measureContainer = ref(null)

const { pages, measureAndSplit } = usePagination(
  previewSections,
  activePageSize,
  activeSettings,
  measureContainer,
)

onMounted(() => measureAndSplit())

const showZoomModal = ref(false)
const userZoom = ref(1)
const MIN_ZOOM = 0.5
const MAX_ZOOM = 3

function openZoom() {
  userZoom.value = 1
  showZoomModal.value = true
}
function closeZoom() { showZoomModal.value = false }

function zoomIn() { userZoom.value = Math.min(MAX_ZOOM, +(userZoom.value + 0.25).toFixed(2)) }
function zoomOut() { userZoom.value = Math.max(MIN_ZOOM, +(userZoom.value - 0.25).toFixed(2)) }
function zoomReset() { userZoom.value = 1 }

const zoomPercent = computed(() => Math.round(userZoom.value * 100))

// Ctrl+wheel zoom (desktop)
function onModalWheel(e) {
  if (!e.ctrlKey && !e.metaKey) return
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  userZoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(userZoom.value + delta).toFixed(2)))
}

// Pinch-to-zoom (mobile)
let pinchStartDist = 0
let pinchStartZoom = 1

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function onTouchStart(e) {
  if (e.touches.length === 2) {
    pinchStartDist = getTouchDist(e.touches)
    pinchStartZoom = userZoom.value
  }
}

function onTouchMove(e) {
  if (e.touches.length === 2) {
    e.preventDefault()
    const dist = getTouchDist(e.touches)
    const scale = dist / pinchStartDist
    userZoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(pinchStartZoom * scale).toFixed(2)))
  }
}

// ─── Scale-to-fit for mobile ─────────────────────────────────────────────────
const pageSizePx = { A4: 794, A3: 1123, Letter: 816, Legal: 816 }
const previewWrapper = ref(null)
const containerWidth = ref(800)

function updateWidth() {
  if (previewWrapper.value) {
    containerWidth.value = previewWrapper.value.clientWidth
  }
}

const previewScale = computed(() => {
  const pageW = pageSizePx[activePageSize.value] || 794
  if (containerWidth.value >= pageW) return 1
  return containerWidth.value / pageW
})

// ─── Zoom modal scale ────────────────────────────────────────────────────────
const zoomWrapper = ref(null)
const zoomWidth = ref(800)

function updateZoomWidth() {
  if (zoomWrapper.value) {
    zoomWidth.value = zoomWrapper.value.clientWidth
  }
}

const ZOOM_PADDING = 40 // 20px each side minimum

const baseZoomScale = computed(() => {
  const pageW = pageSizePx[activePageSize.value] || 794
  const available = zoomWidth.value - ZOOM_PADDING
  if (available >= pageW) return 1
  return available / pageW
})

const zoomScale = computed(() => baseZoomScale.value * userZoom.value)

let resizeObserver = null
onMounted(() => {
  updateWidth()
  if (previewWrapper.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === previewWrapper.value) updateWidth()
        if (entry.target === zoomWrapper.value) updateZoomWidth()
      }
    })
    resizeObserver.observe(previewWrapper.value)
  }
})

// Watch for zoom modal opening to observe its wrapper
watch(showZoomModal, async (val) => {
  if (val) {
    await nextTick()
    if (zoomWrapper.value) {
      updateZoomWidth()
      resizeObserver?.observe(zoomWrapper.value)
    }
  }
})

onUnmounted(() => { resizeObserver?.disconnect() })
</script>

<template>
  <div class="flex flex-col gap-4">

    <div
      v-if="!hasMetadata && previewSections.length === 0"
      class="bg-white dark:bg-gray-800 shadow-md rounded-xl flex flex-col items-center justify-center py-24 text-gray-300 dark:text-gray-600"
    >
      <span class="text-5xl mb-4">📄</span>
      <p class="text-sm font-medium text-gray-400 dark:text-gray-500">Your resume preview will appear here</p>
      <p class="text-xs text-gray-300 dark:text-gray-600 mt-1">Fill in Resume Info and add entries to get started</p>
    </div>

    <div ref="previewWrapper" class="preview-pages-wrapper flex flex-col items-center" :style="{ gap: (16 * previewScale) + 'px' }">
      <div
        v-for="(page, index) in pages"
        :key="index"
        class="cursor-zoom-in"
        :style="{
          width: (pageSizePx[activePageSize] || 794) + 'px',
          transform: `scale(${previewScale})`,
          transformOrigin: 'top center',
          marginBottom: previewScale < 1 ? `-${(1 - previewScale) * (pageSizePx[activePageSize] || 794) * 1.414}px` : '0',
        }"
        @click="openZoom"
      >
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
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          @wheel.prevent="onModalWheel"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
        >
          <!-- Scrollable area — click on background closes -->
          <div
            ref="zoomWrapper"
            class="h-full py-6 pb-20"
            :class="userZoom > 1 ? 'overflow-auto' : 'overflow-y-auto overflow-x-hidden'"
            @click.self="closeZoom"
          >
            <div class="flex flex-col items-center" :style="{ gap: (16 * zoomScale) + 'px' }" @click.self="closeZoom">
              <div
                v-for="(page, index) in pages"
                :key="index"
                class="relative"
                :style="{
                  width: (pageSizePx[activePageSize] || 794) + 'px',
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  marginBottom: zoomScale < 1 ? `-${(1 - zoomScale) * (pageSizePx[activePageSize] || 794) * 1.414}px` : '0',
                }"
              >
                <!-- Close button — top-right of first page -->
                <button
                  v-if="index === 0"
                  @click="closeZoom"
                  class="absolute -top-3 -right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-lg text-gray-500 hover:text-gray-900 hover:bg-white transition"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
                  class="shadow-2xl"
                />
              </div>
            </div>
          </div>

          <!-- Zoom controls bar -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 px-2 py-1.5 rounded-full bg-gray-900/80 backdrop-blur-sm shadow-lg">
            <button
              @click="zoomOut"
              :disabled="userZoom <= MIN_ZOOM"
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium transition',
                userZoom <= MIN_ZOOM ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-white/20',
              ]"
            >-</button>
            <button
              @click="zoomReset"
              class="px-2 h-8 rounded-full text-xs font-medium text-gray-300 hover:bg-white/20 transition min-w-[52px]"
            >{{ zoomPercent }}%</button>
            <button
              @click="zoomIn"
              :disabled="userZoom >= MAX_ZOOM"
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium transition',
                userZoom >= MAX_ZOOM ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-white/20',
              ]"
            >+</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Hidden measurement container: renders each section individually -->
    <!-- Never render ResumePage here — circular dependency with pages computed -->
    <div
      ref="measureContainer"
      class="fixed top-0 left-0 opacity-0 pointer-events-none"
      :style="{
        zIndex: -1,
        width: activePageSize === 'A3' ? '420px' : activePageSize === 'Letter' ? '384px' : '360px',
        fontSize: s.fontSize + 'pt',
        fontFamily: s.fontFamily + ', sans-serif',
        lineHeight: s.lineHeight,
      }"
      aria-hidden="true"
    >
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

      <div
        v-for="section in previewSections"
        :key="section.id"
        :data-measure="`section-${section.id}`"
        style="padding-bottom: 4px"
      >
        <span :style="headingStyle">{{ section.title }}</span>
        <SectionContent :section="section" v-bind="sectionContentProps" />
      </div>
    </div>

  </div>
</template>
