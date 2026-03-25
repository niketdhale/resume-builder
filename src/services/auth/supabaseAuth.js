/**
 * supabaseAuth.js
 * Auth service backed by Supabase — magic link only.
 * Mirrors the guestAuth interface so nothing else needs to change.
 */

import { supabase } from '../../lib/supabase.js'

export const supabaseAuth = {
  // ── Session ────────────────────────────────────────────────

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session ?? null
  },

  async getUser() {
    const { data } = await supabase.auth.getUser()
    return data.user ?? null
  },

  isLoggedIn() {
    // Synchronous check — relies on the cached session in localStorage
    // For reactive state, use useAuth() composable instead
    const raw = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')
    return !!raw
  },

  getUserId() {
    // Best-effort sync read; use useAuth().userId for reactive access
    try {
      const raw = Object.keys(localStorage).find(k => k.includes('-auth-token'))
      if (!raw) return null
      const parsed = JSON.parse(localStorage.getItem(raw))
      return parsed?.user?.id ?? null
    } catch {
      return null
    }
  },

  // ── Magic Link ─────────────────────────────────────────────

  /**
   * Send magic link email.
   * @param {string} email
   * @param {string} [redirectTo]  defaults to current origin + /auth/callback
   * @returns {{ error: Error|null }}
   */
  async sendMagicLink(email, redirectTo) {
    const redirect = redirectTo ?? `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect },
    })
    return { error }
  },

  // ── Sign out ───────────────────────────────────────────────

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // ── Auth state change listener ─────────────────────────────

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   * @param {(event: string, session: object|null) => void} callback
   */
  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange(callback)
    return () => data.subscription.unsubscribe()
  },
}
