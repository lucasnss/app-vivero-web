2025-12-20 13:32:13.171 [info] 🌍 Ambiente detectado: ✅ PRODUCCIÓN (NODE_ENV=production)
2025-12-20 13:32:13.177 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:13.177 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-20 13:32:13.177 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:13.177 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-20 13:32:13.177 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=138095816241&topic=payment
2025-12-20 13:32:13.177 [info] 📋 [DEBUG] Headers recibidos:
2025-12-20 13:32:13.177 [info] - x-signature: ts=1766237532,v1=669c5f9414da7e17f92a4b13f656f1459f687de95420521d3adc02468a9c4950
2025-12-20 13:32:13.177 [info] - x-request-id: b18ae5fc-c32d-4ed5-a771-ca8c2cc33bd5
2025-12-20 13:32:13.179 [info] - user-agent: MercadoPago Feed v2.0 payment
2025-12-20 13:32:13.179 [info] - content-type: application/json
2025-12-20 13:32:13.179 [info] 📋 [DEBUG] Query params: { id: '138095816241', topic: 'payment' }
2025-12-20 13:32:13.179 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-20 13:32:13.179 [error] ❌ [MP_SIGNATURE] Query param data.id faltante en URL: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=138095816241&topic=payment
2025-12-20 13:32:13.179 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:13.179 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-20 13:32:13.179 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:13.397 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-20 13:32:13.402 [info] 🔍 Query params recibidos: { id: '138095816241', topic: 'payment' }
2025-12-20 13:32:13.402 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-20 13:32:13.402 [info] 🔔 Webhook procesado: {
  id: '138095816241',
  type: 'payment',
  action: null,
  data_id: '138095816241'
}
2025-12-20 13:32:13.602 [info] 🔄 Procesando pago: 138095816241
2025-12-20 13:32:13.602 [info] 🔍 Notificación a procesar: {
  id: '138095816241',
  type: 'payment',
  action: null,
  data: { id: '138095816241' }
}
2025-12-20 13:32:14.226 [info] 🔍 Analizando pago para detectar tipo: {
  live_mode: undefined,
  payment_method_id: 'visa',
  transaction_amount: 10,
  payer_email: undefined,
  payment_id: '138095816241',
  is_development_mock: undefined
}
2025-12-20 13:32:14.226 [info] ✅ Pago detectado como REAL
2025-12-20 13:32:14.226 [info] 📊 Tipo de pago: ✅ REAL
2025-12-20 13:32:14.226 [info] 🔍 Buscando datos temporales de la preferencia...
2025-12-20 13:32:14.402 [info] 🔎 Buscando datos temporales con external_reference: d802be76-6e51-4399-be41-0592e64f89d5
2025-12-20 13:32:14.580 [info] ✅ Datos temporales encontrados: {
  temp_order_id: 'd802be76-6e51-4399-be41-0592e64f89d5',
  customer_email: 'lucasctmn@gmail.com'
}
2025-12-20 13:32:14.580 [info] 🔍 Verificando si ya existe orden con external_reference: d802be76-6e51-4399-be41-0592e64f89d5
2025-12-20 13:32:14.748 [info] 📝 Creando orden real desde datos temporales...
2025-12-20 13:32:14.748 [info] 📧 Email REAL del cliente a guardar: lucasctmn@gmail.com
2025-12-20 13:32:14.748 [info] 📧 Email usado en MP: lucasctmn@gmail.com
2025-12-20 13:32:14.749 [info] 📝 Creando orden con datos del cliente: {
  email: 'lucasctmn@gmail.com',
  name: 'Prueba final andando todo',
  phone: '3818383812',
  has_shipping_address: true
}
2025-12-20 13:32:14.907 [info] ✅ Orden creada exitosamente: {
  order_id: 'ab9c589c-16bf-4359-b2e5-8d4bb343a89c',
  customer_email: 'lucasctmn@gmail.com',
  customer_name: 'Prueba final andando todo',
  customer_phone: '3818383812'
}
2025-12-20 13:32:15.219 [info] ✅ Orden real creada con external_reference: ab9c589c-16bf-4359-b2e5-8d4bb343a89c
2025-12-20 13:32:15.219 [info] ✅ Email guardado en la orden: lucasctmn@gmail.com
2025-12-20 13:32:15.375 [info] 📝 Actualizando orden con información de pago...
2025-12-20 13:32:15.375 [info] Order ID: ab9c589c-16bf-4359-b2e5-8d4bb343a89c
2025-12-20 13:32:15.377 [info] Payment Info: {
  payment_id: '138095816241',
  status: 'approved',
  payment_method_id: 'visa',
  payment_type_id: 'prepaid_card',
  payer_email: 'lucasctmn@gmail.com',
  date_approved: '2025-12-20T09:32:12.000-04:00'
}
2025-12-20 13:32:15.693 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:15.693 [error] ❌ [ORDER_SERVICE] Error updating payment info
2025-12-20 13:32:15.693 [error] Order ID: ab9c589c-16bf-4359-b2e5-8d4bb343a89c
2025-12-20 13:32:15.693 [error] Payment Data: {
  "payment_id": "138095816241",
  "payment_status": "approved",
  "metodo_pago": "visa",
  "email_comprador": "lucasctmn@gmail.com",
  "fecha_pago": "2025-12-20T09:32:12.000-04:00",
  "payment_type": "prepaid_card",
  "merchant_order_id": "36570309465"
}
2025-12-20 13:32:15.693 [error] Update Data: {
  "payment_id": "138095816241",
  "payment_status": "approved",
  "metodo_pago": "visa",
  "email_comprador": "lucasctmn@gmail.com",
  "fecha_pago": "2025-12-20T09:32:12.000-04:00",
  "payment_type": "prepaid_card",
  "merchant_order_id": "36570309465",
  "updated_at": "2025-12-20T13:32:15.532Z"
}
2025-12-20 13:32:15.693 [error] Supabase Error: {
  "code": "23505",
  "details": null,
  "hint": null,
  "message": "duplicate key value violates unique constraint \"orders_payment_id_key\""
}
2025-12-20 13:32:15.693 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:15.694 [error] Error updating payment info: Error: Error al actualizar información de pago: duplicate key value violates unique constraint "orders_payment_id_key"
    at Object.updatePaymentInfo (/var/task/.next/server/chunks/595.js:11:4514)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async y (/var/task/.next/server/app/api/mercadopago/webhook/route.js:1:10838)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25561)
    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)
    at async r9.renderToResponseWithComponentsImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:508)
    at async r9.renderPageComponent (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5102)
