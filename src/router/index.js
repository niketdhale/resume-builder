import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'overview',
    component: () => import('../views/OverviewView.vue'),
    meta: { title: 'My Resumes' },
  },
  {
    path: '/editor/:id',
    name: 'editor',
    component: () => import('../views/EditorView.vue'),
    meta: { title: 'Resume Editor' },
  },
  {
    path: '/jobs',
    name: 'jobs',
    component: () => import('../views/JobsView.vue'),
    meta: { title: 'Job Tracker' },
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/AuthView.vue'),
    meta: { title: 'Sign In', public: true },
  },
  {
    // Magic link lands here — Supabase exchanges the token then redirects home
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('../views/AuthCallbackView.vue'),
    meta: { title: 'Signing in…', public: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Update page title
router.beforeEach(async (to) => {
  document.title = `${to.meta.title || 'Resume Builder'} — Resume Builder`

  // For the callback route, let Supabase handle the token exchange first
  if (to.name === 'auth-callback') return true

  // All other routes are publicly accessible — we don't force login
  // (guest users keep full app access; auth is opt-in for cloud sync)
  return true
})

export default router
