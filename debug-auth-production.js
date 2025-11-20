/**
 * 🔍 SCRIPT DE DEBUG PARA AUTENTICACIÓN EN PRODUCCIÓN
 * 
 * Uso:
 * 1. Abrí tu sitio en producción
 * 2. Abrí la consola del navegador (F12)
 * 3. Copiá y pegá este script completo
 * 4. Presioná Enter
 * 5. Mirá los resultados
 */

console.log('🚀 Iniciando diagnóstico de autenticación...\n');

// ============================================================================
// 1. VERIFICAR COOKIES
// ============================================================================
console.log('📋 1. VERIFICANDO COOKIES:');
const cookies = document.cookie.split(';').map(c => c.trim());
console.log('Cookies actuales:', cookies);

const authTokenCookie = cookies.find(c => c.startsWith('auth-token='));
if (authTokenCookie) {
  console.log('✅ Cookie auth-token encontrada:', authTokenCookie.substring(0, 30) + '...');
} else {
  console.log('❌ Cookie auth-token NO encontrada');
}

console.log('\n');

// ============================================================================
// 2. VERIFICAR URL Y ENTORNO
// ============================================================================
console.log('🌐 2. VERIFICANDO ENTORNO:');
console.log('URL actual:', window.location.href);
console.log('Hostname:', window.location.hostname);
console.log('Protocol:', window.location.protocol);
console.log('Pathname:', window.location.pathname);

console.log('\n');

// ============================================================================
// 3. TESTEAR /api/auth/me
// ============================================================================
console.log('🔐 3. TESTEANDO /api/auth/me:');

const startTime = Date.now();

fetch('/api/auth/me', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('📡 Respuesta recibida:');
    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    console.log('  - OK:', response.ok);
    console.log('  - Tiempo de respuesta:', responseTime, 'ms');
    
    if (responseTime > 500) {
      console.log('⚠️ ADVERTENCIA: Tiempo de respuesta alto (' + responseTime + 'ms)');
      console.log('   Esto puede causar race conditions en la carga inicial.');
    }
    
    return response.json();
  })
  .then(data => {
    console.log('📦 Datos recibidos:', data);
    
    if (data.success && data.data?.admin) {
      console.log('✅ AUTENTICACIÓN EXITOSA');
      console.log('   - Email:', data.data.admin.email);
      console.log('   - Nombre:', data.data.admin.name);
      console.log('   - Rol:', data.data.admin.role);
    } else {
      console.log('❌ NO AUTENTICADO');
      console.log('   - Razón:', data.error?.message || 'Usuario no encontrado');
    }
  })
  .catch(error => {
    console.error('❌ ERROR en /api/auth/me:', error);
    console.log('   Esto indica un problema de red o CORS');
  });

console.log('\n');

// ============================================================================
// 4. VERIFICAR LOCAL STORAGE
// ============================================================================
console.log('💾 4. VERIFICANDO LOCAL STORAGE:');
const localStorageKeys = Object.keys(localStorage);
console.log('Keys en localStorage:', localStorageKeys);

localStorageKeys.forEach(key => {
  if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) {
    console.log(`  - ${key}:`, localStorage.getItem(key)?.substring(0, 30) + '...');
  }
});

if (localStorageKeys.length === 0) {
  console.log('  (vacío)');
}

console.log('\n');

// ============================================================================
// 5. VERIFICAR SESSION STORAGE
// ============================================================================
console.log('💾 5. VERIFICANDO SESSION STORAGE:');
const sessionStorageKeys = Object.keys(sessionStorage);
console.log('Keys en sessionStorage:', sessionStorageKeys);

sessionStorageKeys.forEach(key => {
  if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) {
    console.log(`  - ${key}:`, sessionStorage.getItem(key)?.substring(0, 30) + '...');
  }
});

if (sessionStorageKeys.length === 0) {
  console.log('  (vacío)');
}

console.log('\n');

// ============================================================================
// 6. SIMULAR CARGA DE PÁGINA
// ============================================================================
console.log('🔄 6. SIMULANDO CARGA DE PÁGINA:');
console.log('Ejecutando secuencia similar al componente...\n');

let authLoadingSimulated = true;
let userSimulated = null;

console.log('t=0ms:    authLoading=true, user=null');

setTimeout(() => {
  console.log('t=100ms:  Fetch a /api/auth/me iniciado...');
  
  fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(r => r.json())
    .then(data => {
      const now = Date.now() - startTime;
      authLoadingSimulated = false;
      
      if (data.success && data.data?.admin) {
        userSimulated = data.data.admin;
        console.log(`t=${now}ms:  authLoading=false, user={email: "${userSimulated.email}"}`);
        console.log('✅ RESULTADO: Autenticado correctamente');
      } else {
        console.log(`t=${now}ms:  authLoading=false, user=null`);
        console.log('❌ RESULTADO: No autenticado');
      }
      
      // Verificar si habría redirigido antes de cargar
      if (now > 100 && !userSimulated) {
        console.log('⚠️ RACE CONDITION DETECTADA:');
        console.log('   El useEffect habría detectado !authLoading && !user');
        console.log('   y habría redirigido al login ANTES de recibir el usuario.');
        console.log('   ✅ El timeout de 500ms debería solucionar esto.');
      }
    });
}, 100);

console.log('\n');

// ============================================================================
// 7. INFORMACIÓN DEL NAVEGADOR
// ============================================================================
console.log('🌍 7. INFORMACIÓN DEL NAVEGADOR:');
console.log('User Agent:', navigator.userAgent);
console.log('Idioma:', navigator.language);
console.log('Cookies habilitadas:', navigator.cookieEnabled);
console.log('Online:', navigator.onLine);

console.log('\n');

// ============================================================================
// 8. CONCLUSIÓN
// ============================================================================
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 DIAGNÓSTICO COMPLETADO');
console.log('═══════════════════════════════════════════════════════════');
console.log('\n');
console.log('⏰ Esperá unos segundos para ver los resultados de las pruebas asíncronas...');
console.log('\n');
console.log('📝 PRÓXIMOS PASOS:');
console.log('1. Revisá los resultados arriba');
console.log('2. Si auth-token NO está presente → Problema con login/cookies');
console.log('3. Si /api/auth/me falla → Problema con API o middleware');
console.log('4. Si tiempo de respuesta > 500ms → Posible race condition');
console.log('5. Compartí estos logs para más ayuda');
console.log('\n');

