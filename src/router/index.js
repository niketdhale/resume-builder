import { createRouter, createWebHistory } from 'vue-router'
import { getAuthService } from '../services/auth/index.js'

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
router.beforeEach((to) => {
  document.title = `${to.meta.title || 'Resume Builder'} — Resume Builder`

  // Let callback route proceed — Supabase token exchange happens there
  if (to.name === 'auth-callback') return true

  // Redirect already-logged-in users away from /auth
  if (to.name === 'auth' && getAuthService().isLoggedIn()) return { name: 'overview' }

  // All routes publicly accessible — guest = full access, auth = opt-in for cloud sync
  return true
})

export default router
