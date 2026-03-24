import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseConfig = !!supabaseUrl && !!supabaseAnon

// Only create the client when credentials are present.
// When running as guest (no .env.local), supabase will be null —
// all callers guard with hasSupabaseConfig before using it.
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,  // required for magic-link redirect
      },
    })
  : null
