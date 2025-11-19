import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/services/orderService'
import { adminAuthService } from '@/services/adminAuthService'
import { handleServiceError, createSuccessResult, createErrorResult } from '@/lib/errorHandler'
import { updateOrderSchema } from '@/lib/validations'

// Helper para obtener el ID de la URL
function getIdFromUrl(request: NextRequest): string {
  const segments = request.url.split('/')
  return segments[segments.length - 1]
}

// GET - Obtener pedido específico (solo admins)
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

    await adminAuthService.getCurrentAdmin(token)
    const orderId = getIdFromUrl(request)

    // Obtener pedido
    const order = await orderService.getOrderById(orderId)
    if (!order) {
      return NextResponse.json({
        error: 'Pedido no encontrado',
        code: 'ORDER_NOT_FOUND'
      }, { status: 404 })
    }

    return NextResponse.json(createSuccessResult({ order }))

  } catch (error) {
    console.error('Error en GET /api/orders/[id]:', error)
    const appError = handleServiceError(error, 'GET /api/orders/[id]')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
}

// PUT - Actualizar estado del pedido (solo admins)
export async function PUT(request: NextRequest) {
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
    const orderId = getIdFromUrl(request)
    const body = await request.json()

    // Validar datos de actualización
    const validationResult = updateOrderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Datos de actualización inválidos',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    // Actualizar pedido
    const updatedOrder = await orderService.updateOrderStatus(orderId, validationResult.data)
    if (!updatedOrder) {
      return NextResponse.json({
        error: 'Pedido no encontrado',
        code: 'ORDER_NOT_FOUND'
      }, { status: 404 })
    }

    return NextResponse.json(createSuccessResult({
      order: updatedOrder,
      message: 'Pedido actualizado exitosamente'
    }))

  } catch (error) {
    console.error('Error en PUT /api/orders/[id]:', error)
    const appError = handleServiceError(error, 'PUT /api/orders/[id]')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
}

// DELETE - Eliminar pedido (solo admins)
export async function DELETE(request: NextRequest) {
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
    const orderId = getIdFromUrl(request)

    // Verificar que el pedido existe
    const existingOrder = await orderService.getOrderById(orderId)
    if (!existingOrder) {
      return NextResponse.json({
        error: 'Pedido no encontrado',
        code: 'ORDER_NOT_FOUND'
      }, { status: 404 })
    }

    // Eliminar pedido
    const deletedOrder = await orderService.deleteOrder(orderId)
    if (!deletedOrder) {
      return NextResponse.json({
        error: 'No se pudo eliminar el pedido',
        code: 'DELETE_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json(createSuccessResult({
      message: 'Pedido eliminado exitosamente',
      deletedOrder
    }))

  } catch (error) {
    console.error('Error en DELETE /api/orders/[id]:', error)
    const appError = handleServiceError(error, 'DELETE /api/orders/[id]')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
} 