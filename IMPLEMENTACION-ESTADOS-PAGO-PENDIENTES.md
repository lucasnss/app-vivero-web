# 🟡 IMPLEMENTACIÓN: Manejo de Estados Pendientes/Rechazados

## Problema

Actualmente, solo procesas pagos `approved`:
```typescript
if (paymentInfo.status === 'approved') {
  await orderService.markOrderAsPaid(...)
}
// pending, rejected, cancelled → NADA PASA
```

**Riesgo:** Cliente paga con dinero en cuenta (pending 3 días) → nunca recibe confirmación.

---

## ✅ SOLUCIÓN: 3 Métodos Nuevos en orderService

Estos pasos crearían 3 métodos en `orderService.ts`:

### 1. `markOrderAsPending()`
Para pagos que están en validación (dinero en cuenta, transferencias).

```typescript
async markOrderAsPending(orderId: string, paymentInfo: {
  payment_id: string
  metodo_pago: string
  merchant_order_id: string
}): Promise<Order> {
  // Actualizar BD:
  // payment_status = 'pending'
  // status = 'awaiting_confirmation'
  
  // Enviar email al cliente:
  // "Tu pago está siendo validado. Puede tardar 24-48 horas."
  
  // Registrar en activity_logs
}
```

### 2. `markOrderAsRejected()`
Para pagos rechazados por falta de fondos, tarjeta bloqueada, etc.

```typescript
async markOrderAsRejected(orderId: string, paymentInfo: {
  payment_id: string
  metodo_pago: string
  rejection_reason: string // "insufficient_funds", "card_declined", etc
}): Promise<Order> {
  // Actualizar BD:
  // payment_status = 'rejected'
  // status = 'payment_failed'
  
  // NO descontar stock (nunca se aprobó)
  
  // Enviar email al cliente:
  // "Tu pago fue rechazado. Motivo: {rejection_reason}"
  // "Intenta de nuevo con otro método"
  
  // Registrar en activity_logs
}
```

### 3. `markOrderAsCancelled()`
Para pagos cancelados por el cliente o expirados.

```typescript
async markOrderAsCancelled(orderId: string, reason: string): Promise<Order> {
  // Actualizar BD:
  // payment_status = 'cancelled'
  // status = 'cancelled'
  
  // Restituir stock si fue descontado previamente
  
  // Enviar email al cliente:
  // "Tu pedido fue cancelado."
  
  // Registrar en activity_logs
}
```

---

## 📝 PASOS PARA IMPLEMENTAR

### PASO 1: Crear método `markOrderAsPending()`

Ubicación: `src/services/orderService.ts` (agregar después de `markOrderAsPaid`)

```typescript
async markOrderAsPending(orderId: string, paymentInfo: {
  payment_id: string
  metodo_pago: string
  merchant_order_id: string
}): Promise<Order> {
  try {
    console.log('⏳ Marcando orden como pendiente:', orderId)
    
    const updateData: any = {
      payment_status: 'pending',
      status: 'awaiting_confirmation',
      payment_id: paymentInfo.payment_id,
      metodo_pago: paymentInfo.metodo_pago,
      merchant_order_id: paymentInfo.merchant_order_id,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Error marcando orden como pendiente:', error)
      throw new Error('Error al marcar orden como pendiente')
    }

    console.log('⏳ Orden marcada como pendiente')

    // Registrar actividad
    await logService.recordActivity({
      action: 'order_payment_pending',
      entity_type: 'order',
      entity_id: orderId,
      details: {
        payment_id: paymentInfo.payment_id,
        metodo_pago: paymentInfo.metodo_pago,
        message: 'Esperando confirmación de pago'
      }
    })

    // Obtener orden completa
    const fullOrder = await this.getOrderById(orderId)
    if (!fullOrder) {
      throw new Error('Orden no encontrada después de marcar como pendiente')
    }
    return fullOrder

  } catch (error) {
    console.error('❌ Error in markOrderAsPending:', error)
    throw error
  }
}
```

### PASO 2: Crear método `markOrderAsRejected()`

```typescript
async markOrderAsRejected(orderId: string, paymentInfo: {
  payment_id: string
  metodo_pago: string
  rejection_reason?: string
}): Promise<Order> {
  try {
    console.log('❌ Marcando orden como rechazada:', orderId)
    
    const updateData: any = {
      payment_status: 'rejected',
      status: 'payment_failed',
      payment_id: paymentInfo.payment_id,
      metodo_pago: paymentInfo.metodo_pago,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Error marcando orden como rechazada:', error)
      throw new Error('Error al marcar orden como rechazada')
    }

    console.log('❌ Orden marcada como rechazada')

    // Registrar actividad
    await logService.recordActivity({
      action: 'order_payment_rejected',
      entity_type: 'order',
      entity_id: orderId,
      details: {
        payment_id: paymentInfo.payment_id,
        metodo_pago: paymentInfo.metodo_pago,
        reason: paymentInfo.rejection_reason || 'unknown',
        note: 'Pago rechazado - stock NO fue descontado'
      }
    })

    // Obtener orden completa
    const fullOrder = await this.getOrderById(orderId)
    if (!fullOrder) {
      throw new Error('Orden no encontrada después de marcar como rechazada')
    }
    return fullOrder

  } catch (error) {
    console.error('❌ Error in markOrderAsRejected:', error)
    throw error
  }
}
```

### PASO 3: Crear método `markOrderAsCancelled()`

