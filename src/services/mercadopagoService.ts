import { Preference, Payment } from 'mercadopago'
import { mercadoPagoClient, mercadoPagoConfig, validateMercadoPagoConfig, isUsingFakeCredentials } from '@/lib/mercadopagoConfig'
import { logService } from './logService'
import type {
  CreateMercadoPagoPreferenceRequest,
  MercadoPagoPreferenceResponse,
  MercadoPagoPaymentInfo,
  WebhookNotification,
  Order,
  PaymentStatus,
  MercadoPagoPaymentType
} from '@/types/order'
import type { CartItem } from '@/types/cartItem'

// Validar configuración al inicializar el servicio
validateMercadoPagoConfig()

export const mercadopagoService = {
  /**
   * Crear preferencia de pago en Mercado Pago
   */
  async createPaymentPreference(
    order: Order,
    items: CartItem[]
  ): Promise<MercadoPagoPreferenceResponse> {
    try {
      const preference = new Preference(mercadoPagoClient)

      // Convertir items del carrito al formato de MP
      const mpItems = items.map(item => ({
        id: item.product_id,
        title: item.product_name,
        description: `${item.product_name} - Cantidad: ${item.quantity}`,
        picture_url: item.image || undefined,
        category_id: 'plantas', // Categoría por defecto
        quantity: item.quantity,
        currency_id: 'ARS', // Peso argentino
        unit_price: Number((item as any).price ?? (item as any).unit_price ?? 0)
      }))

      // Configurar datos del pagador si están disponibles
      const payer: any = {}
      if (order.customer_email) {
        payer.email = order.customer_email
      }
      if (order.customer_name) {
        const nameParts = order.customer_name.split(' ')
        payer.name = nameParts[0]
        if (nameParts.length > 1) {
          payer.surname = nameParts.slice(1).join(' ')
        }
      }
      if (order.customer_phone) {
        payer.phone = {
          area_code: '11', // Código de área por defecto
          number: order.customer_phone.replace(/\D/g, '') // Solo números
        }
      }
      if (order.shipping_address) {
        payer.address = {
          street_name: order.shipping_address.street,
          street_number: order.shipping_address.number,
          zip_code: order.shipping_address.zip
        }
      }

      // Crear la preferencia
      const preferenceData = {
        items: mpItems,
        payer: Object.keys(payer).length > 0 ? payer : undefined,
        back_urls: {
          success: mercadoPagoConfig.urls.success,
          failure: mercadoPagoConfig.urls.failure,
          pending: mercadoPagoConfig.urls.pending
        },
        notification_url: mercadoPagoConfig.urls.notification,
        external_reference: order.id,
        // auto_return: mercadoPagoConfig.checkout.autoReturn, // Comentado temporalmente
        
        // Configuraciones adicionales
        payment_methods: {
          excluded_payment_methods: mercadoPagoConfig.checkout.excludedPaymentMethods.map(m => ({ id: m.id })),
          excluded_payment_types: mercadoPagoConfig.checkout.excludedPaymentTypes.map(t => ({ id: t.id })),
          installments: mercadoPagoConfig.checkout.maxInstallments
        },
        
        // Metadatos adicionales
        metadata: {
          order_id: order.id,
          customer_email: order.customer_email,
          created_at: new Date().toISOString()
        }
      }

      console.log('📤 Enviando datos a Mercado Pago:', JSON.stringify(preferenceData, null, 2))
      
      // Log específico de la configuración de métodos de pago
      console.log('🔒 Configuración de métodos de pago:')
      console.log('   - excludedPaymentMethods:', mercadoPagoConfig.checkout.excludedPaymentMethods)
      console.log('   - excludedPaymentTypes:', mercadoPagoConfig.checkout.excludedPaymentTypes)
      console.log('   - payment_methods config:', preferenceData.payment_methods)
      
      // Log detallado de la preferencia completa
      console.log('📋 Preferencia completa a enviar:')
      console.log(JSON.stringify(preferenceData, null, 2))
      
      const result = await preference.create({ body: preferenceData })
      
      console.log('📨 Respuesta de Mercado Pago:', JSON.stringify(result, null, 2))

      // Log de la creación de preferencia
      await logService.recordActivity({
        action: 'create_mp_preference',
        entity_type: 'mercadopago',
        entity_id: result.id!,
        details: {
          order_id: order.id,
          items_count: items.length,
          total_amount: order.total_amount,
          preference_id: result.id
        }
      })

      return {
        id: result.id!,
        init_point: result.init_point!,
        sandbox_init_point: result.sandbox_init_point!,
        date_created: result.date_created!,
        items: result.items!,
        payer: result.payer!,
        back_urls: result.back_urls!,
        auto_return: result.auto_return!,
        notification_url: result.notification_url!,
        external_reference: result.external_reference!
      }

    } catch (error) {
      console.error('💥 Error creando preferencia de MP:', error)
      
      // Información detallada del error de MP
      if (error && typeof error === 'object') {
        console.error('- Error completo:', JSON.stringify(error, null, 2))
        if ('message' in error) console.error('- Message:', error.message)
        if ('error' in error) console.error('- Error type:', error.error)
        if ('status' in error) console.error('- Status:', error.status)
        if ('cause' in error) console.error('- Cause:', error.cause)
      }
      
      // Log del error
      try {
        await logService.recordActivity({
          action: 'error_mp_preference',
          entity_type: 'mercadopago',
          entity_id: order.id,
          details: {
            error: error instanceof Error ? error.message : 'Error desconocido',
            order_id: order.id,
            full_error: JSON.stringify(error)
          }
        })
      } catch (logError) {
        console.error('⚠️ Error logging MP error:', logError)
      }

      throw new Error('Error al crear preferencia de pago en Mercado Pago')
    }
  },

  /**
   * Obtener información de un pago desde Mercado Pago
   */
  async getPaymentInfo(paymentId: string): Promise<MercadoPagoPaymentInfo> {
    try {
      // Modo de prueba para testing
      if (paymentId.startsWith('test-')) {
        console.log('🧪 Modo de prueba detectado, simulando respuesta de MP')
        return this.getTestPaymentInfo(paymentId)
      }

      const payment = new Payment(mercadoPagoClient)
      const result = await payment.get({ id: paymentId })

      if (!result) {
        throw new Error(`Pago no encontrado: ${paymentId}`)
      }

      // Log de consulta de pago
      await logService.recordActivity({
        action: 'get_mp_payment',
        entity_type: 'mercadopago',
        entity_id: paymentId,
        details: {
          status: result.status,
          payment_method: result.payment_method_id,
          amount: result.transaction_amount
        }
      })

      return {
        payment_id: result.id?.toString() || paymentId,
        status: this.mapMPStatusToLocal(result.status || 'pending'),
        status_detail: result.status_detail || 'Sin detalles',
        payment_method_id: result.payment_method_id || 'unknown',
        payment_type_id: result.payment_type_id as MercadoPagoPaymentType || 'credit_card',
        date_approved: result.date_approved || undefined,
        date_created: result.date_created || new Date().toISOString(),
        payer_email: result.payer?.email || undefined,
        transaction_amount: Number(result.transaction_amount || 0),
        net_received_amount: result.transaction_details?.net_received_amount 
          ? Number(result.transaction_details.net_received_amount) 
          : undefined,
        total_paid_amount: result.transaction_details?.total_paid_amount 
          ? Number(result.transaction_details.total_paid_amount) 
          : undefined,
        
        // Para métodos offline
        ticket_url: result.point_of_interaction?.transaction_data?.ticket_url || undefined,
        
        // Para tarjetas
        authorization_code: result.authorization_code || undefined,
        
        // Información adicional
        external_reference: result.external_reference || undefined,
        merchant_order_id: result.order?.id?.toString() || undefined
      }

    } catch (error: any) {
      console.error('Error obteniendo información de pago:', error)
      
      // En desarrollo, si es un error 404, podría ser una simulación de MP
      // Permitir procesar webhooks de simulación retornando datos ficticios
      if (process.env.NODE_ENV === 'development' && 
          (error?.status === 404 || error?.message?.includes('not_found'))) {
        console.log('⚠️ Pago no encontrado en Mercado Pago (posible simulación de webhook)')
        console.log('📝 En DESARROLLO: Generando pago ficticio para procesar el webhook')
        
        // Retornar datos simulados para permitir testing del webhook
        return this.getTestPaymentInfo(paymentId)
      }
      
      await logService.recordActivity({
        action: 'error_get_mp_payment',
        entity_type: 'mercadopago',
        entity_id: paymentId,
        details: {
          error: error instanceof Error ? error.message : 'Error desconocido',
          status: error?.status,
          node_env: process.env.NODE_ENV
        }
      })

      throw new Error('Error al obtener información del pago')
    }
  },

  /**
   * Procesar notificación de webhook de Mercado Pago
   */
  async processWebhookNotification(notification: WebhookNotification): Promise<MercadoPagoPaymentInfo | null> {
    try {
      // Log de recepción de webhook
      await logService.recordActivity({
        action: 'webhook_received',
        entity_type: 'mercadopago',
        entity_id: notification.data.id,
        details: {
          type: notification.type,
          action: notification.action,
          webhook_id: notification.id,
          live_mode: notification.live_mode
        }
      })

      // Solo procesar notificaciones de pago
      if (notification.type !== 'payment') {
        console.log(`Webhook ignorado, tipo: ${notification.type}`)
        return null
      }

      // Obtener información del pago
      const paymentInfo = await this.getPaymentInfo(notification.data.id)

      await logService.recordActivity({
        action: 'webhook_processed',
        entity_type: 'mercadopago',
        entity_id: notification.data.id,
        details: {
          payment_status: paymentInfo.status,
          external_reference: paymentInfo.external_reference,
          amount: paymentInfo.transaction_amount
        }
      })

      return paymentInfo

    } catch (error) {
      console.error('Error procesando webhook:', error)
      
      await logService.recordActivity({
        action: 'error_webhook',
        entity_type: 'mercadopago',
        entity_id: notification.data.id,
        details: {
          error: error instanceof Error ? error.message : 'Error desconocido',
          webhook_type: notification.type,
          webhook_action: notification.action
        }
      })

      throw error
    }
  },

  /**
   * Validar firma de webhook (para seguridad)
   * TODO: Implementar cuando MP proporcione el secret key
   */
  validateWebhookSignature(body: string, signature: string): boolean {
    // Por ahora retornamos true, pero en producción deberíamos validar
    // la firma usando el secret key de MP
    console.log('Validación de firma de webhook (pendiente de implementar)')
    return true
  },

  /**
   * Mapear estado de MP a nuestro sistema local
   */
  mapMPStatusToLocal(mpStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'pending': 'pending',
      'approved': 'approved',
      'authorized': 'authorized',
      'in_process': 'in_process',
      'in_mediation': 'in_process',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'charged_back': 'refunded'
    }

    return statusMap[mpStatus] || 'pending'
  },

  /**
   * Obtener URL de comprobante según el método de pago
   */
  getComprobanteUrl(paymentInfo: MercadoPagoPaymentInfo): string | null {
    // Para métodos offline, usar ticket_url
    if (paymentInfo.ticket_url) {
      return paymentInfo.ticket_url
    }

    // Para otros métodos, no hay comprobante PDF
    return null
  },

  /**
   * Validar si un pago está finalizado
   */
  isPaymentFinal(status: string): boolean {
    const finalStatuses = ['approved', 'rejected', 'cancelled', 'refunded']
    return finalStatuses.includes(status)
  },

  /**
   * Obtener descripción amigable del estado
   */
  getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      'pending': 'Pendiente de pago',
      'approved': 'Pago aprobado',
      'authorized': 'Pago autorizado',
      'in_process': 'Pago en proceso',
      'rejected': 'Pago rechazado',
      'cancelled': 'Pago cancelado',
      'refunded': 'Pago reembolsado'
    }

    return descriptions[status] || 'Estado desconocido'
  },

  /**
   * Generar datos de prueba para testing (no hace llamadas reales a MP)
   */
  getTestPaymentInfo(paymentId: string): MercadoPagoPaymentInfo {
    console.log('🧪 Generando datos de prueba para:', paymentId)
    
    // Extraer ID de orden del payment ID de prueba
    const orderId = paymentId.replace('test-payment-', '')
    
    return {
      payment_id: paymentId,
      status: 'approved', // Estado de prueba por defecto
      status_detail: 'Pago de prueba simulado',
      payment_method_id: 'account_money', // ✅ CAMBIO: Usar account_money para que detecte como test
      payment_type_id: 'account_money',
      date_approved: new Date().toISOString(),
      date_created: new Date().toISOString(),
      payer_email: 'test@viveroweb.com', // ✅ CAMBIO: Email con "test" para que detecte como test
      transaction_amount: 0.50, // ✅ CAMBIO: Monto bajo para que detecte como test
      net_received_amount: 0.50,
      total_paid_amount: 0.50,
      ticket_url: undefined,
      authorization_code: 'TEST123',
      external_reference: orderId, // Usar ID de orden real
      merchant_order_id: orderId, // Usar ID de orden real
      is_development_mock: true, // ✅ NUEVO: Flag específico para simulaciones
      live_mode: false // ✅ NUEVO: Flag de Mercado Pago para test
    } as any
  }
}