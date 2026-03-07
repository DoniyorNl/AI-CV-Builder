import { createBrowserClient } from '@supabase/ssr'

// Using untyped client for compatibility with all @supabase/supabase-js versions
// Cast results to our own types at the call site.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
