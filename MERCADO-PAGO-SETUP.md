# 💳 **CONFIGURACIÓN DE MERCADO PAGO**

> Nota de alineación (Agosto 2025): En el proyecto actual las variables efectivas son `MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY` y `NEXT_PUBLIC_BASE_URL` (ver `src/lib/mercadopagoConfig.ts`). Mantén estas variables en `Fronted/.env.local`. La URL de webhook y back_urls se generan desde `NEXT_PUBLIC_BASE_URL` → `/api/mercadopago/webhook` y `/pago/*`.

## 🎯 **Objetivo**
Configurar e integrar Mercado Pago en el proyecto ViveroWeb para procesar pagos de forma segura y confiable.

---

## 📋 **REQUISITOS PREVIOS**

### **Cuenta de Mercado Pago:**

- [ ] Cuenta de desarrollador en Mercado Pago
- [ ] Credenciales de prueba (Test)
- [ ] Credenciales de producción (Live)
- [ ] Configuración de webhooks

### **Variables de Entorno:**

```env
# Mercado Pago - Desarrollo
MERCADO_PAGO_ACCESS_TOKEN_TEST=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY_TEST=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Mercado Pago - Producción
MERCADO_PAGO_ACCESS_TOKEN_PROD=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY_PROD=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configuración
MERCADO_PAGO_WEBHOOK_URL=https://tu-dominio.com/api/payments/webhook
MERCADO_PAGO_ENVIRONMENT=test # o 'prod'
```

---

## 🔧 **INSTALACIÓN Y CONFIGURACIÓN**

### **1. Instalar SDK de Mercado Pago**
```bash
npm install mercadopago
# o
yarn add mercadopago
```

### **2. Configurar variables de entorno**
Agregar las variables al archivo `.env.local`:
```env
# Mercado Pago Configuration
MERCADO_PAGO_ACCESS_TOKEN_TEST=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY_TEST=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_WEBHOOK_URL=https://localhost:3000/api/payments/webhook
MERCADO_PAGO_ENVIRONMENT=test
```

### **3. Crear servicio de Mercado Pago**
Archivo: `src/services/mercadoPagoService.ts`

```typescript
import mercadopago from 'mercadopago'

export class MercadoPagoService {
  private static initialize() {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST || 
                       process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD
    
    mercadopago.configure({
      access_token: accessToken!
    })
  }

  static async createPaymentPreference(orderData: OrderData): Promise<PaymentPreference> {
    this.initialize()
    
    const preference = {
      items: orderData.items.map(item => ({
        title: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        currency_id: 'ARS'
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/carrito/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/carrito/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/carrito/pending`
      },
      auto_return: 'approved',
      external_reference: orderData.orderId,
      notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL
    }

    const response = await mercadopago.preferences.create(preference)
    return response.body
  }

  static async processPaymentNotification(notification: PaymentNotification): Promise<void> {
    this.initialize()
    
    const payment = await mercadopago.payment.findById(notification.data.id)
    return payment.body
  }

  static async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    this.initialize()
    
    const payment = await mercadopago.payment.findById(paymentId)
    return payment.body
  }

  static async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    this.initialize()
    
    const refund = await mercadopago.refund.create({
      payment_id: paymentId,
      amount: amount
    })
    return refund.body
  }
}
```

---

## 🌐 **API ROUTES**

### **1. Crear preferencia de pago**
Archivo: `app/api/payments/create-preference/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoService } from '@/src/services/mercadoPagoService'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    const preference = await MercadoPagoService.createPaymentPreference(orderData)
    
    return NextResponse.json({
      success: true,
      preference_id: preference.id,
      init_point: preference.init_point
    })
  } catch (error) {
    console.error('Error creating payment preference:', error)
    return NextResponse.json({
      success: false,
      error: 'Error creating payment preference'
    }, { status: 500 })
  }
}
```

### **2. Webhook para notificaciones**
Archivo: `app/api/payments/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoService } from '@/src/services/mercadoPagoService'
import { orderService } from '@/src/services/orderService'

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()
    
    // Verificar firma del webhook (recomendado)
    // const signature = request.headers.get('x-signature')
    // if (!verifySignature(notification, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    // }
    
    const payment = await MercadoPagoService.processPaymentNotification(notification)
    
    // Actualizar estado del pedido
    await orderService.updateOrderPaymentStatus(
      payment.external_reference,
      payment.status,
      payment.id
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
```

### **3. Consultar estado de pago**
Archivo: `app/api/payments/status/[paymentId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoService } from '@/src/services/mercadoPagoService'

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const paymentStatus = await MercadoPagoService.getPaymentStatus(params.paymentId)
    
    return NextResponse.json({
      success: true,
      payment: paymentStatus
    })
  } catch (error) {
    console.error('Error getting payment status:', error)
    return NextResponse.json({
      success: false,
      error: 'Error getting payment status'
    }, { status: 500 })
  }
}
```

---

## 🔄 **FLUJO DE PAGO**

### **1. Usuario confirma pedido**
```typescript
// En app/carrito/revisar/page.tsx
const handleConfirmOrder = async () => {
  try {
    // 1. Crear pedido en base de datos
    const order = await createOrder(orderData)
    
    // 2. Crear preferencia de pago
    const response = await fetch('/api/payments/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        items: cartItems,
        total: totalAmount
      })
    })
    
    const { preference_id, init_point } = await response.json()
    
    // 3. Redirigir a Mercado Pago
    window.location.href = init_point
  } catch (error) {
    console.error('Error confirming order:', error)
  }
}
```

### **2. Usuario completa pago en Mercado Pago**
- Usuario es redirigido a Mercado Pago
- Completa el pago con método elegido
- Mercado Pago procesa el pago

### **3. Mercado Pago notifica via webhook**
```typescript
// Webhook recibe notificación automáticamente
// Actualiza estado del pedido en base de datos
// Envía email de confirmación al cliente
```

### **4. Usuario retorna a la aplicación**
```typescript
// En app/carrito/success/page.tsx
const SuccessPage = () => {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  
  useEffect(() => {
    if (paymentId && status === 'approved') {
      // Mostrar confirmación de pago exitoso
      // Limpiar carrito
      // Redirigir a página de confirmación
    }
  }, [paymentId, status])
  
  return (
    <div>
      <h1>¡Pago exitoso!</h1>
      <p>Tu pedido ha sido confirmado.</p>
    </div>
  )
}
```

---

## 🛡️ **SEGURIDAD**

### **1. Verificación de webhooks**
```typescript
import crypto from 'crypto'

