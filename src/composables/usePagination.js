import { ref, computed, watch, nextTick } from 'vue'

// ─── Page dimensions at 96dpi (mm → px: mm / 25.4 * 96) ─────────────────────
const PAGE_HEIGHTS_PX = {
  A4: 1122,
  A3: 1587,
  Letter: 1056,
  Legal: 1344,
}

// Gap between sections in px (matches entrySpacing * 2 used in ResumePage)
const SECTION_GAP = 16
const HEADER_FALLBACK_PX = 120
const SECTION_FALLBACK_PX = 80

export function usePagination(sections, pageSize, settings, containerRef) {
  const sectionHeights = ref({})
  const headerHeight = ref(HEADER_FALLBACK_PX)

  // ─── Available content height per page (minus top+bottom margins) ──────────
  const pageContentHeight = computed(() => {
    const totalPx = PAGE_HEIGHTS_PX[pageSize.value] || PAGE_HEIGHTS_PX.A4
    const marginPx = (settings.value?.marginY || 12) * (96 / 25.4) * 2
    return Math.floor(totalPx - marginPx)
  })

  // ─── Measure all sections in the hidden container ──────────────────────────
  async function measureAndSplit() {
    await nextTick()
    if (!containerRef.value) return

    // Measure header
    const headerEl = containerRef.value.querySelector('[data-measure="header"]')
    headerHeight.value = headerEl
      ? Math.ceil(headerEl.getBoundingClientRect().height) + 24
      : HEADER_FALLBACK_PX

    // Measure each section individually
    const heights = {}
    for (const section of sections.value) {
      const el = containerRef.value.querySelector(`[data-measure="section-${section.id}"]`)
      if (el) {
        // section height = heading + content + gap below
        heights[section.id] = Math.ceil(el.getBoundingClientRect().height) + SECTION_GAP
      } else {
        heights[section.id] = SECTION_FALLBACK_PX
      }
    }
    sectionHeights.value = heights
  }

  // ─── Pagination algorithm ──────────────────────────────────────────────────
  // In 1-col mode: sections flow top-to-bottom, we fill pages sequentially.
  // In 2-col/mix mode: left and right sections run in parallel columns.
  //   The page height is consumed by whichever column is taller.
  //   We advance both columns together page-by-page.

  const pages = computed(() => {
    const allSections = sections.value
    if (!allSections.length) return [{ sections: [], isFirstPage: true }]

    const pageH = pageContentHeight.value
    const headerH = headerHeight.value
    const firstAvail = pageH - headerH
    const otherAvail = pageH

    const isMultiCol =
      settings.value?.columns === 'two' || settings.value?.columns === 'mix'
    const columnLayout = settings.value?.columnLayout || { left: [], right: [] }

    const getH = (id) => sectionHeights.value[id] || SECTION_FALLBACK_PX

    // ── Single column ──────────────────────────────────────────────────────
    if (!isMultiCol) {
      const result = []
      let pageSections = []
      let usedH = 0
      let isFirst = true

      for (const section of allSections) {
        const avail = isFirst ? firstAvail : otherAvail
        const secH = getH(section.id)

        if (pageSections.length > 0 && usedH + secH > avail) {
          result.push({ sections: pageSections, isFirstPage: isFirst })
          pageSections = [section]
          usedH = secH
          isFirst = false
        } else {
          pageSections.push(section)
          usedH += secH
        }
      }

      if (pageSections.length > 0) {
        result.push({ sections: pageSections, isFirstPage: isFirst && result.length === 0 })
      }

      return result.length ? result : [{ sections: [], isFirstPage: true }]
    }

    // ── Multi-column ───────────────────────────────────────────────────────
    // Separate sections by column assignment
    const leftIds = columnLayout.left || []
    const rightIds = columnLayout.right || []

    // Preserve drag order: follow the IDs array order, then fall back to section.column
    const leftSections = leftIds.length > 0
      ? leftIds.map((id) => allSections.find((s) => s.id === id)).filter(Boolean)
      : allSections.filter((s) => s.column === 'left')

    const rightSections = rightIds.length > 0
      ? rightIds.map((id) => allSections.find((s) => s.id === id)).filter(Boolean)
      : allSections.filter((s) => s.column === 'right')

    const fullSections = allSections.filter((s) => s.column === 'full')

    const result = []
    let leftIdx = 0
    let rightIdx = 0
    let fullIdx = 0
    let isFirst = true

    while (leftIdx < leftSections.length || rightIdx < rightSections.length || fullIdx < fullSections.length) {
      const avail = isFirst ? firstAvail : otherAvail

      // Pack full-width sections first on this page
      const pageFullSections = []
      let usedForFull = 0
      while (fullIdx < fullSections.length) {
        const h = getH(fullSections[fullIdx].id)
        if (usedForFull + h <= avail) {
          pageFullSections.push(fullSections[fullIdx])
          usedForFull += h
          fullIdx++
        } else {
          break
        }
      }

      const remainingH = avail - usedForFull

      // Pack left column
      const pageLeftSections = []
      let leftUsed = 0
      while (leftIdx < leftSections.length) {
        const h = getH(leftSections[leftIdx].id)
        if (leftUsed + h <= remainingH) {
          pageLeftSections.push(leftSections[leftIdx])
          leftUsed += h
          leftIdx++
        } else {
          break
        }
      }

      // Pack right column (same available height)
      const pageRightSections = []
      let rightUsed = 0
      while (rightIdx < rightSections.length) {
        const h = getH(rightSections[rightIdx].id)
        if (rightUsed + h <= remainingH) {
          pageRightSections.push(rightSections[rightIdx])
          rightUsed += h
          rightIdx++
        } else {
          break
        }
      }

      // Combine all sections for this page (full-width first, then left+right interleaved
      // so ResumePage can split them again by column)
      const pageSections = [
        ...pageFullSections,
        ...mergeByColumn(pageLeftSections, pageRightSections),
      ]

      result.push({ sections: pageSections, isFirstPage: isFirst })
      isFirst = false

      // Safety: if nothing was packed (single section too tall), force-advance
      if (pageLeftSections.length === 0 && pageRightSections.length === 0 && pageFullSections.length === 0) {
        // Force include next section to avoid infinite loop
        const next =
          leftIdx < leftSections.length
            ? leftSections[leftIdx++]
            : rightIdx < rightSections.length
              ? rightSections[rightIdx++]
              : fullSections[fullIdx++]
        result[result.length - 1].sections.push(next)
      }
    }

    return result.length ? result : [{ sections: [], isFirstPage: true }]
  })

  // ─── Interleave left/right sections preserving relative order ──────────────
  // ResumePage will re-split them by section.column, so order doesn't matter much,
  // but keeping them interleaved ensures both columns appear on the same page.
  function mergeByColumn(left, right) {
    const merged = []
    const max = Math.max(left.length, right.length)
    for (let i = 0; i < max; i++) {
      if (left[i]) merged.push(left[i])
      if (right[i]) merged.push(right[i])
    }
    return merged
  }

  // ─── Re-measure whenever anything affecting layout changes ─────────────────
  watch(
    [
      sections,
      pageSize,
      () => settings.value?.fontSize,
      () => settings.value?.lineHeight,
      () => settings.value?.marginY,
      () => settings.value?.marginX,
      () => settings.value?.entrySpacing,
      () => settings.value?.fontFamily,
      () => settings.value?.columns,
      () => settings.value?.columnLayout,
    ],
    async () => {
      await measureAndSplit()
    },
    { deep: true, immediate: true },
  )

  return { pages, measureAndSplit }
}
