#!/usr/bin/env node

/**
 * Script para configurar las variables de entorno de MercadoPago
 * Este script copia env.example a .env.local si no existe
 */

const fs = require('fs');
const path = require('path');

// Configuración de Mercado Pago para desarrollo
const envContent = `NEXT_PUBLIC_SUPABASE_URL=https://zqiqpevtoacevzhnkeky.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxaXFwZXZ0b2FjZXZ6aG5rZWt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA5NzY1MCwiZXhwIjoyMDY3NjczNjUwfQ.wHsH-6YcSUheb0uapCIjIN260fAGWpYPC0TZiha5VjM
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxaXFwZXZ0b2FjZXZ6aG5rZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTc2NTAsImV4cCI6MjA2NzY3MzY1MH0.gUSvigtSVpRmqMwuGa2ZjtcsXzUoo_P4d4jfw1tXFGI
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=vivero-web-secret-key-development

# Mercado Pago Configuration
MP_ACCESS_TOKEN=TEST-1234567890123456-123456-1234567890abcdef1234567890abcdef-123456789
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-1234567890123456-123456-1234567890abcdef1234567890abcdef-123456789
NEXT_PUBLIC_BASE_URL=https://f9c5a233dcaa.ngrok-free.app
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env.local creado exitosamente');
  console.log('📝 Variables de entorno configuradas:');
  console.log('   - MP_ACCESS_TOKEN: Token de prueba configurado');
  console.log('   - NEXT_PUBLIC_BASE_URL: URL de ngrok configurada');
  console.log('   - NEXT_PUBLIC_MP_PUBLIC_KEY: Clave pública configurada');
  console.log('');
  console.log('🔄 Reinicia el servidor de desarrollo para aplicar los cambios');
} catch (error) {
  console.error('❌ Error creando .env.local:', error.message);
  console.log('');
  console.log('📋 Copia manualmente este contenido en un archivo .env.local:');
  console.log('');
  console.log(envContent);
}