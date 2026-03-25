/**
 * supabaseAuth.js
 * Auth service backed by Supabase — email + password.
 * All methods are no-ops when Supabase is not configured.
 */

import { supabase, hasSupabaseConfig } from '../../lib/supabase.js'

export const supabaseAuth = {
  async getSession() {
    if (!hasSupabaseConfig) return null
    const { data } = await supabase.auth.getSession()
    return data.session ?? null
  },

  async getUser() {
    if (!hasSupabaseConfig) return null
    const { data } = await supabase.auth.getUser()
    return data.user ?? null
  },

  /**
   * Sign up with email + password.
   * @returns {{ user, error }}
   */
  async signUp(email, password) {
    if (!hasSupabaseConfig) return { user: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { user: data?.user ?? null, error }
  },

  /**
   * Sign in with email + password.
   * @returns {{ user, error }}
   */
  async signIn(email, password) {
    if (!hasSupabaseConfig) return { user: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { user: data?.user ?? null, error }
  },

  /**
   * Send a magic link (passwordless) to the given email.
   * @returns {{ error }}
   */
  async sendMagicLink(email) {
    if (!hasSupabaseConfig) return { error: new Error('Supabase not configured') }
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    return { error }
  },

  /**
   * Synchronous best-effort user ID.
   * Returns 'local' until the async session resolves.
   * Use useAuth().userId for the reactive version.
   */
  getUserId() {
    try {
      const key = Object.keys(localStorage).find(k => k.includes('-auth-token'))
      if (!key) return 'local'
      const parsed = JSON.parse(localStorage.getItem(key))
      return parsed?.user?.id ?? 'local'
    } catch {
      return 'local'
    }
  },

  /**
   * Synchronous best-effort login check.
   * Use useAuth().isLoggedIn for the reactive version.
   */
  isLoggedIn() {
    return this.getUserId() !== 'local'
  },

  async signOut() {
    if (!hasSupabaseConfig) return { error: null }
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  onAuthStateChange(callback) {
    if (!hasSupabaseConfig) return () => {}
    const { data } = supabase.auth.onAuthStateChange(callback)
    return () => data.subscription.unsubscribe()
  },
}
