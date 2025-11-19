#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TESTING MANUAL: Simular Webhook de MP
 * 
 * Este script simula un webhook de Mercado Pago para verificar que:
 * 1. El endpoint webhook recibe la notificación
 * 2. La orden se crea correctamente en BD
 * 3. Los estados se actualizan
 * 4. La orden aparece en el historial
 */

const fetch = require('node-fetch');
const { randomUUID } = require('crypto');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  debug: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
  section: (title) => console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}\n📊 ${title}\n${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`)
};

async function testWebhookManually() {
  log.section('TEST MANUAL DE WEBHOOK DE MERCADO PAGO');

  const BASE_URL = 'http://localhost:3000';
  const API_URL = `${BASE_URL}/api`;

  // PASO 1: Verificar servidor
  log.info('Paso 1: Verificando servidor...');
  try {
    const healthCheck = await fetch(`${API_URL}/health`);
    if (!healthCheck.ok) {
      log.error(`Servidor no responde correctamente (${healthCheck.status})`);
      return;
    }
    log.success('Servidor activo');
  } catch (err) {
    log.error(`No se puede conectar a ${BASE_URL}. Asegúrate que npm run dev esté corriendo.`);
    return;
  }

  // PASO 2: Obtener órdenes existentes para contar baseline
  log.info('Paso 2: Contando órdenes existentes...');
  let ordersBeforeCount = 0;
  try {
    const res = await fetch(`${API_URL}/orders?limit=1000`);
    if (res.ok) {
      const data = await res.json();
      ordersBeforeCount = (data.data || []).length;
      log.debug(`Órdenes antes: ${ordersBeforeCount}`);
    }
  } catch (err) {
    log.warn(`No se pudo contar órdenes: ${err.message}`);
  }

  // PASO 3: Simular un webhook de MP
  log.section('PASO 3: ENVIANDO WEBHOOK SIMULADO');
  
  const fakePaymentId = `999${Date.now()}`;
  const fakeExternalRef = randomUUID();
  
  const webhookPayload = {
    id: randomUUID(),
    live_mode: false,
    type: 'payment',
    action: 'payment.created',
    data: {
      id: fakePaymentId
    },
    date_created: new Date().toISOString()
  };

  log.debug(`Enviando webhook con:`);
  console.log(`  - Payment ID: ${fakePaymentId}`);
  console.log(`  - External Reference: ${fakeExternalRef}`);
  console.log(`  - Webhook ID: ${webhookPayload.id}`);

  try {
    const webhookRes = await fetch(`${API_URL}/mercadopago/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });

    log.debug(`Respuesta del webhook: ${webhookRes.status}`);
    
    if (webhookRes.ok) {
      const responseData = await webhookRes.json();
      log.success('Webhook procesado correctamente');
      log.debug(`Respuesta: ${JSON.stringify(responseData, null, 2)}`);
    } else {
      log.error(`Webhook respondió con error: ${webhookRes.status}`);
      const errorData = await webhookRes.json();
      log.debug(`Error: ${JSON.stringify(errorData, null, 2)}`);
    }
  } catch (err) {
    log.error(`Error enviando webhook: ${err.message}`);
  }

  // PASO 4: Verificar si la orden se creó
  log.section('PASO 4: VERIFICANDO SI LA ORDEN SE CREÓ');
  
  log.info('Contando órdenes nuevamente...');
  let ordersAfterCount = 0;
  try {
    const res = await fetch(`${API_URL}/orders?limit=1000`);
    if (res.ok) {
      const data = await res.json();
      ordersAfterCount = (data.data || []).length;
      log.debug(`Órdenes después: ${ordersAfterCount}`);

      const ordersAdded = ordersAfterCount - ordersBeforeCount;
      if (ordersAdded > 0) {
        log.success(`${ordersAdded} orden(es) nueva(s) creada(s)`);
      } else {
        log.error('Ninguna nueva orden fue creada. El webhook no creó la orden.');
        log.warn('Posibles razones:');
        console.log('  1. El webhook llegó pero no encontró datos temporales');
        console.log('  2. No completaste un checkout antes de este test');
        console.log('  3. Los datos temporales expiró (si dejó >1 hora)');
        console.log('\nAcción: Realiza un checkout real y luego revisa los logs.');
      }
    }
  } catch (err) {
    log.warn(`No se pudo contar órdenes: ${err.message}`);
  }

  // PASO 5: Resumen
  log.section('RESUMEN DEL TEST');
  
  console.log(`
${colors.cyan}RESULTADO:${colors.reset}

Si llegaste aquí sin errores:
  ✓ El endpoint webhook está accesible y funciona
  ✓ Puede recibir notificaciones de MP

Si la orden SE CREÓ:
  ✓ Todo el flujo funciona correctamente
  ✓ Las compras deberían aparecer en el historial

Si la orden NO se creó:
  → El webhook necesita datos temporales de una compra real
  → Realiza un checkout completo desde /carrito
  → Los datos se guardan en activity_logs
  → El webhook los usa para crear la orden

${colors.yellow}📝 INSTRUCCIONES PARA UN TEST REAL:${colors.reset}

1. Abre consola (F12) en http://localhost:3000/carrito
2. Agrega un producto al carrito
3. Click en "Proceder a pagar"
4. Completa el formulario:
   - Nombre: Test User
   - Email: test@example.com
   - Dirección, provincia, código
   - Click "Pagar con Mercado Pago"
5. En MP Sandbox, usa tarjeta: 4500000000000000
6. Completa fechas y CVC (cualquier valor)
7. Click "Pagar"
8. Verifica la consola de Node.js (npm run dev) para ver logs
9. Verifica ngrok dashboard (http://localhost:4040) para ver webhook
10. Verifica /admin/sales-history para ver la orden

${colors.green}💡 MONITOREO EN TIEMPO REAL:${colors.reset}

Abre estas ventanas en paralelo:
  Terminal 1: npm run dev (ver logs de create-preference y webhook)
  Terminal 2: cd Fronted && npx http-server . -p 8080 (servir ngrok dashboard)
  Navegador 1: http://localhost:4040 (ngrok - ver requests)
  Navegador 2: http://localhost:3000/carrito (hacer compra)
  Navegador 3: http://localhost:3000/admin/sales-history (ver historial)
  `);
}

testWebhookManually().catch(console.error);


