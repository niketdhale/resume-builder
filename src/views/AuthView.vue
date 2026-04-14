<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabaseAuth } from '../services/auth/supabaseAuth.js'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { isLoggedIn } = useAuth()
if (isLoggedIn.value) router.replace({ name: 'overview' })

const mode         = ref('signin')
const email        = ref('')
const password     = ref('')
const showPassword = ref(false)
const loading      = ref(false)
const error        = ref(null)
const magicSent    = ref(false)

const TABS = [
  { id: 'signin', label: 'Sign in' },
  { id: 'signup', label: 'Sign up' },
  { id: 'magic',  label: 'Magic link' },
]

const emailValid    = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const passwordValid = computed(() => password.value.length >= 6)
const formValid     = computed(() => {
  if (mode.value === 'magic') return emailValid.value
  return emailValid.value && passwordValid.value
})

function switchMode(m) {
  mode.value = m; error.value = null; magicSent.value = false; showPassword.value = false
}

async function submit() {
  if (!formValid.value || loading.value) return
  loading.value = true; error.value = null

  if (mode.value === 'magic') {
    const { error: err } = await supabaseAuth.sendMagicLink(email.value.trim())
    loading.value = false
    if (err) { error.value = friendlyError(err.message); return }
    magicSent.value = true; return
  }

  if (mode.value === 'signin') {
    const { error: err } = await supabaseAuth.signIn(email.value.trim(), password.value)
    loading.value = false
    if (err) { error.value = friendlyError(err.message); return }
    return
  }

  if (mode.value === 'signup') {
    const { error: err } = await supabaseAuth.signUp(email.value.trim(), password.value)
    loading.value = false
    if (err) { error.value = friendlyError(err.message); return }
  }
}

