import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Mock Supabase client for development
const createMockClient = () => ({
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: null }),
        limit: (count: number) => Promise.resolve({ data: [], error: null })
      }),
      gte: (column: string, value: any) => ({
        lte: (column: string, value: any) => Promise.resolve({ data: [], error: null })
      }),
      order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
      limit: (count: number) => Promise.resolve({ data: [], error: null })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
    })
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: (credentials: any) => Promise.resolve({ data: { user: null }, error: null }),
    signUp: (credentials: any) => Promise.resolve({ data: { user: null }, error: null }),
    signInWithOtp: (credentials: any) => Promise.resolve({ data: null, error: null }),
    verifyOtp: (credentials: any) => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
})

// Try to create real Supabase client, fallback to mock
let supabase: any

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    supabase = createSupabaseClient(supabaseUrl, supabaseKey)
  } else {
    console.warn('Supabase credentials not found, using mock client')
    supabase = createMockClient()
  }
} catch (error) {
  console.warn('Failed to create Supabase client, using mock client:', error)
  supabase = createMockClient()
}

export { supabase }