2025-12-20 13:32:15.694 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:15.694 [error] ❌ [WEBHOOK] Error después de 2517ms
2025-12-20 13:32:15.694 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:15.694 [error] Error procesando webhook: Error: Error al actualizar información de pago: duplicate key value violates unique constraint "orders_payment_id_key"
    at Object.updatePaymentInfo (/var/task/.next/server/chunks/595.js:11:4514)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async y (/var/task/.next/server/app/api/mercadopago/webhook/route.js:1:10838)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25561)
    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)
    at async r9.renderToResponseWithComponentsImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:508)
    at async r9.renderPageComponent (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5102)





---------------------------------------------------------------------
2025-12-20 13:32:13.096 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:13.096 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-20 13:32:13.096 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:13.096 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-20 13:32:13.096 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?data.id=138095816241&type=payment
2025-12-20 13:32:13.096 [info] 📋 [DEBUG] Headers recibidos:
2025-12-20 13:32:13.096 [info] - x-signature: ts=1766237532,v1=94da9239a5eb667f599a3cedf868a41be435b04f045f61c1c816036ab2f49136
2025-12-20 13:32:13.096 [info] - x-request-id: b18ae5fc-c32d-4ed5-a771-ca8c2cc33bd5
2025-12-20 13:32:13.096 [info] - user-agent: MercadoPago WebHook v1.0 payment
2025-12-20 13:32:13.096 [info] - content-type: application/json
2025-12-20 13:32:13.096 [info] 📋 [DEBUG] Query params: { 'data.id': '138095816241', type: 'payment' }
2025-12-20 13:32:13.096 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-20 13:32:13.096 [error] ❌ [MP_SIGNATURE] Timestamp del webhook muy antiguo (posible replay attack)
2025-12-20 13:32:13.096 [error] Timestamp mensaje: 1970-01-21T10:37:17.532Z
2025-12-20 13:32:13.096 [error] Timestamp actual: 2025-12-20T13:32:13.096Z
2025-12-20 13:32:13.097 [error] Diferencia (ms): 1764471295564
2025-12-20 13:32:13.097 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:13.097 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-20 13:32:13.097 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:13.289 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-20 13:32:13.290 [info] 🔍 Query params recibidos: { 'data.id': '138095816241', type: 'payment' }
2025-12-20 13:32:13.290 [info] 📦 Body recibido: {
  id: 127467597250,
  type: 'payment',
  action: 'payment.created',
  data_id: '138095816241'
}
2025-12-20 13:32:13.290 [info] 🔔 Webhook procesado: {
  id: 127467597250,
  type: 'payment',
  action: 'payment.created',
  data_id: '138095816241'
}
2025-12-20 13:32:13.508 [info] 🔄 Procesando pago: 138095816241
2025-12-20 13:32:13.508 [info] 🔍 Notificación a procesar: {
  id: 127467597250,
  type: 'payment',
  action: 'payment.created',
  data: { id: '138095816241' }
}
2025-12-20 13:32:14.116 [info] 🔍 Analizando pago para detectar tipo: {
  live_mode: undefined,
  payment_method_id: 'visa',
  transaction_amount: 10,
  payer_email: undefined,
  payment_id: '138095816241',
  is_development_mock: undefined
}
2025-12-20 13:32:14.116 [info] ✅ Pago detectado como REAL
2025-12-20 13:32:14.116 [info] 📊 Tipo de pago: ✅ REAL
2025-12-20 13:32:14.116 [info] 🔍 Buscando datos temporales de la preferencia...
2025-12-20 13:32:14.308 [info] 🔎 Buscando datos temporales con external_reference: d802be76-6e51-4399-be41-0592e64f89d5
2025-12-20 13:32:14.520 [info] ✅ Datos temporales encontrados: {
  temp_order_id: 'd802be76-6e51-4399-be41-0592e64f89d5',
  customer_email: 'lucasctmn@gmail.com'
}
2025-12-20 13:32:14.520 [info] 🔍 Verificando si ya existe orden con external_reference: d802be76-6e51-4399-be41-0592e64f89d5
2025-12-20 13:32:14.686 [info] 📝 Creando orden real desde datos temporales...
2025-12-20 13:32:14.686 [info] 📧 Email REAL del cliente a guardar: lucasctmn@gmail.com
2025-12-20 13:32:14.686 [info] 📧 Email usado en MP: lucasctmn@gmail.com
2025-12-20 13:32:14.686 [info] 📝 Creando orden con datos del cliente: {
  email: 'lucasctmn@gmail.com',
  name: 'Prueba final andando todo',
  phone: '3818383812',
  has_shipping_address: true
}
2025-12-20 13:32:14.878 [info] ✅ Orden creada exitosamente: {
  order_id: '48e9e9b1-aa82-429d-b98e-1564e45ea85f',
  customer_email: 'lucasctmn@gmail.com',
  customer_name: 'Prueba final andando todo',
  customer_phone: '3818383812'
}
2025-12-20 13:32:15.195 [info] ✅ Orden real creada con external_reference: 48e9e9b1-aa82-429d-b98e-1564e45ea85f
2025-12-20 13:32:15.195 [info] ✅ Email guardado en la orden: lucasctmn@gmail.com
2025-12-20 13:32:15.369 [info] 📝 Actualizando orden con información de pago...
2025-12-20 13:32:15.369 [info] Order ID: 48e9e9b1-aa82-429d-b98e-1564e45ea85f
2025-12-20 13:32:15.369 [info] Payment Info: {
  payment_id: '138095816241',
  status: 'approved',
  payment_method_id: 'visa',
  payment_type_id: 'prepaid_card',
  payer_email: 'lucasctmn@gmail.com',
  date_approved: '2025-12-20T09:32:12.000-04:00'
}
2025-12-20 13:32:15.965 [info] ✅ Pago aprobado, marcando orden como pagada
2025-12-20 13:32:15.965 [info] 💰 Marcando orden como pagada: 48e9e9b1-aa82-429d-b98e-1564e45ea85f
2025-12-20 13:32:16.111 [info] 📦 Orden encontrada con 1 items
2025-12-20 13:32:16.111 [info] 🔍 Validando disponibilidad de stock...
2025-12-20 13:32:16.111 [info] 🔍 Validando stock para 1 productos...
2025-12-20 13:32:16.265 [info] - Guantes de jardinería : 51 disponible, 1 solicitado
2025-12-20 13:32:16.265 [info] ✅ Validación de stock exitosa
2025-12-20 13:32:16.265 [info] ✅ Stock validado correctamente
2025-12-20 13:32:16.413 [info] ✅ Orden actualizada en BD
2025-12-20 13:32:16.413 [info] 📉 Reduciendo stock de productos...
2025-12-20 13:32:16.413 [info] - Reduciendo 1 unidades de Guantes de jardinería
2025-12-20 13:32:16.908 [info] ✅ Stock reducido exitosamente para todos los productos
2025-12-20 13:32:17.215 [info] ✅ Orden marcada como pagada exitosamente
2025-12-20 13:32:17.215 [info] 🗑️ Marcando para limpiar carrito temporal del cliente
2025-12-20 13:32:17.364 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:17.364 [info] ✅ [WEBHOOK] Procesamiento completado en 4269ms
2025-12-20 13:32:17.365 [info] Order ID: 48e9e9b1-aa82-429d-b98e-1564e45ea85f
2025-12-20 13:32:17.365 [info] Payment ID: 138095816241
2025-12-20 13:32:17.365 [info] Status: approved
2025-12-20 13:32:17.365 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



