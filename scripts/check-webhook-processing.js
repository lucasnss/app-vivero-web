#!/usr/bin/env node

/**
 * 🔍 VERIFICAR: ¿El webhook procesó correctamente la orden?
 * 
 * Este script verifica:
 * 1. Si hay órdenes en BD
 * 2. Si hay logs de webhook en activity_logs
 * 3. Estado actual de la integración
 */

// Para Node.js 18+ fetch está disponible globalmente, para versiones anteriores usar node-fetch
let fetchFn;
try {
  // Intentar usar fetch global de Node.js 18+
  fetchFn = fetch;
} catch (e) {
  // Fallback a node-fetch para versiones anteriores
  try {
    fetchFn = require('node-fetch');
  } catch (e2) {
    console.error('❌ Error: fetch no disponible. Instala node-fetch: npm install node-fetch@2');
    process.exit(1);
  }
}

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
  section: (title) => console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}\n${title}\n${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`)
};

async function checkWebhookProcessing() {
  log.section('VERIFICACIÓN: ¿El Webhook Procesó Correctamente?');

  const BASE_URL = 'http://localhost:3000';

  // Paso 1: Órdenes en BD
  log.info('Paso 1: Verificando órdenes en BD...');
  try {
    const ordersRes = await fetchFn(`${BASE_URL}/api/orders?limit=1000`);
    if (ordersRes.ok) {
      const data = await ordersRes.json();
      const orders = data.data || [];
      
      if (orders.length > 0) {
        log.success(`${orders.length} orden(es) encontrada(s) en BD`);
        
        // Muestra últimas 3 con detalles
        console.log('\n📋 Últimas órdenes:');
        orders.slice(0, 3).forEach((order, idx) => {
          console.log(`\n  ${idx + 1}. ID: ${order.id.slice(0, 8)}...`);
          console.log(`     Cliente: ${order.customer_info?.email || 'N/A'}`);
          console.log(`     Estado Pago: ${order.payment_status || 'N/A'}`);
          console.log(`     Total: $${order.total_amount}`);
          console.log(`     Creada: ${new Date(order.created_at).toLocaleString()}`);
        });
      } else {
        log.error('No hay órdenes en BD (tabla orders vacía)');
        log.warn('→ El webhook no creó órdenes, O nunca hiciste checkout real');
      }
    } else {
      log.error(`GET /api/orders falló: ${ordersRes.status}`);
    }
  } catch (err) {
    log.error(`Error consultando órdenes: ${err.message}`);
  }

  // Paso 2: Logs de webhook
  log.section('PASO 2: Verificando Activity Logs');
  
  try {
    const logsRes = await fetchFn(`${BASE_URL}/api/admin/activity-logs?limit=200`);
    if (logsRes.ok) {
      const data = await logsRes.json();
      const logs = data.data || [];
      
      const mpTempLogs = logs.filter(l => l.action === 'mp_preference_created_temp');
      const webhookLogs = logs.filter(l => 
        l.action === 'webhook_processed_success' || 
        l.action === 'webhook_duplicate' ||
        l.action === 'error_mp_preference'
      );
      const errorLogs = logs.filter(l => l.action?.includes('error'));

      log.success(`${logs.length} logs totales encontrados`);
      
      console.log(`\n📊 Resumen de Logs:`);
      console.log(`  • Preferencias temporales (checkout): ${mpTempLogs.length}`);
      console.log(`  • Webhooks procesados: ${webhookLogs.length}`);
      console.log(`  • Errores: ${errorLogs.length}`);

      if (mpTempLogs.length > 0) {
        log.success('✓ Preferencias temporales están siendo guardadas (checkouts completados)');
        console.log('\n  Últimas preferencias:');
        mpTempLogs.slice(0, 2).forEach((l, idx) => {
          const details = l.details || {};
          console.log(`    ${idx + 1}. Pref ID: ${details.preference_id?.slice(0, 10) || 'N/A'}...`);
          console.log(`       Email: ${details.customer_email || 'N/A'}`);
          console.log(`       Items: ${details.items_count || 'N/A'}`);
        });
      } else {
        log.error('✗ Sin preferencias temporales (nunca completaste checkout real)');
        log.warn('  → Haz un checkout completo en /carrito/pago');
      }

      if (webhookLogs.length > 0) {
        log.success('✓ Webhooks siendo recibidos y procesados');
        console.log('\n  Últimos webhooks:');
        webhookLogs.slice(0, 2).forEach((l, idx) => {
          console.log(`    ${idx + 1}. Acción: ${l.action}`);
          console.log(`       Timestamp: ${new Date(l.timestamp).toLocaleString()}`);
        });
      } else {
        log.error('✗ Sin webhooks procesados');
        log.warn('  → El webhook no está llegando o hay error silencioso');
      }

      if (errorLogs.length > 0) {
        log.error(`⚠️  Encontrados ${errorLogs.length} error(es):`);
        console.log('\n  Últimos errores:');
        errorLogs.slice(0, 3).forEach((l, idx) => {
          console.log(`    ${idx + 1}. ${l.action}`);
          console.log(`       Error: ${l.details?.error || 'N/A'}`);
          console.log(`       Timestamp: ${new Date(l.timestamp).toLocaleString()}`);
        });
      }
    } else {
      log.error(`GET /api/admin/activity-logs falló: ${logsRes.status}`);
    }
  } catch (err) {
    log.error(`Error consultando activity logs: ${err.message}`);
  }

  // Paso 3: Diagnóstico final
  log.section('DIAGNÓSTICO FINAL');

  try {
    const ordersRes = await fetchFn(`${BASE_URL}/api/orders?limit=1`);
    const logsRes = await fetchFn(`${BASE_URL}/api/admin/activity-logs?limit=100`);

    const orders = ordersRes.ok ? (await ordersRes.json()).data || [] : [];
    const logs = logsRes.ok ? (await logsRes.json()).data || [] : [];

    const mpTempLogs = logs.filter(l => l.action === 'mp_preference_created_temp');
    const webhookLogs = logs.filter(l => l.action === 'webhook_processed_success');

    console.log(`
${colors.cyan}┌─ DIAGNÓSTICO ─┐${colors.reset}
│
├─ Órdenes en BD: ${orders.length > 0 ? '✅' : '❌'} (${orders.length})
├─ Checkouts completados: ${mpTempLogs.length > 0 ? '✅' : '❌'} (${mpTempLogs.length})
├─ Webhooks procesados: ${webhookLogs.length > 0 ? '✅' : '❌'} (${webhookLogs.length})
└─

${colors.yellow}📝 INTERPRETACIÓN:${colors.reset}

SI VES:
  ✅ ✅ ✅  → TODO FUNCIONA CORRECTAMENTE
          → Órdenes deberían aparecer en /admin/sales-history

  ✅ ✅ ❌  → Webhooks no llegando
          → Revisa: ngrok activo, URL en MP Dashboard actualizada

  ✅ ❌ ❌  → Nunca hiciste checkout real
          → Haz checkout completo en /carrito/pago

  ❌ ❌ ❌  → Servidor tiene problemas
          → Revisa: npm run dev está corriendo, Supabase accesible

${colors.green}🎯 PRÓXIMO PASO:${colors.reset}

1. Si ves ✅ ✅ ✅:
   → Ve a /admin/sales-history
   → Las órdenes deberían estar ahí
   → Si NO están: problema en FRONTEND

2. Si ves otros patrones:
   → Revisa la descripción arriba
   → Ejecuta acción recomendada

3. Si no sabes qué hacer:
   → Copia esta salida completa
   → Comparte conmigo junto con screenshot de Supabase
    `);
  } catch (err) {
    log.error(`Error en diagnóstico: ${err.message}`);
  }
}

checkWebhookProcessing().catch(console.error);

