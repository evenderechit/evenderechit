import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user info
    const { data: userInfo, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get business settings
    const { data: businessSettings, error: businessError } = await supabase
      .from('business_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (userError || businessError) {
      console.error('Error fetching business info:', { userError, businessError })
      return NextResponse.json({ error: 'Failed to fetch business info' }, { status: 500 })
    }

    const businessInfo = {
      ...userInfo,
      ...businessSettings,
    }

    return NextResponse.json({ businessInfo })

  } catch (error) {
    console.error('Error in business info API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
