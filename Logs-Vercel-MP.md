1er log :
2025-12-23 00:06:17.986 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:17.986 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 00:06:17.986 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:17.986 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 00:06:17.986 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36675958546&topic=merchant_order
2025-12-23 00:06:17.986 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 00:06:17.986 [info] - x-signature: ts=1766448377,v1=74d5707491f9f4179ca28beaa1972fdd46c202e807aa80b9850b86f2e9cefcd6
2025-12-23 00:06:17.986 [info] - x-request-id: d2fb55c8-31f0-452f-99d5-ed4ca041e315
2025-12-23 00:06:17.986 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-23 00:06:17.986 [info] - content-type: application/json
2025-12-23 00:06:17.986 [info] 📋 [DEBUG] Query params: { id: '36675958546', topic: 'merchant_order' }
2025-12-23 00:06:17.986 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-23 00:06:17.986 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 00:06:17.986 [info] 🔍 Tipo de notificación: merchant_order, ID: 36675958546
2025-12-23 00:06:17.986 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 00:06:17.986 [info] - Raw (segundos): 1766448377
2025-12-23 00:06:17.986 [info] - Convertido (ms): 1766448377000
2025-12-23 00:06:17.986 [info] - Fecha: 2025-12-23T00:06:17.000Z
2025-12-23 00:06:17.986 [info] - Diferencia: 984 ms
2025-12-23 00:06:17.986 [info] 📋 Manifest construido (merchant_order): id:36675958546;request-id:d2fb55c8-31f0-452f-99d5-ed4ca041e315;ts:1766448377;
2025-12-23 00:06:17.986 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 00:06:17.986 [error] Manifest usado: id:36675958546;request-id:d2fb55c8-31f0-452f-99d5-ed4ca041e315;ts:1766448377;
2025-12-23 00:06:17.986 [error] Hash esperado: 23fad60d6e2abba105bd8510c20088ab652e1319171f03df87c5aebd58dcabf4
2025-12-23 00:06:17.986 [error] Hash recibido: 74d5707491f9f4179ca28beaa1972fdd46c202e807aa80b9850b86f2e9cefcd6
2025-12-23 00:06:17.986 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:17.986 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 00:06:17.986 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:18.272 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 00:06:18.272 [info] 🔍 Query params recibidos: { id: '36675958546', topic: 'merchant_order' }
2025-12-23 00:06:18.272 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-23 00:06:18.272 [info] 🔔 Webhook procesado: {
  id: '36675958546',
  type: 'merchant_order',
  action: null,
  data_id: '36675958546'
}
2025-12-23 00:06:18.273 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order

SEGUNDO LOG:
2025-12-23 00:06:17.631 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:17.631 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 00:06:17.631 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:17.631 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 00:06:17.631 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36675958546&topic=merchant_order
2025-12-23 00:06:17.631 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 00:06:17.631 [info] - x-signature: ts=1766448377,v1=563384fd0ebd685d6a07d579da5f38f27bb53133d01e4c12c970ba27eaa2c8a7
2025-12-23 00:06:17.631 [info] - x-request-id: 2b7b77d1-a506-44d4-993a-4825b359f03c
2025-12-23 00:06:17.631 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-23 00:06:17.631 [info] - content-type: application/json
2025-12-23 00:06:17.631 [info] 📋 [DEBUG] Query params: { id: '36675958546', topic: 'merchant_order' }
2025-12-23 00:06:17.631 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-23 00:06:17.631 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 00:06:17.631 [info] 🔍 Tipo de notificación: merchant_order, ID: 36675958546
2025-12-23 00:06:17.631 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 00:06:17.631 [info] - Raw (segundos): 1766448377
2025-12-23 00:06:17.631 [info] - Convertido (ms): 1766448377000
2025-12-23 00:06:17.631 [info] - Fecha: 2025-12-23T00:06:17.000Z
2025-12-23 00:06:17.631 [info] - Diferencia: 630 ms
2025-12-23 00:06:17.631 [info] 📋 Manifest construido (merchant_order): id:36675958546;request-id:2b7b77d1-a506-44d4-993a-4825b359f03c;ts:1766448377;
2025-12-23 00:06:17.631 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 00:06:17.631 [error] Manifest usado: id:36675958546;request-id:2b7b77d1-a506-44d4-993a-4825b359f03c;ts:1766448377;
2025-12-23 00:06:17.631 [error] Hash esperado: 4e71d9762e967cf722505a82a58a15181272e9fe4292d366a454d6f48ac0f30d
2025-12-23 00:06:17.631 [error] Hash recibido: 563384fd0ebd685d6a07d579da5f38f27bb53133d01e4c12c970ba27eaa2c8a7
2025-12-23 00:06:17.631 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:17.631 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 00:06:17.631 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:17.798 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 00:06:17.799 [info] 🔍 Query params recibidos: { id: '36675958546', topic: 'merchant_order' }
2025-12-23 00:06:17.799 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-23 00:06:17.799 [info] 🔔 Webhook procesado: {
  id: '36675958546',
  type: 'merchant_order',
  action: null,
  data_id: '36675958546'
}
2025-12-23 00:06:17.799 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order

