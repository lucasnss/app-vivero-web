2025-12-22 21:32:49.483 [info] 🌍 Ambiente detectado: ✅ PRODUCCIÓN (NODE_ENV=production)
2025-12-22 21:32:49.486 [info] 🚀 === INICIO CREATE PREFERENCE ===
2025-12-22 21:32:49.486 [info] 📥 Parseando body del request...
2025-12-22 21:32:49.487 [info] ✅ Body parseado: {
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
  "customer_name": "lucas funca?",
  "customer_phone": "313131313131",
  "shipping_method": "pickup"
}
2025-12-22 21:32:49.487 [info] 🔍 Validando stock de productos...
2025-12-22 21:32:49.487 [info] - Validando stock para: Guantes de jardinería  (ID: e52b9adf-6de3-4216-a1fa-771780d9dec4, Cantidad: 1)
2025-12-22 21:32:49.712 [info] - Stock válido para Guantes de jardinería : { isValid: true, availableStock: 49, message: '' }
2025-12-22 21:32:49.712 [info] 🧮 Calculando total de items...
2025-12-22 21:32:49.712 [info] ✅ Total calculado: 10
2025-12-22 21:32:49.713 [info] 📧 Emails recibidos: {
  real: 'lucasctmn@gmail.com',
  for_mp: 'lucasctmn@gmail.com',
  are_different: false
}
2025-12-22 21:32:49.713 [info] 💳 Creando preferencia de pago en MP...
2025-12-22 21:32:49.713 [info] 📤 Enviando datos a Mercado Pago: {
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
    "name": "lucas",
    "surname": "funca?",
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
  "external_reference": "a2ac74b1-3202-46b3-bba9-8d0639960aac",
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
    "order_id": "a2ac74b1-3202-46b3-bba9-8d0639960aac",
    "customer_email": "lucasctmn@gmail.com",
    "created_at": "2025-12-22T21:32:49.712Z"
  }
}
2025-12-22 21:32:49.713 [info] 🔒 Configuración de métodos de pago:
2025-12-22 21:32:49.714 [info] - excludedPaymentMethods: [
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
2025-12-22 21:32:49.714 [info] - excludedPaymentTypes: [ { id: 'ticket' }, { id: 'atm' } ]
2025-12-22 21:32:49.715 [info] - payment_methods config: {
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
2025-12-22 21:32:49.715 [info] 📋 Preferencia completa a enviar:
2025-12-22 21:32:49.715 [info] {
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
    "name": "lucas",
    "surname": "funca?",
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
  "external_reference": "a2ac74b1-3202-46b3-bba9-8d0639960aac",
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
    "order_id": "a2ac74b1-3202-46b3-bba9-8d0639960aac",
    "customer_email": "lucasctmn@gmail.com",
    "created_at": "2025-12-22T21:32:49.712Z"
  }
}
2025-12-22 21:32:50.040 [info] 📨 Respuesta de Mercado Pago: {
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
  "date_created": "2025-12-22T17:32:49.997-04:00",
  "date_of_expiration": null,
  "expiration_date_from": null,
  "expiration_date_to": null,
  "expires": false,
  "external_reference": "a2ac74b1-3202-46b3-bba9-8d0639960aac",
  "id": "174087864-87c5ba57-150d-4408-a787-7db4e9789b2a",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-87c5ba57-150d-4408-a787-7db4e9789b2a",
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
    "created_at": "2025-12-22T21:32:49.712Z",
    "customer_email": "lucasctmn@gmail.com",
    "order_id": "a2ac74b1-3202-46b3-bba9-8d0639960aac"
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
    "name": "lucas",
    "surname": "funca?",
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
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-87c5ba57-150d-4408-a787-7db4e9789b2a",
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
        "Mon, 22 Dec 2025 21:32:50 GMT"
      ],
      "content-type": [
        "application/json; charset=utf-8"
      ],
      "content-length": [
        "1139"
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
        "17dde978-b176-417f-a6b9-f49ef18808c6"
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
2025-12-22 21:32:50.255 [info] ✅ Preferencia de MP creada: {
  id: '174087864-87c5ba57-150d-4408-a787-7db4e9789b2a',
  init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-87c5ba57-150d-4408-a787-7db4e9789b2a'
}
2025-12-22 21:32:50.255 [info] 💾 Almacenando datos temporales para webhook...
2025-12-22 21:32:50.472 [info] ✅ Datos temporales almacenados para webhook (email REAL guardado)
2025-12-22 21:32:50.472 [info] 🎉 === PREFERENCIA CREADA EXITOSAMENTE (SIN ORDEN AÚN) ===
2025-12-22 21:32:50.472 [info] ✅ Datos finales: {
  temp_order_id: 'a2ac74b1-3202-46b3-bba9-8d0639960aac',
  preference_id: '174087864-87c5ba57-150d-4408-a787-7db4e9789b2a',
  init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=174087864-87c5ba57-150d-4408-a787-7db4e9789b2a'
}
-------------------------------------------------------------------------- OTRO LOG DESDE AQUI--------------------------------------------------
2025-12-22 21:33:21.370 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:21.370 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-22 21:33:21.370 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:21.370 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-22 21:33:21.370 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36670513876&topic=merchant_order
2025-12-22 21:33:21.370 [info] 📋 [DEBUG] Headers recibidos:
2025-12-22 21:33:21.370 [info] - x-signature: ts=1766439200,v1=cf6dd6f3614ddeb0b4d2e2d403daa1247fb23f1ba1e4947d65b64486039a80ab
2025-12-22 21:33:21.370 [info] - x-request-id: fb9cf94a-1767-46f3-8b30-da58714b4151
2025-12-22 21:33:21.370 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-22 21:33:21.370 [info] - content-type: application/json
2025-12-22 21:33:21.371 [info] 📋 [DEBUG] Query params: { id: '36670513876', topic: 'merchant_order' }
2025-12-22 21:33:21.371 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-22 21:33:21.371 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-22 21:33:21.371 [info] 🔍 Query param detectado: 36670513876
2025-12-22 21:33:21.371 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-22 21:33:21.372 [error] Manifest usado: id:36670513876;request-id:fb9cf94a-1767-46f3-8b30-da58714b4151;ts:1766439200;
2025-12-22 21:33:21.372 [error] Hash esperado: 34eb8ed2d8ca391994c3ffd4648494cafe3d4f989476f66040540b790bb9a839
2025-12-22 21:33:21.372 [error] Hash recibido: cf6dd6f3614ddeb0b4d2e2d403daa1247fb23f1ba1e4947d65b64486039a80ab
2025-12-22 21:33:21.372 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:21.372 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-22 21:33:21.372 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:21.594 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-22 21:33:21.594 [info] 🔍 Query params recibidos: { id: '36670513876', topic: 'merchant_order' }
2025-12-22 21:33:21.594 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-22 21:33:21.594 [info] 🔔 Webhook procesado: {
  id: '36670513876',
  type: 'merchant_order',
  action: null,
  data_id: '36670513876'
}
2025-12-22 21:33:21.594 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order

-------------------------------------------------------------------------- OTRO LOG DESDE AQUI--------------------------------------------------

2025-12-22 21:33:22.803 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:22.803 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-22 21:33:22.803 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:22.803 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-22 21:33:22.803 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?data.id=139077673662&type=payment
2025-12-22 21:33:22.803 [info] 📋 [DEBUG] Headers recibidos:
2025-12-22 21:33:22.803 [info] - x-signature: ts=1766439202,v1=e8927fa5d9bf9af10c8078c0c862f9d65c4b8100242dbbf1fd80edd868dc8fc4
2025-12-22 21:33:22.803 [info] - x-request-id: 545aef6f-315e-41f8-a93f-6b092565f41d
2025-12-22 21:33:22.803 [info] - user-agent: MercadoPago WebHook v1.0 payment
2025-12-22 21:33:22.803 [info] - content-type: application/json
2025-12-22 21:33:22.804 [info] 📋 [DEBUG] Query params: { 'data.id': '139077673662', type: 'payment' }
2025-12-22 21:33:22.804 [info] 📋 [DEBUG] Tipo de notificación detectado: payment
2025-12-22 21:33:22.804 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-22 21:33:22.804 [info] 🔍 Query param detectado: 139077673662
2025-12-22 21:33:22.804 [info] ✅ [MP_SIGNATURE] Firma de MercadoPago validada correctamente
2025-12-22 21:33:22.804 [info] data.id: 139077673662
2025-12-22 21:33:22.804 [info] request-id: 545aef6f-315e-41f8-a93f-6b092565f41d
2025-12-22 21:33:22.804 [info] ✅ [WEBHOOK] Firma validada correctamente
2025-12-22 21:33:22.805 [info] 🔍 Query params recibidos: { 'data.id': '139077673662', type: 'payment' }
2025-12-22 21:33:22.805 [info] 📦 Body recibido: {
  id: 127542822842,
  type: 'payment',
  action: 'payment.created',
  data_id: '139077673662'
}
2025-12-22 21:33:22.805 [info] 🔔 Webhook procesado: {
  id: 127542822842,
  type: 'payment',
  action: 'payment.created',
  data_id: '139077673662'
}
2025-12-22 21:33:23.041 [info] 🔄 Procesando pago: 139077673662
2025-12-22 21:33:23.041 [info] 🔍 Notificación a procesar: {
  id: 127542822842,
  type: 'payment',
  action: 'payment.created',
  data: { id: '139077673662' }
}
2025-12-22 21:33:23.611 [info] 🔍 Analizando pago para detectar tipo: {
  live_mode: undefined,
  payment_method_id: 'visa',
  transaction_amount: 10,
  payer_email: undefined,
  payment_id: '139077673662',
  is_development_mock: undefined
}
2025-12-22 21:33:23.611 [info] ✅ Pago detectado como REAL
2025-12-22 21:33:23.611 [info] 📊 Tipo de pago: ✅ REAL
2025-12-22 21:33:23.611 [info] 🔍 Buscando datos temporales de la preferencia...
2025-12-22 21:33:23.811 [info] 🔎 Buscando datos temporales con external_reference: a2ac74b1-3202-46b3-bba9-8d0639960aac
2025-12-22 21:33:24.012 [info] ✅ Datos temporales encontrados: {
  temp_order_id: 'a2ac74b1-3202-46b3-bba9-8d0639960aac',
  customer_email: 'lucasctmn@gmail.com'
}
2025-12-22 21:33:24.012 [info] 🔍 Verificando si ya existe orden con external_reference: a2ac74b1-3202-46b3-bba9-8d0639960aac
2025-12-22 21:33:24.186 [info] 📝 Creando orden real desde datos temporales...
2025-12-22 21:33:24.186 [info] 📧 Email REAL del cliente a guardar: lucasctmn@gmail.com
2025-12-22 21:33:24.186 [info] 📧 Email usado en MP: lucasctmn@gmail.com
2025-12-22 21:33:24.187 [info] 📝 Creando orden con datos del cliente: {
  email: 'lucasctmn@gmail.com',
  name: 'lucas funca?',
  phone: '313131313131',
  has_shipping_address: true
}
2025-12-22 21:33:24.378 [info] ✅ Orden creada exitosamente: {
  order_id: '9aa6594f-6b6a-4a34-9e24-ea2de8b606b5',
  customer_email: 'lucasctmn@gmail.com',
  customer_name: 'lucas funca?',
  customer_phone: '313131313131'
}
2025-12-22 21:33:24.718 [info] ✅ Orden real creada con external_reference: 9aa6594f-6b6a-4a34-9e24-ea2de8b606b5
2025-12-22 21:33:24.718 [info] ✅ Email guardado en la orden: lucasctmn@gmail.com
2025-12-22 21:33:24.884 [info] 📝 Actualizando orden con información de pago...
2025-12-22 21:33:24.884 [info] Order ID: 9aa6594f-6b6a-4a34-9e24-ea2de8b606b5
2025-12-22 21:33:24.884 [info] Payment Info: {
  payment_id: '139077673662',
  status: 'approved',
  payment_method_id: 'visa',
  payment_type_id: 'prepaid_card',
  payer_email: 'lucasctmn@gmail.com',
  date_approved: '2025-12-22T17:33:22.000-04:00'
}
2025-12-22 21:33:25.716 [info] ✅ Pago aprobado, marcando orden como pagada
2025-12-22 21:33:25.717 [info] 💰 Marcando orden como pagada: 9aa6594f-6b6a-4a34-9e24-ea2de8b606b5
2025-12-22 21:33:25.870 [info] 📦 Orden encontrada con 1 items
2025-12-22 21:33:25.870 [info] 🔍 Validando disponibilidad de stock...
2025-12-22 21:33:25.870 [info] 🔍 Validando stock para 1 productos...
2025-12-22 21:33:26.042 [info] - Guantes de jardinería : 49 disponible, 1 solicitado
2025-12-22 21:33:26.042 [info] ✅ Validación de stock exitosa
2025-12-22 21:33:26.042 [info] ✅ Stock validado correctamente
2025-12-22 21:33:26.193 [info] ✅ Orden actualizada en BD
2025-12-22 21:33:26.193 [info] 📉 Reduciendo stock de productos...
2025-12-22 21:33:26.193 [info] - Reduciendo 1 unidades de Guantes de jardinería
2025-12-22 21:33:26.739 [info] ✅ Stock reducido exitosamente para todos los productos
2025-12-22 21:33:27.070 [info] ✅ Orden marcada como pagada exitosamente
2025-12-22 21:33:27.070 [info] 🗑️ Marcando para limpiar carrito temporal del cliente
2025-12-22 21:33:27.243 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:27.243 [info] ✅ [WEBHOOK] Procesamiento completado en 4441ms
2025-12-22 21:33:27.243 [info] Order ID: 9aa6594f-6b6a-4a34-9e24-ea2de8b606b5
2025-12-22 21:33:27.243 [info] Payment ID: 139077673662
2025-12-22 21:33:27.243 [info] Status: approved
2025-12-22 21:33:27.243 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-------------------------------------------------------------------------- OTRO LOG DESDE AQUI--------------------------------------------------

2025-12-22 21:33:22.950 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:22.950 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-22 21:33:22.950 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:22.950 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-22 21:33:22.950 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36670513876&topic=merchant_order
2025-12-22 21:33:22.950 [info] 📋 [DEBUG] Headers recibidos:
2025-12-22 21:33:22.950 [info] - x-signature: ts=1766439202,v1=0c6d57a2a570ceb62038ba8b649b1bfd038abae92ff7e4e8c19e38865254ba54
2025-12-22 21:33:22.950 [info] - x-request-id: 545aef6f-315e-41f8-a93f-6b092565f41d
2025-12-22 21:33:22.950 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-22 21:33:22.950 [info] - content-type: application/json
2025-12-22 21:33:22.950 [info] 📋 [DEBUG] Query params: { id: '36670513876', topic: 'merchant_order' }
2025-12-22 21:33:22.950 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-22 21:33:22.950 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-22 21:33:22.950 [info] 🔍 Query param detectado: 36670513876
2025-12-22 21:33:22.950 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-22 21:33:22.950 [error] Manifest usado: id:36670513876;request-id:545aef6f-315e-41f8-a93f-6b092565f41d;ts:1766439202;
2025-12-22 21:33:22.950 [error] Hash esperado: 0aae8053a2d27eca2bac524fc39100096cd6f18a2c49c90411e1f3a32fb31e3e
2025-12-22 21:33:22.950 [error] Hash recibido: 0c6d57a2a570ceb62038ba8b649b1bfd038abae92ff7e4e8c19e38865254ba54
2025-12-22 21:33:22.950 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:22.951 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-22 21:33:22.951 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:33:23.159 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-22 21:33:23.159 [info] 🔍 Query params recibidos: { id: '36670513876', topic: 'merchant_order' }
2025-12-22 21:33:23.159 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-22 21:33:23.159 [info] 🔔 Webhook procesado: {
  id: '36670513876',
  type: 'merchant_order',
  action: null,
  data_id: '36670513876'
}
2025-12-22 21:33:23.159 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order

-------------------------------------------------------------------------- OTRO LOG DESDE AQUI--------------------------------------------------

2025-12-22 21:34:23.974 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:34:23.974 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-22 21:34:23.974 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:34:23.974 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-22 21:34:23.974 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36670513876&topic=merchant_order
2025-12-22 21:34:23.974 [info] 📋 [DEBUG] Headers recibidos:
2025-12-22 21:34:23.974 [info] - x-signature: ts=1766439263,v1=5e7574afdd865c9e12ba74fcf5b8c10cc7e058fa2d735bbcc18fa811ba4c0372
2025-12-22 21:34:23.974 [info] - x-request-id: 88a57544-456c-4af9-bd56-69c8a62b0753
2025-12-22 21:34:23.974 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-22 21:34:23.974 [info] - content-type: application/json
2025-12-22 21:34:23.975 [info] 📋 [DEBUG] Query params: { id: '36670513876', topic: 'merchant_order' }
2025-12-22 21:34:23.975 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-22 21:34:23.975 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-22 21:34:23.975 [info] 🔍 Query param detectado: 36670513876
2025-12-22 21:34:23.975 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-22 21:34:23.975 [error] Manifest usado: id:36670513876;request-id:88a57544-456c-4af9-bd56-69c8a62b0753;ts:1766439263;
2025-12-22 21:34:23.975 [error] Hash esperado: 1362125227a0fec63d38c12e10eade21ae2d360706d892a4d5e4674a060959a0
2025-12-22 21:34:23.975 [error] Hash recibido: 5e7574afdd865c9e12ba74fcf5b8c10cc7e058fa2d735bbcc18fa811ba4c0372
2025-12-22 21:34:23.975 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:34:23.975 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-22 21:34:23.975 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:34:24.238 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-22 21:34:24.239 [info] 🔍 Query params recibidos: { id: '36670513876', topic: 'merchant_order' }
2025-12-22 21:34:24.239 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-22 21:34:24.239 [info] 🔔 Webhook procesado: {
  id: '36670513876',
  type: 'merchant_order',
  action: null,
  data_id: '36670513876'
}
2025-12-22 21:34:24.239 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order

-------------------------------------------------------------------------- OTRO LOG DESDE AQUI--------------------------------------------------

2025-12-22 21:34:24.479 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:34:24.479 [info] 🔔 [WEBHOOK] Notificación recibida de MercadoPago
2025-12-22 21:34:24.479 [info] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:34:24.479 [info] 🔐 [WEBHOOK] Validando firma x-signature...
2025-12-22 21:34:24.479 [info] 📋 [DEBUG] URL completa: https://app-vivero-web.vercel.app/api/mercadopago/webhook?id=36670513876&topic=merchant_order
2025-12-22 21:34:24.479 [info] 📋 [DEBUG] Headers recibidos:
2025-12-22 21:34:24.479 [info] - x-signature: ts=1766439264,v1=6d8361347bd2a34a7c76ff08b5d1604cec2ce29bdec330a2eb7b9d48f28ccb0a
2025-12-22 21:34:24.480 [info] - x-request-id: d02b1a67-370e-4360-ae1c-7535ebbdc5a8
2025-12-22 21:34:24.480 [info] - user-agent: MercadoPago Feed v2.0 merchant_order
2025-12-22 21:34:24.480 [info] - content-type: application/json
2025-12-22 21:34:24.480 [info] 📋 [DEBUG] Query params: { id: '36670513876', topic: 'merchant_order' }
2025-12-22 21:34:24.480 [info] 📋 [DEBUG] Tipo de notificación detectado: merchant_order
2025-12-22 21:34:24.480 [info] 📋 [DEBUG] Secret Key configurada: SÍ (longitud: 64)
2025-12-22 21:34:24.480 [info] 🔍 Query param detectado: 36670513876
2025-12-22 21:34:24.480 [error] ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
2025-12-22 21:34:24.480 [error] Manifest usado: id:36670513876;request-id:d02b1a67-370e-4360-ae1c-7535ebbdc5a8;ts:1766439264;
2025-12-22 21:34:24.480 [error] Hash esperado: f4ed13c8b2eda55d61d6299a0c162b1d20716b28f2548d2679805fa1166f6afa
2025-12-22 21:34:24.480 [error] Hash recibido: 6d8361347bd2a34a7c76ff08b5d1604cec2ce29bdec330a2eb7b9d48f28ccb0a
2025-12-22 21:34:24.480 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:34:24.480 [error] 🚨 [WEBHOOK] FIRMA INVÁLIDA - ADVERTENCIA
2025-12-22 21:34:24.480 [error] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-12-22 21:34:24.667 [warning] ⚠️ [WEBHOOK] CONTINUANDO A PESAR DE FIRMA INVÁLIDA (MODO DEBUG)
2025-12-22 21:34:24.667 [info] 🔍 Query params recibidos: { id: '36670513876', topic: 'merchant_order' }
2025-12-22 21:34:24.667 [info] 📦 Body recibido: {
  id: undefined,
  type: undefined,
  action: undefined,
  data_id: undefined
}
2025-12-22 21:34:24.667 [info] 🔔 Webhook procesado: {
  id: '36670513876',
  type: 'merchant_order',
  action: null,
  data_id: '36670513876'
}
2025-12-22 21:34:24.667 [info] ℹ️ Webhook ignorado, no es de tipo payment: merchant_order


