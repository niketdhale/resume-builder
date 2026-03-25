<script setup>
/**
 * AuthCallbackView.vue
 * Supabase redirects here after the user clicks the magic link.
 * The Supabase client automatically exchanges the token from the URL hash.
 * We just wait for the session to resolve, then redirect home.
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'

const router = useRouter()

onMounted(async () => {
  // getSession() will trigger the token exchange from the URL hash/query params
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('[AuthCallback] session error:', error.message)
    router.replace('/auth')
    return
  }

  if (data.session) {
    router.replace('/')
  } else {
    // No session — possibly link expired
    router.replace('/auth')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="flex flex-col items-center gap-3 text-gray-400">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p class="text-sm">Signing you in…</p>
    </div>
  </div>
</template>
