import { NextRequest, NextResponse } from 'next/server'
import { mercadopagoService } from '@/services/mercadopagoService'
import { orderService } from '@/services/orderService'
import { logService } from '@/services/logService'
import { WebhookNotification } from '@/types/order'
import { supabase } from '@/lib/supabaseClient'

// Forzar renderizado dinámico para evitar errores en producción con headers
export const dynamic = "force-dynamic"

// ✅ NUEVO: Cache en memoria para evitar procesar el mismo webhook dos veces
// Las claves son payment_id, los valores son timestamps
const processingCache = new Map<string, number>()
const PROCESSING_TIMEOUT = 5000 // 5 segundos

/**
 * Verifica si un webhook ya está siendo procesado
 */
function isPaymentBeingProcessed(paymentId: string): boolean {
  const lastProcess = processingCache.get(paymentId)
  if (!lastProcess) return false
  
  const elapsed = Date.now() - lastProcess
  if (elapsed > PROCESSING_TIMEOUT) {
    // Expiró el timeout, limpiar
    processingCache.delete(paymentId)
    return false
  }
  
  return true
}

/**
 * Marca un payment como siendo procesado
 */
function markPaymentAsProcessing(paymentId: string): void {
  processingCache.set(paymentId, Date.now())
}

/**
 * POST /api/mercadopago/webhook
 * Recibir notificaciones de webhook de Mercado Pago
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WebhookNotification
    
    // ✅ NUEVO: Parsear también query params (Mercado Pago a veces envía así)
    const searchParams = request.nextUrl.searchParams
    
    // ✅ LOG de debugging - mostrar qué datos llegaron
    console.log('🔍 Query params recibidos:', Object.fromEntries(searchParams))
    console.log('📦 Body recibido:', {
      id: body.id,
      type: body.type,
      action: body.action,
      data_id: body.data?.id
    })
    
    // ✅ NUEVO: Priorizar body sobre query params, con fallback a query
    const webhookData = {
      id: body.id || searchParams.get('id'),
      type: body.type || searchParams.get('type') || searchParams.get('topic'),
      action: body.action || searchParams.get('action'),
      data_id: body.data?.id || searchParams.get('id') || searchParams.get('data.id')
    }

    console.log('🔔 Webhook procesado:', webhookData)

    // Validar que sea una notificación de pago
    if (webhookData.type !== 'payment') {
      console.log('ℹ️ Webhook ignorado, no es de tipo payment:', webhookData.type)
      return NextResponse.json(
        { error: 'Invalid webhook type', reason: 'not_payment_type' },
        { status: 400 }
      )
    }

    // Validar que tengamos el ID del pago
    if (!webhookData.data_id) {
      console.error('❌ Webhook sin data_id')
      return NextResponse.json(
        { error: 'Missing payment ID in webhook data' },
        { status: 400 }
      )
    }

    // Validar que el ID del pago sea válido
    if (typeof webhookData.data_id !== 'string' || webhookData.data_id.trim() === '') {
      console.error('❌ Webhook con ID de pago inválido:', webhookData.data_id)
      return NextResponse.json(
        { error: 'Invalid payment ID format' },
        { status: 400 }
      )
    }

    const paymentId = webhookData.data_id

    // ✅ NUEVO: Verificar si ya está siendo procesado (race condition protection)
    if (isPaymentBeingProcessed(paymentId)) {
      console.log('⚠️ Webhook ya está siendo procesado:', paymentId)
      return NextResponse.json({ status: 'already_processing' })
    }
    
    // Marcar como siendo procesado
    markPaymentAsProcessing(paymentId)

    // Verificar si ya procesamos este pago (idempotencia)
    const existingOrder = await orderService.getOrderByPaymentId(paymentId)
    if (existingOrder && mercadopagoService.isPaymentFinal(existingOrder.payment_status)) {
      console.log('⚠️ Pago ya procesado previamente:', paymentId)
      await logService.recordActivity({
        action: 'webhook_duplicate',
        entity_type: 'mercadopago',
        entity_id: paymentId,
        details: {
          webhook_id: body.id,
          order_id: existingOrder.id,
          current_status: existingOrder.payment_status
        }
      })
      return NextResponse.json({ status: 'already_processed' })
    }

    // Procesar la notificación
    console.log('🔄 Procesando pago:', paymentId)
    
    // ✅ Construir objeto WebhookNotification correctamente
    // (Mercado Pago a veces envía datos en query params, no en body)
    const notificationToProcess: any = {
      id: webhookData.id,
      type: webhookData.type,
      action: webhookData.action,
      data: {
        id: paymentId
      }
    }
    
    console.log('🔍 Notificación a procesar:', notificationToProcess)
    const paymentInfo = await mercadopagoService.processWebhookNotification(notificationToProcess)

    if (!paymentInfo) {
      console.log('ℹ️ No se pudo procesar el webhook')
      return NextResponse.json({ status: 'not_processed' })
    }

    // Detectar si es test o real
    const payment_source = detectarSiEsTest(paymentInfo)
    console.log(`📊 Tipo de pago: ${payment_source === 'test' ? '🧪 TEST' : '✅ REAL'}`)

    // Buscar datos temporales de la preferencia para crear la orden
    console.log('🔍 Buscando datos temporales de la preferencia...')
    let order: any = null
    let tempOrderData: any = null

    // Primero intentar buscar orden existente (por si ya se procesó antes)
    if (paymentInfo.external_reference) {
      try {
        order = await orderService.getOrderById(paymentInfo.external_reference)
        if (order) {
          console.log('✅ Orden existente encontrada:', order.id)
        }
      } catch (error) {
        console.log('ℹ️ Orden no existe aún, procederemos a crearla')
      }
    }

    // Si no hay orden, buscar datos temporales y crear la orden
    if (!order) {
      try {
        // Buscar datos temporales por temp_order_id (external_reference) en activity_logs
        console.log('🔎 Buscando datos temporales con external_reference:', paymentInfo.external_reference)
        const { data: tempLogs } = await supabase
          .from('activity_logs')
          .select('details')
          .eq('action', 'mp_preference_created_temp')
          .contains('details', { temp_order_id: paymentInfo.external_reference })
          .order('timestamp', { ascending: false })
          .limit(1)
          .single()

        if (tempLogs?.details) {
          tempOrderData = tempLogs.details
          console.log('✅ Datos temporales encontrados:', {
            temp_order_id: tempOrderData.temp_order_id,
            customer_email: tempOrderData.customer_email
          })

          // ✅ IDEMPOTENCIA: Verificar si ya existe una orden con este temp_order_id (external_reference)
          console.log('🔍 Verificando si ya existe orden con external_reference:', tempOrderData.temp_order_id)
          const { data: existingOrderByRef } = await supabase
            .from('orders')
            .select('*')
            .eq('external_reference', tempOrderData.temp_order_id)
            .single()

          if (existingOrderByRef) {
            console.log('♻️ Orden ya existe (reutilizando):', existingOrderByRef.id)
            order = existingOrderByRef
          } else {
            // Crear la orden real en BD usando los datos temporales
            console.log('📝 Creando orden real desde datos temporales...')
            console.log('📧 Email REAL del cliente a guardar:', tempOrderData.customer_email)
            console.log('📧 Email usado en MP:', tempOrderData.customer_email_for_mp || 'no especificado')
            
            const createOrderRequest: any = {
              items: tempOrderData.items,
              shipping_address: tempOrderData.shipping_address,
              payment_method: 'mercadopago' as const,
              customer_email: tempOrderData.customer_email, // ✅ Email REAL del cliente
              customer_name: tempOrderData.customer_name,
              customer_phone: tempOrderData.customer_phone || '',
              // ✅ NUEVO: Pasar shipping_method para que se guarde en customer_info
              shipping_method: tempOrderData.shipping_method,
              notes: `Orden creada automáticamente desde webhook MP`,
              // ✅ NUEVO: Pasar payment_source
              payment_source,
              // ✅ CRÍTICO: Pasar external_reference DESDE EL INICIO para prevenir race condition
              external_reference: tempOrderData.temp_order_id
            }

            order = await orderService.createGuestOrder(createOrderRequest)
            console.log('✅ Orden real creada con external_reference:', order?.id)
            console.log('✅ Email guardado en la orden:', order?.customer_email)
          }
          
          // Actualizar shipping_method en la orden creada si es necesario
          if (tempOrderData?.shipping_method && order?.id) {
            // Actualizar directamente en BD sin usar updatePaymentInfo
            const { error: updateError } = await supabase
              .from('orders')
              .update({ shipping_method: tempOrderData.shipping_method })
              .eq('id', order.id)
            
            if (!updateError && order) {
              order.shipping_method = tempOrderData.shipping_method
            }
          }
        }
      } catch (error) {
        console.error('❌ Error buscando/creando orden desde datos temporales:', error)
      }
    }

    // Si aún no hay orden, es un error
    if (!order || !order?.id) {
      console.error('❌ No se encontró orden ni datos temporales para el pago:', paymentId)
      await logService.recordActivity({
        action: 'webhook_order_not_found',
        entity_type: 'mercadopago',
        entity_id: paymentId,
        details: {
          external_reference: paymentInfo.external_reference,
          payment_status: paymentInfo.status,
          temp_data_search_attempted: true
        }
      })
      return NextResponse.json(
        { error: 'Order data not found for payment' },
        { status: 404 }
      )
    }

    // Actualizar información de pago en la orden
    console.log('📝 Actualizando orden con información de pago...')
    
    // ✅ NUEVO: Verificar si ya existe una orden con este payment_id (para evitar duplicados)
    const existingOrderWithPaymentId = await orderService.getOrderByPaymentId(paymentInfo.payment_id)
    if (existingOrderWithPaymentId && existingOrderWithPaymentId.id !== order?.id) {
      console.log('⚠️ Este payment_id ya fue asignado a otra orden. Ignorando duplicado:', paymentInfo.payment_id)
      await logService.recordActivity({
        action: 'webhook_duplicate_payment_id',
        entity_type: 'mercadopago',
        entity_id: paymentInfo.payment_id,
        details: {
          first_order_id: existingOrderWithPaymentId.id,
          duplicate_order_id: order?.id,
          payment_status: paymentInfo.status
        }
      })
      return NextResponse.json({ status: 'duplicate_payment_id', order_id: existingOrderWithPaymentId.id })
    }
    
    const updatedOrder = await orderService.updatePaymentInfo(order?.id || '', {
      payment_id: paymentInfo.payment_id,
      payment_status: paymentInfo.status,
      metodo_pago: paymentInfo.payment_method_id,
      email_comprador: paymentInfo.payer_email || undefined,
      fecha_pago: paymentInfo.date_approved || undefined,
      comprobante_url: mercadopagoService.getComprobanteUrl(paymentInfo) || undefined,
      payment_type: paymentInfo.payment_type_id,
      merchant_order_id: paymentInfo.merchant_order_id
    })

    // Si el pago fue aprobado, marcar orden como pagada y establecer fulfillment_status
    if (paymentInfo.status === 'approved') {
      console.log('✅ Pago aprobado, marcando orden como pagada')
      
      // Determinar fulfillment_status basado en shipping_method
      let fulfillmentStatus = 'awaiting_pickup'; // Default para pickup
      if (order?.shipping_method === 'delivery') {
        fulfillmentStatus = 'awaiting_shipment';
      }
      
      await orderService.markOrderAsPaid(order?.id || '', {
        payment_id: paymentInfo.payment_id,
        metodo_pago: paymentInfo.payment_method_id,
        fecha_pago: paymentInfo.date_approved || new Date().toISOString(),
        comprobante_url: mercadopagoService.getComprobanteUrl(paymentInfo) || undefined,
        fulfillment_status: fulfillmentStatus
      })
      
      // ✅ CAMBIO: Notificar al cliente para que limpie el carrito temporal
      // Agregamos header de respuesta que el cliente puede leer para saber que debe limpiar el carrito
      console.log('🗑️ Marcando para limpiar carrito temporal del cliente')
    }

    // Log exitoso
    await logService.recordActivity({
      action: 'webhook_processed_success',
      entity_type: 'order',
      entity_id: order?.id || 'unknown',
      details: {
        payment_id: paymentInfo.payment_id,
        payment_status: paymentInfo.status,
        metodo_pago: paymentInfo.payment_method_id,
        webhook_id: body.id,
        amount: paymentInfo.transaction_amount
      }
    })

    console.log('✅ Webhook procesado exitosamente:', {
      order_id: order?.id,
      payment_id: paymentInfo.payment_id,
      status: paymentInfo.status
    })

    return NextResponse.json({
      status: 'processed',
      order_id: order?.id,
      payment_status: paymentInfo.status
    })

  } catch (error) {
    console.error('❌ Error procesando webhook:', error)

    // Log del error
    await logService.recordActivity({
      action: 'error_webhook_processing',
      entity_type: 'mercadopago',
      entity_id: 'webhook_error',
      details: {
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      }
    })

    return NextResponse.json(
      { 
        error: 'Internal server error processing webhook',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Error desconocido') : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/mercadopago/webhook
 * Endpoint de verificación para Mercado Pago
 */
