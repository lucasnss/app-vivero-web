import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/services/orderService'
import { mercadopagoService } from '@/services/mercadopagoService'
import { logService } from '@/services/logService'

interface Params {
  params: {
    orderId: string
  }
}

/**
 * GET /api/mercadopago/payment-status/[orderId]
 * Consultar estado actual del pago de una orden
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { orderId } = params

    if (!orderId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order ID es requerido' 
        },
        { status: 400 }
      )
    }

    console.log('🔍 Consultando estado de pago para orden:', orderId)

    // Obtener la orden
    const order = await orderService.getOrderById(orderId)
    if (!order) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Orden no encontrada' 
        },
        { status: 404 }
      )
    }

    // Si la orden no tiene payment_id, no hay pago en MP
    if (!order.payment_id) {
      return NextResponse.json({
        success: true,
        data: {
          order_id: orderId,
          payment_status: order.payment_status || 'pending',
          payment_method: order.payment_method,
          has_mp_payment: false,
          message: 'Orden sin pago de Mercado Pago'
        }
      })
    }

    // Consultar estado actual en Mercado Pago
    console.log('📞 Consultando MP para payment_id:', order.payment_id)
    let currentPaymentInfo = null
    try {
      currentPaymentInfo = await mercadopagoService.getPaymentInfo(order.payment_id)
    } catch (error) {
      console.error('Error consultando MP:', error)
      // Si hay error consultando MP, devolver info de la BD
      return NextResponse.json({
        success: true,
        data: {
          order_id: orderId,
          payment_id: order.payment_id,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          metodo_pago: order.metodo_pago,
          fecha_pago: order.fecha_pago,
          comprobante_url: order.comprobante_url,
          has_mp_payment: true,
          source: 'database',
          message: 'Estado desde base de datos (error consultando MP)'
        }
      })
    }

    // Si el estado cambió, actualizar en BD
    if (currentPaymentInfo.status !== order.payment_status) {
      console.log('🔄 Estado cambió, actualizando BD:', {
        from: order.payment_status,
        to: currentPaymentInfo.status
      })

      try {
        await orderService.updatePaymentInfo(orderId, {
          payment_status: currentPaymentInfo.status,
          metodo_pago: currentPaymentInfo.payment_method_id,
          email_comprador: currentPaymentInfo.payer_email,
          fecha_pago: currentPaymentInfo.date_approved,
          comprobante_url: mercadopagoService.getComprobanteUrl(currentPaymentInfo) || undefined
        })

        // Si se aprobó, marcar como pagada
        if (currentPaymentInfo.status === 'approved' && order.payment_status !== 'approved') {
          await orderService.markOrderAsPaid(orderId, {
            payment_id: currentPaymentInfo.payment_id,
            metodo_pago: currentPaymentInfo.payment_method_id,
            fecha_pago: currentPaymentInfo.date_approved || new Date().toISOString(),
            comprobante_url: mercadopagoService.getComprobanteUrl(currentPaymentInfo) || undefined
          })
        }
      } catch (updateError) {
        console.error('Error actualizando orden:', updateError)
        // Continuar con la respuesta aunque falle la actualización
      }
    }

    // Log de consulta
    await logService.recordActivity({
      action: 'payment_status_checked',
      entity_type: 'order',
      entity_id: orderId,
      details: {
        payment_id: order.payment_id,
        current_status: currentPaymentInfo.status,
        previous_status: order.payment_status,
        status_changed: currentPaymentInfo.status !== order.payment_status
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        payment_id: order.payment_id,
        payment_status: currentPaymentInfo.status,
        payment_method: order.payment_method,
        metodo_pago: currentPaymentInfo.payment_method_id,
        payment_type: currentPaymentInfo.payment_type_id,
        fecha_pago: currentPaymentInfo.date_approved,
        comprobante_url: mercadopagoService.getComprobanteUrl(currentPaymentInfo) || undefined,
        transaction_amount: currentPaymentInfo.transaction_amount,
        status_description: mercadopagoService.getStatusDescription(currentPaymentInfo.status),
        has_mp_payment: true,
        source: 'mercadopago',
        last_updated: new Date().toISOString(),
        
        // Información adicional útil
        is_final_status: mercadopagoService.isPaymentFinal(currentPaymentInfo.status),
        authorization_code: currentPaymentInfo.authorization_code,
        external_reference: currentPaymentInfo.external_reference
      }
    })

  } catch (error) {
    console.error('❌ Error checking payment status:', error)

    await logService.recordActivity({
      action: 'error_payment_status_check',
      entity_type: 'order',
      entity_id: params.orderId,
      details: {
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    })

    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor al consultar estado de pago',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Error desconocido') : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/mercadopago/payment-status/[orderId]
 * Forzar actualización del estado de pago (solo para admin)
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { orderId } = params

    // TODO: Agregar middleware de autenticación admin
    // Por ahora permitimos la operación

    console.log('🔄 Forzando actualización de estado para orden:', orderId)

    // Obtener la orden
    const order = await orderService.getOrderById(orderId)
    if (!order || !order.payment_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Orden no encontrada o sin pago de MP' 
        },
        { status: 404 }
      )
    }

    // Consultar estado actual en MP y forzar actualización
    const paymentInfo = await mercadopagoService.getPaymentInfo(order.payment_id)
    
    const updatedOrder = await orderService.updatePaymentInfo(orderId, {
      payment_status: paymentInfo.status,
      metodo_pago: paymentInfo.payment_method_id,
      email_comprador: paymentInfo.payer_email,
      fecha_pago: paymentInfo.date_approved,
      comprobante_url: mercadopagoService.getComprobanteUrl(paymentInfo) || undefined
    })

    await logService.recordActivity({
      action: 'payment_status_force_update',
      entity_type: 'order',
      entity_id: orderId,
      details: {
        payment_id: order.payment_id,
        new_status: paymentInfo.status,
        previous_status: order.payment_status
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        payment_status: paymentInfo.status,
        updated: true,
        message: 'Estado actualizado desde Mercado Pago'
      }
    })

  } catch (error) {
    console.error('❌ Error forcing payment status update:', error)

    return NextResponse.json(
      { 
        success: false, 
        error: 'Error forzando actualización de estado',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Error desconocido') : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Otros métodos no permitidos
 */
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}