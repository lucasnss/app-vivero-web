#!/usr/bin/env node

/**
 * Script de Testing Manual para Sandbox de Mercado Pago
 * 
 * Este script permite:
 * 1. Crear preferencias de pago reales en sandbox
 * 2. Probar diferentes métodos de pago
 * 3. Verificar webhooks en tiempo real
 * 4. Simular diferentes escenarios de pago
 */

const axios = require('axios');
const readline = require('readline');

// Configuración
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vivero.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🎯 ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

// Interface de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Clase principal de testing manual
class MercadoPagoSandboxTester {
  constructor() {
    this.sessionToken = null;
    this.testOrderId = null;
    this.testPreferenceId = null;
    this.testPaymentId = null;
    this.testProduct = null; // Agregar producto de prueba
  }

  async init() {
    logHeader('TESTING MANUAL DE MERCADO PAGO SANDBOX');
    log(`📍 URL Base: ${BASE_URL}`, 'cyan');
    log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`, 'cyan');
    
    // Verificar que el servidor esté corriendo
    try {
      const response = await axios.get(`${BASE_URL}/api/health`);
      logSuccess('Servidor respondiendo correctamente');
    } catch (error) {
      logError('Servidor no responde. Asegúrate de que esté corriendo en ' + BASE_URL);
      process.exit(1);
    }
  }

  async login() {
    logInfo('🔐 Iniciando sesión como admin...');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/admin/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });

      if (response.data.data && response.data.data.token) {
        this.sessionToken = response.data.data.token;
        logSuccess('Login exitoso');
        return true;
      } else if (response.data.token) {
        // Formato alternativo de respuesta
        this.sessionToken = response.data.token;
        logSuccess('Login exitoso');
        return true;
      } else {
        logError('Login falló - no se recibió token');
        console.log('Respuesta recibida:', JSON.stringify(response.data, null, 2));
        return false;
      }
    } catch (error) {
      logError(`Login falló: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async createTestOrder() {
    logInfo('📦 Creando orden de prueba...');
    
    // Primero obtener un producto existente para usar su ID
    try {
      const productsResponse = await axios.get(`${BASE_URL}/api/products`, {
        headers: {
          'x-admin-token': this.sessionToken
        }
      });
      
      if (!productsResponse.data.data || productsResponse.data.data.length === 0) {
        logError('No hay productos disponibles para crear la orden');
        return false;
      }
      
      const firstProduct = productsResponse.data.data[0];
      this.testProduct = firstProduct; // Guardar producto para usar en preferencias
      logInfo(`Usando producto: ${firstProduct.name} (ID: ${firstProduct.id})`);
      
      const orderData = {
        customer_name: 'Cliente Test Sandbox',
        customer_email: 'test.sandbox@mercadopago.com',
        customer_phone: '+5491112345678',
        items: [
          {
            product_id: firstProduct.id,
            quantity: 1,
            unit_price: firstProduct.price
          }
        ],
        shipping_address: {
          street: 'Calle Sandbox 456',
          number: '123',
          city: 'Buenos Aires',
          state: 'BA',
          zip: '1234',
          additional_info: 'Piso 2, Depto A'
        },
        payment_method: 'card',
        notes: 'Orden de prueba para testing de Mercado Pago'
      };

      // Crear la orden
      try {
      const response = await axios.post(`${BASE_URL}/api/orders`, orderData, {
        headers: {
          'x-admin-token': this.sessionToken,
          'Content-Type': 'application/json'
        }
      });

      // Extraer ID de la respuesta soportando distintos formatos
      const respData = response.data;
      const orderId = respData?.data?.order?.id || respData?.order?.id || respData?.id;

      if (orderId) {
        this.testOrderId = orderId;
        logSuccess(`Orden de prueba creada: ${this.testOrderId}`);
        return true;
      } else {
        logError('No se pudo crear la orden de prueba (respuesta sin ID)');
        console.log('Respuesta recibida:', JSON.stringify(respData, null, 2));
        return false;
      }
      } catch (error) {
        logError(`Error creando orden: ${error.response?.data?.message || error.message}`);
        return false;
      }
    } catch (error) {
      logError(`Error obteniendo productos: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async createPaymentPreference() {
    logInfo('💳 Creando preferencia de pago en sandbox...');
    
    // La API espera los datos completos de la orden, no solo order_id
    if (!this.testProduct) {
      logError('No hay producto disponible. Crea una orden primero.');
      return false;
    }
    
    const preferenceData = {
      items: [
        {
          product_id: this.testProduct.id,
          product_name: this.testProduct.name,
          quantity: 1,
          unit_price: this.testProduct.price
        }
      ],
      customer_email: 'test.sandbox@mercadopago.com',
      customer_name: 'Cliente Test Sandbox',
      shipping_address: {
        street: 'Calle Sandbox 456',
        number: '123',
        city: 'Buenos Aires',
        state: 'BA',
        zip: '1234',
        additional_info: 'Piso 2, Depto A'
      }
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/mercadopago/create-preference`, preferenceData, {
        headers: {
          'x-admin-token': this.sessionToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.preference_id && response.data.init_point) {
        this.testPreferenceId = response.data.preference_id;
        logSuccess(`Preferencia creada: ${this.testPreferenceId}`);
        logInfo(`URL de pago: ${response.data.init_point}`);
        
        // Mostrar instrucciones para testing
        logHeader('INSTRUCCIONES PARA TESTING EN SANDBOX');
        log('1. Abre la URL de pago en tu navegador', 'cyan');
        log('2. Usa las tarjetas de prueba de MP:', 'cyan');
        log('   - Aprobada: 4509 9535 6623 3704', 'green');
        log('   - Rechazada: 4000 0000 0000 0002', 'red');
        log('   - Pendiente: 4000 0000 0000 0101', 'yellow');
        log('3. CVV: 123, Fecha: 12/25', 'cyan');
        log('4. DNI: 12345678', 'cyan');
        log('5. Completa el pago y regresa aquí', 'cyan');
        
        return true;
      } else {
        logError('No se pudo crear la preferencia de pago');
        return false;
      }
    } catch (error) {
      logError(`Error creando preferencia: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async waitForPaymentCompletion() {
    logHeader('ESPERANDO COMPLETACIÓN DEL PAGO');
    log('⏳ Esperando que completes el pago en Mercado Pago...', 'yellow');
    log('💡 Una vez completado, presiona Enter para continuar', 'cyan');
    
    await question('Presiona Enter cuando hayas completado el pago...');
    
    logInfo('Verificando estado del pago...');
    return true;
  }

  async verifyPaymentStatus() {
    logInfo('🔍 Verificando estado del pago...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/mercadopago/payment-status/${this.testOrderId}`, {
        headers: {
          'x-admin-token': this.sessionToken
        }
      });

      const paymentInfo = response.data;
      
      logHeader('INFORMACIÓN DEL PAGO');
      log(`📊 Estado: ${paymentInfo.status || 'No disponible'}`, 'cyan');
      log(`🆔 Payment ID: ${paymentInfo.payment_id || 'No asignado'}`, 'cyan');
      log(`💳 Método: ${paymentInfo.payment_method_id || 'No disponible'}`, 'cyan');
      log(`💰 Monto: $${paymentInfo.transaction_amount || 'No disponible'}`, 'cyan');
      log(`📅 Fecha: ${paymentInfo.date_created || 'No disponible'}`, 'cyan');
      
      if (paymentInfo.status === 'approved') {
        logSuccess('¡Pago aprobado exitosamente!');
      } else if (paymentInfo.status === 'rejected') {
        logWarning('Pago rechazado - esto es normal en testing');
      } else if (paymentInfo.status === 'pending') {
        logInfo('Pago pendiente - verificar instrucciones del método');
      }
      
      return true;
    } catch (error) {
      logError(`Error verificando estado: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async verifyOrderUpdate() {
    logInfo('🔍 Verificando actualización de la orden...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/${this.testOrderId}`, {
        headers: {
          'x-admin-token': this.sessionToken
        }
      });

      const order = response.data;
      
      logHeader('ESTADO ACTUALIZADO DE LA ORDEN');
      log(`📦 ID Orden: ${order.id}`, 'cyan');
      log(`💳 Estado de Pago: ${order.payment_status || 'No asignado'}`, 'cyan');
      log(`🆔 Payment ID: ${order.payment_id || 'No asignado'}`, 'cyan');
      log(`🔗 Comprobante: ${order.comprobante_url || 'No disponible'}`, 'cyan');
      log(`📧 Email: ${order.email_comprador || 'No asignado'}`, 'cyan');
      log(`📅 Fecha Pago: ${order.fecha_pago || 'No asignado'}`, 'cyan');
      
      if (order.payment_status) {
        logSuccess('Orden actualizada correctamente con información de pago');
        return true;
      } else {
        logWarning('La orden no tiene estado de pago asignado');
        return false;
      }
    } catch (error) {
      logError(`Error verificando orden: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async testWebhookEndpoint() {
    logHeader('TESTING DEL ENDPOINT WEBHOOK');
    log('🔄 Verificando que el webhook esté funcionando...', 'cyan');
    
    try {
      // Test GET para verificar que el endpoint esté activo
      const response = await axios.get(`${BASE_URL}/api/mercadopago/webhook`);
      
      if (response.status === 200) {
        logSuccess('Endpoint webhook respondiendo correctamente');
        logInfo(`Respuesta: ${response.data.message || 'OK'}`);
        return true;
      } else {
        logError(`Webhook respondió con status: ${response.status}`);
        return false;
      }
    } catch (error) {
      logError(`Error en webhook: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async showTestingMenu() {
    logHeader('MENÚ DE TESTING');
    log('1. Crear orden de prueba', 'cyan');
    log('2. Crear preferencia de pago', 'cyan');
    log('3. Esperar completación de pago', 'cyan');
    log('4. Verificar estado del pago', 'cyan');
    log('5. Verificar actualización de orden', 'cyan');
    log('6. Test endpoint webhook', 'cyan');
    log('7. Ejecutar flujo completo', 'cyan');
    log('8. Salir', 'cyan');
    
    const choice = await question('\nSelecciona una opción (1-8): ');
    
    switch (choice) {
      case '1':
        await this.createTestOrder();
        break;
      case '2':
        await this.createPaymentPreference();
        break;
      case '3':
        await this.waitForPaymentCompletion();
        break;
      case '4':
        await this.verifyPaymentStatus();
        break;
      case '5':
        await this.verifyOrderUpdate();
        break;
      case '6':
        await this.testWebhookEndpoint();
        break;
      case '7':
        await this.runCompleteFlow();
        break;
      case '8':
        log('👋 ¡Hasta luego!', 'bright');
        process.exit(0);
        break;
      default:
        logError('Opción inválida');
    }
    
    // Continuar con el menú
    await this.showTestingMenu();
  }

  async runCompleteFlow() {
    logHeader('EJECUTANDO FLUJO COMPLETO');
    
    const steps = [
      { name: 'Crear Orden', method: () => this.createTestOrder() },
      { name: 'Crear Preferencia', method: () => this.createPaymentPreference() },
      { name: 'Esperar Pago', method: () => this.waitForPaymentCompletion() },
      { name: 'Verificar Pago', method: () => this.verifyPaymentStatus() },
      { name: 'Verificar Orden', method: () => this.verifyOrderUpdate() },
      { name: 'Test Webhook', method: () => this.testWebhookEndpoint() }
    ];

    let passedSteps = 0;
    
    for (const step of steps) {
      log(`\n📋 ${step.name}...`, 'magenta');
      try {
        const result = await step.method();
        if (result) {
          logSuccess(`${step.name} completado`);
          passedSteps++;
        } else {
          logError(`${step.name} falló`);
          break;
        }
      } catch (error) {
        logError(`${step.name} error: ${error.message}`);
        break;
      }
    }

    log('\n' + '='.repeat(60), 'cyan');
    if (passedSteps === steps.length) {
      log('🎉 FLUJO COMPLETO EXITOSO!', 'bright');
      logSuccess('FASE 1 COMPLETADA AL 100%');
    } else {
      logError(`❌ ${steps.length - passedSteps} de ${steps.length} pasos fallaron`);
      logWarning('Revisa los errores y ejecuta nuevamente');
    }
  }

  async cleanup() {
    logInfo('🧹 Limpiando datos de prueba...');
    
    if (this.testOrderId) {
      try {
        await axios.delete(`${BASE_URL}/api/orders/${this.testOrderId}`, {
          headers: {
            'Authorization': `Bearer ${this.sessionToken}`
          }
        });
        logSuccess('Orden de prueba eliminada');
      } catch (error) {
        logWarning(`No se pudo eliminar orden de prueba: ${error.message}`);
      }
    }
  }
}

// Función principal
async function main() {
  const tester = new MercadoPagoSandboxTester();
  
  try {
    await tester.init();
    await tester.login();
    
    logHeader('INICIO DE TESTING MANUAL');
    log('Este script te permite probar el flujo completo de Mercado Pago', 'cyan');
    log('en modo sandbox con pagos reales de prueba.', 'cyan');
    
    await tester.showTestingMenu();
    
  } catch (error) {
    logError(`Error en testing: ${error.message}`);
  } finally {
    await tester.cleanup();
    rl.close();
    log('\n👋 Testing completado', 'bright');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = MercadoPagoSandboxTester;
