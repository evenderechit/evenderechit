import { createBrowserClient } from "@supabase/ssr"

// Use the available environment variables from the integration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const createClient = () => {
  if (typeof window === "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
    // During build time, return a mock client to prevent build failures
    return null as any
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Create singleton client instance
let client: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseClient = () => {
  if (typeof window === "undefined") return null

  if (!client && isSupabaseConfigured) {
    client = createClient()
  }
  return client
}

export const supabase = typeof window !== "undefined" && isSupabaseConfigured ? createClient() : null
