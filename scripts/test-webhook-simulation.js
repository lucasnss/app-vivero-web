#!/usr/bin/env node

/**
 * Script de Testing: Simular Webhook de Mercado Pago
 * 
 * Uso:
 *   node scripts/test-webhook-simulation.js
 *   node scripts/test-webhook-simulation.js --id=123456
 *   node scripts/test-webhook-simulation.js --test
 */

const http = require('http');
const args = process.argv.slice(2);

// Parsear argumentos
let paymentId = '123456';
let isTestMode = false;

args.forEach(arg => {
  if (arg.startsWith('--id=')) {
    paymentId = arg.split('=')[1];
  }
  if (arg === '--test') {
    paymentId = `test-payment-${Date.now()}`;
    isTestMode = true;
  }
});

// Payload del webhook de simulación
const webhookPayload = {
  id: `webhook-sim-${Date.now()}`,
  type: 'payment',
  action: 'payment.updated',
  data: {
    id: paymentId
  },
  live_mode: false,
  timestamp: new Date().toISOString()
};

console.log('📤 Enviando webhook de simulación...');
console.log(`🔹 Payment ID: ${paymentId}`);
console.log(`🔹 Modo: ${isTestMode ? 'TEST' : 'SIMULACIÓN'}`);
console.log('');

const postData = JSON.stringify(webhookPayload);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/mercadopago/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Respuesta del servidor:');
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
    console.log(`   Body: ${data}`);
    console.log('');
    
    if (res.statusCode === 200 || res.statusCode === 500) {
      console.log('📝 Webhook procesado. Revisa los logs del servidor para más detalles.');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error enviando webhook:', error);
  console.error('');
  console.error('Asegúrate de que:');
  console.error('  1. La aplicación está ejecutándose en http://localhost:3000');
  console.error('  2. ngrok está configurado correctamente');
  console.error('  3. Mercado Pago está configurado en .env');
});

// Enviar datos
req.write(postData);
req.end();

console.log('📤 Payload enviado:');
console.log(JSON.stringify(webhookPayload, null, 2));
console.log('');
console.log('⏳ Esperando respuesta...');