TERCER LOG :
2025-12-23 00:06:16.676 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.676 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 00:06:16.676 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.676 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 00:06:16.676 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36675958546&topic=merchant_order
2025-12-23 00:06:16.676 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 00:06:16.676 [info] - x-signature: ts=1766448376,v1=259dcf6cd4ba58d28b202a8f8702d130c4c5e92019d45f28511c14407cbfc613
2025-12-23 00:06:16.676 [info] - x-request-id: abc18256-0090-4ba1-9552-f15569113bc2
2025-12-23 00:06:16.676 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-23 00:06:16.677 [info] - content-type: application/json
2025-12-23 00:06:16.677 [info] 📋 [DEBUG] Query params: { id: '36675958546', topic: 'merchant_order' }
2025-12-23 00:06:16.677 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-23 00:06:16.677 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 00:06:16.677 [info] 🔍 Tipo de notificación: merchant_order, ID: 36675958546
2025-12-23 00:06:16.677 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 00:06:16.677 [info] - Raw (segundos): 1766448376
2025-12-23 00:06:16.677 [info] - Convertido (ms): 1766448376000
2025-12-23 00:06:16.677 [info] - Fecha: 2025-12-23T00:06:16.000Z
2025-12-23 00:06:16.677 [info] - Diferencia: 676 ms
2025-12-23 00:06:16.677 [info] 📋 Manifest construido (merchant_order): id:36675958546;request-id:abc18256-0090-4ba1-9552-f15569113bc2;ts:1766448376;
2025-12-23 00:06:16.677 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 00:06:16.678 [error] Manifest usado: id:36675958546;request-id:abc18256-0090-4ba1-9552-f15569113bc2;ts:1766448376;
2025-12-23 00:06:16.678 [error] Hash esperado: e2befc9e90711743ed2b09358f021ffa5a72a8fd073b25cfaa435490a2f98fe7
2025-12-23 00:06:16.678 [error] Hash recibido: 259dcf6cd4ba58d28b202a8f8702d130c4c5e92019d45f28511c14407cbfc613
2025-12-23 00:06:16.678 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.678 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 00:06:16.678 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.861 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 00:06:16.862 [info] 🔍 Query params recibidos: { id: '36675958546', topic: 'merchant_order' }
2025-12-23 00:06:16.862 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-23 00:06:16.862 [info] 🔔 Webhook procesado: {
  id: '36675958546',
  type: 'merchant_order',
  action: null,
  data_id: '36675958546'
}
2025-12-23 00:06:16.862 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order

