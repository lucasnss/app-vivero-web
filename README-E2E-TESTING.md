# 🧪 **GUÍA DE TESTING END-TO-END: CARRITO → CHECKOUT**

## 📋 **Resumen Ejecutivo**

Esta guía describe cómo ejecutar tests de integración end-to-end que simulan el flujo completo de compra en ViveroWeb, **sin depender de Mercado Pago**. Los tests validan toda la funcionalidad desde agregar un producto al carrito hasta llegar al formulario de checkout.

---

## 🎯 **¿Qué Prueba Este Test?**

### **Flujo Completo Validado:**
1. **🛍️ Crear producto de prueba** - Validar API de productos
2. **🛒 Agregar al carrito** - Simular lógica del carrito
3. **✅ Validar carrito** - Verificar stock y datos
4. **🧭 Navegar al carrito** - Simular página del carrito
5. **📋 Revisar carrito** - Validar cálculos y envío
6. **💳 Formulario checkout** - Validar datos del cliente
7. **📦 Preparar orden** - Estructurar datos de la orden
8. **🚀 Crear orden** - Simular creación (sin pago real)
9. **🎯 Flujo completo** - Validar integridad del proceso

### **Características Clave:**
- ✅ **Independiente de Mercado Pago** - No requiere integración externa
- ✅ **Simulación completa** - Valida toda la lógica de negocio
- ✅ **Limpieza automática** - Elimina productos de prueba
- ✅ **Validaciones robustas** - Stock, precios, formularios
- ✅ **Reporte detallado** - Resultados paso a paso

---

## 🚀 **Configuración Inicial**

### **Paso 1: Instalar Dependencias**

```bash
cd Fronted

# Configurar entorno para testing end-to-end
node setup-e2e-testing.js
```

Este script:
- ✅ Verifica las dependencias necesarias
- ✅ Instala `node-fetch` si es necesario
- ✅ Verifica que el archivo de test existe
- ✅ Comprueba el estado del servidor

### **Paso 2: Asegurar que el Servidor Esté Corriendo**

```bash
# En otra terminal
cd Fronted
npm run dev
```

El servidor debe estar ejecutándose en `http://localhost:3000`.

---

## 🧪 **Ejecución de Tests**

### **Ejecutar Test de Integración Completo**

```bash
cd Fronted
node test-cart-checkout-integration.js
```

### **Salida Esperada**

```
====================================
  TEST DE INTEGRACIÓN E2E: CARRITO → CHECKOUT
====================================
🚀 Iniciando tests de integración end-to-end...
📋 Flujo: Agregar producto → Carrito → Revisar → Checkout
⏰ [Fecha y hora actual]

✅ Servidor funcionando
   Status: healthy
   Timestamp: [timestamp]

🔍 Test 1: Obtener categoría para producto
✅ PASS Obtener categorías
   17 categorías obtenidas

🔍 Test 2: Crear producto de prueba
✅ PASS Crear producto
   Producto creado con ID: [uuid]

🔍 Test 3: Simular agregar producto al carrito
✅ PASS Agregar al carrito
   Producto agregado: 2x Planta de Prueba E2E

[... más tests ...]

====================================
           RESUMEN DE TESTS
====================================
📊 Total de tests: 10
✅ Tests exitosos: 10
❌ Tests fallidos: 0

🎉 ¡Todos los tests pasaron! El flujo end-to-end está funcionando correctamente.

📋 Detalles del flujo completado:
   🛍️ Producto: Planta de Prueba E2E
   🛒 Items en carrito: 1
   👤 Cliente: Cliente Test E2E
   📦 Orden: mock-order-id-[timestamp]

🚀 Flujo de integración end-to-end completado
```

---

## 🔍 **Detalles de Cada Test**

### **Test 1: Obtener Categoría**
- **Propósito:** Obtener una categoría válida para el producto de prueba
- **Validación:** Verifica que la API de categorías funcione
- **Resultado:** Asigna `categoryId` para el producto

### **Test 2: Crear Producto de Prueba**
- **Propósito:** Crear un producto temporal para testing
- **Validación:** Verifica que la API de productos funcione
- **Resultado:** Asigna `productId` para el carrito

### **Test 3: Simular Agregar al Carrito**
- **Propósito:** Simular la lógica de agregar producto al carrito
- **Validación:** Crea estructura de datos del carrito
- **Resultado:** `cartItems` con producto y cantidad

### **Test 4: Validar Datos del Carrito**
- **Propósito:** Verificar integridad de los datos del carrito
- **Validación:** Stock disponible, producto existe en BD
- **Resultado:** Confirma que el carrito es válido

### **Test 5: Simular Navegación al Carrito**
- **Propósito:** Simular la página del carrito
- **Validación:** Cálculos de totales y conteo de items
- **Resultado:** Confirma que la navegación funciona

### **Test 6: Simular Revisión del Carrito**
- **Propósito:** Simular la página de revisión
- **Validación:** Cálculos de envío y totales
- **Resultado:** Confirma que la revisión es correcta

