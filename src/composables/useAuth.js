/**
 * useAuth.js
 * Reactive auth state — user, session, loading flag.
 * Single source of truth for auth across the app.
 *
 * Usage:
 *   const { user, isLoggedIn, isLoading, signOut } = useAuth()
 */

import { ref, computed } from 'vue'
import { getAuthService } from '../services/auth/index.js'

const auth = getAuthService()

// ── Singleton state (module-level so all callers share the same refs) ─────────
const user      = ref(null)   // Supabase User object or null
const isLoading = ref(true)   // true until first session check resolves

// ── Bootstrap: resolve session on first import ────────────────────────────────
let _bootstrapped = false

async function bootstrap() {
  if (_bootstrapped) return
  _bootstrapped = true

  const sessionUser = await auth.getUser()
  user.value = sessionUser
  isLoading.value = false
}

bootstrap()

// ── Auth state listener (module-level, single subscription) ──────────────────
auth.onAuthStateChange((_event, session) => {
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
    const { error } = await auth.signOut()
    if (error) console.error('[useAuth] signOut error:', error)
    // Clear offline queue so stale failed writes don't block the next session
    localStorage.removeItem('rb_offline_queue')
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
