import { ref, computed, watch, nextTick } from 'vue'

// ─── Page heights in px at 96dpi (mm / 25.4 * 96) ────────────────────────────
const PAGE_HEIGHTS_PX = {
  A4: 1122,
  A3: 1587,
  Letter: 1056,
  Legal: 1344,
}

const SECTION_GAP_PX = 20
const HEADER_FALLBACK = 100
const SECTION_FALLBACK = 80

export function usePagination(sections, pageSize, settings, containerRef) {
  const sectionHeights = ref({})
  const headerHeight = ref(HEADER_FALLBACK)
  const isMeasured = ref(false)

  // ─── Available content height per page ─────────────────────────────────────
  const pageContentHeight = computed(() => {
    const totalPx = PAGE_HEIGHTS_PX[pageSize.value] || PAGE_HEIGHTS_PX.A4
    const marginPx = (settings.value.marginY || 12) * (96 / 25.4) * 2
    return Math.floor(totalPx - marginPx)
  })

  // ─── Measure DOM ───────────────────────────────────────────────────────────
  async function measureAndSplit() {
    await nextTick()
    if (!containerRef.value) return

    // Measure header
    const headerEl = containerRef.value.querySelector('[data-measure="header"]')
    if (headerEl) {
      headerHeight.value = Math.ceil(headerEl.getBoundingClientRect().height) + 32
    }

    // Measure each section
    const heights = {}
    sections.value.forEach((section) => {
      const el = containerRef.value.querySelector(`[data-measure="section-${section.id}"]`)
      heights[section.id] = el
        ? Math.ceil(el.getBoundingClientRect().height) + SECTION_GAP_PX
        : SECTION_FALLBACK
    })
    sectionHeights.value = heights
    isMeasured.value = true
  }

  // ─── Splitting algorithm ───────────────────────────────────────────────────
  const pages = computed(() => {
    const allSections = sections.value
    if (!allSections.length) return [{ sections: [], isFirstPage: true }]

    const pageH = pageContentHeight.value
    const firstPageH = pageH - headerHeight.value
    const otherPageH = pageH

    const result = []
    let pageSections = []
    let usedH = 0
    let isFirst = true

    for (const section of allSections) {
      const maxH = isFirst ? firstPageH : otherPageH
      const secH = sectionHeights.value[section.id] || SECTION_FALLBACK

      if (pageSections.length > 0 && usedH + secH > maxH) {
        // Commit current page
        result.push({ sections: pageSections, isFirstPage: isFirst })
        pageSections = [section]
        usedH = secH
        isFirst = false
      } else {
        pageSections.push(section)
        usedH += secH
      }
    }

    // Last page
    if (pageSections.length > 0) {
      result.push({ sections: pageSections, isFirstPage: isFirst && result.length === 0 })
    }

    return result.length ? result : [{ sections: [], isFirstPage: true }]
  })

  // ─── Re-measure on any relevant change ────────────────────────────────────
  watch(
    [
      sections,
      pageSize,
      () => settings.value.fontSize,
      () => settings.value.lineHeight,
      () => settings.value.marginY,
      () => settings.value.entrySpacing,
      () => settings.value.fontFamily,
    ],
    async () => {
      isMeasured.value = false
      await measureAndSplit()
    },
    { deep: true, immediate: true },
  )

  return { pages, isMeasured, measureAndSplit }
}
