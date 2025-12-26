2025-12-23 02:08:14.614 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.614 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 02:08:14.614 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.614 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 02:08:14.614 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36678944360&topic=merchant_order
2025-12-23 02:08:14.614 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 02:08:14.614 [info] - x-signature: ts=1766455694,v1=5c80908c297a81fec85641e32f78210f42fa1de8a712d6d73a55f663f43082f5
2025-12-23 02:08:14.614 [info] - x-request-id: b01f0262-589b-4feb-aff1-ac74c690b4d0
2025-12-23 02:08:14.614 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-23 02:08:14.614 [info] - content-type: application/json
2025-12-23 02:08:14.614 [info] 📋 [DEBUG] Query params: { id: '36678944360', topic: 'merchant_order' }
2025-12-23 02:08:14.615 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-23 02:08:14.615 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 02:08:14.615 [info] 🔍 Tipo de notificación: merchant_order, ID: 36678944360, Formato: merchant_order
2025-12-23 02:08:14.615 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 02:08:14.615 [info] - Raw (segundos): 1766455694
2025-12-23 02:08:14.615 [info] - Convertido (ms): 1766455694000
2025-12-23 02:08:14.615 [info] - Fecha: 2025-12-23T02:08:14.000Z
2025-12-23 02:08:14.615 [info] - Diferencia: 614 ms
2025-12-23 02:08:14.615 [info] 📋 Manifest construido (merchant_order - Formato: merchant_order): id:36678944360;request-id:b01f0262-589b-4feb-aff1-ac74c690b4d0;ts:1766455694;
2025-12-23 02:08:14.615 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 02:08:14.615 [error] Tipo: merchant_order
2025-12-23 02:08:14.615 [error] Formato: merchant_order
2025-12-23 02:08:14.615 [error] Manifest usado: id:36678944360;request-id:b01f0262-589b-4feb-aff1-ac74c690b4d0;ts:1766455694;
2025-12-23 02:08:14.615 [error] Hash esperado: 3efa320af8c52cc5cbf453e68e6783bbd4eba29dace4a5b98cc8c55e5016c966
2025-12-23 02:08:14.615 [error] Hash recibido: 5c80908c297a81fec85641e32f78210f42fa1de8a712d6d73a55f663f43082f5
2025-12-23 02:08:14.615 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.615 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 02:08:14.615 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.818 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 02:08:14.818 [info] 🔍 Query params recibidos: { id: '36678944360', topic: 'merchant_order' }
2025-12-23 02:08:14.818 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-23 02:08:14.818 [info] 🔔 Webhook procesado: {
  id: '36678944360',
  type: 'merchant_order',
  action: null,
  data_id: '36678944360'
}
2025-12-23 02:08:14.818 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order

SEGUNDO LOG:
2025-12-23 02:08:14.218 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.218 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 02:08:14.218 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.218 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 02:08:14.218 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36678944360&topic=merchant_order
2025-12-23 02:08:14.218 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 02:08:14.218 [info] - x-signature: ts=1766455694,v1=f2d2d76f249a18332737e7a23e0a4d4209eeadf42c80a8771bbb116fa64c3f1b
2025-12-23 02:08:14.218 [info] - x-request-id: 08e8663d-b132-4ea2-be1a-56bf6be67152
2025-12-23 02:08:14.218 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-23 02:08:14.218 [info] - content-type: application/json
2025-12-23 02:08:14.218 [info] 📋 [DEBUG] Query params: { id: '36678944360', topic: 'merchant_order' }
2025-12-23 02:08:14.218 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-23 02:08:14.218 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 02:08:14.218 [info] 🔍 Tipo de notificación: merchant_order, ID: 36678944360, Formato: merchant_order
2025-12-23 02:08:14.218 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 02:08:14.218 [info] - Raw (segundos): 1766455694
2025-12-23 02:08:14.219 [info] - Convertido (ms): 1766455694000
2025-12-23 02:08:14.219 [info] - Fecha: 2025-12-23T02:08:14.000Z
2025-12-23 02:08:14.219 [info] - Diferencia: 218 ms
2025-12-23 02:08:14.219 [info] 📋 Manifest construido (merchant_order - Formato: merchant_order): id:36678944360;request-id:08e8663d-b132-4ea2-be1a-56bf6be67152;ts:1766455694;
2025-12-23 02:08:14.219 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 02:08:14.219 [error] Tipo: merchant_order
2025-12-23 02:08:14.219 [error] Formato: merchant_order
2025-12-23 02:08:14.219 [error] Manifest usado: id:36678944360;request-id:08e8663d-b132-4ea2-be1a-56bf6be67152;ts:1766455694;
2025-12-23 02:08:14.219 [error] Hash esperado: df39bf172604bd8ce0972070e3b8359ef4ea73e5253a9c2a6938281755948a55
2025-12-23 02:08:14.219 [error] Hash recibido: f2d2d76f249a18332737e7a23e0a4d4209eeadf42c80a8771bbb116fa64c3f1b
2025-12-23 02:08:14.219 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.219 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 02:08:14.219 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.386 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 02:08:14.386 [info] 🔍 Query params recibidos: { id: '36678944360', topic: 'merchant_order' }
2025-12-23 02:08:14.386 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-23 02:08:14.386 [info] 🔔 Webhook procesado: {
  id: '36678944360',
  type: 'merchant_order',
  action: null,
  data_id: '36678944360'
}
2025-12-23 02:08:14.386 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order