export async function GET(request: NextRequest) {
  // Mercado Pago a veces hace GET requests para verificar el endpoint
  console.log('🔍 Verificación de webhook de Mercado Pago')
  
  await logService.recordActivity({
    action: 'webhook_verification',
    entity_type: 'mercadopago',
    entity_id: 'verification',
    details: {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    }
  })

  return NextResponse.json({ 
    status: 'webhook_endpoint_active',
    timestamp: new Date().toISOString()
  })
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

/**
 * Detecta si un pago es TEST o REAL
 */
function detectarSiEsTest(paymentInfo: any): string {
  console.log('🔍 Analizando pago para detectar tipo:', {
    live_mode: paymentInfo.live_mode,
    payment_method_id: paymentInfo.payment_method_id,
    transaction_amount: paymentInfo.transaction_amount,
    payer_email: paymentInfo.payer?.email,
    payment_id: paymentInfo.payment_id,
    is_development_mock: paymentInfo.is_development_mock
  })

  // Criterio 0: Simulación de desarrollo
  if (paymentInfo.is_development_mock === true) {
    console.log('🧪 Test detectado: is_development_mock = true')
    return 'test'
  }

  // Criterio 1: Flag oficial de Mercado Pago (si live_mode = false, es test)
  if (paymentInfo.live_mode === false) {
    console.log('🧪 Test detectado: live_mode = false')
    return 'test'
  }

  // Criterio 2: Account Money (transferencia entre cuentas)
  if (paymentInfo.payment_method_id === 'account_money') {
    console.log('🧪 Test detectado: payment_method_id = account_money')
    return 'test'
  }

  // Criterio 3: Monto muy bajo
  if (paymentInfo.transaction_amount && paymentInfo.transaction_amount < 1) {
    console.log('🧪 Test detectado: monto < 1')
    return 'test'
  }

  // Criterio 4: Email con "test"
  if (paymentInfo.payer?.email?.toLowerCase().includes('test')) {
    console.log('🧪 Test detectado: email contiene "test"')
    return 'test'
  }

  // Criterio 5: Payment ID de simulación (comienza con números bajos)
  if (paymentInfo.payment_id && paymentInfo.payment_id.toString().match(/^[0-9]{1,6}$/)) {
    console.log('🧪 Test detectado: payment_id parece simulación')
    return 'test'
  }

  console.log('✅ Pago detectado como REAL')
  return 'real'
}