### **Test 7: Simular Formulario de Checkout**
- **Propósito:** Validar el formulario de datos del cliente
- **Validación:** Campos requeridos, formato de dirección
- **Resultado:** Confirma que el formulario es válido

### **Test 8: Simular Preparación de Orden**
- **Propósito:** Estructurar datos para la orden
- **Validación:** Mapeo correcto de items y cliente
- **Resultado:** Datos de orden preparados

### **Test 9: Simular Creación de Orden**
- **Propósito:** Simular la creación de la orden
- **Validación:** Estructura de datos correcta
- **Resultado:** Orden simulada creada

### **Test 10: Validar Flujo Completo**
- **Propósito:** Verificar que todo el flujo funcione
- **Validación:** Todos los tests anteriores pasaron
- **Resultado:** Flujo end-to-end validado

---

## 🧹 **Limpieza Automática**

### **Productos de Prueba**
- ✅ **Eliminación automática** al finalizar los tests
- ✅ **No contamina** la base de datos de desarrollo
- ✅ **IDs únicos** para evitar conflictos

### **Datos Temporales**
- ✅ **Carrito simulado** - No usa localStorage real
- ✅ **Órdenes simuladas** - No se crean en la BD
- ✅ **Cliente de prueba** - Datos ficticios

---

## 🚨 **Solución de Problemas**

### **Error: "No se puede conectar al servidor"**

**Causa:** El servidor Next.js no está ejecutándose.

**Solución:**
```bash
cd Fronted
npm run dev
```

### **Error: "node-fetch not found"**

**Causa:** Dependencia faltante para fetch en Node.js.

**Solución:**
```bash
cd Fronted
node setup-e2e-testing.js
```

### **Error: "Producto no creado correctamente"**

**Causa:** Problema en la API de productos o autenticación.

**Solución:**
1. Verificar que el servidor esté funcionando
2. Revisar logs del servidor para errores
3. Verificar variables de entorno de Supabase

### **Error: "Stock insuficiente"**

**Causa:** El producto de prueba no tiene stock suficiente.

**Solución:**
- El test crea productos con stock 10 por defecto
- Si falla, revisar la lógica de validación de stock

---

## 📊 **Interpretación de Resultados**

### **✅ Todos los Tests Pasaron (10/10)**
- **Significado:** El flujo end-to-end está funcionando perfectamente
- **Estado:** Sistema listo para producción
- **Próximo paso:** Continuar con otras funcionalidades

### **⚠️ Algunos Tests Fallaron**
- **Revisar:** Tests específicos que fallaron
- **Diagnosticar:** Errores en APIs o lógica de negocio
- **Corregir:** Problemas identificados antes de continuar

### **❌ Muchos Tests Fallaron**
- **Prioridad:** Revisar configuración del servidor
- **Verificar:** Base de datos y variables de entorno
- **Revisar:** Logs del servidor para errores críticos

---

## 🔄 **Integración con Otros Tests**

### **Tests Existentes**
- ✅ **API Testing:** `test-api.js` - Endpoints individuales
- ✅ **Cart Testing:** `test-cart.js` - Funcionalidad del carrito
- ✅ **E2E Testing:** `test-cart-checkout-integration.js` - Flujo completo

### **Flujo de Testing Recomendado**
1. **Ejecutar tests de API** para verificar endpoints
2. **Ejecutar tests del carrito** para validar lógica
3. **Ejecutar tests E2E** para validar integración
4. **Revisar resultados** y corregir problemas

---

## 🎯 **Casos de Uso**

### **Desarrollo Local**
- ✅ **Validar cambios** antes de commit
- ✅ **Verificar integración** de nuevas funcionalidades
- ✅ **Detectar regresiones** en el flujo de compra

### **CI/CD Pipeline**
- ✅ **Tests automáticos** en cada deploy
- ✅ **Validación de calidad** antes de producción
- ✅ **Reportes de integración** para el equipo

### **Testing Manual**
- ✅ **Verificar funcionalidad** después de cambios
- ✅ **Validar integración** con el equipo
- ✅ **Documentar comportamiento** esperado

---

## 🏆 **Conclusión**

Este sistema de testing end-to-end te permite:

1. **Validar** que todo el flujo de compra funcione correctamente
2. **Detectar** problemas de integración antes de que lleguen a producción
3. **Asegurar** la calidad del código y la experiencia del usuario
4. **Documentar** el comportamiento esperado del sistema

**¡Ejecuta los tests regularmente para mantener la calidad del proyecto!** 🚀

---

## 📚 **Archivos Relacionados**

- `test-cart-checkout-integration.js` - Test principal de integración
- `setup-e2e-testing.js` - Script de configuración
- `README-E2E-TESTING.md` - Esta documentación
- `test-api.js` - Tests de APIs individuales
- `test-cart.js` - Tests del carrito
- `README-TESTING.md` - Documentación general de testing
