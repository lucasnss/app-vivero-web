#!/usr/bin/env node

/**
 * Script de Verificación: Configuración de Mercado Pago para Producción
 * 
 * Este script verifica que todas las variables de entorno estén configuradas
 * correctamente para usar Mercado Pago en producción.
 * 
 * Uso:
 *   node scripts/verify-mp-production-config.js
 */

const fs = require('fs')
const path = require('path')

// Colores para la terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkmark() {
  return '✅'
}

function cross() {
  return '❌'
}

function warning() {
  return '⚠️'
}

console.log('\n')
log('═══════════════════════════════════════════════════════════', 'cyan')
log('  Verificación de Configuración de Mercado Pago', 'cyan')
log('═══════════════════════════════════════════════════════════', 'cyan')
console.log('\n')

// Cargar variables de entorno
let envVars = {}
const envPath = path.join(process.cwd(), '.env.local')

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  })
  log(`${checkmark()} Archivo .env.local encontrado`, 'green')
} else {
  log(`${cross()} Archivo .env.local NO encontrado`, 'red')
  log('   Creando uno de ejemplo...', 'yellow')
}

console.log('\n')
log('─────────────────────────────────────────────────────────', 'blue')
log('1. Verificando Variables de Mercado Pago', 'blue')
log('─────────────────────────────────────────────────────────', 'blue')
console.log('\n')

// Variables requeridas
const requiredVars = {
  'MP_ACCESS_TOKEN': {
    description: 'Access Token de Mercado Pago',
    pattern: /^(APP_USR-|TEST-)/,
    productionPattern: /^APP_USR-/
  },
  'NEXT_PUBLIC_MP_PUBLIC_KEY': {
    description: 'Public Key de Mercado Pago',
    pattern: /^(APP_USR-|TEST-)/,
    productionPattern: /^APP_USR-/
  },
  'NEXT_PUBLIC_BASE_URL': {
    description: 'URL base de la aplicación',
    pattern: /^https?:\/\//,
    productionPattern: /^https:\/\//
  }
}

let allPassed = true
let isProduction = true

for (const [varName, config] of Object.entries(requiredVars)) {
  const value = process.env[varName] || envVars[varName]
  
  if (!value) {
    log(`${cross()} ${varName}`, 'red')
    log(`   ${config.description}`, 'red')
    log(`   Estado: NO configurada`, 'red')
    allPassed = false
    continue
  }

  // Verificar formato
  if (!config.pattern.test(value)) {
    log(`${cross()} ${varName}`, 'red')
    log(`   ${config.description}`, 'red')
    log(`   Valor: ${value.substring(0, 20)}...`, 'red')
    log(`   Estado: Formato inválido`, 'red')
    allPassed = false
    continue
  }

  // Verificar si es producción
  const isProductionValue = config.productionPattern.test(value)
  
  if (!isProductionValue && varName.includes('MP_')) {
    isProduction = false
    log(`${warning()} ${varName}`, 'yellow')
    log(`   ${config.description}`, 'yellow')
    log(`   Valor: ${value.substring(0, 30)}...`, 'yellow')
    log(`   Estado: CREDENCIALES DE TEST (no producción)`, 'yellow')
  } else if (varName === 'NEXT_PUBLIC_BASE_URL' && (value.includes('localhost') || value.includes('ngrok'))) {
    isProduction = false
    log(`${warning()} ${varName}`, 'yellow')
    log(`   ${config.description}`, 'yellow')
    log(`   Valor: ${value}`, 'yellow')
    log(`   Estado: URL de DESARROLLO (localhost o ngrok)`, 'yellow')
  } else {
    log(`${checkmark()} ${varName}`, 'green')
    log(`   ${config.description}`, 'green')
    log(`   Valor: ${value.substring(0, 30)}...`, 'green')
    log(`   Estado: Configurada correctamente`, 'green')
  }
  
  console.log('')
}

