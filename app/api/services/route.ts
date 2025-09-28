import { NextRequest, NextResponse } from 'next/server'

// Mock data for demo
const mockServices = [
  {
    id: '1',
    name: 'תספורת גברים',
    duration: 30,
    price: 50,
    description: 'תספורת קלאסית לגברים',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'תספורת נשים',
    duration: 45,
    price: 80,
    description: 'תספורת וסטיילינג לנשים',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'צביעת שיער',
    duration: 120,
    price: 200,
    description: 'צביעה מלאה של השיער',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    // In demo mode, return mock data
    return NextResponse.json({ 
      success: true, 
      data: mockServices 
    })
  } catch (error) {
    console.error('Error in get services:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create new service with mock data
    const newService = {
      id: Date.now().toString(),
      name: body.name,
      duration: body.duration,
      price: body.price,
      description: body.description || '',
      is_active: true,
      created_at: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      data: newService 
    })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