function verifySignature(payload: any, signature: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
  const expectedSignature = crypto
    .createHmac('sha256', secret!)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

### **2. Validación de datos**
```typescript
function validatePaymentData(paymentData: any): boolean {
  // Validar que el monto coincida con el pedido
  // Validar que el external_reference sea válido
  // Validar que el estado sea válido
  return true
}
```

### **3. Rate limiting**
```typescript
import rateLimit from 'express-rate-limit'

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos por IP
  message: 'Too many payment attempts'
})
```

---

## 🧪 **TESTING**

### **1. Credenciales de prueba**
```typescript
// Tarjetas de prueba de Mercado Pago
const testCards = {
  approved: {
    number: '4509 9535 6623 3704',
    security_code: '123',
    expiration_month: '11',
    expiration_year: '25',
    cardholder: {
      name: 'APRO'
    }
  },
  pending: {
    number: '4509 9535 6623 3704',
    security_code: '123',
    expiration_month: '11',
    expiration_year: '25',
    cardholder: {
      name: 'CONT'
    }
  },
  rejected: {
    number: '4509 9535 6623 3704',
    security_code: '123',
    expiration_month: '11',
    expiration_year: '25',
    cardholder: {
      name: 'OTHE'
    }
  }
}
```

### **2. Tests unitarios**
```typescript
// tests/mercadoPagoService.test.ts
describe('MercadoPagoService', () => {
  test('should create payment preference', async () => {
    const orderData = {
      orderId: 'test-order-123',
      items: [
        { name: 'Test Product', price: 100, quantity: 1 }
      ]
    }
    
    const preference = await MercadoPagoService.createPaymentPreference(orderData)
    
    expect(preference).toHaveProperty('id')
    expect(preference).toHaveProperty('init_point')
  })
  
  test('should process payment notification', async () => {
    const notification = {
      type: 'payment',
      data: { id: 'test-payment-id' }
    }
    
    const payment = await MercadoPagoService.processPaymentNotification(notification)
    
    expect(payment).toHaveProperty('status')
    expect(payment).toHaveProperty('external_reference')
  })
})
```

---

## 📊 **MONITOREO Y LOGGING**

### **1. Logging de transacciones**
```typescript
import { logService } from '@/src/services/logService'

async function logPaymentEvent(event: string, data: any) {
  await logService.recordActivity({
    action: `payment_${event}`,
    entity_type: 'payment',
    entity_id: data.payment_id,
    details: {
      amount: data.transaction_amount,
      status: data.status,
      method: data.payment_method_type
    }
  })
}
```

### **2. Métricas de pagos**
```typescript
// Métricas a monitorear
const paymentMetrics = {
  totalTransactions: 0,
  successfulPayments: 0,
  failedPayments: 0,
  averageAmount: 0,
  conversionRate: 0
}
```

---

## 🚀 **PRODUCCIÓN**

### **1. Cambiar a credenciales de producción**
```env
MERCADO_PAGO_ENVIRONMENT=prod
MERCADO_PAGO_ACCESS_TOKEN_PROD=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY_PROD=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **2. Configurar webhook de producción**
- URL: `https://tu-dominio.com/api/payments/webhook`
- Eventos: `payment.created`, `payment.updated`

### **3. Configurar SSL**
- Certificado SSL válido
- HTTPS obligatorio para webhooks

### **4. Monitoreo en producción**
- Alertas para pagos fallidos
- Logs de todas las transacciones
- Métricas de conversión

---

## 📚 **RECURSOS ADICIONALES**

### **Documentación oficial:**
- [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
- [SDK de Node.js](https://github.com/mercadopago/sdk-nodejs)
- [API Reference](https://www.mercadopago.com.ar/developers/es/reference)

### **Herramientas de testing:**
- [Mercado Pago Test](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/integration-test/test-cards)
- [Webhook Tester](https://webhook.site/)

### **Soporte:**
- [Centro de Ayuda](https://www.mercadopago.com.ar/ayuda)
- [Foro de Desarrolladores](https://developers.mercadopago.com/forum)

---

**Documento creado:** `Fronted/MERCADO-PAGO-SETUP.md`  
**Fecha:** $(date)  
**Versión:** 1.0  
**Estado:** Pendiente de implementación 