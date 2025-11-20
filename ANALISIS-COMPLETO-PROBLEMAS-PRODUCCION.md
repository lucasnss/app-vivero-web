# 🔍 ANÁLISIS COMPLETO: Problemas Potenciales en Producción

## 📊 ESTADO DE TU PROYECTO

### ✅ **LO QUE ESTÁ BIEN:**

1. ✅ **Cookies HttpOnly** correctamente configuradas:
   - `sameSite: 'lax'` (correcto, no 'strict')
   - NO setea `domain` (correcto)
   - `path: '/'` (correcto)
   - `httpOnly: true` (correcto)

2. ✅ **Imports de AuthContext** consistentes:
   - Todos usan `@/contexts/AuthContext` (mismo case)

3. ✅ **Middleware** en ubicación correcta:
   - `middleware.ts` está en root ✅

4. ✅ **NO hay vercel.json** (correcto, menos config = menos problemas)

5. ✅ **Race condition** solucionado con timeout de 500ms

---

### ⚠️ **LO QUE PUEDE CAUSAR PROBLEMAS:**

## 🔴 **PRIORIDAD 1: CRÍTICO (Debe revisarse YA)**

### **1. router.push() en lugar de window.location.href**

**Probabilidad:** 🔴🔴🔴🔴⚪ 80%

**Por qué es el problema más probable:**
- Tu código usa `router.push()` para redirecciones
- Esto funciona en local pero puede fallar en producción

**Archivos afectados:**
```typescript
// app/admin/sales-history/page.tsx línea 102
router.push('/login?returnUrl=/admin/sales-history')

// app/admin/page.tsx línea 61
router.push('/login?returnUrl=/admin')

// app/login/page.tsx línea 42 ✅ (este SÍ usa window.location.href)
window.location.href = returnUrl
```

**Solución AHORA:**

```typescript
// app/admin/sales-history/page.tsx
// CAMBIAR línea 102 de:
router.push('/login?returnUrl=/admin/sales-history')

// A:
window.location.href = '/login?returnUrl=/admin/sales-history'

// app/admin/page.tsx  
// CAMBIAR línea 61 de:
router.push('/login?returnUrl=/admin')

// A:
window.location.href = '/login?returnUrl=/admin'
```

**Por qué esto funciona:**
- `router.push()` depende del JavaScript runtime del cliente
- `window.location.href` es un redirect nativo del navegador
- Más confiable en producción con diferentes latencias

---

### **2. Package Manager: npm vs bun**

**Probabilidad:** 🔴🔴🔴⚪⚪ 60%

**Tu proyecto tiene:**
- `package-lock.json` (npm)
- `bun.lockb` (bun)

**El problema:**
Si usás bun localmente pero Vercel usa npm, las versiones de dependencias pueden diferir.

**Verificar en Vercel:**
```
Dashboard → Tu Proyecto → Settings → General
→ Build & Development Settings
→ Package Manager: ¿Cuál está seleccionado?
```

**Solución:**

**Opción 1: Usar solo npm (recomendado para Vercel)**
```bash
# Eliminar bun lockfile
rm bun.lockb

# Reinstalar con npm
rm -rf node_modules
npm install

# Commit
git add .
git commit -m "chore: usar solo npm como package manager"
git push
```

**Opción 2: Usar solo bun**
```bash
# Eliminar npm lockfile
rm package-lock.json

# Reinstalar con bun
rm -rf node_modules
bun install

# Configurar Vercel para usar bun
# En package.json agregar:
{
  "packageManager": "bun@1.0.0"
}
```

---

### **3. Git Case Sensitivity**

**Probabilidad:** 🔴🔴🔴⚪⚪ 60%

**Verificar:**
```bash
# En tu terminal (CMD, no PowerShell):
cd "C:\Users\Mateo\OneDrive\Escritorio\js yayo\ViveroWeb"
git config core.ignorecase
```

