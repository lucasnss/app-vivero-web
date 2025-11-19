import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/services/orderService'
import { adminAuthService } from '@/services/adminAuthService'
import { handleServiceError, createSuccessResult, createErrorResult } from '@/lib/errorHandler'
import { createOrderSchema, paginationSchema } from '@/lib/validations'
import { OrdersResponse, GetOrdersOptions, OrderStatus } from '@/types/order'

// GET - Obtener pedidos (solo admins autenticados)
export async function GET(request: NextRequest) {
  try {
    // Obtener admin actual del token
    const token = request.headers.get('x-admin-token')
    if (!token) {
      return NextResponse.json({
        error: 'Token no proporcionado',
        code: 'MISSING_TOKEN'
      }, { status: 401 })
    }

    const admin = await adminAuthService.getCurrentAdmin(token)

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as OrderStatus | undefined

    // Validar parámetros de paginación
    const paginationResult = paginationSchema.safeParse({ page, limit })
    if (!paginationResult.success) {
      return NextResponse.json({
        error: 'Parámetros de paginación inválidos',
        details: paginationResult.error.errors,
        code: 'INVALID_PAGINATION'
      }, { status: 400 })
    }

    // Obtener pedidos con paginación y filtros
    const options: GetOrdersOptions = {
      page: paginationResult.data.page,
      limit: paginationResult.data.limit,
      status
    }

    const result = await orderService.getAllOrders(options)

    return NextResponse.json(createSuccessResult(result))

  } catch (error) {
    console.error('Error en GET /api/orders:', error)
    const appError = handleServiceError(error, 'GET /api/orders')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
}

// POST - Crear nuevo pedido (invitados y admins)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos del pedido
    const validationResult = createOrderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Datos de pedido inválidos',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    // Verificar si es un admin creando el pedido
    const token = request.headers.get('x-admin-token')
    let adminId: string | undefined

    if (token) {
      const admin = await adminAuthService.getCurrentAdmin(token)
      if (admin) {
        adminId = admin.id
      }
    }

    // Crear pedido
    // Normalizar items: zod usa unit_price; el servicio usa price
    const normalized = {
      ...validationResult.data,
      items: validationResult.data.items.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        price: (i as any).price ?? i.unit_price
      })),
      created_by_admin: adminId
    } as any

    const newOrder = await orderService.createGuestOrder(normalized)

    return NextResponse.json(createSuccessResult({
      order: newOrder,
      message: 'Pedido creado exitosamente'
    }), { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/orders:', error)
    const appError = handleServiceError(error, 'POST /api/orders')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
} 