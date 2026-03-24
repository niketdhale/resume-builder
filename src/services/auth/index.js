/**
 * Auth service selector.
 * Uses supabaseAuth when VITE_SUPABASE_URL is set, otherwise falls back to guestAuth.
 */

import { guestAuth } from './guestAuth.js'
import { supabaseAuth } from './supabaseAuth.js'

const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY

export function getAuthService() {
  return hasSupabase ? supabaseAuth : guestAuth
}

export { guestAuth, supabaseAuth }