function friendlyError(msg) {
  if (!msg) return 'Something went wrong.'
  if (msg.includes('Invalid login'))       return 'Incorrect email or password.'
  if (msg.includes('Email not confirmed')) return 'Please confirm your email first.'
  if (msg.includes('already registered'))  return 'An account with this email already exists.'
  if (msg.includes('Password should be'))  return 'Password must be at least 6 characters.'
  if (msg.includes('rate limit') || msg.includes('email rate limit')) return 'Too many attempts — please wait a few minutes.'
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

watch(isLoggedIn, (val) => { if (val) router.replace({ name: 'overview' }) })
</script>

<template>
  <div class="auth-root">

    <!-- Left: Branding panel -->
    <div class="auth-brand">
      <!-- Wordmark -->
      <div class="brand-wordmark" @click="router.push({ name: 'landing' })">
        <div class="brand-icon">R</div>
        <span class="brand-name">Résumé Builder</span>
      </div>

      <!-- Brand copy -->
      <div class="brand-copy">
        <h2 class="brand-headline">
          Your career,<br>
          <em>beautifully</em><br>
          presented.
        </h2>
        <p class="brand-sub">
          Sign in to sync your resumes across every device. Your data stays yours — always.
        </p>
      </div>

      <!-- Features list -->
      <ul class="brand-features">
        <li class="brand-feature" v-for="f in [
          'Seven premium resume templates',
          'Real-time live preview editor',
          'Pixel-perfect PDF export',
          '30+ font choices',
          'Drag-and-drop sections',
        ]" :key="f">
          <div class="feature-check">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          {{ f }}
        </li>
      </ul>

      <!-- Footer note -->
      <p class="brand-footer">No credit card required · Works offline</p>
    </div>

    <!-- Right: Form panel -->
    <div class="auth-form-panel">

      <!-- Top bar: back + theme -->
      <div class="form-topbar">
        <button class="back-btn" @click="router.push({ name: 'landing' })">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to home
        </button>
      </div>

      <div class="form-center">
        <div class="form-card">

          <!-- Header -->
          <div class="form-header">
            <h1 class="form-title">
              {{ mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Magic link' }}
            </h1>
            <p class="form-subtitle">
              {{ mode === 'signin' ? 'Sign in to sync your resumes' :
                 mode === 'signup' ? 'Start building for free' :
                 'Get a one-click sign-in link by email' }}
            </p>
          </div>

          <!-- Mode tabs -->
          <div class="mode-tabs">
            <button
              v-for="tab in TABS"
              :key="tab.id"
              @click="switchMode(tab.id)"
              class="mode-tab"
              :class="{ 'mode-tab-active': mode === tab.id }"
            >{{ tab.label }}</button>
          </div>

          <!-- Magic link sent -->
          <template v-if="mode === 'magic' && magicSent">
            <div class="magic-sent">
              <div class="magic-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3 class="magic-title">Check your inbox</h3>
              <p class="magic-desc">
                We sent a magic link to<br>
                <strong>{{ email }}</strong>
              </p>
              <p class="magic-hint">No email? Check your spam folder.</p>
              <button class="magic-retry" @click="magicSent = false; email = ''">
                Try a different email →
              </button>
            </div>
          </template>

          <!-- Form -->
          <template v-else>
            <form class="form-fields" @submit.prevent="submit" novalidate>
              <!-- Email -->
              <div class="field">
                <label class="field-label">Email address</label>
                <input
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  class="field-input"
                  :class="{ 'field-input-error': error && mode !== 'magic' }"
                />
              </div>

              <!-- Password -->
              <div v-if="mode !== 'magic'" class="field">
                <label class="field-label">Password</label>
                <div class="field-password-wrap">
                  <input
                    v-model="password"
                    :type="showPassword && password.length > 0 ? 'text' : 'password'"
                    :placeholder="mode === 'signup' ? 'At least 6 characters' : 'Your password'"
                    :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
                    class="field-input"
                    :class="{ 'field-input-error': error }"
                  />
                  <button
                    v-if="password.length > 0"
                    type="button"
                    class="password-toggle"
                    @click="showPassword = !showPassword"
                    :title="showPassword ? 'Hide' : 'Show'"
                  >
                    <svg v-if="!showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Magic hint -->
              <p v-if="mode === 'magic'" class="field-hint">
                No password needed — we'll send a one-click sign-in link to your email.
              </p>

              <!-- Error -->
              <div v-if="error" class="form-error">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ error }}
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="submit-btn"
                :class="{ 'submit-btn-disabled': !formValid || loading }"
                :disabled="!formValid || loading"
              >
                <svg v-if="loading" class="spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {{ submitLabel }}
              </button>
            </form>

            <!-- Divider -->
            <div class="form-divider">
              <div class="divider-line"></div>
              <span class="divider-text">or</span>
              <div class="divider-line"></div>
            </div>

            <!-- Guest -->
            <button class="guest-btn" @click="router.push({ name: 'overview' })">
              Continue without account
            </button>
            <p class="guest-note">Your resumes stay saved locally in your browser.</p>
          </template>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ─── Root layout ──────────────────────────────────────────────── */
.auth-root {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* ─── Brand panel (left) ───────────────────────────────────────── */
.auth-brand {
  background: #0C0B09;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  position: relative;
  overflow: hidden;
}
.auth-brand::before {
  content: '';
  position: absolute;
  top: -30%;
  left: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(ellipse at center, rgba(0,94,180,0.09) 0%, transparent 65%);
  pointer-events: none;
}

.brand-wordmark {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  z-index: 1;
}
.brand-icon {
  width: 32px;
  height: 32px;
  background: #005eb4;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.125rem;
  font-weight: 500;
  color: #fff;
  flex-shrink: 0;
}
.brand-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.0625rem;
  font-weight: 500;
  color: #F0EDE6;
  letter-spacing: -0.01em;
}

.brand-copy { position: relative; z-index: 1; }
.brand-headline {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.25rem, 3.5vw, 3.25rem);
  font-weight: 300;
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: #F0EDE6;
  margin: 0 0 1rem;
}
.brand-headline em { font-style: italic; color: #C8A050; }
.brand-sub {
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.65;
  color: rgba(240,237,230,0.5);
  margin: 0;
  max-width: 360px;
}

.brand-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.625rem; position: relative; z-index: 1; }
.brand-feature {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(240,237,230,0.6);
}
.feature-check {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0,94,180,0.15);
  border: 1px solid rgba(0,94,180,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #005eb4;
  flex-shrink: 0;
}
.brand-footer {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(240,237,230,0.25);
  letter-spacing: 0.02em;
  margin: 0 0 0 0;
  margin-top: auto;
  position: relative;
  z-index: 1;
}