TERCER LOG

2025-12-23 02:08:13.318 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:13.318 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 02:08:13.318 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:13.318 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 02:08:13.318 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36678944360&topic=merchant_order
2025-12-23 02:08:13.318 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 02:08:13.318 [info] - x-signature: ts=1766455693,v1=cdcb6e2bba2e4d34b04a69a3207dd39b6bad385fba258222ace7150444e46c50
2025-12-23 02:08:13.318 [info] - x-request-id: d6b0124b-53cc-4f8e-8dff-710d241ac434
2025-12-23 02:08:13.318 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-23 02:08:13.319 [info] - content-type: application/json
2025-12-23 02:08:13.319 [info] 📋 [DEBUG] Query params: { id: '36678944360', topic: 'merchant_order' }
2025-12-23 02:08:13.319 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-23 02:08:13.319 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 02:08:13.319 [info] 🔍 Tipo de notificación: merchant_order, ID: 36678944360, Formato: merchant_order
2025-12-23 02:08:13.319 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 02:08:13.319 [info] - Raw (segundos): 1766455693
2025-12-23 02:08:13.319 [info] - Convertido (ms): 1766455693000
2025-12-23 02:08:13.319 [info] - Fecha: 2025-12-23T02:08:13.000Z
2025-12-23 02:08:13.319 [info] - Diferencia: 318 ms
2025-12-23 02:08:13.319 [info] 📋 Manifest construido (merchant_order - Formato: merchant_order): id:36678944360;request-id:d6b0124b-53cc-4f8e-8dff-710d241ac434;ts:1766455693;
2025-12-23 02:08:13.319 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 02:08:13.319 [error] Tipo: merchant_order
2025-12-23 02:08:13.319 [error] Formato: merchant_order
2025-12-23 02:08:13.319 [error] Manifest usado: id:36678944360;request-id:d6b0124b-53cc-4f8e-8dff-710d241ac434;ts:1766455693;
2025-12-23 02:08:13.319 [error] Hash esperado: ad8054ff2d8732417bf82db788b3d81834b30812933fe034991809110e1a20a5
2025-12-23 02:08:13.319 [error] Hash recibido: cdcb6e2bba2e4d34b04a69a3207dd39b6bad385fba258222ace7150444e46c50
2025-12-23 02:08:13.319 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:13.319 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 02:08:13.319 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:13.531 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 02:08:13.532 [info] 🔍 Query params recibidos: { id: '36678944360', topic: 'merchant_order' }
2025-12-23 02:08:13.532 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-23 02:08:13.532 [info] 🔔 Webhook procesado: {
  id: '36678944360',
  type: 'merchant_order',
  action: null,
  data_id: '36678944360'
}
2025-12-23 02:08:13.532 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order

