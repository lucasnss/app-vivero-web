import { supabase } from '@/lib/supabaseClient'
import { logService } from './logService'
import { productService } from './productService'
import { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderRequest, 
  GetOrdersOptions,
  OrdersResponse
} from '@/types/order'
import { normalizeItems } from '@/lib/normalizers'

export const orderService = {
  async getAllOrders(options: GetOrdersOptions): Promise<OrdersResponse> {
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })

      // Aplicar filtro por status si se proporciona
      if (options.status) {
        query = query.eq('status', options.status)
      }

      // Aplicar filtro por email si se proporciona
      if (options.email) {
        query = query.eq('customer_email', options.email)
      }

      // Aplicar paginación
      const from = (options.page - 1) * options.limit
      const to = from + options.limit - 1
      
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error fetching orders:', error)
        throw new Error('Error al obtener pedidos')
      }

      const total = count || 0
      const totalPages = Math.ceil(total / options.limit)

      return {
        orders: data.map(order => ({
          id: order.id,
          status: order.status,
          total_amount: order.total_amount,
          shipping_address: order.shipping_address,
          payment_method: order.payment_method,
          // Campos de Mercado Pago
          payment_id: order.payment_id,
          comprobante_url: order.comprobante_url,
          metodo_pago: order.metodo_pago,
          email_comprador: order.email_comprador,
          fecha_pago: order.fecha_pago,
          payment_status: order.payment_status,
          preference_id: order.preference_id,
          payment_type: order.payment_type,
          merchant_order_id: order.merchant_order_id,
          external_reference: order.external_reference,
          notes: order.notes,
          created_by_admin: order.created_by_admin,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: order.items || [],
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          // Campos del nuevo sistema de estados
          fulfillment_status: order.fulfillment_status,
          shipping_method: order.shipping_method,
          // Crear customer_info para compatibilidad con la interfaz
          customer_info: {
            name: order.customer_name || 'Sin nombre',
            email: order.customer_email || 'Sin email',
            phone: order.customer_phone || 'Sin teléfono'
          }
        })),
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          totalPages,
          hasNext: options.page < totalPages,
          hasPrev: options.page > 1
        }
      }

    } catch (error) {
      console.error('Error in getAllOrders:', error)
      throw error
    }
  },

  async createGuestOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      // Normalizar items para evitar NaN y soportar price | unit_price
      const { items: normalizedItems, total_amount } = normalizeItems((orderData as any).items || [])

      // ✅ VALIDACIÓN de datos antes de insertar
      const customerEmail = orderData.customer_email || null
      const customerName = orderData.customer_name || null
      const customerPhone = orderData.customer_phone || null

      // ✅ LOG de verificación
      console.log('📝 Creando orden con datos del cliente:', {
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        has_shipping_address: !!orderData.shipping_address
      })

      // Construir datos de inserción evitando campos inexistentes en la tabla
      const insertData: any = {
        status: 'pending',
        total_amount,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        notes: orderData.notes,
        payment_source: (orderData as any).payment_source || 'real',
        
        // ✅ CAMPOS DIRECTOS con validación (SOLUCIÓN AL PROBLEMA 2)
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        
        // ✅ CRÍTICO: Agregar external_reference desde el inicio para idempotencia
        ...(orderData.external_reference && { external_reference: orderData.external_reference }),
        
        // Guardar TODA la información del cliente en JSONB para tener historial completo
        customer_info: {
          // Datos personales
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          // Datos de dirección (iguales a shipping_address para redundancia)
          address: orderData.shipping_address,
          // Información de entrega
          shipping_method: (orderData as any).shipping_method || 'pickup',
          // Timestamp de cuándo se capturaron los datos
          captured_at: new Date().toISOString()
        }
      }

      // Nota: No agregamos created_by_admin porque la columna no existe en la tabla 'orders' del esquema actual

      // Crear el pedido
      const { data: order, error } = await supabase
        .from('orders')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating order:', error)
        // Propagar error original de Supabase para mostrar detalle (código/constraint)
        throw error
      }

      // ✅ LOG de confirmación
      console.log('✅ Orden creada exitosamente:', {
        order_id: order.id,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone
      })

      // Crear los items del pedido
      const orderItems = normalizedItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.line_total
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        // Intentar eliminar el pedido si falló la creación de items
        await supabase.from('orders').delete().eq('id', order.id)
        // Propagar error original para detalle
        throw itemsError
      }

      // Registrar actividad
      await logService.recordActivity({
        action: 'order_created',
        entity_type: 'order',
        entity_id: order.id,
        details: {
          total_amount,
          items_count: orderData.items.length,
          created_by_admin: orderData.created_by_admin
        }
      })

      return {
        ...order,
        items: orderItems
      }

    } catch (error) {
      console.error('Error in createGuestOrder:', error)
      throw error
    }
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            products (
              name,
              image,
              category_id
            )
          )
        `)
        .eq('id', orderId)
        .single()

      if (error || !order) {
        return null
      }

      return {
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        // Campos de Mercado Pago
        payment_id: order.payment_id,
        comprobante_url: order.comprobante_url,
        metodo_pago: order.metodo_pago,
        email_comprador: order.email_comprador,
        fecha_pago: order.fecha_pago,
        payment_status: order.payment_status,
        preference_id: order.preference_id,
        payment_type: order.payment_type,
        merchant_order_id: order.merchant_order_id,
        external_reference: order.external_reference,
        notes: order.notes,
        created_by_admin: order.created_by_admin,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: order.items?.map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          product_name: item.products?.name || 'Producto',
          quantity: item.quantity,
          price: item.unit_price,
          subtotal: item.subtotal,
          image: item.products?.image || ''
        })) || [],
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        // Campos requeridos por el tipo Order
        shipping_method: order.shipping_method || 'pickup',
        fulfillment_status: order.fulfillment_status || 'awaiting_shipment'
      }

    } catch (error) {
      console.error('Error in getOrderById:', error)
      throw error
    }
  },

  /**
   * Obtener detalle completo de una orden para mostrar en el modal
   */
  async getOrderDetailForModal(orderId: string): Promise<any | null> {
    try {
      console.log('🔍 [getOrderDetailForModal] Obteniendo detalle para orden:', orderId)
      
      const order = await this.getOrderById(orderId)
      
      console.log('📦 [getOrderDetailForModal] Orden obtenida:', {
        id: order?.id,
        customer_name: order?.customer_name,
        customer_email: order?.customer_email,
        items_count: order?.items?.length,
        has_shipping_address: !!order?.shipping_address
      })
      
      if (!order) {
        console.error('❌ [getOrderDetailForModal] Orden no encontrada')
        return null
      }

      // Transformar al formato que espera OrderDetailModal
      console.log('🔧 [getOrderDetailForModal] Items brutos antes de transformar:', JSON.stringify(order.items, null, 2))
      
      const transformedItems = order.items?.map((item: any) => {
        const transformed = {
          id: item.id,
          name: item.product_name || 'Producto sin nombre',
          quantity: item.quantity,
          price: item.price,
          image: item.image || '/placeholder.jpg'
        }
        console.log('🔄 [getOrderDetailForModal] Item transformado:', transformed)
        return transformed
      }) || []
      
      const orderDetail = {
        id: order.id,
        customer_name: order.customer_name || 'Sin nombre',
        customer_email: order.customer_email || 'Sin email',
        customer_phone: order.customer_phone || 'Sin teléfono',
        shipping_address: order.shipping_address,
        payment_status: order.payment_status || 'pending',
        fulfillment_status: order.fulfillment_status || 'none',
        shipping_method: order.shipping_method || 'pickup',
        total_amount: order.total_amount,
        created_at: order.created_at,
        payment_id: order.payment_id,
        payment_method: order.metodo_pago || order.payment_method || 'Mercado Pago',
        items: transformedItems
      }
      
      console.log('✅ [getOrderDetailForModal] Detalle de orden transformado:', {
        id: orderDetail.id,
        customer: orderDetail.customer_name,
        items_count: orderDetail.items.length,
        items: orderDetail.items
      })
      
      return orderDetail

    } catch (error) {
      console.error('❌ [getOrderDetailForModal] Error:', error)
      throw error
    }
  },

  async updateOrderStatus(orderId: string, data: UpdateOrderRequest): Promise<Order | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update({
          status: data.status,
          notes: data.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error || !order) {
        return null
      }

      // Registrar actividad
      await logService.recordActivity({
        action: 'order_updated',
        entity_type: 'order',
        entity_id: orderId,
        details: {
          new_status: data.status,
          notes: data.notes
        }
      })

      return {
        ...order,
        items: [] // Los items no se modifican en esta operación
      }

    } catch (error) {
      console.error('Error in updateOrderStatus:', error)
      throw error
    }
  },

  // ==========================================
  // MÉTODOS PARA INTEGRACIÓN MERCADO PAGO
  // ==========================================

  /**
   * Crear orden con información para Mercado Pago
   */
  async createOrderWithPayment(orderData: CreateOrderRequest): Promise<Order> {
    try {
      // Crear la orden normal pero con payment_method = 'mercadopago'
      const orderWithMP = {
        ...orderData,
        payment_method: 'mercadopago' as const
      }

      const order = await this.createGuestOrder(orderWithMP)

      // Registrar actividad específica para MP
      await logService.recordActivity({
        action: 'create_order_mp',
        entity_type: 'order',
        entity_id: order.id,
        details: {
          total_amount: order.total_amount,
          items_count: order.items.length,
          customer_email: order.customer_email,
          payment_method: 'mercadopago'
        }
      })

      return order

    } catch (error) {
      console.error('Error creating order with MP:', error)
      throw error
    }
  },

  /**
   * Actualizar información de pago de Mercado Pago
   */
  async updatePaymentInfo(orderId: string, paymentData: {
    payment_id?: string
    payment_status?: string
    metodo_pago?: string
    email_comprador?: string
    fecha_pago?: string
    comprobante_url?: string
    preference_id?: string
    payment_type?: string
    merchant_order_id?: string
    external_reference?: string
  }): Promise<Order> {
    try {
      // Construir objeto de actualización solo con campos que tienen valor
      const updateData: any = {}
      
      if (paymentData.payment_id) updateData.payment_id = paymentData.payment_id
      if (paymentData.payment_status) updateData.payment_status = paymentData.payment_status
      if (paymentData.metodo_pago) updateData.metodo_pago = paymentData.metodo_pago
      if (paymentData.email_comprador) updateData.email_comprador = paymentData.email_comprador
      if (paymentData.fecha_pago) updateData.fecha_pago = paymentData.fecha_pago
      if (paymentData.comprobante_url) updateData.comprobante_url = paymentData.comprobante_url
      if (paymentData.preference_id) updateData.preference_id = paymentData.preference_id
      if (paymentData.payment_type) updateData.payment_type = paymentData.payment_type
      if (paymentData.merchant_order_id) updateData.merchant_order_id = paymentData.merchant_order_id
      if (paymentData.external_reference) updateData.external_reference = paymentData.external_reference

      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select('*')
        .single()

      if (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ [ORDER_SERVICE] Error updating payment info')
        console.error('   Order ID:', orderId)
        console.error('   Payment Data:', JSON.stringify(paymentData, null, 2))
        console.error('   Update Data:', JSON.stringify(updateData, null, 2))
        console.error('   Supabase Error:', JSON.stringify(error, null, 2))
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        throw new Error(`Error al actualizar información de pago: ${error.message || error.code || 'Unknown'}`)
      }

      // Registrar actividad
      await logService.recordActivity({
        action: 'update_payment_info',
        entity_type: 'order',
        entity_id: orderId,
        details: {
          payment_id: paymentData.payment_id,
          payment_status: paymentData.payment_status,
          metodo_pago: paymentData.metodo_pago,
          updated_fields: Object.keys(updateData)
        }
      })

      // Obtener orden completa con items
      const fullOrder = await this.getOrderById(orderId)
      if (!fullOrder) {
        throw new Error('Orden no encontrada después de la actualización')
      }
      return fullOrder

    } catch (error) {
      console.error('Error updating payment info:', error)
      throw error
    }
  },

  /**
   * Obtener orden por payment_id de Mercado Pago
   */
  async getOrderByPaymentId(paymentId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_id', paymentId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No encontrado
          return null
        }
        console.error('Error getting order by payment_id:', error)
        throw new Error('Error al buscar orden por payment_id')
      }

      // Obtener items de la orden
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products (
            name,
            image,
            category_id
          )
        `)
        .eq('order_id', data.id)

      if (itemsError) {
        console.error('Error getting order items:', itemsError)
        throw new Error('Error al obtener items de la orden')
      }

      return {
        ...data,
        items: orderItems.map(item => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          product_name: item.products?.name || 'Producto',
          quantity: item.quantity,
          price: item.unit_price,
          subtotal: item.subtotal,
          image: item.products?.image || ''
        }))
      }

    } catch (error) {
      console.error('Error in getOrderByPaymentId:', error)
      throw error
    }
  },

  /**
   * ✅ FASE 1: Validar disponibilidad de stock para los items de una orden
   * Valida que haya stock suficiente ANTES de aprobar el pago
   */
  async validateStockAvailability(items: Array<{product_id: string, quantity: number, product_name?: string}>): Promise<{
    valid: boolean
    message?: string
    insufficientItems?: Array<{product_id: string, product_name: string, requested: number, available: number}>
  }> {
    try {
      const insufficientItems: Array<{product_id: string, product_name: string, requested: number, available: number}> = []
      
      console.log('🔍 Validando stock para', items.length, 'productos...')
      
      for (const item of items) {
        const product = await productService.getProductById(item.product_id)
        
        if (!product) {
          console.error('❌ Producto no encontrado:', item.product_id)
          return {
            valid: false,
            message: `Producto con ID ${item.product_id} no encontrado`
          }
        }
        
        console.log(`  - ${product.name}: ${product.stock} disponible, ${item.quantity} solicitado`)
        
        if (product.stock < item.quantity) {
          insufficientItems.push({
            product_id: item.product_id,
            product_name: product.name,
            requested: item.quantity,
            available: product.stock
          })
        }
      }
      
      if (insufficientItems.length > 0) {
        const details = insufficientItems
          .map(i => `${i.product_name}: solicitado ${i.requested}, disponible ${i.available}`)
          .join(', ')
        
        console.error('❌ Stock insuficiente:', details)
        
        return {
          valid: false,
          message: `Stock insuficiente para: ${details}`,
          insufficientItems
        }
      }
      
      console.log('✅ Validación de stock exitosa')
      return { valid: true }
      
    } catch (error) {
      console.error('❌ Error validando stock:', error)
      return {
        valid: false,
        message: 'Error al validar disponibilidad de stock'
      }
    }
  },

  /**
   * ✅ FASE 1: Marcar orden como pagada y REDUCIR STOCK
   * Ahora incluye validación de stock y reducción automática
   */
  async markOrderAsPaid(orderId: string, paymentInfo: {
    payment_id: string
    metodo_pago: string
    fecha_pago: string
    comprobante_url?: string
    fulfillment_status?: string
  }): Promise<Order> {
    try {
      console.log('💰 Marcando orden como pagada:', orderId)
      
      // ✅ PASO 1: Obtener la orden completa con sus items
      const order = await this.getOrderById(orderId)
      if (!order) {
        throw new Error('Orden no encontrada')
      }
      
      console.log('📦 Orden encontrada con', order.items?.length || 0, 'items')
      
      // ✅ PASO 2: VALIDAR STOCK ANTES DE APROBAR (FASE 1)
      console.log('🔍 Validando disponibilidad de stock...')
      const stockValidation = await this.validateStockAvailability(order.items || [])
      
      if (!stockValidation.valid) {
        const errorMsg = `Stock insuficiente: ${stockValidation.message}`
        console.error('❌', errorMsg)
        
        // Log de error para debugging
        await logService.recordActivity({
          action: 'order_payment_rejected_insufficient_stock',
          entity_type: 'order',
          entity_id: orderId,
          details: {
            payment_id: paymentInfo.payment_id,
            validation_result: stockValidation,
            error: errorMsg
          }
        })
        
        throw new Error(errorMsg)
      }
      
      console.log('✅ Stock validado correctamente')
      
      // ✅ PASO 3: Actualizar payment_status en la BD
      const updateData: any = {
        payment_status: 'approved',
        status: 'confirmed',
        payment_id: paymentInfo.payment_id,
        metodo_pago: paymentInfo.metodo_pago,
        fecha_pago: paymentInfo.fecha_pago,
        comprobante_url: paymentInfo.comprobante_url,
        updated_at: new Date().toISOString()
      }

      if (paymentInfo.fulfillment_status) {
        updateData.fulfillment_status = paymentInfo.fulfillment_status
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select('*')
        .single()

      if (error) {
        console.error('❌ Error actualizando orden:', error)
        throw new Error('Error al marcar orden como pagada')
      }

      console.log('✅ Orden actualizada en BD')

      // ✅ PASO 4: REDUCIR STOCK DE PRODUCTOS (FASE 1)
      console.log('📉 Reduciendo stock de productos...')
      const stockReductionErrors: Array<any> = []
      
      try {
        for (const item of order.items || []) {
          console.log(`  - Reduciendo ${item.quantity} unidades de ${item.product_name || item.product_id}`)
          
          const success = await productService.updateStock(item.product_id, item.quantity)
          
          if (!success) {
            stockReductionErrors.push({
              product_id: item.product_id,
              product_name: item.product_name || 'Producto',
              quantity: item.quantity
            })
          }
        }
        
        if (stockReductionErrors.length > 0) {
          console.error('⚠️ Algunos productos no pudieron actualizar stock:', stockReductionErrors)
          
          // Log para debugging (NO fallar la orden, solo registrar)
          await logService.recordActivity({
            action: 'stock_reduction_partial_failure',
            entity_type: 'order',
            entity_id: orderId,
            details: {
              failed_products: stockReductionErrors,
              payment_id: paymentInfo.payment_id
            }
          })
        } else {
          console.log('✅ Stock reducido exitosamente para todos los productos')
        }
      } catch (stockError) {
        console.error('❌ Error reduciendo stock:', stockError)
        
        // Log del error pero NO fallar la orden (ya fue pagada)
        await logService.recordActivity({
          action: 'stock_reduction_error',
          entity_type: 'order',
          entity_id: orderId,
          details: {
            error: stockError instanceof Error ? stockError.message : 'Error desconocido',
            payment_id: paymentInfo.payment_id,
            // TODO FASE 2: Implementar rollback manual si es crítico
          }
        })
      }

      // Registrar actividad de pago aprobado
      await logService.recordActivity({
        action: 'order_paid',
        entity_type: 'order',
        entity_id: orderId,
        details: {
          payment_id: paymentInfo.payment_id,
          metodo_pago: paymentInfo.metodo_pago,
          fecha_pago: paymentInfo.fecha_pago,
          previous_status: 'pending',
          new_status: 'confirmed',
          stock_reduced: stockReductionErrors.length === 0
        }
      })

      // Obtener orden completa actualizada
      const fullOrder = await this.getOrderById(orderId)
      if (!fullOrder) {
        throw new Error('Orden no encontrada después de marcar como pagada')
      }
      
      console.log('✅ Orden marcada como pagada exitosamente')
      return fullOrder

    } catch (error) {
      console.error('❌ Error in markOrderAsPaid:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas de pagos para el dashboard admin
   */
  async getPaymentStats(): Promise<{
    total_orders: number
    paid_orders: number
    pending_orders: number
    rejected_orders: number
    total_revenue: number
    payment_methods: Array<{method: string, count: number}>
  }> {
    try {
      // Consulta para estadísticas básicas
      const { data: stats, error: statsError } = await supabase
        .from('orders')
        .select('payment_status, total_amount, metodo_pago')

      if (statsError) {
        console.error('Error getting payment stats:', statsError)
        throw new Error('Error al obtener estadísticas de pagos')
      }

      const totalOrders = stats.length
      const paidOrders = stats.filter(o => o.payment_status === 'approved').length
      const pendingOrders = stats.filter(o => o.payment_status === 'pending').length
      const rejectedOrders = stats.filter(o => o.payment_status === 'rejected').length
      
      const totalRevenue = stats
        .filter(o => o.payment_status === 'approved')
        .reduce((sum, o) => sum + Number(o.total_amount), 0)

      // Agrupar por método de pago
      const methodCounts: Record<string, number> = {}
      stats.forEach(order => {
        if (order.metodo_pago) {
          methodCounts[order.metodo_pago] = (methodCounts[order.metodo_pago] || 0) + 1
        }
      })

      const paymentMethods = Object.entries(methodCounts).map(([method, count]) => ({
        method,
        count
      }))

      return {
        total_orders: totalOrders,
        paid_orders: paidOrders,
        pending_orders: pendingOrders,
        rejected_orders: rejectedOrders,
        total_revenue: totalRevenue,
        payment_methods: paymentMethods
      }

    } catch (error) {
      console.error('Error in getPaymentStats:', error)
      throw error
    }
  },

  /**
   * Eliminar pedido (solo para admins)
   */
  async deleteOrder(orderId: string): Promise<Order | null> {
    try {
      // Verificar que el pedido existe
      const existingOrder = await this.getOrderById(orderId)
      if (!existingOrder) {
        console.log('❌ Pedido no encontrado para eliminar:', orderId)
        return null
      }

      // Eliminar items del pedido primero (si existe la tabla order_items)
      try {
        await supabase
          .from('order_items')
          .delete()
          .eq('order_id', orderId)
      } catch (error) {
        console.log('⚠️ No se pudieron eliminar items del pedido (puede que no exista la tabla):', error)
      }

      // Eliminar el pedido
      const { data, error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
        .select('*')
        .single()

      if (error) {
        console.error('Error eliminando pedido:', error)
        throw new Error('Error al eliminar pedido')
      }

      // Registrar actividad de eliminación
      await logService.recordActivity({
        action: 'order_deleted',
        entity_type: 'order',
        entity_id: orderId,
        details: {
          order_id: orderId,
          customer_email: existingOrder.customer_email,
          total_amount: existingOrder.total_amount,
          status: existingOrder.status
        }
      })

      console.log('✅ Pedido eliminado exitosamente:', orderId)
      return data

    } catch (error) {
      console.error('Error in deleteOrder:', error)
      throw error
    }
  },

  /**
   * Actualizar estado logístico de una orden
   */
  async updateFulfillmentStatus(orderId: string, updateData: {
    fulfillment_status: string
    admin_notes?: string
    tracking_info?: any
    updated_at: string
  }): Promise<Order | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select('*')
        .single()

      if (error) {
        console.error('Error updating fulfillment status:', error)
        throw new Error('Error al actualizar estado logístico')
      }

      // Obtener orden completa
      const fullOrder = await this.getOrderById(orderId)
      return fullOrder

    } catch (error) {
      console.error('Error in updateFulfillmentStatus:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas de fulfillment para el dashboard admin
   */
  async getFulfillmentStats(): Promise<{
    total_orders: number
    awaiting_shipment: number
    awaiting_pickup: number
    shipped: number
    delivered: number
    pickup_completed: number
    cancelled_by_admin: number
  }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('fulfillment_status, payment_status')

      if (error) {
        console.error('Error getting fulfillment stats:', error)
        throw new Error('Error al obtener estadísticas de fulfillment')
      }

      // Solo contar órdenes con pago aprobado
      const approvedOrders = orders.filter(o => o.payment_status === 'approved')
      
      const stats = {
        total_orders: approvedOrders.length,
        awaiting_shipment: approvedOrders.filter(o => o.fulfillment_status === 'awaiting_shipment').length,
        awaiting_pickup: approvedOrders.filter(o => o.fulfillment_status === 'awaiting_pickup').length,
        shipped: approvedOrders.filter(o => o.fulfillment_status === 'shipped').length,
        delivered: approvedOrders.filter(o => o.fulfillment_status === 'delivered').length,
        pickup_completed: approvedOrders.filter(o => o.fulfillment_status === 'pickup_completed').length,
        cancelled_by_admin: approvedOrders.filter(o => o.fulfillment_status === 'cancelled_by_admin').length
      }

      return stats

    } catch (error) {
      console.error('Error in getFulfillmentStats:', error)
      throw error
    }
  }
} 