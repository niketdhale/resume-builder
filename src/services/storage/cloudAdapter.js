/**
 * Cloud adapter stub — Supabase implementation (future)
 *
 * This file will be implemented when Supabase is added.
 * It intentionally mirrors the exact same interface as localAdapter
 * so the rest of the app never needs to change.
 */

/* eslint-disable no-unused-vars */

export const cloudAdapter = {
  async save(key, data) {
    console.warn('[cloudAdapter] Not yet implemented')
    return false
  },

  async load(key) {
    console.warn('[cloudAdapter] Not yet implemented')
    return null
  },

  async delete(key) {
    console.warn('[cloudAdapter] Not yet implemented')
    return false
  },

  async list(prefix = '') {
    console.warn('[cloudAdapter] Not yet implemented')
    return []
  },
}
