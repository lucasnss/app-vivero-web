# 🔧 Solución: Bucle Infinito en Producción (Deploy Vercel)

## 📋 Problema Identificado

En producción (Vercel), al acceder a `/admin/sales-history`, se generaba un bucle infinito de verificación de sesión y redirección. Esto NO ocurría en desarrollo local.

### Causa Raíz

Next.js 14/15 intenta **prerenderizar estáticamente** las rutas de API durante el build. Cuando una ruta usa `request.cookies` o `request.headers`, Next.js no puede prerenderizarla y genera el error:

```
Route /api/auth/me couldn't be rendered statically because it used `request.cookies`
digest: 'DYNAMIC_SERVER_USAGE'
```

Este error rompe las APIs de autenticación en producción, causando:
- `/api/auth/me` devuelve `null` o falla
- El hook `useAuth` detecta usuario no autenticado
- Redirección a `/login`
- Login exitoso → redirección a `/admin/sales-history`
- **Bucle infinito** ♾️

## ✅ Solución Implementada

Se agregó `export const dynamic = "force-dynamic"` a todas las rutas de API que usan `cookies` o `headers`:

### Rutas de Autenticación Actualizadas

#### 1. `/app/api/auth/me/route.ts`
- **Usa**: `request.cookies.get('auth-token')`
- **Función**: Obtener usuario autenticado actual
- ✅ **Agregado**: `export const dynamic = "force-dynamic"`

#### 2. `/app/api/admin/auth/me/route.ts`
- **Usa**: `request.headers.get('authorization')`
- **Función**: Obtener admin autenticado (con token en header)
- ✅ **Agregado**: `export const dynamic = "force-dynamic"`

#### 3. `/app/api/auth/login/route.ts`
- **Usa**: Establece cookies en response
- **Función**: Login de usuario
- ✅ **Agregado**: `export const dynamic = "force-dynamic"`

#### 4. `/app/api/auth/logout/route.ts`
- **Usa**: `request.cookies.get('auth-token')`
- **Función**: Cerrar sesión
- ✅ **Agregado**: `export const dynamic = "force-dynamic"`

#### 5. `/app/api/auth/refresh/route.ts`
- **Usa**: `request.cookies.get('auth-token')`
- **Función**: Renovar token de sesión
- ✅ **Agregado**: `export const dynamic = "force-dynamic"`

#### 6. `/app/api/admin/auth/logout/route.ts`
- **Usa**: `request.headers.get('authorization')`
- **Función**: Cerrar sesión de admin
- ✅ **Agregado**: `export const dynamic = "force-dynamic"`

### Otras Rutas Actualizadas (Prevención)

Para evitar problemas similares en el futuro:

#### 7. `/app/api/orders/route.ts`
- **Usa**: `request.headers.get('x-admin-token')`
- ✅ **Agregado**: `export const dynamic = "force-dynamic"`

#### 8. `/app/api/orders/[id]/route.ts`
- **Usa**: `request.headers.get('x-admin-token')`
- ✅ **Agregado**: `export const dynamic = "force-dynamic"`

#### 9. `/app/api/admin/orders/[id]/fulfillment/route.ts`
- **Usa**: `request.headers.get('x-admin-token')`
- ✅ **Agregado**: `export const dynamic = "force-dynamic"`

#### 10. `/app/api/mercadopago/webhook/route.ts`
- **Usa**: `request.headers.get('x-forwarded-for')`, `request.headers.get('user-agent')`
- ✅ **Agregado**: `export const dynamic = "force-dynamic"`

## 🔍 ¿Qué hace `force-dynamic`?

```typescript
export const dynamic = "force-dynamic"
```

Esta directiva le indica a Next.js:
- ❌ **NO intentar** prerenderizar esta ruta estáticamente
- ✅ **SIEMPRE ejecutar** dinámicamente en el servidor
- ✅ **PERMITIR** el uso de `cookies` y `headers` sin errores

## 📦 Próximos Pasos

1. **Commit de los cambios**:
```bash
git add .
git commit -m "fix(auth): marcar rutas dinámicas para evitar bucle infinito en producción

- Añadir export const dynamic = 'force-dynamic' en rutas de auth
- Evitar prerender estático que rompe cookies/headers
- Prevenir bucle infinito en deploy de Vercel
- Aplicar también a rutas de orders y webhook por precaución"
```

2. **Deploy a Vercel**:
```bash
git push origin development
```

3. **Verificar en producción**:
   - ✅ Acceder directamente a `/admin/sales-history`
   - ✅ Verificar que no haya bucle infinito
   - ✅ Confirmar que la autenticación funcione correctamente
   - ✅ Revisar logs de Vercel (no debe haber errores de `DYNAMIC_SERVER_USAGE`)

## 📚 Referencias

- [Next.js Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
- [Next.js Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic)
- [Dynamic Server Usage Error](https://nextjs.org/docs/messages/dynamic-server-error)

## 🎯 Resultado Esperado

Después de estos cambios:
- ✅ No más errores de build relacionados con `DYNAMIC_SERVER_USAGE`
- ✅ Las APIs de autenticación funcionarán correctamente en producción
- ✅ No más bucle infinito al acceder a rutas protegidas
- ✅ Comportamiento consistente entre desarrollo y producción

---

**Fecha**: 2025-11-20  
**Responsable**: Sistema de IA (Claude)  
**Estado**: ✅ Completado