CUARTO 
2025-12-23 02:08:13.274 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:13.274 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 02:08:13.274 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:13.274 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 02:08:13.274 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=138472432031&topic=payment
2025-12-23 02:08:13.274 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 02:08:13.274 [info] - x-signature: ts=1766455693,v1=d1d215483c5ff4eb35893b048a8a1bde6f74ded3ee9cea43b2a997600a0aac06
2025-12-23 02:08:13.274 [info] - x-request-id: d6b0124b-53cc-4f8e-8dff-710d241ac434
2025-12-23 02:08:13.274 [info] - user-agent: MercadoPago Feed v2.0 payment
2025-12-23 02:08:13.274 [info] - content-type: application/json
2025-12-23 02:08:13.274 [info] 📋 [DEBUG] Query params: { id: '138472432031', topic: 'payment' }
2025-12-23 02:08:13.274 [info] 📋 [DEBUG] Tipo de notificación detectado: payment
2025-12-23 02:08:13.274 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 02:08:13.274 [info] 🔍 Tipo de notificación: payment, ID: 138472432031, Formato: id
2025-12-23 02:08:13.274 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 02:08:13.274 [info] - Raw (segundos): 1766455693
2025-12-23 02:08:13.274 [info] - Convertido (ms): 1766455693000
2025-12-23 02:08:13.274 [info] - Fecha: 2025-12-23T02:08:13.000Z
2025-12-23 02:08:13.274 [info] - Diferencia: 269 ms
2025-12-23 02:08:13.274 [info] 📋 Manifest construido (payment - Formato: id): id:138472432031;request-id:d6b0124b-53cc-4f8e-8dff-710d241ac434;ts:1766455693;
2025-12-23 02:08:13.274 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 02:08:13.274 [error] Tipo: payment
2025-12-23 02:08:13.274 [error] Formato: id
2025-12-23 02:08:13.274 [error] Manifest usado: id:138472432031;request-id:d6b0124b-53cc-4f8e-8dff-710d241ac434;ts:1766455693;
2025-12-23 02:08:13.274 [error] Hash esperado: 7f11ca90f24ce57e4acbf3388561e8497d5d7ba5f0114c03a9292ec7420e3b10
2025-12-23 02:08:13.274 [error] Hash recibido: d1d215483c5ff4eb35893b048a8a1bde6f74ded3ee9cea43b2a997600a0aac06
2025-12-23 02:08:13.274 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:13.274 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 02:08:13.274 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:13.446 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 02:08:13.447 [info] 🔍 Query params recibidos: { id: '138472432031', topic: 'payment' }
2025-12-23 02:08:13.447 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-23 02:08:13.447 [info] 🔔 Webhook procesado: {
  id: '138472432031',
  type: 'payment',
  action: null,
  data_id: '138472432031'
}
2025-12-23 02:08:13.937 [info] 🔄 Procesando pago: 138472432031
2025-12-23 02:08:13.937 [info] 🔍 Notificación a procesar: {
  id: '138472432031',
  type: 'payment',
  action: null,
  data: { id: '138472432031' }
}
2025-12-23 02:08:14.515 [info] 🔍 Analizando pago para detectar tipo: {
  live_mode: undefined,
  payment_method_id: 'visa',
  transaction_amount: 10,
  payer_email: undefined,
  payment_id: '138472432031',
  is_development_mock: undefined
}
2025-12-23 02:08:14.515 [info] ✅ Pago detectado como REAL
2025-12-23 02:08:14.515 [info] 📊 Tipo de pago: ✅ REAL
2025-12-23 02:08:14.515 [info] 🔍 Buscando datos temporales de la preferencia...
2025-12-23 02:08:14.718 [info] 🔎 Buscando datos temporales con external_reference: 1643f282-0f1b-4993-a976-65bbaffe9756
2025-12-23 02:08:14.872 [info] ✅ Datos temporales encontrados: {
  temp_order_id: '1643f282-0f1b-4993-a976-65bbaffe9756',
  customer_email: 'lucasctmn@gmail.com'
}
2025-12-23 02:08:14.872 [info] 🔍 Verificando si ya existe orden con external_reference: 1643f282-0f1b-4993-a976-65bbaffe9756
2025-12-23 02:08:15.033 [info] 📝 Creando orden real desde datos temporales...
2025-12-23 02:08:15.033 [info] 📧 Email REAL del cliente a guardar: lucasctmn@gmail.com
2025-12-23 02:08:15.033 [info] 📧 Email usado en MP: lucasctmn@gmail.com
2025-12-23 02:08:15.034 [info] 📝 Creando orden con datos del cliente: {
  email: 'lucasctmn@gmail.com',
  name: 'prueba final sin errores',
  phone: '313131313131',
  has_shipping_address: true
}
2025-12-23 02:08:15.232 [info] ✅ Orden creada exitosamente: {
  order_id: 'fc5e6fe5-8242-450f-a5e5-f01898be6643',
  customer_email: 'lucasctmn@gmail.com',
  customer_name: 'prueba final sin errores',
  customer_phone: '313131313131'
}
2025-12-23 02:08:15.553 [info] ✅ Orden real creada con external_reference: fc5e6fe5-8242-450f-a5e5-f01898be6643
2025-12-23 02:08:15.553 [info] ✅ Email guardado en la orden: lucasctmn@gmail.com
2025-12-23 02:08:15.739 [info] 📝 Actualizando orden con información de pago...
2025-12-23 02:08:15.739 [info] Order ID: fc5e6fe5-8242-450f-a5e5-f01898be6643
2025-12-23 02:08:15.739 [info] Payment Info: {
  payment_id: '138472432031',
  status: 'approved',
  payment_method_id: 'visa',
  payment_type_id: 'prepaid_card',
  payer_email: 'lucasctmn@gmail.com',
  date_approved: '2025-12-22T22:08:12.000-04:00'
}
2025-12-23 02:08:16.460 [info] ✅ Pago aprobado, marcando orden como pagada
2025-12-23 02:08:16.461 [info] 💰 Marcando orden como pagada: fc5e6fe5-8242-450f-a5e5-f01898be6643
2025-12-23 02:08:16.611 [info] 📦 Orden encontrada con 1 items
2025-12-23 02:08:16.611 [info] 🔍 Validando disponibilidad de stock...
2025-12-23 02:08:16.611 [info] 🔍 Validando stock para 1 productos...
2025-12-23 02:08:16.766 [info] - Guantes de jardinería : 46 disponible, 1 solicitado
2025-12-23 02:08:16.766 [info] ✅ Validación de stock exitosa
2025-12-23 02:08:16.766 [info] ✅ Stock validado correctamente
2025-12-23 02:08:16.922 [info] ✅ Orden actualizada en BD
2025-12-23 02:08:16.922 [info] 📉 Reduciendo stock de productos...
2025-12-23 02:08:16.922 [info] - Reduciendo 1 unidades de Guantes de jardinería
2025-12-23 02:08:17.428 [info] ✅ Stock reducido exitosamente para todos los productos
2025-12-23 02:08:17.761 [info] ✅ Orden marcada como pagada exitosamente
2025-12-23 02:08:17.761 [info] 🗑️ Marcando para limpiar carrito temporal del cliente
2025-12-23 02:08:17.910 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:17.910 [info] ✅ [WEBHOOK] Procesamiento completado en 4641ms
2025-12-23 02:08:17.910 [info] Order ID: fc5e6fe5-8242-450f-a5e5-f01898be6643
2025-12-23 02:08:17.910 [info] Payment ID: 138472432031
2025-12-23 02:08:17.910 [info] Status: approved
2025-12-23 02:08:17.910 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUINTO 
2025-12-23 02:08:13.990 [info] 🌍 Ambiente detectado: ✅ PRODUCCIÓN (NODE_ENV=production)
2025-12-23 02:08:14.012 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.012 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 02:08:14.012 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.012 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 02:08:14.012 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?data.id=138472432031&type=payment
2025-12-23 02:08:14.012 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 02:08:14.013 [info] - x-signature: ts=1766455693,v1=7f11ca90f24ce57e4acbf3388561e8497d5d7ba5f0114c03a9292ec7420e3b10
2025-12-23 02:08:14.013 [info] - x-request-id: d6b0124b-53cc-4f8e-8dff-710d241ac434
2025-12-23 02:08:14.013 [info] - user-agent: MercadoPago WebHook v1.0 payment
2025-12-23 02:08:14.013 [info] - content-type: application/json
2025-12-23 02:08:14.013 [info] 📋 [DEBUG] Query params: { 'data.id': '138472432031', type: 'payment' }
2025-12-23 02:08:14.013 [info] 📋 [DEBUG] Tipo de notificación detectado: payment
2025-12-23 02:08:14.013 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 02:08:14.014 [info] 🔍 Tipo de notificación: payment, ID: 138472432031, Formato: data.id
2025-12-23 02:08:14.014 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 02:08:14.014 [info] - Raw (segundos): 1766455693
2025-12-23 02:08:14.014 [info] - Convertido (ms): 1766455693000
2025-12-23 02:08:14.017 [info] - Fecha: 2025-12-23T02:08:13.000Z
2025-12-23 02:08:14.017 [info] - Diferencia: 1014 ms
2025-12-23 02:08:14.017 [info] 📋 Manifest construido (payment - Formato: data.id): data.id:138472432031;request-id:d6b0124b-53cc-4f8e-8dff-710d241ac434;ts:1766455693;
2025-12-23 02:08:14.017 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 02:08:14.017 [error] Tipo: payment
2025-12-23 02:08:14.017 [error] Formato: data.id
2025-12-23 02:08:14.017 [error] Manifest usado: data.id:138472432031;request-id:d6b0124b-53cc-4f8e-8dff-710d241ac434;ts:1766455693;
2025-12-23 02:08:14.017 [error] Hash esperado: 733a638dc9aee82b03d52b0d6d80847f04adb57e3ed754e8c9a1f4cf0cd2d310
2025-12-23 02:08:14.017 [error] Hash recibido: 7f11ca90f24ce57e4acbf3388561e8497d5d7ba5f0114c03a9292ec7420e3b10
2025-12-23 02:08:14.017 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.017 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 02:08:14.017 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:14.318 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 02:08:14.318 [info] 🔍 Query params recibidos: { 'data.id': '138472432031', type: 'payment' }
2025-12-23 02:08:14.318 [info] 📦 Body recibido: {
  id: 127551041914,
  type: 'payment',
  action: 'payment.created',
  data_id: '138472432031'
}
2025-12-23 02:08:14.318 [info] 🔔 Webhook procesado: {
  id: 127551041914,
  type: 'payment',
  action: 'payment.created',
  data_id: '138472432031'
}
2025-12-23 02:08:14.503 [info] 🔄 Procesando pago: 138472432031
2025-12-23 02:08:14.503 [info] 🔍 Notificación a procesar: {
  id: 127551041914,
  type: 'payment',
  action: 'payment.created',
  data: { id: '138472432031' }
}
2025-12-23 02:08:15.114 [info] 🔍 Analizando pago para detectar tipo: {
  live_mode: undefined,
  payment_method_id: 'visa',
  transaction_amount: 10,
  payer_email: undefined,
  payment_id: '138472432031',
  is_development_mock: undefined
}
2025-12-23 02:08:15.114 [info] ✅ Pago detectado como REAL
2025-12-23 02:08:15.114 [info] 📊 Tipo de pago: ✅ REAL
2025-12-23 02:08:15.114 [info] 🔍 Buscando datos temporales de la preferencia...
2025-12-23 02:08:15.292 [info] 🔎 Buscando datos temporales con external_reference: 1643f282-0f1b-4993-a976-65bbaffe9756
2025-12-23 02:08:15.494 [info] ✅ Datos temporales encontrados: {
  temp_order_id: '1643f282-0f1b-4993-a976-65bbaffe9756',
  customer_email: 'lucasctmn@gmail.com'
}
2025-12-23 02:08:15.494 [info] 🔍 Verificando si ya existe orden con external_reference: 1643f282-0f1b-4993-a976-65bbaffe9756
2025-12-23 02:08:15.676 [info] ♻️ Orden ya existe (reutilizando): fc5e6fe5-8242-450f-a5e5-f01898be6643
2025-12-23 02:08:15.858 [info] 📝 Actualizando orden con información de pago...
2025-12-23 02:08:15.858 [info] Order ID: fc5e6fe5-8242-450f-a5e5-f01898be6643
2025-12-23 02:08:15.858 [info] Payment Info: {
  payment_id: '138472432031',
  status: 'approved',
  payment_method_id: 'visa',
  payment_type_id: 'prepaid_card',
  payer_email: 'lucasctmn@gmail.com',
  date_approved: '2025-12-22T22:08:12.000-04:00'
}
2025-12-23 02:08:16.612 [info] ✅ Pago aprobado, marcando orden como pagada
2025-12-23 02:08:16.616 [info] 💰 Marcando orden como pagada: fc5e6fe5-8242-450f-a5e5-f01898be6643
2025-12-23 02:08:16.799 [info] 📦 Orden encontrada con 1 items
2025-12-23 02:08:16.799 [info] 🔍 Validando disponibilidad de stock...
2025-12-23 02:08:16.801 [info] 🔍 Validando stock para 1 productos...
2025-12-23 02:08:16.983 [info] - Guantes de jardinería : 46 disponible, 1 solicitado
2025-12-23 02:08:16.983 [info] ✅ Validación de stock exitosa
2025-12-23 02:08:16.984 [info] ✅ Stock validado correctamente
2025-12-23 02:08:17.162 [info] ✅ Orden actualizada en BD
2025-12-23 02:08:17.162 [info] 📉 Reduciendo stock de productos...
2025-12-23 02:08:17.162 [info] - Reduciendo 1 unidades de Guantes de jardinería
2025-12-23 02:08:17.718 [info] ✅ Stock reducido exitosamente para todos los productos
2025-12-23 02:08:18.076 [info] ✅ Orden marcada como pagada exitosamente
2025-12-23 02:08:18.076 [info] 🗑️ Marcando para limpiar carrito temporal del cliente
2025-12-23 02:08:18.241 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:18.241 [info] ✅ [WEBHOOK] Procesamiento completado en 4226ms
2025-12-23 02:08:18.241 [info] Order ID: fc5e6fe5-8242-450f-a5e5-f01898be6643
2025-12-23 02:08:18.241 [info] Payment ID: 138472432031
2025-12-23 02:08:18.241 [info] Status: approved
2025-12-23 02:08:18.241 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SEXTO

