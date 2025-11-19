import { NextRequest, NextResponse } from 'next/server'

// Ruta de prueba simple sin middleware de autenticación
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Test route working',
    timestamp: new Date().toISOString()
  })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'PUT test route working',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error parsing JSON',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
} 