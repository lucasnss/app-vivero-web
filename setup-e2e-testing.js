#!/usr/bin/env node

/**
 * 🔧 CONFIGURACIÓN PARA TESTING END-TO-END
 * 
 * Este script configura el entorno para ejecutar tests de integración end-to-end
 * que simulan el flujo completo de carrito → checkout
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

/**
 * Función para ejecutar comandos de forma segura
 */
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.cyan}🔧 ${description}...${colors.reset}`)
    
    try {
      const output = execSync(command, { 
        cwd: process.cwd(),
        stdio: 'pipe',
        encoding: 'utf8'
      })
      console.log(`${colors.green}✅ ${description} completado${colors.reset}`)
      resolve(output)
    } catch (error) {
      console.log(`${colors.red}❌ Error en ${description}: ${error.message}${colors.reset}`)
      reject(error)
    }
  })
}

/**
 * Función principal de configuración
 */
async function setupE2ETesting() {
  try {
    console.log(`${colors.magenta}====================================`)
    console.log(`  CONFIGURACIÓN TESTING END-TO-END`)
    console.log(`====================================${colors.reset}`)
    console.log(`🚀 Configurando entorno para tests de integración...`)
    console.log('')
    
    // Verificar si estamos en el directorio correcto
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`${colors.red}❌ No se encontró package.json${colors.reset}`)
      console.log(`   Asegúrate de estar en el directorio Fronted del proyecto`)
      process.exit(1)
    }
    
    // Verificar si hay soporte para fetch
    try {
      require('undici')
      console.log(`${colors.green}✅ undici ya está instalado${colors.reset}`)
    } catch (error) {
      try {
        require('node-fetch')
        console.log(`${colors.green}✅ node-fetch ya está instalado${colors.reset}`)
      } catch (e) {
        // Instalar node-fetch para soporte de fetch en Node.js
        await runCommand('npm install node-fetch@2 --legacy-peer-deps', 'Instalando node-fetch para soporte de fetch')
      }
    }
    
    // Verificar que el archivo de test existe
    const testFile = path.join(process.cwd(), 'test-cart-checkout-integration.js')
    if (!fs.existsSync(testFile)) {
      console.log(`${colors.red}❌ No se encontró el archivo de test${colors.reset}`)
      console.log(`   Archivo esperado: test-cart-checkout-integration.js`)
      process.exit(1)
    }
    
    // Verificar que el servidor esté corriendo
    console.log(`\n${colors.blue}🔍 Verificando estado del servidor...${colors.reset}`)
    try {
      const fetch = require('node-fetch')
      const response = await fetch('http://localhost:3000/api/health')
      if (response.ok) {
        console.log(`${colors.green}✅ Servidor funcionando en http://localhost:3000${colors.reset}`)
      } else {
        console.log(`${colors.yellow}⚠️ Servidor respondió con status: ${response.status}${colors.reset}`)
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠️ No se puede conectar al servidor: ${error.message}${colors.reset}`)
      console.log(`   Asegúrate de ejecutar 'npm run dev' en otra terminal`)
    }
    
    console.log(`\n${colors.magenta}====================================`)
    console.log(`       CONFIGURACIÓN COMPLETADA     `)
    console.log(`====================================${colors.reset}`)
    
    console.log(`${colors.green}🎉 ¡Setup completado exitosamente!${colors.reset}`)
    
    console.log(`\n${colors.cyan}Comandos disponibles para testing end-to-end:${colors.reset}`)
    console.log(`${colors.yellow}1. Ejecutar test de integración:${colors.reset}`)
    console.log(`   node test-cart-checkout-integration.js`);
    console.log('');
    console.log(`${colors.yellow}2. Asegúrate de que el servidor esté corriendo:${colors.reset}`)
    console.log(`   npm run dev`);
    console.log('');
    console.log(`${colors.yellow}3. El test verificará:${colors.reset}`)
    console.log(`   ✅ Servidor funcionando`);
    console.log(`   ✅ Crear producto de prueba`);
    console.log(`   ✅ Agregar al carrito`);
    console.log(`   ✅ Validar carrito`);
    console.log(`   ✅ Navegar al carrito`);
    console.log(`   ✅ Revisar carrito`);
    console.log(`   ✅ Formulario de checkout`);
    console.log(`   ✅ Preparar orden`);
    console.log(`   ✅ Crear orden (simulada)`);
    console.log(`   ✅ Flujo completo validado`);
    console.log('');
    console.log(`${colors.blue}🚀 ¡Listo para ejecutar tests de integración end-to-end!${colors.reset}`)
    
  } catch (error) {
    console.log(`${colors.red}❌ ERROR durante el setup: ${error.message}${colors.reset}`)
    process.exit(1)
  }
}

// Ejecutar setup
setupE2ETesting()
