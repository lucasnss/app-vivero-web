import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/services/adminAuthService'
import { orderService } from '@/services/orderService'
import { logService } from '@/services/logService'
import { canChangeFulfillment } from '@/lib/orderStatus'
import { z } from 'zod'

// =============================================================================
// 📋 VALIDACIONES
// =============================================================================

const fulfillmentActionSchema = z.object({
  action: z.enum([
    'mark_awaiting_shipment',    // Marcar como esperando envío
    'mark_awaiting_pickup',      // Marcar como listo para retirar
    'mark_shipped',              // Marcar como enviado
    'mark_delivered',            // Marcar como entregado
    'mark_pickup_completed',     // Marcar como retirado
    'cancel_by_admin'            // Cancelar operativamente
  ]),
  notes: z.string().optional(),
  tracking_number: z.string().optional(),
  estimated_delivery: z.string().optional()
})

type FulfillmentAction = z.infer<typeof fulfillmentActionSchema>

// =============================================================================
// 🔧 FUNCIONES AUXILIARES
// =============================================================================

function getIdFromUrl(request: NextRequest): string {
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  return pathParts[pathParts.length - 2] // /admin/orders/[id]/fulfillment
}

function getFulfillmentStatusFromAction(action: string): string {
  switch (action) {
    case 'mark_awaiting_shipment':
      return 'awaiting_shipment'
    case 'mark_awaiting_pickup':
      return 'awaiting_pickup'
    case 'mark_shipped':
      return 'shipped'
    case 'mark_delivered':
      return 'delivered'
    case 'mark_pickup_completed':
      return 'pickup_completed'
    case 'cancel_by_admin':
      return 'cancelled_by_admin'
    default:
      throw new Error(`Acción no válida: ${action}`)
  }
}

// =============================================================================
// 🚀 ENDPOINT PRINCIPAL
// =============================================================================

/**
 * POST /api/admin/orders/[id]/fulfillment
 * Cambiar estado logístico de una orden (solo admins)
 */
export async function POST(request: NextRequest) {
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
    if (!admin) {
      return NextResponse.json({
        error: 'Token inválido o expirado',
        code: 'INVALID_TOKEN'
      }, { status: 401 })
    }
    
    const orderId = getIdFromUrl(request)
    const body = await request.json()

    // Validar datos de la acción
    const validationResult = fulfillmentActionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Datos de acción inválidos',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    const { action, notes, tracking_number, estimated_delivery } = validationResult.data

    // Obtener la orden actual
    const currentOrder = await orderService.getOrderById(orderId)
    if (!currentOrder) {
      return NextResponse.json({
        error: 'Orden no encontrada',
        code: 'ORDER_NOT_FOUND'
      }, { status: 404 })
    }

    // Verificar que se puede cambiar el estado logístico
    if (!canChangeFulfillment(currentOrder.payment_status, currentOrder.fulfillment_status)) {
      return NextResponse.json({
        error: 'No se puede cambiar el estado logístico de esta orden',
        details: {
          current_payment_status: currentOrder.payment_status,
          current_fulfillment_status: currentOrder.fulfillment_status,
          reason: 'La orden no está en un estado que permita cambios logísticos'
        },
        code: 'INVALID_STATUS_CHANGE'
      }, { status: 400 })
    }

    // Obtener el nuevo estado logístico
    const newFulfillmentStatus = getFulfillmentStatusFromAction(action)

    // Preparar datos de actualización
    const updateData: any = {
      fulfillment_status: newFulfillmentStatus,
      updated_at: new Date().toISOString()
    }

    // Agregar notas del admin si se proporcionan
    if (notes) {
      updateData.admin_notes = currentOrder.admin_notes 
        ? `${currentOrder.admin_notes}\n\n[${new Date().toISOString()}] ${admin.name}: ${notes}`
        : `[${new Date().toISOString()}] ${admin.name}: ${notes}`
    }

    // Agregar información de tracking si es relevante
    if (tracking_number && (action === 'mark_shipped' || action === 'mark_delivered')) {
      updateData.tracking_info = {
        tracking_number,
        estimated_delivery,
        shipped_at: action === 'mark_shipped' ? new Date().toISOString() : undefined,
        delivered_at: action === 'mark_delivered' ? new Date().toISOString() : undefined
      }
    }

    // Actualizar la orden
    const updatedOrder = await orderService.updateFulfillmentStatus(orderId, updateData)
    if (!updatedOrder) {
      return NextResponse.json({
        error: 'Error al actualizar la orden',
        code: 'UPDATE_ERROR'
      }, { status: 500 })
    }

    // Log de auditoría
    await logService.recordActivity({
      action: `fulfillment_status_changed`,
      entity_type: 'order',
      entity_id: orderId,
      details: {
        admin_id: admin.id,
        admin_email: admin.email,
        old_fulfillment_status: currentOrder.fulfillment_status,
        new_fulfillment_status: newFulfillmentStatus,
        action: action,
        notes: notes,
        tracking_number: tracking_number,
        estimated_delivery: estimated_delivery
      }
    })

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: `Estado logístico actualizado a: ${newFulfillmentStatus}`,
      order: {
        id: updatedOrder.id,
        fulfillment_status: updatedOrder.fulfillment_status,
        admin_notes: updatedOrder.admin_notes,
        updated_at: updatedOrder.updated_at
      }
    })

  } catch (error) {
    console.error('Error en POST /api/admin/orders/[id]/fulfillment:', error)
    
    // Log del error
    await logService.recordActivity({
      action: 'error_fulfillment_update',
      entity_type: 'order',
      entity_id: 'fulfillment_error',
      details: {
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      }
    })

    return NextResponse.json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// =============================================================================
// 📋 ENDPOINTS ADICIONALES
// =============================================================================

/**
 * GET /api/admin/orders/[id]/fulfillment
 * Obtener historial de cambios logísticos de una orden
 */
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
    if (!admin) {
      return NextResponse.json({
        error: 'Token inválido o expirado',
        code: 'INVALID_TOKEN'
      }, { status: 401 })
    }
    
    const orderId = getIdFromUrl(request)

    // Obtener la orden
    const order = await orderService.getOrderById(orderId)
    if (!order) {
      return NextResponse.json({
        error: 'Orden no encontrada',
        code: 'ORDER_NOT_FOUND'
      }, { status: 404 })
    }

    // Obtener logs de actividad relacionados con esta orden
    const activityLogs = await logService.getActivityLogs({
      page: 1,
      limit: 100,
      entity_type: 'order',
      entity_id: orderId,
      action: 'fulfillment_status_changed'
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        current_fulfillment_status: order.fulfillment_status,
        payment_status: order.payment_status,
        shipping_method: order.shipping_method,
        admin_notes: order.admin_notes,
        updated_at: order.updated_at
      },
      fulfillment_history: activityLogs.logs
    })

  } catch (error) {
    console.error('Error en GET /api/admin/orders/[id]/fulfillment:', error)
    return NextResponse.json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// =============================================================================
// 🚫 MÉTODOS NO PERMITIDOS
// =============================================================================

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
