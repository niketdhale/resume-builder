/**
 * localStorage adapter
 * Implements the storage interface for local/guest usage.
 * All methods are async to match the cloud adapter interface.
 */

const PREFIX = 'resume_builder_'

export const localAdapter = {
  async save(key, data) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(data))
      return true
    } catch (e) {
      console.warn(`[localAdapter] Failed to save "${key}":`, e)
      return false
    }
  },

  async load(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      console.warn(`[localAdapter] Failed to load "${key}":`, e)
      return null
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(PREFIX + key)
      return true
    } catch (e) {
      console.warn(`[localAdapter] Failed to delete "${key}":`, e)
      return false
    }
  },

  async list(prefix = '') {
    try {
      return Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX + prefix))
        .map((k) => k.replace(PREFIX, ''))
    } catch (e) {
      console.warn(`[localAdapter] Failed to list keys:`, e)
      return []
    }
  },

  // Blob methods — LightningFS already owns IndexedDB for the guest FS,
  // so these are no-ops for the local adapter. The FS persists automatically.
  async saveBlob() { return true },
  async loadBlob() { return null },
}
