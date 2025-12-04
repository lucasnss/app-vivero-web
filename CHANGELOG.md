# 📝 CHANGELOG - ViveroWeb

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.0.5] - 2025-12-01

### 🎨 Mejorado
- **Posición del botón "Descargar PDF" en modal**: Ajustada posición del botón para evitar solapamiento con el botón de cerrar (X)
  - Agregado margen derecho (`mr-10`) de 40px al botón "Descargar PDF"
  - Mejora la usabilidad y evita confusiones al interactuar con el modal
  - Archivo modificado: `components/OrderDetailModal.tsx`

---

## [2.0.4] - 2025-12-01

### 🐛 Corregido
- **Descuento de stock en compras**: Bug crítico donde el stock NO se reducía al completar una orden
  - Implementada reducción de stock cuando se aprueba el pago en MercadoPago
  - Se llama `productService.updateStock()` en el webhook para cada item de la orden
  - Ahora el inventario se actualiza correctamente después de cada compra

- **Envío de emails**: Error de autenticación con Gmail
  - Implementado uso correcto de contraseñas de aplicación de Google
  - Se requiere 2FA habilitado en la cuenta de Google
  - Los emails se envían correctamente con detalles de la orden y PDF adjunto

### 📄 Archivos Modificados
- `src/services/orderService.ts` - Agregada reducción de stock en `markOrderAsPaid()`
- `app/api/mercadopago/webhook/route.ts` - Implementado descuento de stock en webhook
- `.env.local` - Actualizada contraseña de aplicación de Google

### 📝 Problemas Identificados Pendientes de Resolver
Se identificaron 7 problemas en análisis anterior (ver ANALISIS-PROBLEMAS.md):
1. ✅ Descuento de stock - **RESUELTO**
2. 🟡 SSR en página del carrito - Pendiente optimización
3. 🟡 SSR en modal historial - Pendiente optimización  
4. 🟡 SSR al completar orden - Pendiente optimización
5. ✅ Posición botón PDF - **RESUELTO**
6. 🔴 Botones hero sin funcionalidad - **PRÓXIMO (ALTA PRIORIDAD)**
7. 🟢 Stock en 0 - Decisión de negocio pendiente

---

## [2.0.3] - 2025-11-30

### 🎨 Mejorado
- **Mejora visual de badges en historial de ventas**: Rediseño de badges para forma de entrega
  - "Domicilio": Fondo blanco con borde negro y texto negro
  - "Retiro": Fondo negro con borde negro y texto blanco
  - Mejora significativa en el contraste y legibilidad
  - Mejor diferenciación visual entre los dos métodos

- **Ocultamiento de columna TEST/REAL**: Se comentó la columna de tipo de pago (TEST/REAL) en la tabla de historial de ventas para mejorar la presentación

- **Corrección de configuración Tailwind**: Agregado safelist en `tailwind.config.ts` para garantizar que los colores dinámicos de estados se compilen correctamente
  - Esto asegura que clases como `bg-emerald-500`, `bg-yellow-500`, etc. estén disponibles

### 📄 Archivos Modificados
- `app/admin/sales-history/page.tsx` - Rediseño de badges de forma de entrega y ocultamiento de columna TYPE
- `tailwind.config.ts` - Agregado safelist para colores de estados

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

