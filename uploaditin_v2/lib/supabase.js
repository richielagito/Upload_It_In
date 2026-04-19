
import { createBrowserClient } from '@supabase/ssr'

// Use publishable environment-driven values only. Default to placeholder to
// ensure repository history contains no secret-like literals.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'pubkey-placeholder'

export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey)
