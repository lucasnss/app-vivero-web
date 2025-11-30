# 📝 CHANGELOG - ViveroWeb

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.0.2] - 2025-11-30

### 🐛 Corregido
- **Validación de stock en checkout**: Corregido bug crítico que impedía comprar todo el stock disponible (ej: 8 de 8 unidades)
  - La función `validateStock()` restaba incorrectamente `currentInCart` durante el checkout
  - Creada nueva función `validateStockForCheckout()` que compara directamente contra el stock del producto
  - Ahora es posible comprar todas las unidades disponibles de un producto

### 📄 Archivos Modificados
- `src/services/cartService.ts` - Agregada función `validateStockForCheckout()`
- `app/api/mercadopago/create-preference/route.ts` - Uso de nueva función de validación
- `src/hooks/useCheckoutMP.ts` - Uso de nueva función de validación

---

## [2.0.1] - 2025-01-27

### ✨ Agregado
- **Documentación de Diagramas de Flujo**: Se crearon dos nuevos archivos de documentación:
  - `PROMPT-DIAGRAMA-FLUJO.md`: Prompt detallado con todas las indicaciones necesarias para crear diagramas de flujo del sistema
  - `DIAGRAMA-FLUJO-SISTEMA.md`: Diagramas de flujo completos del sistema en formato Mermaid, incluyendo:
    - Diagrama principal completo con todos los flujos
    - Diagrama simplificado de flujos principales
    - Diagrama de secuencia de autenticación
    - Diagrama de proceso de pago
    - Diagrama de gestión de stock

### 📄 Archivos Creados
- `app-vivero-web/PROMPT-DIAGRAMA-FLUJO.md`
- `app-vivero-web/DIAGRAMA-FLUJO-SISTEMA.md`
- `app-vivero-web/CHANGELOG.md` (este archivo)

### 📊 Contenido de los Diagramas
Los diagramas incluyen:
- Flujo completo de cliente invitado (navegación → carrito → checkout → pago → confirmación)
- Flujo completo de administrador (login → panel → gestión de productos/pedidos/categorías)
- Proceso de pago con MercadoPago (creación de preferencia → webhook → actualización de orden)
- Sistema de autenticación JWT para administradores
- Validaciones de stock en múltiples puntos
- Gestión de carrito en localStorage
- Middleware de seguridad

---

## [2.0.0] - 2025-11-20

### ✅ Completado
- **Corrección de imports en API routes**: Reemplazados imports incorrectos de autenticación
- **Optimización de páginas de pago**: Refactorización con Suspense boundary
- **Corrección de paginación**: Aumento de límites en APIs de productos y órdenes
- **Build exitoso**: Verificación de compilación sin errores críticos

### 📄 Archivos Modificados
- `app/api/products/[id]/images/route.ts`
- `app/api/images/[productId]/route.ts`
- `app/api/images/route.ts`
- `app/pago/success/page.tsx`
- `app/pago/pending/page.tsx`
- `app/pago/failure/page.tsx`
- `app/api/products/route.ts`
- `app/api/orders/route.ts`
- `app/admin/sales-history/page.tsx`
- `lib/validations.ts`

---

## Tipos de Cambios

- **✨ Agregado**: Para nuevas funcionalidades
- **🔄 Cambiado**: Para cambios en funcionalidades existentes
- **⚠️ Deprecado**: Para funcionalidades que serán eliminadas
- **❌ Eliminado**: Para funcionalidades eliminadas
- **🐛 Corregido**: Para corrección de bugs
- **🔒 Seguridad**: Para vulnerabilidades de seguridad

---

**Nota**: Este CHANGELOG se actualizará con cada cambio importante en el proyecto.

