#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE DIAGNÓSTICO: Verificar Flujo de Webhook MP → Historial de Compras
 * 
 * Este script verifica cada paso del flujo de compra/pago/webhook para identificar
 * dónde está el problema cuando las compras no aparecen en el historial.
 */

const fetch = require('node-fetch');
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

async function debugWebhookFlow() {
  log.section('DIAGNÓSTICO DE FLUJO: COMPRA → PAGO → WEBHOOK → HISTORIAL');

  const BASE_URL = 'http://localhost:3000';
  const API_URL = `${BASE_URL}/api`;

  // PASO 1: Verificar servidor
  log.info('Paso 1: Verificando servidor local...');
  try {
    const healthCheck = await fetch(`${API_URL}/health`, { timeout: 5000 });
    if (healthCheck.ok) {
      const health = await healthCheck.json();
      log.success(`Servidor activo en ${BASE_URL}`);
      log.debug(`Health check: ${JSON.stringify(health, null, 2)}`);
    } else {
      log.error(`Servidor responde con ${healthCheck.status}`);
      return;
    }
  } catch (err) {
    log.error(`No se puede conectar a ${BASE_URL}. Verifica que "npm run dev" esté corriendo.`);
    return;
  }

  // PASO 2: Verificar órdenes existentes
  log.info('Paso 2: Verificando órdenes existentes en historial...');
  try {
    const ordersRes = await fetch(`${API_URL}/orders?limit=100`);
    if (ordersRes.ok) {
      const ordersData = await ordersRes.json();
      const orders = ordersData.data || [];
      if (orders.length > 0) {
        log.success(`${orders.length} órdenes encontradas en BD`);
        log.debug(`Últimas 3 órdenes:`);
        orders.slice(0, 3).forEach(order => {
          console.log(`  - ID: ${order.id.slice(0, 8)}... | Status: ${order.payment_status || 'N/A'} | Total: $${order.total_amount}`);
        });
      } else {
        log.warn('No hay órdenes en BD (historial vacío)');
      }
    } else {
      log.error(`GET /api/orders falló con status ${ordersRes.status}`);
    }
  } catch (err) {
    log.error(`Error consultando órdenes: ${err.message}`);
  }

  // PASO 3: Verificar activity_logs (datos temporales de MP)
  log.info('Paso 3: Verificando activity_logs (datos temporales de MP)...');
  try {
    const logsRes = await fetch(`${API_URL}/admin/activity-logs?limit=50`);
    if (logsRes.ok) {
      const logsData = await logsRes.json();
      const logs = logsData.data || [];
      
      const mpTempLogs = logs.filter(l => l.action === 'mp_preference_created_temp');
      const webhookLogs = logs.filter(l => l.action === 'webhook_processed_success' || l.action === 'webhook_duplicate');
      
      log.success(`Activity logs encontrados: ${logs.length} total`);
      log.debug(`- Preferencias temporales (mp_preference_created_temp): ${mpTempLogs.length}`);
      log.debug(`- Webhooks procesados: ${webhookLogs.length}`);
      
      if (mpTempLogs.length > 0) {
        log.success('✓ Datos temporales de MP están siendo guardados');
        console.log(`  Últimas preferencias:`);
        mpTempLogs.slice(0, 3).forEach(log_entry => {
          const details = log_entry.details || {};
          console.log(`    - Preference ID: ${details.preference_id?.slice(0, 10) || 'N/A'}...`);
          console.log(`      Email: ${details.customer_email || 'N/A'}`);
          console.log(`      Items: ${details.items_count || 'N/A'}`);
        });
      } else {
        log.error('✗ NO hay datos temporales de MP (check: ¿se envió algún formulario de checkout?)');
      }

      if (webhookLogs.length > 0) {
        log.success('✓ Webhooks están siendo recibidos y procesados');
        console.log(`  Últimos webhooks:`);
        webhookLogs.slice(0, 3).forEach(wlog => {
          const details = wlog.details || {};
          console.log(`    - Acción: ${wlog.action}`);
          console.log(`      Orden: ${details.order_id?.slice(0, 8) || 'N/A'}...`);
          console.log(`      Status: ${details.new_status || 'N/A'}`);
        });
      } else {
        log.error('✗ NO hay webhooks procesados. El problema es: MP NO ENVÍA WEBHOOKS o llegan fallidos.');
      }
    } else {
      log.error(`GET /api/admin/activity-logs falló con status ${logsRes.status}`);
    }
  } catch (err) {
    log.error(`Error consultando activity logs: ${err.message}`);
  }

  // PASO 4: Información de ngrok
  log.section('PASO 4: VERIFICACIÓN DE NGROK Y WEBHOOK URL');
  
  log.info('Verificando ngrok en http://localhost:4040...');
  try {
    const ngrokRes = await fetch('http://localhost:4040/api/tunnels', { timeout: 3000 });
    if (ngrokRes.ok) {
      const ngrokData = await ngrokRes.json();
      const httpTunnel = ngrokData.tunnels?.find(t => t.proto === 'http');
      
      if (httpTunnel) {
        log.success(`ngrok activo: ${httpTunnel.public_url}`);
        const webhookUrl = `${httpTunnel.public_url}/api/mercadopago/webhook`;
        log.debug(`URL de webhook en MP Dashboard debe ser: ${webhookUrl}`);
        log.warn('⚠️  IMPORTANTE: Verifica en MP Dashboard > Integración > Webhooks que esta URL esté configurada');
      } else {
        log.error('No se encontró túnel HTTP en ngrok');
      }
    } else {
      log.error(`ngrok responde con ${ngrokRes.status}`);
    }
  } catch (err) {
    log.error(`ngrok no está activo en localhost:4040. Ejecuta: ngrok http 3000`);
    log.warn('Sin ngrok activo, MP NO puede enviar webhooks a tu máquina local.');
  }

  // PASO 5: Resumen y recomendaciones
  log.section('RESUMEN Y RECOMENDACIONES');

  console.log(`
${colors.cyan}┌─ CHECKLIST DE DIAGNÓSTICO ─┐${colors.reset}
│
├─ ✓ Servidor local corriendo en ${BASE_URL}
├─ ${mpTempLogs?.length > 0 ? '✓' : '✗'} Datos temporales de MP guardados (mp_preference_created_temp logs)
├─ ${webhookLogs?.length > 0 ? '✓' : '✗'} Webhooks siendo procesados (webhook_processed_success logs)
├─ ${orders?.length > 0 ? '✓' : '✗'} Órdenes en BD (historial no vacío)
└─ ${ngrokActive ? '✓' : '✗'} ngrok activo para webhooks

${colors.yellow}📋 PRÓXIMOS PASOS:${colors.reset}

1️⃣  SI NO VES DATOS TEMPORALES (mp_preference_created_temp):
    → No completaste ningún checkout aún
    → Acción: Ve a /carrito → Agrega producto → Checkout → Paga con tarjeta test

2️⃣  SI VES DATOS TEMPORALES PERO NO WEBHOOKS (webhook_processed_success):
    → MP NO está enviando webhooks a tu ngrok
    → Acciones:
       a) Verifica ngrok activo: http://localhost:4040
       b) Confirma URL en MP Dashboard > Integración > Webhooks
       c) La URL debe ser: ${httTunnel?.public_url || 'https://YOUR_NGROK_URL'}/api/mercadopago/webhook
       d) Si URL es vieja, actualízala (ngrok genera URL nueva cada reinicio)

3️⃣  SI VES WEBHOOKS PERO NO ÓRDENES EN BD:
    → El webhook llegó pero falló al crear la orden
    → Acción: Revisa la consola de Node.js (npm run dev) para ver error específico

4️⃣  SI VES TODO BIEN PERO ÓRDENES NO APARECEN EN HISTORIAL (/admin/sales-history):
    → Las órdenes están en BD pero el frontend no las muestra
    → Acción: Revisa la consola del navegador (F12) para ver si hay error

${colors.green}💡 PRO TIP:${colors.reset}
Monitorea estas URLs mientras haces checkout:
  - Consola Node.js: npm run dev (logs de create-preference y webhook)
  - ngrok Dashboard: http://localhost:4040 (verifica POST al webhook)
  - Supabase: Table Editor > orders (verifica nueva orden)
  - Historial Admin: /admin/sales-history (verifica que aparezca)
  `);
}

debugWebhookFlow().catch(console.error);


