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

    // Fetch roles
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        name,
        description,
        permissions,
        created_at
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching roles:', error)
      // Return demo data on error
      return NextResponse.json({
        roles: [
          {
            id: '1',
            name: 'מנהל ראשי',
            description: 'גישה מלאה לכל המערכת',
            permissions: ['read', 'write', 'delete', 'admin'],
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'עובד',
            description: 'גישה בסיסית לניהול תורים',
            permissions: ['read', 'write'],
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '3',
            name: 'מנהל',
            description: 'גישה מורחבת לניהול ודוחות',
            permissions: ['read', 'write', 'reports'],
            created_at: '2024-01-01T00:00:00Z'
          }
        ]
      })
    }

    return NextResponse.json({ roles: roles || [] })
  } catch (error) {
    console.error('Error in roles API:', error)
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

    const { name, description, permissions } = await request.json()

    if (!name || !permissions) {
      return NextResponse.json(
        { error: 'Name and permissions are required' },
        { status: 400 }
      )
    }

    // Create role
    const { data: role, error } = await supabase
      .from('user_roles')
      .insert([{
        name,
        description: description || '',
        permissions
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating role:', error)
      return NextResponse.json(
        { error: 'Failed to create role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ role })
  } catch (error) {
    console.error('Error in POST roles API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