2025-12-23 02:08:11.760 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:11.760 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 02:08:11.760 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:11.760 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 02:08:11.760 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36678944360&topic=merchant_order
2025-12-23 02:08:11.760 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 02:08:11.760 [info] - x-signature: ts=1766455690,v1=95482c9b845478ba73db7ad5c5d6984a8a7637cb7392e1f2ac36175f52e97195
2025-12-23 02:08:11.760 [info] - x-request-id: 9a1078e2-402a-465e-a36f-588ae5c5e88c
2025-12-23 02:08:11.760 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-23 02:08:11.760 [info] - content-type: application/json
2025-12-23 02:08:11.760 [info] 📋 [DEBUG] Query params: { id: '36678944360', topic: 'merchant_order' }
2025-12-23 02:08:11.760 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-23 02:08:11.760 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 02:08:11.760 [info] 🔍 Tipo de notificación: merchant_order, ID: 36678944360, Formato: merchant_order
2025-12-23 02:08:11.760 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 02:08:11.760 [info] - Raw (segundos): 1766455690
2025-12-23 02:08:11.760 [info] - Convertido (ms): 1766455690000
2025-12-23 02:08:11.760 [info] - Fecha: 2025-12-23T02:08:10.000Z
2025-12-23 02:08:11.760 [info] - Diferencia: 1760 ms
2025-12-23 02:08:11.760 [info] 📋 Manifest construido (merchant_order - Formato: merchant_order): id:36678944360;request-id:9a1078e2-402a-465e-a36f-588ae5c5e88c;ts:1766455690;
2025-12-23 02:08:11.761 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 02:08:11.761 [error] Tipo: merchant_order
2025-12-23 02:08:11.761 [error] Formato: merchant_order
2025-12-23 02:08:11.761 [error] Manifest usado: id:36678944360;request-id:9a1078e2-402a-465e-a36f-588ae5c5e88c;ts:1766455690;
2025-12-23 02:08:11.761 [error] Hash esperado: 323b7c0ebc6cf9fe1db304c61ac3ef0d91342e29509b98c84cb4a7a6cbcc3e3a
2025-12-23 02:08:11.761 [error] Hash recibido: 95482c9b845478ba73db7ad5c5d6984a8a7637cb7392e1f2ac36175f52e97195
2025-12-23 02:08:11.761 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:11.761 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 02:08:11.761 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 02:08:11.971 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 02:08:11.974 [info] 🔍 Query params recibidos: { id: '36678944360', topic: 'merchant_order' }
2025-12-23 02:08:11.974 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-23 02:08:11.977 [info] 🔔 Webhook procesado: {
  id: '36678944360',
  type: 'merchant_order',
  action: null,
  data_id: '36678944360'
}
2025-12-23 02:08:11.977 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order

