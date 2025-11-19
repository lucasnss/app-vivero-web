#!/usr/bin/env node

/**
 * Script de Testing para Flujo Completo de Mercado Pago
 * 
 * Este script prueba:
 * 1. Creación de preferencia de pago
 * 2. Simulación de webhook
 * 3. Verificación de actualización de orden
 * 4. Edge cases y manejo de errores
 */

const axios = require('axios');
const crypto = require('crypto');

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

// Clase principal de testing
class MercadoPagoTester {
  constructor() {
    this.sessionToken = null;
    this.testOrderId = null;
    this.testPreferenceId = null;
    this.testPaymentId = null;
    this._lastOrderPayload = null; // Para reutilizar el payload de la orden
  }

  async init() {
    log('🚀 Iniciando Testing de Mercado Pago...', 'bright');
    log(`📍 URL Base: ${BASE_URL}`, 'cyan');
    
    // Verificar que el servidor esté corriendo
    try {
      const response = await axios.get(`${BASE_URL}/api/health`);
      logSuccess('Servidor respondiendo correctamente');
      return true;
    } catch (error) {
      logError('Servidor no responde. Asegúrate de que esté corriendo en ' + BASE_URL);
      return false;
    }
  }

  async login() {
    logInfo('🔐 Iniciando sesión como admin...');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/admin/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });

      const token = response.data?.data?.token;
      if (token) {
        this.sessionToken = token;
        logSuccess('Login exitoso');
        return true;
      } else {
        logError('Login falló - no se recibió token');
        return false;
      }
    } catch (error) {
      logError(`Login falló: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async createTestOrder() {
    logInfo('📦 Creando orden de prueba...');
    
    try {
      // Obtener productos reales para construir items válidos
      const productsResp = await axios.get(`${BASE_URL}/api/products?limit=2`);
      const products = productsResp.data?.data || [];

      // Agregar filtro para productos con precio válido
      const validProducts = products.filter(p => Number(p.price) > 0);
      let selected;
      if (validProducts.length > 0) {
        selected = validProducts.slice(0, 2);
      } else {
        // Fallback: items hardcodeados si no hay productos válidos
        logWarning('No hay productos con precio >0, usando items de prueba');
        selected = [
          { id: 'test-product-1', price: 2500, name: 'Planta Test 1' },
          { id: 'test-product-2', price: 1500, name: 'Planta Test 2' }
        ];
      }

      const orderData = {
        items: selected.map((p) => ({
          product_id: p.id,
          quantity: 1,
          unit_price: Number(p.price) // Asegurar número >0
        })),
        shipping_address: {
          street: 'Calle Test 123',
          number: '123',
          city: 'Buenos Aires',
          state: 'BA',
          zip: '1234'
        },
        payment_method: 'cash',
        customer_email: 'test@mercadopago.com',
        customer_name: 'Cliente Test MP',
        customer_phone: '+5491112345678'
      };

      const calculatedTotal = orderData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      if (calculatedTotal <= 0) {
        throw new Error('Total calculado inválido: ' + calculatedTotal);
      }
      logInfo(`Total calculado para orden: $${calculatedTotal}`);

      const response = await axios.post(`${BASE_URL}/api/orders`, orderData, {
        headers: {
          'x-admin-token': this.sessionToken,
          'Content-Type': 'application/json'
        }
      });

      const newOrderId = response.data?.data?.order?.id || response.data?.data?.id || response.data?.id;
      if (newOrderId) {
        this.testOrderId = newOrderId;
        this._lastOrderPayload = orderData;
        logSuccess(`Orden de prueba creada: ${this.testOrderId}`);
        return true;
      } else {
        logError('No se pudo crear la orden de prueba');
        return false;
      }
    } catch (error) {
      logError(`Error creando orden: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async createPaymentPreference() {
    logInfo('💳 Creando preferencia de pago...');
    
    try {
      const preferenceData = this._lastOrderPayload || null;
      if (!preferenceData) {
        logError('No hay payload de orden previo para crear preferencia');
        return false;
      }

      const response = await axios.post(`${BASE_URL}/api/mercadopago/create-preference`, preferenceData, {
        headers: {
          'x-admin-token': this.sessionToken,
          'Content-Type': 'application/json'
        }
      });

      const prefId = response.data?.data?.preference_id || response.data?.preference_id;
      const initPoint = response.data?.data?.init_point || response.data?.init_point;
      const orderIdFromPref = response.data?.data?.order_id;
      if (orderIdFromPref) this.testOrderId = orderIdFromPref;

      if (prefId && initPoint) {
        this.testPreferenceId = prefId;
        logSuccess(`Preferencia creada: ${this.testPreferenceId}`);
        logInfo(`URL de pago: ${initPoint}`);
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

  async simulateWebhook(paymentStatus = 'approved') {
    logInfo(`🔄 Simulando webhook con status: ${paymentStatus}`);
    
    try {
      // Simular datos de webhook de Mercado Pago
      const webhookData = {
        type: 'payment',
        data: {
          id: `test-payment-${this.testOrderId}` // Usar ID de orden real para testing
        }
      };

      // Simular firma de webhook (en producción esto vendría de MP)
      const signature = crypto.createHmac('sha256', 'test-secret').update(JSON.stringify(webhookData)).digest('hex');

      const response = await axios.post(`${BASE_URL}/api/mercadopago/webhook`, webhookData, {
        headers: {
          'X-Signature': signature,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        logSuccess('Webhook procesado correctamente');
        return true;
      } else {
        logError(`Webhook falló con status: ${response.status}`);
        return false;
      }
    } catch (error) {
      logError(`Error en webhook: ${error.response?.data?.message || error.message}`);
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

      const order = response.data?.data?.order || response.data?.data || response.data;
      
      if (order.payment_status) {
        logSuccess(`Estado de pago actualizado: ${order.payment_status}`);
        logInfo(`Payment ID: ${order.payment_id || 'No asignado'}`);
        logInfo(`Método de pago: ${order.metodo_pago || 'No asignado'}`);
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

  async testEdgeCases() {
    logInfo('🧪 Probando edge cases...');
    
    const testCases = [
      {
        name: 'Webhook sin firma',
        test: async () => {
          try {
            await axios.post(`${BASE_URL}/api/mercadopago/webhook`, { type: 'payment' });
            return false; // Debería fallar
          } catch (error) {
            return error.response?.status === 400; // Debería dar 400
          }
        }
      },
      {
        name: 'Webhook con datos inválidos',
        test: async () => {
          try {
            await axios.post(`${BASE_URL}/api/mercadopago/webhook`, { invalid: 'data' });
            return false; // Debería fallar
          } catch (error) {
            return error.response?.status === 400; // Debería dar 400
          }
        }
      },
      {
        name: 'Consulta de estado de pago',
        test: async () => {
          try {
            const response = await axios.get(`${BASE_URL}/api/mercadopago/payment-status/${this.testOrderId}`);
            return response.status === 200;
          } catch (error) {
            return false;
          }
        }
      }
    ];

    let passedTests = 0;
    
    for (const testCase of testCases) {
      try {
        const result = await testCase.test();
        if (result) {
          logSuccess(`${testCase.name}: PASÓ`);
          passedTests++;
        } else {
          logError(`${testCase.name}: FALLÓ`);
        }
      } catch (error) {
        logError(`${testCase.name}: ERROR - ${error.message}`);
      }
    }

    logInfo(`Edge cases: ${passedTests}/${testCases.length} pasaron`);
    return passedTests === testCases.length;
  }

  async runFullTest() {
    log('🧪 INICIANDO TEST COMPLETO DE MERCADO PAGO', 'bright');
    log('=' .repeat(60), 'cyan');
    
    const steps = [
      { name: 'Inicialización', method: () => this.init() },
      { name: 'Login Admin', method: () => this.login() },
      { name: 'Crear Orden', method: () => this.createTestOrder() },
      { name: 'Crear Preferencia', method: () => this.createPaymentPreference() },
      { name: 'Simular Webhook', method: () => this.simulateWebhook() },
      { name: 'Verificar Orden', method: () => this.verifyOrderUpdate() },
      { name: 'Edge Cases', method: () => this.testEdgeCases() }
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
          break; // Detener si un paso crítico falla
        }
      } catch (error) {
        logError(`${step.name} error: ${error.message}`);
        break;
      }
    }

    log('\n' + '=' .repeat(60), 'cyan');
    if (passedSteps === steps.length) {
      log('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE!', 'bright');
      logSuccess('FASE 1 COMPLETADA AL 100%');
    } else {
      logError(`❌ ${steps.length - passedSteps} de ${steps.length} tests fallaron`);
      logWarning('Revisa los errores y ejecuta nuevamente');
    }
    
    return passedSteps === steps.length;
  }

  async cleanup() {
    logInfo('🧹 Limpiando datos de prueba...');
    
    if (this.testOrderId) {
      try {
        await axios.delete(`${BASE_URL}/api/orders/${this.testOrderId}`, {
          headers: {
            'x-admin-token': this.sessionToken
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
  const tester = new MercadoPagoTester();
  
  try {
    const success = await tester.runFullTest();
    
    if (success) {
      log('\n🚀 RECOMENDACIONES PARA PRODUCCIÓN:', 'bright');
      log('1. Configurar credenciales reales de Mercado Pago', 'cyan');
      log('2. Configurar webhook en panel de MP', 'cyan');
      log('3. Probar con pagos reales en sandbox', 'cyan');
      log('4. Monitorear logs y métricas', 'cyan');
      log('5. Implementar alertas para webhooks fallidos', 'cyan');
    }
    
  } catch (error) {
    logError(`Error en test principal: ${error.message}`);
  } finally {
    await tester.cleanup();
    log('\n👋 Testing completado', 'bright');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = MercadoPagoTester;
