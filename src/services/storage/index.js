/**
 * Storage adapter selector.
 *
 * Logic:
 *   logged-in user  → cloudAdapter (with offline queue fallback)
 *   guest           → localAdapter
 *
 * The rest of the app only imports from here —
 * never directly from localAdapter or cloudAdapter.
 */

import { localAdapter }  from './localAdapter.js'
import { cloudAdapter }  from './cloudAdapter.js'

// Reactive userId — set by App.vue when auth state changes
let _currentUserId = null

export function setStorageUserId(userId) {
  _currentUserId = userId
  cloudAdapter.setUserId(userId)
}

export function getStorageAdapter() {
  return _currentUserId && _currentUserId !== 'local'
    ? cloudAdapter
    : localAdapter
}

// Re-export both adapters for direct use in tests
export { localAdapter, cloudAdapter }
