/**
 * Auth service selector
 *
 * Returns the appropriate auth implementation.
 * Currently always returns guestAuth.
 *
 * Future:
 *   import { supabaseAuth } from './supabaseAuth.js'
 *   if (import.meta.env.VITE_SUPABASE_URL) return supabaseAuth
 */

import { guestAuth } from './guestAuth.js'

export function getAuthService() {
  // TODO: return supabaseAuth when ready
  return guestAuth
}

export { guestAuth }