/* ─── Form panel (right) ───────────────────────────────────────── */
.auth-form-panel {
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
}

.form-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border);
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--ink-3);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}
.back-btn:hover { color: var(--ink); }

.form-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 2rem;
}

.form-card {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Form header */
.form-header { display: flex; flex-direction: column; gap: 0.375rem; }
.form-title {
  font-family: var(--font-display);
  font-size: 1.875rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 0;
}
.form-subtitle { font-size: 0.875rem; font-weight: 300; color: var(--ink-3); margin: 0; }

/* Mode tabs */
.mode-tabs {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.mode-tab {
  flex: 1;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--ink-3);
  background: var(--bg-surface);
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.15s;
  border-right: 1px solid var(--border);
}
.mode-tab:last-child { border-right: none; }
.mode-tab:hover { color: var(--ink); background: var(--bg-subtle); }
.mode-tab-active { background: var(--gold-bg) !important; color: var(--gold) !important; font-weight: 500; }

/* Magic sent */
.magic-sent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  padding: 1.5rem 0;
  text-align: center;
}
.magic-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--gold-bg);
  border: 1px solid var(--gold-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
}
.magic-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 400; color: var(--ink); margin: 0; }
.magic-desc { font-size: 0.875rem; font-weight: 300; line-height: 1.6; color: var(--ink-2); margin: 0; }
.magic-desc strong { font-weight: 500; color: var(--gold); }
.magic-hint { font-size: 0.75rem; color: var(--ink-3); margin: 0; }
.magic-retry {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gold);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}
.magic-retry:hover { color: var(--gold-hover); }

/* Fields */
.form-fields { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.75rem; font-weight: 500; color: var(--ink-2); letter-spacing: 0.01em; }
.field-input {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 400;
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--ink);
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  box-sizing: border-box;
}
.field-input::placeholder { color: var(--ink-3); }
.field-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-bg); }
.field-input-error { border-color: rgba(220,38,38,0.5); }

.field-password-wrap { position: relative; }
.field-password-wrap .field-input { padding-right: 2.5rem; }
.password-toggle {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ink-3);
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.password-toggle:hover { color: var(--ink); }

.field-hint { font-size: 0.75rem; font-weight: 300; color: var(--ink-3); margin: 0; line-height: 1.55; }
.form-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #dc2626;
  background: rgba(220,38,38,0.06);
  border: 1px solid rgba(220,38,38,0.15);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.submit-btn {
  width: 100%;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: var(--gold);
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  transition: background 0.15s, transform 0.1s;
}
.submit-btn:hover:not(.submit-btn-disabled) { background: var(--gold-hover); }
.submit-btn:active:not(.submit-btn-disabled) { transform: scale(0.99); }
.submit-btn-disabled { background: var(--gold); opacity: 0.45; cursor: not-allowed; }

.form-divider { display: flex; align-items: center; gap: 0.75rem; }
.divider-line { flex: 1; height: 1px; background: var(--border); }
.divider-text { font-size: 0.75rem; color: var(--ink-3); }

.guest-btn {
  width: 100%;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--ink-2);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.6875rem;
  cursor: pointer;
  transition: all 0.15s;
}
.guest-btn:hover { background: var(--bg-subtle); color: var(--ink); border-color: var(--border-2); }
.guest-note { font-size: 0.6875rem; text-align: center; color: var(--ink-3); margin: 0; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Responsive ───────────────────────────────────────────────── */
@media (max-width: 768px) {
  .auth-root { grid-template-columns: 1fr; }
  .auth-brand { display: none; }
  .auth-form-panel { min-height: 100vh; }
}
</style>
