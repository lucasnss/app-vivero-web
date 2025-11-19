#!/usr/bin/env node

/**
 * Script para crear el archivo .env.local a partir de env.example
 */

const fs = require('fs');
const path = require('path');

// Ruta de los archivos
const examplePath = path.join(__dirname, 'env.example');
const envPath = path.join(__dirname, '.env.local');

console.log('🚀 Creando archivo .env.local para MercadoPago...\n');

// Verificar si existe env.example
if (!fs.existsSync(examplePath)) {
  console.error('❌ Error: No se encontró el archivo env.example');
  process.exit(1);
}

// Leer contenido de env.example
let envContent;
try {
  envContent = fs.readFileSync(examplePath, 'utf8');
  console.log('✅ Archivo env.example leído correctamente');
} catch (error) {
  console.error('❌ Error al leer env.example:', error.message);
  process.exit(1);
}

// Escribir contenido en .env.local
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env.local creado exitosamente');
} catch (error) {
  console.error('❌ Error al crear .env.local:', error.message);
  process.exit(1);
}

console.log('\n✅ Configuración completada. Por favor:');
console.log('1. Reinicia el servidor Next.js');
console.log('2. Intenta nuevamente el checkout con MercadoPago');