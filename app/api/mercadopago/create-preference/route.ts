import { NextRequest, NextResponse } from 'next/server'
import { mercadopagoService } from '@/services/mercadopagoService'
import { cartService } from '@/services/cartService'
import { logService } from '@/services/logService'
import { CreateOrderRequest } from '@/types/order'
import { randomUUID } from 'crypto'

/**
 * POST /api/mercadopago/create-preference
 * Crear preferencia de pago en Mercado Pago
 */
export async function POST(request: NextRequest) {
  console.log('🚀 === INICIO CREATE PREFERENCE ===')
  
  try {
    console.log('📥 Parseando body del request...')
    const body = await request.json() as CreateOrderRequest
    console.log('✅ Body parseado:', JSON.stringify(body, null, 2))

    // Validar datos requeridos
    if (!body.items || body.items.length === 0) {
      console.log('❌ Validación fallida: Items del carrito faltantes')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Items del carrito son requeridos' 
        },
        { status: 400 }
      )
    }

    if (!body.customer_email || !body.customer_name || !body.shipping_address) {
      console.log('❌ Validación fallida: Información del cliente faltante')
      console.log('- customer_email:', !!body.customer_email)
      console.log('- customer_name:', !!body.customer_name)
      console.log('- shipping_address:', !!body.shipping_address)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Información del cliente es requerida' 
        },
        { status: 400 }
      )
    }

    // 1. Validar stock de todos los productos
    console.log('🔍 Validando stock de productos...')
    for (const item of body.items) {
      console.log(`- Validando stock para: ${item.product_name} (ID: ${item.product_id}, Cantidad: ${item.quantity})`)
      try {
        const stockValid = await cartService.validateStock(item.product_id, item.quantity)
        console.log(`- Stock válido para ${item.product_name}:`, stockValid)
        if (!stockValid.isValid) {
          console.log(`❌ Stock insuficiente para ${item.product_name}`)
          return NextResponse.json(
            { 
              success: false, 
              error: `Stock insuficiente para ${item.product_name}: ${stockValid.message}` 
            },
            { status: 400 }
          )
        }
      } catch (stockError) {
        console.error(`❌ Error validando stock para ${item.product_name}:`, stockError)
        throw new Error(`Error validando stock: ${stockError instanceof Error ? stockError.message : 'Error desconocido'}`)
      }
    }

    // 2. Calcular total para la preferencia (sin crear orden aún)
    console.log('🧮 Calculando total de items...')
    const total_amount = body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    console.log('✅ Total calculado:', total_amount)

    // ✅ CAMBIO: Separar email REAL vs email para MercadoPago
    const realCustomerEmail = body.customer_email // Email REAL del cliente
    const emailForMP = (body as any).customer_email_for_mp || body.customer_email // Email para MP (con fallback)
    
    console.log('📧 Emails recibidos:', {
      real: realCustomerEmail,
      for_mp: emailForMP,
      are_different: realCustomerEmail !== emailForMP
    })

    // 3. Crear orden temporal para la preferencia (no se guarda en BD)
    const tempOrderData = {
      id: randomUUID(), // ID temporal para external_reference
      total_amount,
      customer_email: emailForMP, // ✅ Usar email para MP (mockeado en dev)
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      shipping_address: body.shipping_address,
      payment_method: 'mercadopago',
      status: 'temp', // Temporal
      payment_status: 'pending',
      // ✅ ACTUALIZADO: Usar shipping_method directo del body
      shipping_method: body.shipping_method || 'pickup',
      fulfillment_status: 'none'
    }

    // 4. Crear preferencia de pago en Mercado Pago (sin orden en BD)
    console.log('💳 Creando preferencia de pago en MP...')
    let preference
    try {
      preference = await mercadopagoService.createPaymentPreference(tempOrderData, body.items)
      console.log('✅ Preferencia de MP creada:', { id: preference.id, init_point: preference.init_point })
    } catch (mpError) {
      console.error('❌ Error creando preferencia MP:', mpError)
      throw new Error(`Error en Mercado Pago: ${mpError instanceof Error ? mpError.message : 'Error desconocido'}`)
    }

    // 5. Guardar datos temporales para el webhook (usando preference_id como clave)
    console.log('💾 Almacenando datos temporales para webhook...')
    try {
      await logService.recordActivity({
        action: 'mp_preference_created_temp',
        entity_type: 'mercadopago',
        entity_id: preference.id,
        details: {
          temp_order_id: tempOrderData.id,
          preference_id: preference.id,
          init_point: preference.init_point,
          total_amount: total_amount,
          items_count: body.items.length,
          customer_email: realCustomerEmail, // ✅ Guardar email REAL del cliente
          customer_email_for_mp: emailForMP, // ✅ Guardar también el email usado para MP (referencia)
          customer_name: body.customer_name,
          customer_phone: body.customer_phone,
          items: body.items,
          shipping_address: body.shipping_address,
          shipping_method: tempOrderData.shipping_method
        }
      })
      console.log('✅ Datos temporales almacenados para webhook (email REAL guardado)')
    } catch (logError) {
      console.error('⚠️ Error almacenando datos temporales (no crítico):', logError)
      // No lanzar error, el log no es crítico
    }

    console.log('🎉 === PREFERENCIA CREADA EXITOSAMENTE (SIN ORDEN AÚN) ===')
    console.log('✅ Datos finales:', {
      temp_order_id: tempOrderData.id,
      preference_id: preference.id,
      init_point: preference.init_point
    })

    return NextResponse.json({
      success: true,
      data: {
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        temp_order_info: {
          id: tempOrderData.id,
          total_amount: total_amount,
          customer_email: tempOrderData.customer_email,
          message: 'Orden se creará cuando el pago sea confirmado'
        }
      }
    })

  } catch (error) {
    console.error('💥 === ERROR EN CREATE PREFERENCE ===')
    console.error('❌ Error completo:', error)
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Error desconocido')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    // Información adicional para debugging
    if (error instanceof Error) {
      console.error('❌ Error type:', error.constructor.name)
      console.error('❌ Error cause:', error.cause)
    }

    // Log del error (solo si no falla)
    try {
      await logService.recordActivity({
        action: 'error_mp_preference',
        entity_type: 'mercadopago',
        entity_id: 'unknown',
        details: {
          error: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : undefined,
          type: error instanceof Error ? error.constructor.name : typeof error
        }
      })
    } catch (logError) {
      console.error('⚠️ También falló el logging del error:', logError)
    }

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorDetails = process.env.NODE_ENV === 'development' ? {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    } : undefined

    console.error('💥 === FIN ERROR DEBUG ===')

    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor al crear preferencia de pago',
        details: errorDetails
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/mercadopago/create-preference
 * Método no permitido
 */
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Método no permitido' 
    },
    { status: 405 }
  )
}