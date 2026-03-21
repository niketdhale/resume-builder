/**
 * Storage adapter selector
 *
 * Decides which storage adapter to use based on:
 * - Auth state (guest vs logged in)
 * - Network availability
 *
 * The rest of the app only imports from here —
 * never directly from localAdapter or cloudAdapter.
 */

import { localAdapter } from './localAdapter.js'
import { cloudAdapter } from './cloudAdapter.js'

/**
 * Returns the appropriate storage adapter.
 * Currently always returns localAdapter until Supabase is set up.
 *
 * Future logic:
 *   if (isLoggedIn() && isOnline()) return cloudAdapter
 *   if (isLoggedIn() && !isOnline()) return localAdapter (offline cache)
 *   return localAdapter (guest)
 */
export function getStorageAdapter() {
  // TODO: switch to cloudAdapter when Supabase is ready
  return localAdapter
}

// Re-export both adapters for direct use in tests
export { localAdapter, cloudAdapter }
