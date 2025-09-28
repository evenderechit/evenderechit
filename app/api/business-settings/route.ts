import { NextRequest, NextResponse } from 'next/server'

// Mock data for demo
const mockBusinessSettings = {
  id: '1',
  business_name: 'העסק שלי',
  phone: '050-1234567',
  email: 'business@demo.com',
  address: 'רחוב הראשי 123, תל אביב',
  description: 'עסק מקצועי לטיפוח ויופי',
  booking_link_slug: 'my-business',
  advance_booking_days: 30,
  cancellation_hours: 24,
  working_hours: {
    sunday: { start: '09:00', end: '17:00', closed: false },
    monday: { start: '09:00', end: '17:00', closed: false },
    tuesday: { start: '09:00', end: '17:00', closed: false },
    wednesday: { start: '09:00', end: '17:00', closed: false },
    thursday: { start: '09:00', end: '17:00', closed: false },
    friday: { start: '09:00', end: '14:00', closed: false },
    saturday: { start: '00:00', end: '00:00', closed: true }
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: new Date().toISOString()
}

export async function GET(request: NextRequest) {
  try {
    // In demo mode, return mock data
    return NextResponse.json({ 
      success: true, 
      data: mockBusinessSettings 
    })
  } catch (error) {
    console.error('Error in get business settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Update business settings with mock data
    const updatedSettings = {
      ...mockBusinessSettings,
      ...body,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedSettings,
      message: 'Business settings updated successfully' 
    })
  } catch (error) {
    console.error('Error updating business settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update business settings' },
      { status: 500 }
    )
  }
}
