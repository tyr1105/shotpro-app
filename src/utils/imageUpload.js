/**
 * imageUpload — Utilities for handling image upload via file input or
 * drag-and-drop. Reads the file as a data URL and resolves with metadata.
 *
 * Usage:
 *   import { handleFileInput, handleDroppedFile, createDropZone } from './imageUpload'
 *
 *   // From <input type="file">:
 *   const result = await handleFileInput(event)
 *
 *   // From drag & drop:
 *   const result = await handleDroppedFile(dragEvent)
 *
 *   // Drop-zone helper (returns cleanup function):
 *   const cleanup = createDropZone(element, { onImage: (r) => ... })
 */

/**
 * Read an image File and return a promise with its data URL + dimensions.
 *
 * @param {File} file
 * @returns {Promise<{ dataUrl: string, width: number, height: number, name: string, size: number }>}
 */
export function readFileAsImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error(`Expected an image file, got "${file.type}"`))
      return
    }

    const reader = new FileReader()

    reader.onerror = () => reject(new Error('FileReader error'))

    reader.onload = (event) => {
      const dataUrl = event.target.result

      // Load into an Image to get natural dimensions
      const img = new Image()

      img.onerror = () => reject(new Error('Failed to load image'))

      img.onload = () => {
        resolve({
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          name: file.name,
          size: file.size,
        })
      }

      img.src = dataUrl
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Handle a file-input change event.
 *
 * @param {Event|React.SyntheticEvent} event – the change event from <input type="file">
 * @returns {Promise<{ dataUrl: string, width: number, height: number, name: string, size: number } | null>}
 *   Returns null if no file was selected.
 */
export async function handleFileInput(event) {
  const file = event.target?.files?.[0]
  if (!file) return null
  return readFileAsImage(file)
}

/**
 * Handle a drop event (drag & drop).
 *
 * @param {DragEvent|React.SyntheticEvent} event – the drop event
 * @returns {Promise<{ dataUrl: string, width: number, height: number, name: string, size: number } | null>}
 *   Returns null if the drop didn't contain an image file.
 */
export async function handleDroppedFile(event) {
  event.preventDefault?.()
  event.stopPropagation?.()

  const file = event.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return null
  return readFileAsImage(file)
}

/**
 * Create a fully-wired drop zone on any DOM element.
 * Returns a cleanup function that removes all listeners.
 *
 * @param {HTMLElement} element
 * @param {Object}      callbacks
 *   - onImage       : (result) => void   – called with the readFileAsImage result
 *   - onDragEnter?  : () => void
 *   - onDragLeave?  : () => void
 *   - onDragOver?   : () => void
 *   - onError?      : (err) => void
 *
 * @returns {() => void} cleanup function
 */
export function createDropZone(element, { onImage, onDragEnter, onDragLeave, onDragOver, onError } = {}) {
  if (!element) throw new Error('createDropZone: element is required')

  let dragCounter = 0 // Track nested enters/leaves

  const handleDragEnter = (e) => {
    e.preventDefault()
    dragCounter++
    onDragEnter?.()
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    dragCounter--
    if (dragCounter <= 0) {
      dragCounter = 0
      onDragLeave?.()
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    onDragOver?.()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    dragCounter = 0
    onDragLeave?.()

    try {
      const result = await handleDroppedFile(e)
      if (result) {
        onImage?.(result)
      }
    } catch (err) {
      onError?.(err)
    }
  }

  element.addEventListener('dragenter', handleDragEnter)
  element.addEventListener('dragleave', handleDragLeave)
  element.addEventListener('dragover', handleDragOver)
  element.addEventListener('drop', handleDrop)

  // Cleanup
  return () => {
    element.removeEventListener('dragenter', handleDragEnter)
    element.removeEventListener('dragleave', handleDragLeave)
    element.removeEventListener('dragover', handleDragOver)
    element.removeEventListener('drop', handleDrop)
  }
}

/**
 * Format file size in a human-readable string.
 *
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