SEPTIMO 

2025-12-23 02:07:44.885 [info] 🌍 Ambiente detectado: ✅ PRODUCCIÓN (NODE_ENV=production)
2025-12-23 02:07:44.891 [info] 🚀 === INICIO CREATE PREFERENCE ===
2025-12-23 02:07:44.891 [info] 📥 Parseando body del request...
2025-12-23 02:07:44.892 [info] ✅ Body parseado: {
  "items": [
    {
      "product_id": "e52b9adf-6de3-4216-a1fa-771780d9dec4",
      "product_name": "Guantes de jardinería ",
      "quantity": 1,
      "price": 10,
      "image": "https://zqiqpevtoacevzhnkeky.supabase.co/storage/v1/object/public/product-images/products/e52b9adf-6de3-4216-a1fa-771780d9dec4/1763810402746-fkhadj.webp"
    }
  ],
  "shipping_address": {
    "street": "las piedras",
    "number": "12",
    "city": "tucuman",
    "state": "tucuman",
    "zip": "4000",
    "additional_info": ""
  },
  "payment_method": "mercadopago",
  "customer_email": "lucasctmn@gmail.com",
  "customer_email_for_mp": "lucasctmn@gmail.com",
  "customer_name": "prueba final sin errores",
  "customer_phone": "313131313131",
  "shipping_method": "pickup"
}
2025-12-23 02:07:44.892 [info] 🔍 Validando stock de productos...
2025-12-23 02:07:44.892 [info] - Validando stock para: Guantes de jardinería  (ID: e52b9adf-6de3-4216-a1fa-771780d9dec4, Cantidad: 1)
2025-12-23 02:07:45.085 [info] - Stock válido para Guantes de jardinería : { isValid: true, availableStock: 46, message: '' }
2025-12-23 02:07:45.085 [info] 🧮 Calculando total de items...
2025-12-23 02:07:45.085 [info] ✅ Total calculado: 10
2025-12-23 02:07:45.086 [info] 📧 Emails recibidos: {
  real: 'lucasctmn@gmail.com',
  for_mp: 'lucasctmn@gmail.com',
  are_different: false
}
2025-12-23 02:07:45.086 [info] 💳 Creando preferencia de pago en MP...
2025-12-23 02:07:45.086 [info] 📤 Enviando datos a Mercado Pago: {
  "items": [
    {
      "id": "e52b9adf-6de3-4216-a1fa-771780d9dec4",
      "title": "Guantes de jardinería ",
      "description": "Guantes de jardinería  - Cantidad: 1",
      "picture_url": "https://zqiqpevtoacevzhnkeky.supabase.co/storage/v1/object/public/product-images/products/e52b9adf-6de3-4216-a1fa-771780d9dec4/1763810402746-fkhadj.webp",
      "category_id": "plantas",
      "quantity": 1,
      "currency_id": "ARS",
      "unit_price": 10
    }
  ],
  "payer": {
    "email": "lucasctmn@gmail.com",
    "name": "prueba",
    "surname": "final sin errores",
    "phone": {
      "area_code": "11",
      "number": "313131313131"
    },
    "address": {
      "street_name": "las piedras",
      "street_number": "12",
      "zip_code": "4000"
    }
  },
  "back_urls": {
    "success": "https://app-vivero-web.vercel.app/pago/success",
    "failure": "https://app-vivero-web.vercel.app/pago/failure",
    "pending": "https://app-vivero-web.vercel.app/pago/pending"
  },
  "notification_url": "https://app-vivero-web.vercel.app/api/mercadopago/webhook",
  "external_reference": "1643f282-0f1b-4993-a976-65bbaffe9756",
  "payment_methods": {
    "excluded_payment_methods": [
      {
        "id": "rapipago"
      },
      {
        "id": "pagofacil"
      },
      {
        "id": "bapropagos"
      },
      {
        "id": "cargavirtual"
      },
      {
        "id": "redlink"
      },
      {
        "id": "cobroexpress"
      },
      {
        "id": "dinero_mail"
      },
      {
        "id": "banelco"
      },
      {
        "id": "link"
      },
      {
        "id": "pago_facil"
      },
      {
        "id": "rapi_pago"
      }
    ],
    "excluded_payment_types": [
      {
        "id": "ticket"
      },
      {
        "id": "atm"
      }
    ],
    "installments": 12
  },
  "metadata": {
    "order_id": "1643f282-0f1b-4993-a976-65bbaffe9756",
    "customer_email": "lucasctmn@gmail.com",
    "created_at": "2025-12-23T02:07:45.086Z"
  }
}
2025-12-23 02:07:45.086 [info] 🔒 Configuración de métodos de pago:
2025-12-23 02:07:45.087 [info] - excludedPaymentMethods: [
  { id: 'rapipago' },
  { id: 'pagofacil' },
  { id: 'bapropagos' },
  { id: 'cargavirtual' },
  { id: 'redlink' },
  { id: 'cobroexpress' },
  { id: 'dinero_mail' },
  { id: 'banelco' },
  { id: 'link' },
  { id: 'pago_facil' },
  { id: 'rapi_pago' }
]
2025-12-23 02:07:45.087 [info] - excludedPaymentTypes: [ { id: 'ticket' }, { id: 'atm' } ]
2025-12-23 02:07:45.088 [info] - payment_methods config: {
  excluded_payment_methods: [
    { id: 'rapipago' },
    { id: 'pagofacil' },
    { id: 'bapropagos' },
    { id: 'cargavirtual' },
    { id: 'redlink' },
    { id: 'cobroexpress' },
    { id: 'dinero_mail' },
    { id: 'banelco' },
    { id: 'link' },
    { id: 'pago_facil' },
    { id: 'rapi_pago' }
  ],
  excluded_payment_types: [ { id: 'ticket' }, { id: 'atm' } ],
  installments: 12
}
2025-12-23 02:07:45.088 [info] 📋 Preferencia completa a enviar:
2025-12-23 02:07:45.088 [info] {
  "items": [
    {
      "id": "e52b9adf-6de3-4216-a1fa-771780d9dec4",
      "title": "Guantes de jardinería ",
      "description": "Guantes de jardinería  - Cantidad: 1",
      "picture_url": "https://zqiqpevtoacevzhnkeky.supabase.co/storage/v1/object/public/product-images/products/e52b9adf-6de3-4216-a1fa-771780d9dec4/1763810402746-fkhadj.webp",
      "category_id": "plantas",
      "quantity": 1,
      "currency_id": "ARS",
      "unit_price": 10
    }
  ],
  "payer": {
    "email": "lucasctmn@gmail.com",
    "name": "prueba",
    "surname": "final sin errores",
    "phone": {
      "area_code": "11",
      "number": "313131313131"
    },
    "address": {
      "street_name": "las piedras",
      "street_number": "12",
      "zip_code": "4000"
    }
  },
  "back_urls": {
    "success": "https://app-vivero-web.vercel.app/pago/success",
    "failure": "https://app-vivero-web.vercel.app/pago/failure",
    "pending": "https://app-vivero-web.vercel.app/pago/pending"
  },
  "notification_url": "https://app-vivero-web.vercel.app/api/mercadopago/webhook",
  "external_reference": "1643f282-0f1b-4993-a976-65bbaffe9756",
  "payment_methods": {
    "excluded_payment_methods": [
      {
        "id": "rapipago"
      },
      {
        "id": "pagofacil"
      },
      {
        "id": "bapropagos"
      },
      {
        "id": "cargavirtual"
      },
      {
        "id": "redlink"
      },
      {
        "id": "cobroexpress"
      },
      {
        "id": "dinero_mail"
      },
      {
        "id": "banelco"
      },
      {
        "id": "link"
      },
      {
        "id": "pago_facil"
      },
      {
        "id": "rapi_pago"
      }
    ],
    "excluded_payment_types": [
      {
        "id": "ticket"
      },
      {
        "id": "atm"
      }
    ],
    "installments": 12
  },
  "metadata": {
    "order_id": "1643f282-0f1b-4993-a976-65bbaffe9756",
    "customer_email": "lucasctmn@gmail.com",
    "created_at": "2025-12-23T02:07:45.086Z"
  }
}
2025-12-23 02:07:45.384 [info] 📨 Respuesta de Mercado Pago: {
  "additional_info": "",
  "auto_return": "",
  "back_urls": {
    "failure": "https://app-vivero-web.vercel.app/pago/failure",
    "pending": "https://app-vivero-web.vercel.app/pago/pending",
    "success": "https://app-vivero-web.vercel.app/pago/success"
  },
  "binary_mode": false,
  "client_id": "4015405103617799",
  "collector_id": 174087864,
  "coupon_code": null,
  "coupon_labels": null,
  "date_created": "2025-12-22T22:07:45.343-04:00",
  "date_of_expiration": null,
  "expiration_date_from": null,
  "expiration_date_to": null,
  "expires": false,
  "external_reference": "1643f282-0f1b-4993-a976-65bbaffe9756",
  "id": "174087864-80edf947-3352-4cf9-a1b5-82f38dec1200",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-80edf947-3352-4cf9-a1b5-82f38dec1200",
  "internal_metadata": null,
  "items": [
    {
      "id": "e52b9adf-6de3-4216-a1fa-771780d9dec4",
      "category_id": "plantas",
      "currency_id": "ARS",
      "description": "Guantes de jardinería  - Cantidad: 1",
      "picture_url": "https://http2.mlstatic.com/D_NQ_NP_874706-MLA102192420453_122025-F.jpg",
      "title": "Guantes de jardinería ",
      "quantity": 1,
      "unit_price": 10
    }
  ],
  "marketplace": "MP-MKT-4015405103617799",
  "marketplace_fee": 0,
  "metadata": {
    "created_at": "2025-12-23T02:07:45.086Z",
    "customer_email": "lucasctmn@gmail.com",
    "order_id": "1643f282-0f1b-4993-a976-65bbaffe9756"
  },
  "notification_url": "https://app-vivero-web.vercel.app/api/mercadopago/webhook",
  "operation_type": "regular_payment",
  "payer": {
    "phone": {
      "area_code": "11",
      "number": "313131313131"
    },
    "address": {
      "zip_code": "4000",
      "street_name": "las piedras",
      "street_number": "12"
    },
    "email": "lucasctmn@gmail.com",
    "identification": {
      "number": "",
      "type": ""
    },
    "name": "prueba",
    "surname": "final sin errores",
    "date_created": null,
    "last_purchase": null
  },
  "payment_methods": {
    "default_card_id": null,
    "default_payment_method_id": null,
    "excluded_payment_methods": [
      {
        "id": "rapipago"
      },
      {
        "id": "pagofacil"
      },
      {
        "id": "bapropagos"
      },
      {
        "id": "cargavirtual"
      },
      {
        "id": "redlink"
      },
      {
        "id": "cobroexpress"
      },
      {
        "id": "dinero_mail"
      },
      {
        "id": "banelco"
      },
      {
        "id": "link"
      },
      {
        "id": "pago_facil"
      },
      {
        "id": "rapi_pago"
      }
    ],
    "excluded_payment_types": [
      {
        "id": "ticket"
      },
      {
        "id": "atm"
      }
    ],
    "installments": 12,
    "default_installments": null
  },
  "processing_modes": null,
  "product_id": null,
  "preference_expired": false,
  "redirect_urls": {
    "failure": "",
    "pending": "",
    "success": ""
  },
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-80edf947-3352-4cf9-a1b5-82f38dec1200",
  "site_id": "MLA",
  "shipments": {
    "default_shipping_method": null,
    "receiver_address": {
      "zip_code": "",
      "street_name": "",
      "street_number": null,
      "floor": "",
      "apartment": "",
      "city_name": null,
      "state_name": null,
      "country_name": null,
      "neighborhood": null
    }
  },
  "total_amount": null,
  "last_updated": null,
  "financing_group": "",
  "api_response": {
    "status": 201,
    "headers": {
      "date": [
        "Tue, 23 Dec 2025 02:07:45 GMT"
      ],
      "content-type": [
        "application/json; charset=utf-8"
      ],
      "content-length": [
        "1151"
      ],
      "connection": [
        "keep-alive"
      ],
      "content-encoding": [
        "gzip"
      ],
      "vary": [
        "Accept-Encoding"
      ],
      "x-content-type-options": [
        "nosniff"
      ],
      "x-request-id": [
        "e615afcc-5995-4086-883c-3ba078d2aa03"
      ],
      "x-xss-protection": [
        "1; mode=block"
      ],
      "strict-transport-security": [
        "max-age=16070400; includeSubDomains; preload, max-age=31536000; includeSubDomains"
      ],
      "access-control-allow-origin": [
        "*"
      ],
      "access-control-allow-headers": [
        "Content-Type"
      ],
      "access-control-allow-methods": [
        "PUT, GET, POST, DELETE, OPTIONS"
      ],
      "access-control-max-age": [
        "86400"
      ],
      "timing-allow-origin": [
        "*"
      ]
    }
  }
}
2025-12-23 02:07:45.600 [info] ✅ Preferencia de MP creada: {
  id: '174087864-80edf947-3352-4cf9-a1b5-82f38dec1200',
  init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-80edf947-3352-4cf9-a1b5-82f38dec1200'
}
2025-12-23 02:07:45.600 [info] 💾 Almacenando datos temporales para webhook...
2025-12-23 02:07:45.780 [info] ✅ Datos temporales almacenados para webhook (email REAL guardado)
2025-12-23 02:07:45.780 [info] 🎉 === PREFERENCIA CREADA EXITOSAMENTE (SIN ORDEN AÚN) ===
2025-12-23 02:07:45.781 [info] ✅ Datos finales: {
  temp_order_id: '1643f282-0f1b-4993-a976-65bbaffe9756',
  preference_id: '174087864-80edf947-3352-4cf9-a1b5-82f38dec1200',
  init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-80edf947-3352-4cf9-a1b5-82f38dec1200'
}