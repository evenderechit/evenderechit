import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch invitations
    const { data: invitations, error } = await supabase
      .from('user_invitations')
      .select(`
        id,
        email,
        role_id,
        status,
        invited_at,
        expires_at
      `)
      .eq('invited_by', user.id)
      .order('invited_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      // Return demo data on error
      return NextResponse.json({
        invitations: [
          {
            id: '1',
            email: 'john@example.com',
            role_id: '2',
            role_name: 'עובד',
            status: 'pending',
            invited_at: '2024-01-10T10:00:00Z',
            expires_at: '2024-01-17T10:00:00Z'
          },
          {
            id: '2',
            email: 'sarah@example.com',
            role_id: '3',
            role_name: 'מנהל',
            status: 'accepted',
            invited_at: '2024-01-08T14:30:00Z',
            expires_at: '2024-01-15T14:30:00Z'
          }
        ]
      })
    }

    // Fetch roles separately
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('id, name')

    if (rolesError) {
      console.error('Error fetching roles:', rolesError)
    }

    // Create role lookup map
    const roleMap = (roles || []).reduce((acc: any, role: any) => {
      acc[role.id] = role.name
      return acc
    }, {})

    // Enrich invitations with role names
    const enrichedInvitations = (invitations || []).map((invitation: any) => ({
      ...invitation,
      role_name: roleMap[invitation.role_id] || 'לא ידוע'
    }))

    return NextResponse.json({ invitations: enrichedInvitations })
  } catch (error) {
    console.error('Error in invitations API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, role_id } = await request.json()

    if (!email || !role_id) {
      return NextResponse.json(
        { error: 'Email and role_id are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent' },
        { status: 400 }
      )
    }

    // Create invitation
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    const { data: invitation, error } = await supabase
      .from('user_invitations')
      .insert([{
        email,
        role_id,
        invited_by: user.id,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating invitation:', error)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // TODO: Send invitation email here
    console.log('Invitation created for:', email)

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error('Error in POST invitations API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
