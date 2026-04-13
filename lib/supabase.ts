import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// No-op storage prevents Supabase from touching the broken Node.js
// localStorage polyfill that Next.js 15 injects during SSR.
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
} as unknown as Storage

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
    storage: noopStorage,
  },
})