```typescript
async markOrderAsCancelled(orderId: string, reason: string = 'customer_cancelled'): Promise<Order> {
  try {
    console.log('🛑 Cancelando orden:', orderId)
    
    // Obtener orden para verificar si fue pagada
    const order = await this.getOrderById(orderId)
    if (!order) {
      throw new Error('Orden no encontrada')
    }

    const updateData: any = {
      payment_status: order.payment_status, // Mantener estado de pago previo
      status: 'cancelled',
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Error cancelando orden:', error)
      throw new Error('Error al cancelar orden')
    }

    console.log('🛑 Orden cancelada')

    // Si ya había sido pagada, restituir stock
    if (order.payment_status === 'approved') {
      console.log('📦 Restituyendo stock (pago fue aprobado)...')
      
      for (const item of order.items || []) {
        const success = await productService.increaseStock(item.product_id, item.quantity)
        if (!success) {
          console.error('⚠️ Error restituyendo stock:', item.product_id)
        }
      }
      
      console.log('✅ Stock restituido')
    }

    // Registrar actividad
    await logService.recordActivity({
      action: 'order_cancelled',
      entity_type: 'order',
      entity_id: orderId,
      details: {
        reason,
        previous_payment_status: order.payment_status,
        stock_restored: order.payment_status === 'approved'
      }
    })

    // Obtener orden completa
    const fullOrder = await this.getOrderById(orderId)
    if (!fullOrder) {
      throw new Error('Orden no encontrada después de cancelar')
    }
    return fullOrder

  } catch (error) {
    console.error('❌ Error in markOrderAsCancelled:', error)
    throw error
  }
}
```

### PASO 4: Crear método `increaseStock()` en productService

Ubicación: `src/services/productService.ts`

```typescript
async increaseStock(id: string, quantity: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', id)
      .single()

    if (error || !data) {
      return false
    }

    const newStock = data.stock + quantity
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error increasing stock:', updateError)
      return false
    }
    
    // Log de actividad
    await logService.recordActivity({
      action: 'product_updated',
      entity_type: 'product',
      entity_id: id,
      details: { stockChange: +quantity, newStock }
    })
    
    return true
  } catch (error) {
    console.error('Error in increaseStock:', error)
    return false
  }
}
```

---

## 📝 PASO 5: Actualizar webhook para usar los nuevos métodos

Ubicación: `app/api/mercadopago/webhook/route.ts` (línea ~390)

**CAMBIAR ESTO:**
```typescript
// Si el pago fue aprobado, marcar orden como pagada y establecer fulfillment_status
if (paymentInfo.status === 'approved') {
  console.log('✅ Pago aprobado, marcando orden como pagada')
  // ... resto del código
}
```

**POR ESTO:**
```typescript
// Actualizar estado según resultado del pago
console.log('📊 Procesando estado de pago:', paymentInfo.status)

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
} else if (paymentInfo.status === 'pending') {
  console.log('⏳ Pago pendiente (validación en progreso)')
  
  await orderService.markOrderAsPending(order?.id || '', {
    payment_id: paymentInfo.payment_id,
    metodo_pago: paymentInfo.payment_method_id,
    merchant_order_id: paymentInfo.merchant_order_id
  })
} else if (paymentInfo.status === 'rejected') {
  console.log('❌ Pago rechazado')
  
  await orderService.markOrderAsRejected(order?.id || '', {
    payment_id: paymentInfo.payment_id,
    metodo_pago: paymentInfo.payment_method_id,
    rejection_reason: paymentInfo.status_detail || 'rejected_by_bank'
  })
} else if (paymentInfo.status === 'cancelled') {
  console.log('🛑 Pago cancelado')
  
  await orderService.markOrderAsCancelled(order?.id || '', 'payer_cancelled')
}

console.log('✅ Estado de pago procesado:', paymentInfo.status)
```

---

## 🧪 PRUEBAS

### Prueba 1: Pago Pending (Dinero en Cuenta)

1. Ir a checkout
2. Elegir "Dinero en Cuenta" como método
3. Completar pago
4. **Resultado esperado:**
   - Orden creada con `payment_status = 'pending'`
   - Logs muestran "Pago pendiente"
   - **NO se descuenta stock** (aún)

### Prueba 2: Pago Rechazado

1. Ir a checkout
2. Usar tarjeta sin fondos (proporciona MP)
3. Intenta pagar
4. **Resultado esperado:**
   - Orden creada con `payment_status = 'rejected'`
   - Logs muestran "Pago rechazado"
   - Stock permanece igual

### Prueba 3: Orden Cancelada

1. Crea una orden aprobada (dinero ya cobrado)
2. En admin, agregar botón "Cancelar orden"
3. Click en cancelar
4. **Resultado esperado:**
   - `status = 'cancelled'`
   - Stock restituid automáticamente
   - Logs muestran "Stock restituido"

---

## ⏱️ TIEMPO ESTIMADO

- [ ] Crear 3 métodos en orderService: **30 min**
- [ ] Crear método increaseStock en productService: **10 min**
- [ ] Actualizar webhook: **20 min**
- [ ] Pruebas: **30 min**

**Total: ~1.5 horas**

---

## 📋 CHECKLIST IMPLEMENTACIÓN

- [ ] Métodos creados en orderService
- [ ] increaseStock() creado en productService
- [ ] Webhook actualizado con lógica de estados
- [ ] Build exitoso (`npm run build`)
- [ ] Pruebas de pending completadas
- [ ] Pruebas de rejected completadas
- [ ] Pruebas de cancelled completadas
- [ ] CHANGELOG.md actualizado
- [ ] tasks.md marcado como completado

