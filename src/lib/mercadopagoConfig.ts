import { MercadoPagoConfig } from 'mercadopago'

// Configuración de Mercado Pago
const accessToken = process.env.MP_ACCESS_TOKEN

// En desarrollo, usar token de prueba por defecto si no está configurado
const defaultAccessToken = 'TEST-1234567890123456-123456-1234567890abcdef1234567890abcdef-123456789'
const finalAccessToken = accessToken || (process.env.NODE_ENV === 'development' ? defaultAccessToken : null)

// Detectar si estamos usando credenciales ficticias
export const isUsingFakeCredentials = finalAccessToken === defaultAccessToken

if (!finalAccessToken) {
  throw new Error('MP_ACCESS_TOKEN no está configurado en las variables de entorno')
}

// Cliente de Mercado Pago
export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: finalAccessToken,
  options: {
    timeout: 5000,
  }
})

// URLs de configuración
export const mercadoPagoConfig = {
  // URLs de retorno (se configuran dinámicamente según el entorno)
  urls: {
    success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pago/success`,
    failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pago/failure`,
    pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pago/pending`,
    // ⚠️ TEMPORAL: Forzar URL principal para webhook (evitar problema de deployments múltiples)
    notification: process.env.NODE_ENV === 'production' 
      ? 'https://app-vivero-web.vercel.app/api/mercadopago/webhook'
      : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mercadopago/webhook`,
  },
  
  // Configuración del checkout
  checkout: {
    // Métodos de pago excluidos (más granular)
    excludedPaymentMethods: [
      // Métodos de efectivo específicos
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
      { id: 'rapi_pago' },
      // Tarjetas que no queremos (opcional)
      // { id: 'amex' },      // American Express
      // { id: 'visa' },      // Visa débito
    ],
    
    // Tipos de pago excluidos (opcional)
    excludedPaymentTypes: [
      // Desactivar efectivo/cupones (Rapipago, Pago Fácil, etc.)
      { id: 'ticket' },
      // Desactivar pagos por cajero automático
      { id: 'atm' },
      // Desactivar otros métodos offline si existen
      // { id: 'bank_transfer' }, // Transferencias bancarias (si aplica)
    ],
    
    // Cuotas máximas
    maxInstallments: 12,
    
    // Auto return (redirigir automáticamente después del pago)
    autoReturn: 'approved' as const,
  },
  
  // Configuración para desarrollo/testing
  development: {
    // En desarrollo, usar URLs locales
    isProduction: process.env.NODE_ENV === 'production',
    
    // Configuración de logging
    enableLogging: process.env.NODE_ENV === 'development',
  }
} as const

// Función helper para validar configuración
export function validateMercadoPagoConfig(): void {
  // Configurar URL base por defecto en desarrollo
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  // En desarrollo, permitir configuración por defecto
  if (process.env.NODE_ENV === 'development') {
    const token = finalAccessToken
    if (token) {
      const isTestToken = token.startsWith('TEST-')
      const isProdToken = token.startsWith('APP_USR-')
      
      if (!isTestToken && !isProdToken) {
        console.warn('⚠️  Usando token de prueba por defecto para desarrollo')
      }
      
      // Log de configuración en desarrollo
      if (mercadoPagoConfig.development.enableLogging) {
        console.log('🔧 Mercado Pago configurado (DESARROLLO):')
        console.log(`   - Ambiente: ${isTestToken ? 'SANDBOX' : 'DESARROLLO'}`)
        console.log(`   - Base URL: ${baseUrl}`)
        console.log(`   - URLs configuradas: ✅`)
      }
    }
    return
  }
  
  // En producción, requerir configuración completa
  const requiredVars = [
    'MP_ACCESS_TOKEN',
    'NEXT_PUBLIC_BASE_URL',
    'NODE_ENV'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(
      `Variables de entorno faltantes para Mercado Pago: ${missingVars.join(', ')}`
    )
  }
  
  // Validar formato del token
  const token = process.env.MP_ACCESS_TOKEN!
  const isTestToken = token.startsWith('TEST-')
  const isProdToken = token.startsWith('APP_USR-')
  
  if (!isTestToken && !isProdToken) {
    throw new Error('MP_ACCESS_TOKEN no tiene un formato válido')
  }
}

// Validar configuración al importar el módulo
validateMercadoPagoConfig()

// ✅ Log de ambiente para debugging en Vercel logs
if (typeof window === 'undefined') {
  const env = process.env.NODE_ENV || 'unknown'
  const isProduction = env === 'production'
  console.log(`🌍 Ambiente detectado: ${isProduction ? '✅ PRODUCCIÓN' : '⚠️ DESARROLLO'} (NODE_ENV=${env})`)
}