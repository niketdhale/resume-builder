/**
 * useAuth.js
 * Reactive auth state — user, session, loading flag.
 * Single source of truth for auth across the app.
 *
 * Usage:
 *   const { user, isLoggedIn, isLoading, signOut } = useAuth()
 */

import { ref, computed } from 'vue'
import { supabaseAuth } from '../services/auth/supabaseAuth.js'

// ── Singleton state (module-level so all callers share the same refs) ─────────
const user      = ref(null)   // Supabase User object or null
const isLoading = ref(true)   // true until first session check resolves

// ── Bootstrap: resolve session on first import ────────────────────────────────
let _bootstrapped = false

async function bootstrap() {
  if (_bootstrapped) return
  _bootstrapped = true

  const sessionUser = await supabaseAuth.getUser()
  user.value = sessionUser
  isLoading.value = false
}

bootstrap()

// ── Auth state listener (module-level, single subscription) ──────────────────
supabaseAuth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null
  isLoading.value = false
})

// ── Composable ────────────────────────────────────────────────────────────────
export function useAuth() {
  const isLoggedIn  = computed(() => !!user.value)
  const userId      = computed(() => user.value?.id ?? 'local')
  const userEmail   = computed(() => user.value?.email ?? null)
  const userInitial = computed(() => {
    const e = user.value?.email
    return e ? e[0].toUpperCase() : 'G'
  })

  async function signOut() {
    const { error } = await supabaseAuth.signOut()
    if (error) console.error('[useAuth] signOut error:', error)
    user.value = null
  }

  return {
    user,
    isLoading,
    isLoggedIn,
    userId,
    userEmail,
    userInitial,
    signOut,
  }
}
