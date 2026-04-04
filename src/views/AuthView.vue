<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabaseAuth } from '../services/auth/supabaseAuth.js'
import { useAuth } from '../composables/useAuth.js'
import { useTheme } from '../composables/useTheme.js'

const router = useRouter()
const { isLoggedIn } = useAuth()
const { isDark } = useTheme()

if (isLoggedIn.value) router.replace('/')

// ── State ──────────────────────────────────────────────────────────────────
// mode: 'signin' | 'signup' | 'magic'
const mode        = ref('signin')
const email       = ref('')
const password    = ref('')
const showPassword = ref(false)
const loading     = ref(false)
const error       = ref(null)
const magicSent   = ref(false) // magic link sent state

const TABS = [
  { id: 'signin', label: 'Sign in' },
  { id: 'signup', label: 'Sign up' },
  { id: 'magic',  label: '✨ Magic link' },
]

const emailValid    = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const passwordValid = computed(() => password.value.length >= 6)
const formValid     = computed(() => {
  if (mode.value === 'magic') return emailValid.value
  return emailValid.value && passwordValid.value
})

function switchMode(m) {
  mode.value        = m
  error.value       = null
  magicSent.value   = false
  showPassword.value = false
}

// ── Submit ─────────────────────────────────────────────────────────────────
async function submit() {
  if (!formValid.value || loading.value) return
  loading.value = true
  error.value   = null

  if (mode.value === 'magic') {
    const { error: err } = await supabaseAuth.sendMagicLink(email.value.trim())
    loading.value = false
    if (err) { error.value = friendlyError(err.message); return }
    magicSent.value = true
    return
  }

  if (mode.value === 'signin') {
    const { error: err } = await supabaseAuth.signIn(email.value.trim(), password.value)
    loading.value = false
    if (err) { error.value = friendlyError(err.message); return }
    // redirect handled by onAuthStateChange watcher below
    return
  }

  if (mode.value === 'signup') {
    const { error: err } = await supabaseAuth.signUp(email.value.trim(), password.value)
    loading.value = false
    if (err) { error.value = friendlyError(err.message); return }
    // redirect handled by onAuthStateChange watcher below
  }
}

function friendlyError(msg) {
  if (!msg) return 'Something went wrong.'
  if (msg.includes('Invalid login'))        return 'Incorrect email or password.'
  if (msg.includes('Email not confirmed'))  return 'Please confirm your email first.'
  if (msg.includes('already registered'))   return 'An account with this email already exists.'
  if (msg.includes('Password should be'))   return 'Password must be at least 6 characters.'
  if (msg.includes('rate limit') || msg.includes('email rate limit')) return 'Too many attempts — please wait a few minutes and try again.'
  return msg
}

const submitLabel = computed(() => {
  if (loading.value) {
    if (mode.value === 'magic')  return 'Sending…'
    if (mode.value === 'signin') return 'Signing in…'
    return 'Creating account…'
  }
  if (mode.value === 'magic')  return 'Send magic link'
  if (mode.value === 'signin') return 'Sign in'
  return 'Create account'
})
// Redirect once auth confirms login (fires after onAuthStateChange propagates)
watch(isLoggedIn, (val) => { if (val) router.replace('/') })
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center px-4"
    :class="isDark ? 'bg-gray-950' : 'bg-gray-50'"
  >
    <div
      class="w-full max-w-sm rounded-2xl shadow-xl p-8 flex flex-col gap-6"
      :class="isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'"
    >
      <!-- Logo -->
      <div class="flex flex-col items-center gap-3">
        <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow">
          R
        </div>
        <div class="text-center">
          <h1 class="text-xl font-bold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">
            Resume Builder
          </h1>
          <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
            Sign in to sync your data across devices
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div
        class="flex rounded-xl p-1 gap-1"
        :class="isDark ? 'bg-gray-800' : 'bg-gray-100'"
      >
        <button
          v-for="tab in TABS"
          :key="tab.id"
          @click="switchMode(tab.id)"
          class="flex-1 py-2 rounded-lg text-xs font-medium transition"
          :class="mode === tab.id
            ? (isDark ? 'bg-gray-700 text-gray-100 shadow-sm' : 'bg-white text-gray-900 shadow-sm')
            : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Magic link: sent state -->
      <template v-if="mode === 'magic' && magicSent">
        <div class="flex flex-col items-center gap-4 py-2 text-center">
          <div class="text-4xl">📬</div>
          <div>
            <p class="font-semibold" :class="isDark ? 'text-gray-100' : 'text-gray-800'">
              Check your inbox
            </p>
            <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              We sent a magic link to<br>
              <span class="font-medium" :class="isDark ? 'text-indigo-400' : 'text-indigo-600'">
                {{ email }}
              </span>
            </p>
          </div>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
            No email? Check your spam folder.
          </p>
          <button
            @click="magicSent = false; email = ''"
            class="text-sm underline underline-offset-2 transition"
            :class="isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'"
          >
            Try a different email
          </button>
        </div>
      </template>

      <!-- Form -->
      <template v-else>
        <form class="flex flex-col gap-4" @submit.prevent="submit" novalidate>
          <!-- Email -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
              Email
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              class="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition focus:ring-2 focus:ring-indigo-500/20"
              :class="isDark
                ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-indigo-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'"
            />
          </div>

          <!-- Password — hidden for magic link -->
          <div v-if="mode !== 'magic'" class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
              Password
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword && password.length > 0 ? 'text' : 'password'"
                :placeholder="mode === 'signup' ? 'At least 6 characters' : 'Your password'"
                :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
                class="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm border outline-none transition focus:ring-2 focus:ring-indigo-500/20"
                :class="isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'"
              />
              <button
                v-if="password.length > 0"
                type="button"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Hide password' : 'Show password'"
                class="absolute inset-y-0 right-0 flex items-center px-3 transition"
                :class="isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
              >
                <!-- Eye icon (show) -->
                <svg v-if="!showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <!-- Eye-off icon (hide) -->
                <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Magic link hint -->
          <p v-if="mode === 'magic'" class="text-xs -mt-1" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
            No password needed — we'll email you a one-click sign-in link.
          </p>

          <!-- Error -->
          <p v-if="error" class="text-sm text-red-500 -mt-1">{{ error }}</p>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="!formValid || loading"
            class="w-full py-2.5 rounded-xl text-sm font-semibold transition"
            :class="formValid && !loading
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              : 'bg-indigo-600/40 text-white/60 cursor-not-allowed'"
          >
            {{ submitLabel }}
          </button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px" :class="isDark ? 'bg-gray-800' : 'bg-gray-200'" />
          <span class="text-xs" :class="isDark ? 'text-gray-600' : 'text-gray-400'">or</span>
          <div class="flex-1 h-px" :class="isDark ? 'bg-gray-800' : 'bg-gray-200'" />
        </div>

        <!-- Guest -->
        <button
          @click="router.push('/')"
          class="w-full py-2.5 rounded-xl text-sm font-medium border transition"
          :class="isDark
            ? 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'"
        >
          Continue as guest
        </button>
      </template>
    </div>
  </div>
</template>
