// Script para configurar dependencias de testing
// Ejecutar con: node setup-testing.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}====================================`);
console.log(`  CONFIGURACIÓN DE TESTING PARA API  `);
console.log(`====================================${colors.reset}\n`);

// Verificar si package.json existe
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log(`${colors.red}❌ ERROR: No se encontró package.json en la carpeta Fronted${colors.reset}`);
  console.log(`${colors.yellow}Asegúrate de estar en la carpeta correcta del proyecto${colors.reset}`);
  process.exit(1);
}

// Función para ejecutar comandos
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.blue}🔄 ${description}...${colors.reset}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`${colors.yellow}⚠️  Advertencia: ${stderr}${colors.reset}`);
      }
      console.log(`${colors.green}✅ ${description} completado${colors.reset}\n`);
      resolve(stdout);
    });
  });
}

// Función principal de setup
async function setupTesting() {
  try {
    // Verificar si hay soporte para fetch
    try {
      require('undici');
      console.log(`${colors.green}✅ undici ya está instalado${colors.reset}\n`);
    } catch (error) {
      try {
        require('node-fetch');
        console.log(`${colors.green}✅ node-fetch ya está instalado${colors.reset}\n`);
      } catch (e) {
        // Instalar node-fetch para soporte de fetch en Node.js
        await runCommand('npm install node-fetch@2 --legacy-peer-deps', 'Instalando node-fetch para soporte de fetch');
      }
    }
    
    console.log(`${colors.magenta}====================================`);
    console.log(`       CONFIGURACIÓN COMPLETADA     `);
    console.log(`====================================${colors.reset}\n`);
    
    console.log(`${colors.green}🎉 ¡Setup completado exitosamente!${colors.reset}\n`);
    
    console.log(`${colors.cyan}Comandos disponibles para testing:${colors.reset}`);
    console.log(`${colors.yellow}1. Testing completo de APIs:${colors.reset}`);
    console.log(`   cd Fronted && node test-api.js`);
    console.log('');
    console.log(`${colors.yellow}2. Testing del carrito:${colors.reset}`);
    console.log(`   cd Fronted && node test-cart.js`);
    console.log('');
    console.log(`${colors.yellow}3. Asegúrate de que el servidor esté corriendo:${colors.reset}`);
    console.log(`   cd Fronted && npm run dev`);
    console.log('');
    
  } catch (error) {
    console.log(`${colors.red}❌ ERROR durante el setup: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Ejecutar setup
setupTesting(); 