console.log('\n')
log('─────────────────────────────────────────────────────────', 'blue')
log('2. Verificando Variables de Supabase', 'blue')
log('─────────────────────────────────────────────────────────', 'blue')
console.log('\n')

const supabaseVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
for (const varName of supabaseVars) {
  const value = process.env[varName] || envVars[varName]
  if (value) {
    log(`${checkmark()} ${varName}`, 'green')
  } else {
    log(`${cross()} ${varName}`, 'red')
    allPassed = false
  }
}

console.log('\n')
log('─────────────────────────────────────────────────────────', 'blue')
log('3. Verificando Variables de Email', 'blue')
log('─────────────────────────────────────────────────────────', 'blue')
console.log('\n')

const emailVars = ['EMAIL_USER', 'EMAIL_PASSWORD']
for (const varName of emailVars) {
  const value = process.env[varName] || envVars[varName]
  if (value) {
    log(`${checkmark()} ${varName}`, 'green')
  } else {
    log(`${cross()} ${varName}`, 'red')
    allPassed = false
  }
}

console.log('\n')
log('─────────────────────────────────────────────────────────', 'blue')
log('4. Verificando Variables de Seguridad', 'blue')
log('─────────────────────────────────────────────────────────', 'blue')
console.log('\n')

const jwtSecret = process.env.JWT_SECRET || envVars.JWT_SECRET
if (jwtSecret) {
  if (jwtSecret.length < 32) {
    log(`${warning()} JWT_SECRET`, 'yellow')
    log(`   Longitud: ${jwtSecret.length} caracteres`, 'yellow')
    log(`   Recomendación: Mínimo 32 caracteres para producción`, 'yellow')
  } else if (jwtSecret === 'vivero-web-secret-key-development') {
    log(`${warning()} JWT_SECRET`, 'yellow')
    log(`   Estado: Usando valor de desarrollo`, 'yellow')
    log(`   Recomendación: Cambiar a un valor único para producción`, 'yellow')
  } else {
    log(`${checkmark()} JWT_SECRET`, 'green')
    log(`   Longitud: ${jwtSecret.length} caracteres`, 'green')
  }
} else {
  log(`${cross()} JWT_SECRET`, 'red')
  allPassed = false
}

console.log('\n')
log('═══════════════════════════════════════════════════════════', 'cyan')
log('  Resultado de la Verificación', 'cyan')
log('═══════════════════════════════════════════════════════════', 'cyan')
console.log('\n')

if (allPassed && isProduction) {
  log(`${checkmark()} ¡Todo configurado correctamente para PRODUCCIÓN!`, 'green')
  console.log('\n')
  log('Próximos pasos:', 'cyan')
  log('1. Hacer deploy a Vercel: vercel --prod', 'cyan')
  log('2. Configurar las mismas variables en Vercel Dashboard', 'cyan')
  log('3. Registrar webhook en Mercado Pago', 'cyan')
  log('4. Realizar pruebas con tarjeta de test', 'cyan')
  console.log('\n')
} else if (allPassed && !isProduction) {
  log(`${warning()} Configuración completa pero usando credenciales de DESARROLLO`, 'yellow')
  console.log('\n')
  log('Para pasar a PRODUCCIÓN:', 'cyan')
  log('1. Obtener credenciales de PRODUCCIÓN del cliente', 'cyan')
  log('   - Access Token que empiece con APP_USR-', 'cyan')
  log('   - Public Key que empiece con APP_USR-', 'cyan')
  log('2. Cambiar NEXT_PUBLIC_BASE_URL a tu dominio de producción', 'cyan')
  log('3. Actualizar las variables de entorno', 'cyan')
  log('4. Hacer re-deploy', 'cyan')
  console.log('\n')
} else {
  log(`${cross()} Hay errores en la configuración`, 'red')
  console.log('\n')
  log('Revisa los errores arriba y corrige las variables faltantes.', 'red')
  log('Consulta el archivo: PRODUCCION-MERCADOPAGO-CHECKLIST.md', 'yellow')
  console.log('\n')
  process.exit(1)
}

console.log('\n')