**Si dice `true`:** ❌ PROBLEMA - Git ignora mayúsculas/minúsculas
**Si dice `false`:** ✅ CORRECTO

**Solución si está en `true`:**
```bash
# Configurar para ser case-sensitive
git config core.ignorecase false

# Verificar que no haya duplicados
git ls-files | sort | uniq -di
```

---

## 🟡 **PRIORIDAD 2: IMPORTANTE (Verificar después)**

### **4. Variables de Entorno en Vercel**

**Probabilidad:** 🟡🟡🟡⚪⚪ 40%

**Checklist de verificación:**

Ir a: `Vercel Dashboard → Tu Proyecto → Settings → Environment Variables`

**Variables que DEBEN estar:**
```
☑️ NEXT_PUBLIC_SUPABASE_URL
☑️ NEXT_PUBLIC_SUPABASE_ANON_KEY
☑️ SUPABASE_SERVICE_ROLE_KEY (si usas)
☑️ JWT_SECRET
☑️ Cualquier otra que uses en .env.local
```

**IMPORTANTE:** Verificar que estén en:
- ✅ Production
- ✅ Preview (si quieres testear en preview deployments)

**Cómo testear:**
```typescript
// Agregar temporalmente en app/admin/sales-history/page.tsx
// DENTRO del componente, después de la línea 92:

console.log('🔍 ENV CHECK:', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  nodeEnv: process.env.NODE_ENV,
})
```

---

### **5. Build Cache Corrupto**

**Probabilidad:** 🟡🟡⚪⚪⚪ 30%

**Cuándo sospechar:**
- Build funciona local pero falla en Vercel
- Error `Module not found` de algo que existe
- Comportamiento extraño sin cambios en código

**Solución:**
```
1. Vercel Dashboard → Tu Proyecto
2. Settings → General
3. Scroll down → "Clear Build Cache"
4. Volver a Deploy
```

---

### **6. NEXT_PUBLIC_ Variables en Runtime**

**Probabilidad:** 🟡🟡⚪⚪⚪ 20%

**El problema:**
Las variables con `NEXT_PUBLIC_` se embeben en el bundle durante build. NO se actualizan en runtime.

**Ejemplo:**
```typescript
// Si cambiás esto en Vercel Dashboard:
NEXT_PUBLIC_API_URL=https://nueva-url.com

// La app SIGUE usando la URL vieja hasta hacer nuevo build
```

**Solución:**
Si necesitás cambiar variables frecuentemente, NO usar `NEXT_PUBLIC_`. Usar API endpoint:

```typescript
// pages/api/config.ts
export default function handler(req, res) {
  res.json({
    apiUrl: process.env.API_URL,  // Sin NEXT_PUBLIC_
  })
}

// Consumir desde el cliente:
const response = await fetch('/api/config')
const { apiUrl } = await response.json()
```

---

## 🟢 **PRIORIDAD 3: BAJO (Revisar si todo lo demás falla)**

### **7. Case Sensitivity en Rutas de Páginas**

**Probabilidad:** 🟢⚪⚪⚪⚪ 10%

**Tu estructura de páginas:**
```
app/
  admin/
    page.tsx           → /admin ✅
    sales-history/     → /admin/sales-history ✅
      page.tsx
```

**Parece correcto:** Todo en lowercase con guiones

**Verificar URLs:**
- ✅ `/admin/sales-history` (correcto)
- ❌ `/Admin/Sales-History` (fallaría en producción)

---

### **8. Server Components vs Client Components**

**Probabilidad:** 🟢⚪⚪⚪⚪ 5%

**Tu código:**
```typescript
// app/admin/sales-history/page.tsx línea 1
"use client"  ✅ CORRECTO

// Usa hooks de React:
const { user, isLoading: authLoading, logout } = useAuth()  ✅ OK
```

**Estado:** ✅ Correcto - Ya tenés `"use client"` donde es necesario

---

### **9. next.config.mjs Syntax**

**Probabilidad:** 🟢⚪⚪⚪⚪ 5%

**Verificar:**


