# Changelog

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