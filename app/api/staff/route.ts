import { NextRequest, NextResponse } from 'next/server'

// Mock data for demo
const mockStaff = [
  {
    id: '1',
    name: 'יוסי כהן',
    phone: '050-1234567',
    email: 'yossi@demo.com',
    role: 'מנהל',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'שרה לוי',
    phone: '052-9876543',
    email: 'sara@demo.com',
    role: 'מעצבת שיער',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    // In demo mode, return mock data
    return NextResponse.json({ 
      success: true, 
      data: mockStaff 
    })
  } catch (error) {
    console.error('Error in get staff:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create new staff member with mock data
    const newStaff = {
      id: Date.now().toString(),
      name: body.name,
      phone: body.phone,
      email: body.email,
      role: body.role || 'עובד',
      is_active: true,
      created_at: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      data: newStaff 
    })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create staff member' },
      { status: 500 }
    )
  }
}
