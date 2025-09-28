import { NextRequest, NextResponse } from 'next/server'

// Mock data for demo
const mockAvailability = [
  {
    id: '1',
    day_of_week: 0, // Sunday
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  },
  {
    id: '2',
    day_of_week: 1, // Monday
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  },
  {
    id: '3',
    day_of_week: 2, // Tuesday
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  },
  {
    id: '4',
    day_of_week: 3, // Wednesday
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  },
  {
    id: '5',
    day_of_week: 4, // Thursday
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  },
  {
    id: '6',
    day_of_week: 5, // Friday
    start_time: '09:00',
    end_time: '14:00',
    is_available: true
  },
  {
    id: '7',
    day_of_week: 6, // Saturday
    start_time: '00:00',
    end_time: '00:00',
    is_available: false
  }
]

export async function GET(request: NextRequest) {
  try {
    // In demo mode, return mock data
    return NextResponse.json({ 
      success: true, 
      data: mockAvailability 
    })
  } catch (error) {
    console.error('Error in get availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Update availability with mock data
    return NextResponse.json({ 
      success: true, 
      message: 'Availability updated successfully' 
    })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}
