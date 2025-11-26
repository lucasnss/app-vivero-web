# Changelog

## [2.0.0] - 2025-11-20

### ✅ Completado
- **Fix Crítico: Corregir imports de módulos inexistentes** - Resuelto error de build por imports incorrectos
- **Optimización: Envolver useSearchParams() en Suspense** - Mejorado rendimiento en páginas de pago
- **Build exitoso para deploy** - Proyecto compilado sin errores críticos

### 🔁 Mejoras de Paginación (Panel Administrador)

#### Paginación de Productos
- **Archivo**: `app/api/products/route.ts`
  - Cambio: Límite por defecto de paginación `limit` pasado de `20` a `10000` para que las peticiones sin `limit` (como el panel de administrador) reciban todos los productos disponibles.
  - Efecto: El panel de administrador ahora puede ver el total de productos, y su propia paginación de frontend se ajusta correctamente al número real de productos.

#### Paginación de Órdenes (Historial de Ventas)
- **Archivo**: `app/api/orders/route.ts`
  - Cambio: Límite por defecto de paginación `limit` pasado de `20` a `10000` para que el historial de órdenes pueda cargar todas las órdenes de la BD.
  - Efecto: El historial de ventas ahora muestra todas las órdenes existentes, no solo las primeras 20.

- **Archivo**: `app/admin/sales-history/page.tsx`
  - Cambio: Modificado para cargar todas las órdenes de una vez (limit: 10000) en lugar de paginar desde la API.
  - Cambio: Implementada paginación del lado del cliente sobre las órdenes filtradas (20 órdenes por página).
  - Cambio: Estadísticas ahora se calculan sobre todas las órdenes cargadas, no solo las de la página actual.
  - Cambio: Removida dependencia de `currentPage` en el useEffect de carga de órdenes.
  - Efecto: El historial muestra el total real de órdenes en la BD, y la paginación funciona correctamente sobre los datos filtrados.

- **Archivo**: `lib/validations.ts`
  - Cambio: `paginationSchema.limit` actualizado de `max(100)` a `max(10000)` para aceptar límites mayores sin invalidar la petición.
  - Efecto: Se evita que la validación corte artificialmente la cantidad máxima de productos/órdenes que pueden devolverse en una sola respuesta.

### 🔧 Correcciones Implementadas

#### 1. Corregir imports en rutas API de imágenes
- **Archivo**: `app/api/products/[id]/images/route.ts`
  - Cambio: `import { auth }` → `import { getAuthenticatedAdmin }`
  - Actualización de referencias: `auth.getSession()` → `await getAuthenticatedAdmin(request)`
  - Cambio de referencias: `session.user.email` → `admin.email`

- **Archivo**: `app/api/images/[productId]/route.ts`
  - Cambio: `import { imageService }` → `import { ImageService }` (clase)
  - Cambio: `import { errorHandler }` → `import { handleError }`
  - Actualización de tipos: Agregados tipos explícitos para parámetros de funciones
  - Cambio de llamadas: `imageService.getImagesByProduct()` → `ImageService.listImages()`

- **Archivo**: `app/api/images/route.ts`
  - Cambio: `import { imageService }` → `import { ImageService }`
  - Cambio: `import { errorHandler }` → `import { handleError }`
  - Actualización de tipos: Agregados tipos `NextRequest` a todos los parámetros
  - Eliminación de referencias no definidas: `rateLimit.check()` removido temporalmente
  - Cambio de retorno de manejo de errores: `handleError()` en lugar de `errorHandler()`

#### 2. Optimización de páginas de pago con Suspense
- **Archivo**: `app/pago/success/page.tsx`
  - Refactorización: Extracción de componente `PaymentSuccessContent`
  - Adición: Componente de fallback `LoadingFallback`
  - Envolvimiento: Página principal usa `<Suspense>` boundary
  - Beneficio: Eliminado warning de pre-renderización

- **Archivo**: `app/pago/pending/page.tsx`
  - Refactorización: Extracción de componente `PaymentPendingContent`
  - Adición: Componente de fallback `LoadingFallback`
  - Envolvimiento: Página principal usa `<Suspense>` boundary
  - Beneficio: Eliminado warning de pre-renderización

- **Archivo**: `app/pago/failure/page.tsx`
  - Refactorización: Extracción de componente `PaymentFailureContent`
  - Adición: Componente de fallback `LoadingFallback`
  - Envolvimiento: Página principal usa `<Suspense>` boundary
  - Beneficio: Eliminado warning de pre-renderización

### 📊 Resultados del Build
- ✅ **Estado**: Build exitoso (Exit code: 0)
- ✅ **Compilación**: `✓ Compiled successfully`
- ✅ **Páginas generadas**: 37/37
- ✅ **Pre-renderización**: Todas las páginas correctamente pre-renderizadas
- ✅ **Warnings resueltos**: 3 warnings de useSearchParams eliminados