CUARTO LOG:
2025-12-23 00:06:16.756 [info] 🌍 Ambiente detectado: ✅ PRODUCCIÓN (NODE_ENV=production)
2025-12-23 00:06:16.772 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.772 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 00:06:16.772 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.772 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 00:06:16.772 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?data.id=139102003060&type=payment
2025-12-23 00:06:16.773 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 00:06:16.773 [info] - x-signature: ts=1766448376,v1=6d8ccb786fdb4cb5371a8e847c0078573849757e71596946c11609f203b3ea50
2025-12-23 00:06:16.774 [info] - x-request-id: abc18256-0090-4ba1-9552-f15569113bc2
2025-12-23 00:06:16.774 [info] - user-agent: MercadoPago WebHook v1.0 payment
2025-12-23 00:06:16.774 [info] - content-type: application/json
2025-12-23 00:06:16.775 [info] 📋 [DEBUG] Query params: { 'data.id': '139102003060', type: 'payment' }
2025-12-23 00:06:16.775 [info] 📋 [DEBUG] Tipo de notificación detectado: payment
2025-12-23 00:06:16.775 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 00:06:16.776 [info] 🔍 Tipo de notificación: payment, ID: 139102003060
2025-12-23 00:06:16.776 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 00:06:16.776 [info] - Raw (segundos): 1766448376
2025-12-23 00:06:16.776 [info] - Convertido (ms): 1766448376000
2025-12-23 00:06:16.776 [info] - Fecha: 2025-12-23T00:06:16.000Z
2025-12-23 00:06:16.776 [info] - Diferencia: 775 ms
2025-12-23 00:06:16.776 [info] 📋 Manifest construido (payment): data.id:139102003060;request-id:abc18256-0090-4ba1-9552-f15569113bc2;ts:1766448376;
2025-12-23 00:06:16.776 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 00:06:16.776 [error] Manifest usado: data.id:139102003060;request-id:abc18256-0090-4ba1-9552-f15569113bc2;ts:1766448376;
2025-12-23 00:06:16.776 [error] Hash esperado: 1107259a9962211c48f6bc4fa444e67e25d3670855a8134de59b303c250a87c6
2025-12-23 00:06:16.776 [error] Hash recibido: 6d8ccb786fdb4cb5371a8e847c0078573849757e71596946c11609f203b3ea50
2025-12-23 00:06:16.776 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.776 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 00:06:16.776 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.995 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 00:06:16.997 [info] 🔍 Query params recibidos: { 'data.id': '139102003060', type: 'payment' }
2025-12-23 00:06:16.997 [info] 📦 Body recibido: {
  id: 127547858158,
  type: 'payment',
  action: 'payment.created',
  data_id: '139102003060'
}
2025-12-23 00:06:16.997 [info] 🔔 Webhook procesado: {
  id: 127547858158,
  type: 'payment',
  action: 'payment.created',
  data_id: '139102003060'
}
2025-12-23 00:06:17.183 [info] 🔄 Procesando pago: 139102003060
2025-12-23 00:06:17.183 [info] 🔍 Notificación a procesar: {
  id: 127547858158,
  type: 'payment',
  action: 'payment.created',
  data: { id: '139102003060' }
}
2025-12-23 00:06:17.741 [info] 🔍 Analizando pago para detectar tipo: {
  live_mode: undefined,
  payment_method_id: 'visa',
  transaction_amount: 10,
  payer_email: undefined,
  payment_id: '139102003060',
  is_development_mock: undefined
}
2025-12-23 00:06:17.741 [info] ✅ Pago detectado como REAL
2025-12-23 00:06:17.741 [info] 📊 Tipo de pago: ✅ REAL
2025-12-23 00:06:17.741 [info] 🔍 Buscando datos temporales de la preferencia...
2025-12-23 00:06:17.940 [info] 🔎 Buscando datos temporales con external_reference: 340f7a01-72d8-41b6-8529-d4a8092d0617
2025-12-23 00:06:18.090 [info] ✅ Datos temporales encontrados: {
  temp_order_id: '340f7a01-72d8-41b6-8529-d4a8092d0617',
  customer_email: 'lucasctmn@gmail.com'
}
2025-12-23 00:06:18.090 [info] 🔍 Verificando si ya existe orden con external_reference: 340f7a01-72d8-41b6-8529-d4a8092d0617
2025-12-23 00:06:18.260 [info] 📝 Creando orden real desde datos temporales...
2025-12-23 00:06:18.260 [info] 📧 Email REAL del cliente a guardar: lucasctmn@gmail.com
2025-12-23 00:06:18.260 [info] 📧 Email usado en MP: lucasctmn@gmail.com
2025-12-23 00:06:18.261 [info] 📝 Creando orden con datos del cliente: {
  email: 'lucasctmn@gmail.com',
  name: 'vamo que funciona todo wachoo',
  phone: '313131313131',
  has_shipping_address: true
}
2025-12-23 00:06:18.431 [info] ✅ Orden creada exitosamente: {
  order_id: '148c8cbe-c8a3-45b8-b497-247d1545cad8',
  customer_email: 'lucasctmn@gmail.com',
  customer_name: 'vamo que funciona todo wachoo',
  customer_phone: '313131313131'
}
2025-12-23 00:06:18.748 [info] ✅ Orden real creada con external_reference: 148c8cbe-c8a3-45b8-b497-247d1545cad8
2025-12-23 00:06:18.748 [info] ✅ Email guardado en la orden: lucasctmn@gmail.com
2025-12-23 00:06:18.900 [info] 📝 Actualizando orden con información de pago...
2025-12-23 00:06:18.900 [info] Order ID: 148c8cbe-c8a3-45b8-b497-247d1545cad8
2025-12-23 00:06:18.900 [info] Payment Info: {
  payment_id: '139102003060',
  status: 'approved',
  payment_method_id: 'visa',
  payment_type_id: 'prepaid_card',
  payer_email: 'lucasctmn@gmail.com',
  date_approved: '2025-12-22T20:06:16.000-04:00'
}
2025-12-23 00:06:19.572 [info] ✅ Pago aprobado, marcando orden como pagada
2025-12-23 00:06:19.573 [info] 💰 Marcando orden como pagada: 148c8cbe-c8a3-45b8-b497-247d1545cad8
2025-12-23 00:06:19.726 [info] 📦 Orden encontrada con 1 items
2025-12-23 00:06:19.726 [info] 🔍 Validando disponibilidad de stock...
2025-12-23 00:06:19.727 [info] 🔍 Validando stock para 1 productos...
2025-12-23 00:06:19.901 [info] - Guantes de jardinería : 47 disponible, 1 solicitado
2025-12-23 00:06:19.901 [info] ✅ Validación de stock exitosa
2025-12-23 00:06:19.901 [info] ✅ Stock validado correctamente
2025-12-23 00:06:20.062 [info] ✅ Orden actualizada en BD
2025-12-23 00:06:20.062 [info] 📉 Reduciendo stock de productos...
2025-12-23 00:06:20.062 [info] - Reduciendo 1 unidades de Guantes de jardinería
2025-12-23 00:06:20.538 [info] ✅ Stock reducido exitosamente para todos los productos
2025-12-23 00:06:20.854 [info] ✅ Orden marcada como pagada exitosamente
2025-12-23 00:06:20.854 [info] 🗑️ Marcando para limpiar carrito temporal del cliente
2025-12-23 00:06:21.016 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:21.016 [info] ✅ [WEBHOOK] Procesamiento completado en 4251ms
2025-12-23 00:06:21.016 [info] Order ID: 148c8cbe-c8a3-45b8-b497-247d1545cad8
2025-12-23 00:06:21.016 [info] Payment ID: 139102003060
2025-12-23 00:06:21.016 [info] Status: approved
2025-12-23 00:06:21.016 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUINTO LOG:
2025-12-23 00:06:16.635 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.635 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 00:06:16.635 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.635 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 00:06:16.635 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=139102003060&topic=payment
2025-12-23 00:06:16.635 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 00:06:16.635 [info] - x-signature: ts=1766448376,v1=a6032472cf545f32dcf7a7fac4f8f3fe95c5a53fcdcbd0b3830aa67287a8579e
2025-12-23 00:06:16.635 [info] - x-request-id: abc18256-0090-4ba1-9552-f15569113bc2
2025-12-23 00:06:16.635 [info] - user-agent: MercadoPago Feed v2.0 payment
2025-12-23 00:06:16.635 [info] - content-type: application/json
2025-12-23 00:06:16.636 [info] 📋 [DEBUG] Query params: { id: '139102003060', topic: 'payment' }
2025-12-23 00:06:16.636 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-23 00:06:16.636 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 00:06:16.636 [info] 🔍 Tipo de notificación: unknown, ID: null
2025-12-23 00:06:16.636 [error] ❌ [MP_SIGNATURE] Query params data.id o id faltantes en URL: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=139102003060&topic=payment
2025-12-23 00:06:16.636 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.636 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 00:06:16.636 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:16.802 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 00:06:16.802 [info] 🔍 Query params recibidos: { id: '139102003060', topic: 'payment' }
2025-12-23 00:06:16.802 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-23 00:06:16.802 [info] 🔔 Webhook procesado: {
  id: '139102003060',
  type: 'payment',
  action: null,
  data_id: '139102003060'
}
2025-12-23 00:06:17.045 [info] 🔄 Procesando pago: 139102003060
2025-12-23 00:06:17.045 [info] 🔍 Notificación a procesar: {
  id: '139102003060',
  type: 'payment',
  action: null,
  data: { id: '139102003060' }
}
2025-12-23 00:06:17.606 [info] 🔍 Analizando pago para detectar tipo: {
  live_mode: undefined,
  payment_method_id: 'visa',
  transaction_amount: 10,
  payer_email: undefined,
  payment_id: '139102003060',
  is_development_mock: undefined
}
2025-12-23 00:06:17.606 [info] ✅ Pago detectado como REAL
2025-12-23 00:06:17.607 [info] 📊 Tipo de pago: ✅ REAL
2025-12-23 00:06:17.607 [info] 🔍 Buscando datos temporales de la preferencia...
2025-12-23 00:06:17.795 [info] 🔎 Buscando datos temporales con external_reference: 340f7a01-72d8-41b6-8529-d4a8092d0617
2025-12-23 00:06:17.988 [info] ✅ Datos temporales encontrados: {
  temp_order_id: '340f7a01-72d8-41b6-8529-d4a8092d0617',
  customer_email: 'lucasctmn@gmail.com'
}
2025-12-23 00:06:17.988 [info] 🔍 Verificando si ya existe orden con external_reference: 340f7a01-72d8-41b6-8529-d4a8092d0617
2025-12-23 00:06:18.156 [info] 📝 Creando orden real desde datos temporales...
2025-12-23 00:06:18.156 [info] 📧 Email REAL del cliente a guardar: lucasctmn@gmail.com
2025-12-23 00:06:18.156 [info] 📧 Email usado en MP: lucasctmn@gmail.com
2025-12-23 00:06:18.156 [info] 📝 Creando orden con datos del cliente: {
  email: 'lucasctmn@gmail.com',
  name: 'vamo que funciona todo wachoo',
  phone: '313131313131',
  has_shipping_address: true
}
2025-12-23 00:06:18.359 [info] ✅ Orden creada exitosamente: {
  order_id: 'f0b29459-850b-4c80-bd97-163b1a9bbd07',
  customer_email: 'lucasctmn@gmail.com',
  customer_name: 'vamo que funciona todo wachoo',
  customer_phone: '313131313131'
}
2025-12-23 00:06:18.715 [info] ✅ Orden real creada con external_reference: f0b29459-850b-4c80-bd97-163b1a9bbd07
2025-12-23 00:06:18.715 [info] ✅ Email guardado en la orden: lucasctmn@gmail.com
2025-12-23 00:06:18.904 [info] 📝 Actualizando orden con información de pago...
2025-12-23 00:06:18.904 [info] Order ID: f0b29459-850b-4c80-bd97-163b1a9bbd07
2025-12-23 00:06:18.904 [info] Payment Info: {
  payment_id: '139102003060',
  status: 'approved',
  payment_method_id: 'visa',
  payment_type_id: 'prepaid_card',
  payer_email: 'lucasctmn@gmail.com',
  date_approved: '2025-12-22T20:06:16.000-04:00'
}
2025-12-23 00:06:19.259 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:19.259 [error] ❌ [ORDER_SERVICE] Error updating payment info
2025-12-23 00:06:19.259 [error] Order ID: f0b29459-850b-4c80-bd97-163b1a9bbd07
2025-12-23 00:06:19.259 [error] Payment Data: {
  "payment_id": "139102003060",
  "payment_status": "approved",
  "metodo_pago": "visa",
  "email_comprador": "lucasctmn@gmail.com",
  "fecha_pago": "2025-12-22T20:06:16.000-04:00",
  "payment_type": "prepaid_card",
  "merchant_order_id": "36675958546"
}
2025-12-23 00:06:19.259 [error] Update Data: {
  "payment_id": "139102003060",
  "payment_status": "approved",
  "metodo_pago": "visa",
  "email_comprador": "lucasctmn@gmail.com",
  "fecha_pago": "2025-12-22T20:06:16.000-04:00",
  "payment_type": "prepaid_card",
  "merchant_order_id": "36675958546",
  "updated_at": "2025-12-23T00:06:19.091Z"
}
2025-12-23 00:06:19.259 [error] Supabase Error: {
  "code": "23505",
  "details": null,
  "hint": null,
  "message": "duplicate key value violates unique constraint \"orders_payment_id_key\""
}
2025-12-23 00:06:19.259 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:19.259 [error] Error updating payment info: Error: Error al actualizar información de pago: duplicate key value violates unique constraint "orders_payment_id_key"
    at Object.updatePaymentInfo (/var/task/.next/server/chunks/595.js:11:4514)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async y (/var/task/.next/server/app/api/mercadopago/webhook/route.js:1:11563)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25561)
    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)
    at async r9.renderToResponseWithComponentsImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:508)
    at async r9.renderPageComponent (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5102)