---------------------------------------------------------------------
2025-12-20 13:32:10.843 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:10.843 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-20 13:32:10.843 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:10.843 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-20 13:32:10.843 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36570309465&topic=merchant_order
2025-12-20 13:32:10.843 [info] 📋 [DEBUG] Headers recibidos:
2025-12-20 13:32:10.843 [info] - x-signature: ts=1766237530,v1=f40c0eb7238c1b41f4a1b4cadcfdea0efe65d318238c9634a29f1f95da73cd5c
2025-12-20 13:32:10.843 [info] - x-request-id: 226281c8-c43f-475b-962d-2b93de9d9c58
2025-12-20 13:32:10.843 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-20 13:32:10.843 [info] - content-type: application/json
2025-12-20 13:32:10.843 [info] 📋 [DEBUG] Query params: { id: '36570309465', topic: 'merchant_order' }
2025-12-20 13:32:10.844 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-20 13:32:10.844 [error] ❌ [MP_SIGNATURE] Query param data.id faltante en URL: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36570309465&topic=merchant_order
2025-12-20 13:32:10.844 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:10.844 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-20 13:32:10.844 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-20 13:32:11.148 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-20 13:32:11.149 [info] 🔍 Query params recibidos: { id: '36570309465', topic: 'merchant_order' }
2025-12-20 13:32:11.149 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-20 13:32:11.149 [info] 🔔 Webhook procesado: {
  id: '36570309465',
  type: 'merchant_order',
  action: null,
  data_id: '36570309465'
}
2025-12-20 13:32:11.149 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order