import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/src/services/orderService'
import { sendCompletionEmail } from '@/src/services/emailService'

/**
 * PUT /api/orders/[id]/fulfillment
 * Actualiza el estado logístico de una orden (marcar como completado o revertir)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    const { action } = body // 'complete' o 'revert'

    console.log(`📦 [PUT /api/orders/${orderId}/fulfillment] Action:`, action)

    // Validar action
    if (!action || !['complete', 'revert'].includes(action)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Acción inválida. Debe ser "complete" o "revert"' } 
        },
        { status: 400 }
      )
    }

    // Obtener orden actual
    const order = await orderService.getOrderById(orderId)

    if (!order) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Orden no encontrada' } 
        },
        { status: 404 }
      )
    }

    console.log(`📋 Orden actual:`, {
      id: order.id,
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
      shipping_method: order.shipping_method
    })

    // VALIDACIONES para acción 'complete'
    if (action === 'complete') {
      // Solo se puede completar si el pago está aprobado
      if (order.payment_status !== 'approved') {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              message: 'Solo se pueden completar pedidos con pago aprobado',
              details: `Estado de pago actual: ${order.payment_status}`
            } 
          },
          { status: 403 }
        )
      }

      // Verificar si ya está completado
      const alreadyCompleted = ['delivered', 'pickup_completed'].includes(
        order.fulfillment_status || ''
      )
      
      if (alreadyCompleted) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              message: 'El pedido ya está completado',
              details: `Estado actual: ${order.fulfillment_status}`
            } 
          },
          { status: 400 }
        )
      }
    }

    // DETERMINAR NUEVO ESTADO
    let newFulfillmentStatus: string

    if (action === 'complete') {
      // Según el método de envío, determinar el estado final
      newFulfillmentStatus = order.shipping_method === 'delivery' 
        ? 'delivered'          // Entregado a domicilio
        : 'pickup_completed'   // Retirado en tienda
    } else {
      // Revertir a estado "esperando envío/retiro"
      newFulfillmentStatus = order.shipping_method === 'delivery'
        ? 'awaiting_shipment'
        : 'awaiting_pickup'
    }

    console.log(`🔄 Actualizando fulfillment_status de "${order.fulfillment_status}" a "${newFulfillmentStatus}"`)

    // ACTUALIZAR EN BASE DE DATOS
    const updatedOrder = await orderService.updateFulfillmentStatus(orderId, {
      fulfillment_status: newFulfillmentStatus,
      admin_notes: action === 'complete' 
        ? `Pedido marcado como completado el ${new Date().toLocaleString('es-AR')}`
        : `Pedido revertido a estado en proceso el ${new Date().toLocaleString('es-AR')}`,
      updated_at: new Date().toISOString()
    })

    if (!updatedOrder) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Error actualizando la orden' } 
        },
        { status: 500 }
      )
    }

    console.log(`✅ Orden actualizada exitosamente`)

    // 📧 ENVIAR EMAIL CON PDF ADJUNTO
    let emailSent = false
    
    if (action === 'complete') {
      try {
        console.log('📧 Intentando enviar email de completación...')
        emailSent = await sendCompletionEmail(updatedOrder)
        console.log(`📧 Email enviado: ${emailSent}`)
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError)
        // No fallar la petición completa si el email falla
        // La orden ya fue actualizada exitosamente
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        emailSent,
        message: action === 'complete'
          ? `Pedido marcado como completado${emailSent ? ' y notificación enviada' : ''}`
          : 'Pedido revertido a estado "En Proceso"'
      }
    })

  } catch (error) {
    console.error('❌ [PUT /api/orders/[id]/fulfillment] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido'
        } 
      },
      { status: 500 }
    )
  }
}