2025-12-23 00:06:19.259 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:19.259 [error] ❌ [WEBHOOK] Error después de 2626ms
2025-12-23 00:06:19.259 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:19.259 [error] Error procesando webhook: Error: Error al actualizar información de pago: duplicate key value violates unique constraint "orders_payment_id_key"
    at Object.updatePaymentInfo (/var/task/.next/server/chunks/595.js:11:4514)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async y (/var/task/.next/server/app/api/mercadopago/webhook/route.js:1:11563)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25561)
    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)
    at async r9.renderToResponseWithComponentsImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:508)
    at async r9.renderPageComponent (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5102)


SEXTO LOG:

2025-12-23 00:06:15.082 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:15.083 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-23 00:06:15.083 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:15.083 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-23 00:06:15.083 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36675958546&topic=merchant_order
2025-12-23 00:06:15.083 [info] 📋 [DEBUG] Headers recibidos:
2025-12-23 00:06:15.083 [info] - x-signature: ts=1766448374,v1=617434eb24a9cc3f7d378d3b69eb7f4b607299a025af8d73e9afda40928ad270
2025-12-23 00:06:15.083 [info] - x-request-id: 554acd02-1ef1-4182-bf64-541164798243
2025-12-23 00:06:15.083 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-23 00:06:15.083 [info] - content-type: application/json
2025-12-23 00:06:15.084 [info] 📋 [DEBUG] Query params: { id: '36675958546', topic: 'merchant_order' }
2025-12-23 00:06:15.084 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-23 00:06:15.084 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-23 00:06:15.084 [info] 🔍 Tipo de notificación: merchant_order, ID: 36675958546
2025-12-23 00:06:15.084 [info] 🕐 [MP_SIGNATURE] Timestamp parseado:
2025-12-23 00:06:15.084 [info] - Raw (segundos): 1766448374
2025-12-23 00:06:15.084 [info] - Convertido (ms): 1766448374000
2025-12-23 00:06:15.085 [info] - Fecha: 2025-12-23T00:06:14.000Z
2025-12-23 00:06:15.085 [info] - Diferencia: 1084 ms
2025-12-23 00:06:15.085 [info] 📋 Manifest construido (merchant_order): id:36675958546;request-id:554acd02-1ef1-4182-bf64-541164798243;ts:1766448374;
2025-12-23 00:06:15.085 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-23 00:06:15.085 [error] Manifest usado: id:36675958546;request-id:554acd02-1ef1-4182-bf64-541164798243;ts:1766448374;
2025-12-23 00:06:15.085 [error] Hash esperado: 90d698902e538a323549169b6d9f0364fb9217f38cd24901b8ea39a5b1fc67aa
2025-12-23 00:06:15.085 [error] Hash recibido: 617434eb24a9cc3f7d378d3b69eb7f4b607299a025af8d73e9afda40928ad270
2025-12-23 00:06:15.086 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:15.086 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-23 00:06:15.086 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-23 00:06:15.407 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-23 00:06:15.408 [info] 🔍 Query params recibidos: { id: '36675958546', topic: 'merchant_order' }
2025-12-23 00:06:15.408 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-23 00:06:15.408 [info] 🔔 Webhook procesado: {
  id: '36675958546',
  type: 'merchant_order',
  action: null,
  data_id: '36675958546'
}
2025-12-23 00:06:15.408 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order
    ULTIOMO LOG:
