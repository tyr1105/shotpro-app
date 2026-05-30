/**
 * exportImage — Captures a DOM element as an image using html2canvas and
 * triggers a file download.
 *
 * @param {HTMLElement} element  – The DOM element to capture (the preview canvas)
 * @param {Object}      options
 *   - format   : 'png' | 'jpeg'  (default 'png')
 *   - quality  : 0-1 for JPEG    (default 0.92)
 *   - scale    : multiplier      (default 2 for retina)
 *   - width    : target width    (default uses element size)
 *   - height   : target height   (default uses element size)
 *   - filename : download name   (default 'shotpro-export-<timestamp>')
 *
 * @returns {Promise<{ blob: Blob, dataUrl: string }>}
 */
export async function exportImage(element, options = {}) {
  // Dynamic import so the library is only loaded when actually exporting
  const html2canvas = (await import('html2canvas')).default

  const {
    format = 'png',
    quality = 0.92,
    scale = 2,
    width,
    height,
    filename,
  } = options

  if (!element) {
    throw new Error('exportImage: element is required')
  }

  // html2canvas options
  const canvasOpts = {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  }

  // If target dimensions are specified, we temporarily resize the element,
  // capture it, then restore it. This produces exports at exact pixel sizes
  // required by app stores.
  const originalW = element.style.width
  const originalH = element.style.height
  const originalTransform = element.style.transform
  const originalPosition = element.style.position

  try {
    if (width && height) {
      // Calculate scale factor to reach target dimensions
      const currentRect = element.getBoundingClientRect()
      const scaleX = width / currentRect.width
      const scaleY = height / currentRect.height
      const finalScale = Math.min(scaleX, scaleY)

      element.style.width = `${currentRect.width * finalScale}px`
      element.style.height = `${currentRect.height * finalScale}px`
    }

    const canvas = await html2canvas(element, canvasOpts)

    // Restore original sizing
    if (width && height) {
      element.style.width = originalW
      element.style.height = originalH
      element.style.transform = originalTransform
      element.style.position = originalPosition
    }

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'

    // Convert canvas to blob
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
        mimeType,
        quality,
      )
    })

    const dataUrl = canvas.toDataURL(mimeType, quality)

    // Trigger download
    const link = document.createElement('a')
    const safeName = filename || `shotpro-export-${Date.now()}.${format}`
    link.download = safeName
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { blob, dataUrl }
  } catch (err) {
    // Restore on error
    if (width && height) {
      element.style.width = originalW
      element.style.height = originalH
      element.style.transform = originalTransform
      element.style.position = originalPosition
    }
    throw err
  }
}

// ─── Preset export sizes ──────────────────────────────────────────────────

export const EXPORT_PRESETS = {
  /** iPad Pro 12.9" App Store screenshot */
  appstore: { width: 2048, height: 2732, label: 'App Store (2048×2732)' },

  /** Google Play feature graphic */
  playstore: { width: 1024, height: 500, label: 'Play Store Feature (1024×500)' },

  /** General social media / Open Graph */
  social: { width: 1200, height: 630, label: 'Social Media (1200×630)' },

  /** Standard phone screenshot */
  phone: { width: 1290, height: 2796, label: 'Phone (1290×2796)' },

  /** Custom (caller supplies width & height) */
  custom: { width: 1080, height: 1920, label: 'Custom (1080×1920)' },
}

/**
 * Convenience helper: export with a named preset.
 *
 * @param {HTMLElement} element
 * @param {string}      preset   – key from EXPORT_PRESETS
 * @param {Object}      overrides – additional options (format, quality, etc.)
 * @returns {Promise<{ blob: Blob, dataUrl: string }>}
 */
export async function exportWithPreset(element, preset = 'appstore', overrides = {}) {
  const config = EXPORT_PRESETS[preset] || EXPORT_PRESETS.appstore
  return exportImage(element, {
    width: config.width,
    height: config.height,
    filename: `shotpro-${preset}-${Date.now()}.${overrides.format || 'png'}`,
    ...overrides,
  })
}
