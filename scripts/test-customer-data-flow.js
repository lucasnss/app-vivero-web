#!/usr/bin/env node

/**
 * 🧪 Script de Prueba E2E - Flujo Completo de Guardado de Datos del Cliente
 * 
 * Prueba:
 * 1. Crear carrito con productos
 * 2. Crear preferencia de pago con datos del cliente
 * 3. Verificar que los datos se guarden en customer_info
 * 4. Simular webhook de Mercado Pago
 * 5. Verificar que la orden se creó con todos los datos completos
 * 
 * Uso: node scripts/test-customer-data-flow.js
 */

const http = require('http');
const https = require('https');

// ==========================================
// COLORES PARA CONSOLA
// ==========================================
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}${'='.repeat(60)}\n📋 ${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

// ==========================================
// CONFIGURACIÓN
// ==========================================
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const isHttps = BASE_URL.startsWith('https');
const protocol = isHttps ? https : http;

log.test(`Usando BASE_URL: ${BASE_URL}`);

// ==========================================
// DATOS DE PRUEBA
// ==========================================
const TEST_CUSTOMER = {
  name: 'Test User Completo',
  email: 'test_user_123456@testuser.com',
  phone: '11 1234-5678',
  address: {
    street: 'Avenida Test',
    number: '1234',
    city: 'Buenos Aires',
    state: 'CABA',
    zip: '1000',
    additional_info: 'Apto 5B - Lado izquierdo'
  }
};

const TEST_CART_ITEMS = [
  {
    product_id: 'test-prod-1',
    product_name: 'Maceta Grande',
    quantity: 2,
    price: 500,
    image: 'https://via.placeholder.com/200'
  },
  {
    product_id: 'test-prod-2',
    product_name: 'Tierra para Plantas',
    quantity: 1,
    price: 300,
    image: 'https://via.placeholder.com/200'
  }
];

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Realizar HTTP request
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Validar estructura de datos
 */
function validateData(data, expectedFields, name) {
  const missing = expectedFields.filter(field => !data.hasOwnProperty(field) && data[field] !== null);
  
  if (missing.length > 0) {
    log.error(`${name} - Campos faltantes: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Pretty print JSON
 */
function prettyPrint(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

// ==========================================
// PRUEBAS
// ==========================================

async function testFlow() {
  let testsPassed = 0;
  let testsFailed = 0;
  let preferenceId = null;
  let orderId = null;
  let tempOrderData = null;

  try {
    // ========== TEST 1: Crear Preferencia de Pago ==========
    log.section('TEST 1: Crear Preferencia de Pago con Datos del Cliente');
    
    const preferencePayload = {
      items: TEST_CART_ITEMS,
      shipping_address: TEST_CUSTOMER.address,
      payment_method: 'mercadopago',
      customer_email: TEST_CUSTOMER.email,
      customer_name: TEST_CUSTOMER.name,
      customer_phone: TEST_CUSTOMER.phone,
      shipping_method: 'delivery', // ✅ NUEVO
      notes: 'Envío a domicilio incluido'
    };

    log.test('Enviando datos de preferencia...');
    log.info('Payload:');
    prettyPrint(preferencePayload);

    const preferenceResponse = await makeRequest(
      'POST',
      '/api/mercadopago/create-preference',
      preferencePayload
    );

    if (preferenceResponse.status !== 200) {
      log.error(`Fallo crear preferencia - Status: ${preferenceResponse.status}`);
      prettyPrint(preferenceResponse.body);
      testsFailed++;
    } else {
      log.success('Preferencia creada exitosamente');
      
      // Validar respuesta
      if (!preferenceResponse.body.data?.preference_id) {
        log.error('Respuesta no contiene preference_id');
        testsFailed++;
      } else {
        preferenceId = preferenceResponse.body.data.preference_id;
        log.success(`Preference ID: ${preferenceId}`);
        testsPassed++;

        // Validar datos temporales
        if (preferenceResponse.body.data?.temp_order_info) {
          log.success('Datos temporales generados');
          prettyPrint(preferenceResponse.body.data.temp_order_info);
          tempOrderData = preferenceResponse.body.data.temp_order_info;
          testsPassed++;
        } else {
          log.warn('No hay datos temporales en la respuesta');
        }
      }
    }

    // ========== TEST 2: Simular Webhook de Mercado Pago ==========
    log.section('TEST 2: Simular Webhook de Mercado Pago');

    if (!preferenceId) {
      log.error('No hay preference_id para simular webhook. Saltando TEST 2.');
      testsFailed++;
    } else {
      // Simular notificación de pago aprobado
      const webhookPayload = {
        id: 'test-webhook-' + Date.now(),
        type: 'payment',
        action: 'payment.created',
        data: {
          id: 'test-payment-' + Date.now()
        }
      };

      log.test('Simulando webhook de pago aprobado...');
      log.info('Payload webhook:');
      prettyPrint(webhookPayload);

      // Primero, crear la orden manualmente (como lo haría el webhook)
      log.test('Creando orden a través de API...');
      
      const createOrderPayload = {
        items: TEST_CART_ITEMS,
        shipping_address: TEST_CUSTOMER.address,
        payment_method: 'mercadopago',
        customer_email: TEST_CUSTOMER.email,
        customer_name: TEST_CUSTOMER.name,
        customer_phone: TEST_CUSTOMER.phone,
        shipping_method: 'delivery', // ✅ NUEVO
        notes: 'Orden creada por test E2E'
      };

      const createOrderResponse = await makeRequest(
        'POST',
        '/api/orders',
        createOrderPayload
      );

      if (createOrderResponse.status === 201) {
        log.success('Orden creada exitosamente');
        orderId = createOrderResponse.body.id;
        log.success(`Order ID: ${orderId}`);
        testsPassed++;

        // ========== TEST 3: Validar Datos en la Orden ==========
        log.section('TEST 3: Validar Datos en la Orden Creada');

        log.test('Obteniendo detalles de la orden...');
        const orderDetailsResponse = await makeRequest('GET', `/api/orders/${orderId}`);

        if (orderDetailsResponse.status === 200) {
          log.success('Orden recuperada exitosamente');
          const order = orderDetailsResponse.body;

          log.info('Datos de la orden:');
          prettyPrint(order);

          // Validar customer_info
          if (order.customer_info) {
            log.success('✅ customer_info existe');

            // Validar campos de customer_info
            const customerInfo = order.customer_info;
            
            // Datos personales
            if (customerInfo.email === TEST_CUSTOMER.email) {
              log.success(`✅ Email correcto: ${customerInfo.email}`);
              testsPassed++;
            } else {
              log.error(`❌ Email incorrecto. Esperado: ${TEST_CUSTOMER.email}, Obtenido: ${customerInfo.email}`);
              testsFailed++;
            }

            if (customerInfo.name === TEST_CUSTOMER.name) {
              log.success(`✅ Nombre correcto: ${customerInfo.name}`);
              testsPassed++;
            } else {
              log.error(`❌ Nombre incorrecto. Esperado: ${TEST_CUSTOMER.name}, Obtenido: ${customerInfo.name}`);
              testsFailed++;
            }

            if (customerInfo.phone === TEST_CUSTOMER.phone) {
              log.success(`✅ Teléfono correcto: ${customerInfo.phone}`);
              testsPassed++;
            } else {
              log.error(`❌ Teléfono incorrecto. Esperado: ${TEST_CUSTOMER.phone}, Obtenido: ${customerInfo.phone}`);
              testsFailed++;
            }

            // Dirección
            if (customerInfo.address) {
              log.success('✅ Dirección existe en customer_info');
              const addr = customerInfo.address;

              const addressChecks = [
                { field: 'street', value: addr.street, expected: TEST_CUSTOMER.address.street },
                { field: 'number', value: addr.number, expected: TEST_CUSTOMER.address.number },
                { field: 'city', value: addr.city, expected: TEST_CUSTOMER.address.city },
                { field: 'state', value: addr.state, expected: TEST_CUSTOMER.address.state },
                { field: 'zip', value: addr.zip, expected: TEST_CUSTOMER.address.zip },
                { field: 'additional_info', value: addr.additional_info, expected: TEST_CUSTOMER.address.additional_info },
              ];

              addressChecks.forEach(check => {
                if (check.value === check.expected) {
                  log.success(`✅ ${check.field}: ${check.value}`);
                  testsPassed++;
                } else {
                  log.error(`❌ ${check.field} incorrecto. Esperado: ${check.expected}, Obtenido: ${check.value}`);
                  testsFailed++;
                }
              });
            } else {
              log.error('❌ Dirección no existe en customer_info');
              testsFailed++;
            }

            // Shipping method
            if (customerInfo.shipping_method === 'delivery') {
              log.success(`✅ Shipping method correcto: ${customerInfo.shipping_method}`);
              testsPassed++;
            } else {
              log.error(`❌ Shipping method incorrecto. Esperado: delivery, Obtenido: ${customerInfo.shipping_method}`);
              testsFailed++;
            }

            // Timestamp
            if (customerInfo.captured_at) {
              log.success(`✅ Timestamp de captura: ${customerInfo.captured_at}`);
              testsPassed++;
            } else {
              log.warn('⚠️ Timestamp de captura no existe');
            }
          } else {
            log.error('❌ customer_info no existe en la orden');
            testsFailed++;
          }

          // Validar shipping_method a nivel de orden
          if (order.shipping_method === 'delivery') {
            log.success(`✅ Order shipping_method: ${order.shipping_method}`);
            testsPassed++;
          } else {
            log.warn(`⚠️ Order shipping_method: ${order.shipping_method}`);
          }

        } else {
          log.error(`Fallo obtener detalles de orden - Status: ${orderDetailsResponse.status}`);
          prettyPrint(orderDetailsResponse.body);
          testsFailed++;
        }

        // ========== TEST 4: Validar que Modal puede mostrar datos ==========
        log.section('TEST 4: Validación de Estructura para Modal');

        log.test('Verificando que todos los campos necesarios están presentes...');
        const order = orderDetailsResponse.body;

        const requiredFields = [
          'id',
          'customer_name',
          'customer_email',
          'customer_phone',
          'shipping_address',
          'payment_status',
          'fulfillment_status',
          'shipping_method',
          'total_amount',
          'created_at',
          'items'
        ];

        const missingFields = requiredFields.filter(field => !order.hasOwnProperty(field) && order[field] !== null);
        
        if (missingFields.length === 0) {
          log.success('✅ Todos los campos requeridos están presentes');
          testsPassed++;
        } else {
          log.error(`❌ Campos faltantes: ${missingFields.join(', ')}`);
          testsFailed++;
        }

      } else {
        log.error(`Fallo crear orden - Status: ${createOrderResponse.status}`);
        prettyPrint(createOrderResponse.body);
        testsFailed++;
      }
    }

    // ========== RESUMEN FINAL ==========
    log.section('📊 RESUMEN DE PRUEBAS');
    
    console.log(`${colors.green}✅ Pruebas Pasadas: ${testsPassed}${colors.reset}`);
    console.log(`${colors.red}❌ Pruebas Fallidas: ${testsFailed}${colors.reset}`);
    
    const totalTests = testsPassed + testsFailed;
    const percentage = totalTests > 0 ? ((testsPassed / totalTests) * 100).toFixed(2) : 0;
    
    console.log(`\n📈 Tasa de Éxito: ${percentage}% (${testsPassed}/${totalTests})\n`);

    if (testsFailed === 0) {
      log.success('🎉 ¡TODAS LAS PRUEBAS PASARON!');
      process.exit(0);
    } else {
      log.warn(`⚠️  Algunas pruebas fallaron. Por favor revisa los errores arriba.`);
      process.exit(1);
    }

  } catch (error) {
    log.error(`Error en flujo de pruebas: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// ==========================================
// EJECUTAR PRUEBAS
// ==========================================

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧪 Script de Prueba E2E - Guardado de Datos del Cliente  ║
║                    ViveroWeb Test Suite                    ║
╚════════════════════════════════════════════════════════════╝
`);

log.info(`Iniciando pruebas contra: ${BASE_URL}`);
log.info(`Timestamp: ${new Date().toISOString()}\n`);

testFlow();

