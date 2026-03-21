import html2pdf from 'html2pdf.js'

/**
 * usePdfExport
 *
 * Exports all `.resume-page` elements as a PDF using html2pdf.js.
 * html2canvas is aliased to html2canvas-pro in vite.config.js, which
 * adds native oklch() support — no color workarounds needed.
 *
 * @param {import('vue').Ref<string>} activePageSize - e.g. 'A4', 'Letter'
 * @param {import('vue').Ref<object>} activeResume   - the active resume object (for title)
 */
export function usePdfExport(activePageSize, activeResume) {
  // ─── Page size → mm dimensions ────────────────────────────────────────────
  const pageDimensions = {
    A4:     { width: 210, height: 297 },
    A3:     { width: 297, height: 420 },
    Letter: { width: 216, height: 279 },
    Legal:  { width: 216, height: 356 },
  }

  // ─── Slugify resume title for filename ────────────────────────────────────
  function toSlug(title) {
    return (title || 'resume')
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  // ─── Main export function ─────────────────────────────────────────────────
  async function exportPdf() {
    const pages = document.querySelectorAll('.resume-page')
    if (!pages.length) {
      console.warn('[usePdfExport] No .resume-page elements found in DOM.')
      return
    }

    const size     = activePageSize?.value || 'A4'
    const dims     = pageDimensions[size] || pageDimensions['A4']
    const title    = activeResume?.value?.title || 'resume'
    const filename = `${toSlug(title)}.pdf`

    // Allow fonts to finish loading before rasterizing
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Single page → target directly.
    // Multi-page → clone into off-screen wrapper with CSS page breaks.
    let target
    let tempWrapper = null

    if (pages.length === 1) {
      target = pages[0]
    } else {
      tempWrapper = document.createElement('div')
      pages.forEach((page) => {
        const clone = page.cloneNode(true)
        clone.style.pageBreakAfter = 'always'
        clone.style.breakAfter = 'page'
        tempWrapper.appendChild(clone)
      })
      tempWrapper.style.position = 'fixed'
      tempWrapper.style.top = '-9999px'
      tempWrapper.style.left = '-9999px'
      document.body.appendChild(tempWrapper)
      target = tempWrapper
    }

    const options = {
      margin:      0,
      filename,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale:           2,
        useCORS:         true,
        letterRendering: true,
        logging:         false,
      },
      jsPDF: {
        unit:        'mm',
        format:      [dims.width, dims.height],
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
      },
    }

    try {
      await html2pdf().set(options).from(target).save()
    } finally {
      if (tempWrapper && tempWrapper.parentNode) {
        document.body.removeChild(tempWrapper)
      }
    }
  }

  return { exportPdf }
}
