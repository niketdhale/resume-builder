import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas-pro'
import { scheduleAutoCommit } from './useVersionControl.js'

/**
 * usePdfExport
 *
 * Exports `.resume-page` elements as a PDF using html2canvas-pro (oklch support)
 * and jsPDF. Uses PNG at scale 3 for crisp, high-quality output.
 *
 * @param {import('vue').Ref<string>} activePageSize - e.g. 'A4', 'Letter'
 * @param {import('vue').Ref<object>} activeResume   - the active resume object (for title)
 */
export function usePdfExport(activePageSize, activeResume) {
  // ─── Page size → mm dimensions ────────────────────────────────────────────
  const pageDimensions = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
  }

  // ─── Slugify resume title for filename ────────────────────────────────────
  function toSlug(title) {
    return (title || 'resume')
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  // ─── Capture one DOM element as a high-res canvas ─────────────────────────
  // scale: 3 = 3× device pixels → sharp text and borders in the PDF
  // PNG (lossless) preserves font hinting, hairlines, and gradient-free resumes
  async function captureElement(element, scale = 3) {
    return html2canvas(element, {
      scale,
      useCORS: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff',
      removeContainer: true,
    })
  }

  // ─── Main export function ─────────────────────────────────────────────────
  async function exportPdf() {
    // Only capture the preview panel pages, not the hidden measurement container
    // The measurement container also contains .resume-page elements — exclude them
    // by querying only inside the visible preview panel wrapper.
    const previewWrapper = document.querySelector('.preview-pages-wrapper')
    const pages = previewWrapper
      ? previewWrapper.querySelectorAll('.resume-page')
      : document.querySelectorAll('.resume-page')

    if (!pages.length) {
      console.warn('[usePdfExport] No .resume-page elements found in DOM.')
      return
    }

    const size = activePageSize?.value || 'A4'
    const dims = pageDimensions[size] || pageDimensions['A4']
    const title = activeResume?.value?.title || 'resume'
    const filename = `${toSlug(title)}.pdf`

    // Small delay to ensure any pending Vue renders have flushed
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Temporarily remove CSS transforms on page wrappers so html2canvas
    // captures at full resolution (transforms cause scaled-down captures on mobile)
    const pageWrappers = []
    pages.forEach((page) => {
      const wrapper = page.parentElement
      if (wrapper && wrapper.style.transform) {
        pageWrappers.push({ el: wrapper, transform: wrapper.style.transform })
        wrapper.style.transform = 'none'
      }
    })

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [dims.width, dims.height],
        compress: true,
      })

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage([dims.width, dims.height])

        const canvas = await captureElement(pages[i], 3)

        // Use PNG for lossless quality — no JPEG compression artifacts on text
        const imgData = canvas.toDataURL('image/png')

        pdf.addImage(imgData, 'PNG', 0, 0, dims.width, dims.height, '', 'FAST')
      }

      pdf.save(filename)
      scheduleAutoCommit(activeResume?.value?.id, 'export')
    } catch (err) {
      console.error('[usePdfExport] PDF export failed:', err)
    } finally {
      // Restore transforms
      pageWrappers.forEach(({ el, transform }) => { el.style.transform = transform })
    }
  }

  return { exportPdf }
}
