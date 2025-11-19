import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/services/orderService'
import { handleServiceError, createSuccessResult, createErrorResult } from '@/lib/errorHandler'

// Helper para obtener el email de la URL
function getEmailFromUrl(request: NextRequest): string {
  const segments = request.url.split('/')
  return decodeURIComponent(segments[segments.length - 1])
}

// GET - Consultar pedidos por email (para invitados)
export async function GET(request: NextRequest) {
  try {
    const email = getEmailFromUrl(request)

    // Validar email
    if (!email || !email.includes('@')) {
      return NextResponse.json({
        error: 'Email inválido',
        code: 'INVALID_EMAIL'
      }, { status: 400 })
    }

    // Obtener pedidos
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await orderService.getAllOrders({
      page,
      limit,
      email
    })

    return NextResponse.json(createSuccessResult(result))

  } catch (error) {
    console.error('Error en GET /api/orders/guest/[email]:', error)
    const appError = handleServiceError(error, 'GET /api/orders/guest/[email]')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
} 