2025-12-23 00:05:49.509 [info] 🌍 Ambiente detectado: ✅ PRODUCCIÓN (NODE_ENV=production)
2025-12-23 00:05:49.521 [info] 🚀 === INICIO CREATE PREFERENCE ===
2025-12-23 00:05:49.521 [info] 📥 Parseando body del request...
2025-12-23 00:05:49.522 [info] ✅ Body parseado: {
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
  "customer_name": "vamo que funciona todo wachoo",
  "customer_phone": "313131313131",
  "shipping_method": "pickup"
}
2025-12-23 00:05:49.523 [info] 🔍 Validando stock de productos...
2025-12-23 00:05:49.523 [info] - Validando stock para: Guantes de jardinería  (ID: e52b9adf-6de3-4216-a1fa-771780d9dec4, Cantidad: 1)
2025-12-23 00:05:49.713 [info] - Stock válido para Guantes de jardinería : { isValid: true, availableStock: 47, message: '' }
2025-12-23 00:05:49.713 [info] 🧮 Calculando total de items...
2025-12-23 00:05:49.714 [info] ✅ Total calculado: 10
2025-12-23 00:05:49.714 [info] 📧 Emails recibidos: {
  real: 'lucasctmn@gmail.com',
  for_mp: 'lucasctmn@gmail.com',
  are_different: false
}
2025-12-23 00:05:49.714 [info] 💳 Creando preferencia de pago en MP...
2025-12-23 00:05:49.715 [info] 📤 Enviando datos a Mercado Pago: {
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
    "name": "vamo",
    "surname": "que funciona todo wachoo",
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
  "external_reference": "340f7a01-72d8-41b6-8529-d4a8092d0617",
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
    "order_id": "340f7a01-72d8-41b6-8529-d4a8092d0617",
    "customer_email": "lucasctmn@gmail.com",
    "created_at": "2025-12-23T00:05:49.715Z"
  }
}
2025-12-23 00:05:49.715 [info] 🔒 Configuración de métodos de pago:
2025-12-23 00:05:49.715 [info] - excludedPaymentMethods: [
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
2025-12-23 00:05:49.715 [info] - excludedPaymentTypes: [ { id: 'ticket' }, { id: 'atm' } ]
2025-12-23 00:05:49.715 [info] - payment_methods config: {
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
2025-12-23 00:05:49.715 [info] 📋 Preferencia completa a enviar:
2025-12-23 00:05:49.715 [info] {
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
    "name": "vamo",
    "surname": "que funciona todo wachoo",
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
  "external_reference": "340f7a01-72d8-41b6-8529-d4a8092d0617",
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
    "order_id": "340f7a01-72d8-41b6-8529-d4a8092d0617",
    "customer_email": "lucasctmn@gmail.com",
    "created_at": "2025-12-23T00:05:49.715Z"
  }
}
2025-12-23 00:05:50.071 [info] 📨 Respuesta de Mercado Pago: {
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
  "date_created": "2025-12-22T20:05:50.032-04:00",
  "date_of_expiration": null,
  "expiration_date_from": null,
  "expiration_date_to": null,
  "expires": false,
  "external_reference": "340f7a01-72d8-41b6-8529-d4a8092d0617",
  "id": "174087864-563a4fff-0482-40d6-b77c-28772b15825f",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-563a4fff-0482-40d6-b77c-28772b15825f",
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
    "created_at": "2025-12-23T00:05:49.715Z",
    "customer_email": "lucasctmn@gmail.com",
    "order_id": "340f7a01-72d8-41b6-8529-d4a8092d0617"
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
    "name": "vamo",
    "surname": "que funciona todo wachoo",
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
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-563a4fff-0482-40d6-b77c-28772b15825f",
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
        "Tue, 23 Dec 2025 00:05:50 GMT"
      ],
      "content-type": [
        "application/json; charset=utf-8"
      ],
      "content-length": [
        "1158"
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
        "924d1a56-bc29-4fa5-896f-5577c7524ad1"
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
2025-12-23 00:05:50.270 [info] ✅ Preferencia de MP creada: {
  id: '174087864-563a4fff-0482-40d6-b77c-28772b15825f',
  init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-563a4fff-0482-40d6-b77c-28772b15825f'
}
2025-12-23 00:05:50.270 [info] 💾 Almacenando datos temporales para webhook...
2025-12-23 00:05:50.448 [info] ✅ Datos temporales almacenados para webhook (email REAL guardado)
2025-12-23 00:05:50.448 [info] 🎉 === PREFERENCIA CREADA EXITOSAMENTE (SIN ORDEN AÚN) ===
2025-12-23 00:05:50.448 [info] ✅ Datos finales: {
  temp_order_id: '340f7a01-72d8-41b6-8529-d4a8092d0617',
  preference_id: '174087864-563a4fff-0482-40d6-b77c-28772b15825f',
  init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-563a4fff-0482-40d6-b77c-28772b15825f'
}