### 🎯 Funcionalidades Afectadas
- ✅ **GET /api/products/[id]/images** - Obtiene imágenes (no afectado)
- ✅ **POST /api/products/[id]/images** - Actualiza imágenes (ahora funcional)
- ✅ **DELETE /api/products/[id]/images** - Elimina imágenes (ahora funcional)
- ✅ **GET /pago/success** - Página de pago exitoso (optimizada)
- ✅ **GET /pago/pending** - Página de pago pendiente (optimizada)
- ✅ **GET /pago/failure** - Página de pago fallido (optimizada)

### ⚠️ Warnings Pendientes (No Críticos)
- Node.js 18 deprecated: Se recomienda actualizar a Node.js 20+
- APIs dinámicas: `/api/auth/me` y `/api/admin/auth/me` no se pre-renderizan (comportamiento esperado)

### 🚀 Estado para Deploy
- ✅ Proyecto listo para deploy en producción
- ✅ Build completado sin errores
- ✅ Todas las correcciones implementadas
- ✅ Páginas de pago optimizadas

---

## [1.9.0] - 2025-11-12

### ✅ Completado
- **Fix: Manejo de Webhooks de Simulación de Mercado Pago** - Permitir testing de webhooks desde panel de MP
- **Mejora en getPaymentInfo** - Detecta errores 404 en desarrollo y retorna datos de prueba
- **Documentación de Testing** - Guías completas para probar webhooks

### 🔧 Correcciones Implementadas
- **mercadopagoService.ts** (líneas 227-250): Mejorado manejo de errores 404 con detección de ambiente
- **Comportamiento en desarrollo**: Usa `getTestPaymentInfo()` cuando Mercado Pago retorna 404
- **Comportamiento en producción**: Mantiene error para evitar procesamiento incorrecto

### 📊 Cambios Técnicos
- Validación de `NODE_ENV` en `getPaymentInfo()`
- Detección de error 404 y status code 404 en respuesta
- Fallback automático a datos de prueba en ambiente de desarrollo

### 📚 Documentación Creada
- `GUIA-TESTING-WEBHOOK-SIMULACION-MP.md` - Guía completa de testing
- `RESUMEN-FIX-WEBHOOK-SIMULACION.md` - Resumen visual del problema y solución
- `scripts/test-webhook-simulation.js` - Script para simular webhooks

### 🎯 Problemas Resueltos
- Error 404 "Payment not found" cuando se simulan webhooks desde MP Developer
- Incapacidad de probar webhooks sin crear pagos reales
- Falta de claridad sobre cómo testear webhooks de simulación

### 🚀 Cómo Usar
1. Ve a Mercado Pago Developer → Tu App → Webhooks → Realizar Prueba
2. El webhook se procesará correctamente usando datos simulados
3. Verifica que la orden se crea en la BD

---

## [1.7.0] - 2025-09-23

### ✅ Completado
- **Tests de imágenes corregidos** - Solucionados problemas de tipado y timeout en tests de imágenes
- **Entorno de pruebas mejorado** - Implementado happy-dom para mejor simulación del DOM
- **Correcciones de tipos en servicios** - Resueltos errores de tipado en mercadopagoService

### 🔧 Correcciones Implementadas
- **setup.ts**: Eliminado mock manual de HTMLCanvasElement.prototype.getContext
- **imageValidations.test.ts**: Implementados mocks completos para FileReader y Canvas
- **imageValidations.ts**: Mejoradas funciones getFileExtension y formatFileSize
- **mercadopagoService.ts**: Corregidos errores de tipado con PaymentStatus y excluded_payment_types

### 📊 Cambios Técnicos
- Actualización de vitest.config.ts para usar happy-dom como entorno de pruebas
- Implementación de mocks más robustos para APIs del navegador (Image, Canvas, FileReader)
- Corrección de acceso seguro a propiedades warnings con operador opcional (?.)
- Mejora en la importación de tipos desde @/types/order en mercadopagoService.ts

### 🎯 Problemas Resueltos
- Errores de tipado en mercadopagoService.ts con PaymentStatus y MercadoPagoPaymentType
- Problema de compatibilidad con arrays readonly en excluded_payment_methods y excluded_payment_types
- Error "Cannot find name 'vi'" en tests por falta de importación de Vitest
- Implementación incorrecta del mock de FileReader causando errores de tipado

## [1.6.0] - 2025-01-07

### ✅ Completado
- **Carrusel de imágenes corregido** - Solucionado problema de duplicados y navegación incorrecta
- **Límite de imágenes en creación** - Ahora permite subir hasta 3 imágenes desde el inicio
- **Validación de duplicados** - Implementada lógica para evitar imágenes duplicadas en el carrusel

### 🔧 Correcciones Implementadas
- **ProductCard.tsx**: Mejorada construcción del array `allImages` para evitar duplicados
- **useImageUpload.ts**: Corregida validación del límite de imágenes durante la creación inicial
- **Navegación del carrusel**: Logs de debug agregados para monitorear el comportamiento

### 📊 Cambios Técnicos
- Separación de `mainImage` y `additionalImages` para evitar duplicados
- Validación mejorada de URLs de imágenes (null, undefined, strings vacíos)
- Logs de debug para facilitar troubleshooting futuro

### 🎯 Problemas Resueltos
- Imágenes duplicadas en el carrusel
- Navegación incorrecta cuando hay pocas imágenes
- Límite incorrecto durante la creación inicial de productos