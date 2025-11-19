# 🧪 Scripts de Prueba - Guardado de Datos del Cliente

Este directorio contiene scripts para probar el flujo completo de guardado de datos del cliente en el historial de pedidos.

## 📋 Scripts Disponibles

### 1. **test-customer-data-flow.js** (Recomendado)

**Descripción**: Script Node.js completo con pruebas E2E detalladas

**Características**:
- ✅ Validación de cada campo guardado
- ✅ Mejor reportes de errores
- ✅ Estructura clara de pruebas
- ✅ Colores en output
- ✅ No requiere herramientas externas

**Uso**:
```bash
# Asegúrate que el servidor está corriendo primero
npm run dev  # En otra terminal

# Ejecutar desde Fronted/
cd Fronted
node scripts/test-customer-data-flow.js
```

**Salida esperada**:
```
╔════════════════════════════════════════════════════════════╗
║  🧪 Script de Prueba E2E - Guardado de Datos del Cliente  ║
║                    ViveroWeb Test Suite                    ║
╚════════════════════════════════════════════════════════════╝

ℹ️  Usando BASE_URL: http://localhost:3000
Timestamp: 2025-11-13T15:30:45.123Z

============================================================
📋 TEST 1: Crear Preferencia de Pago con Datos del Cliente
============================================================

✅ Preferencia creada exitosamente
✅ Preference ID: APP_12345678901234567890

[... más pruebas ...]

📊 RESUMEN DE PRUEBAS
✅ Pruebas Pasadas: 15
❌ Pruebas Fallidas: 0
📈 Tasa de Éxito: 100% (15/15)

🎉 ¡TODAS LAS PRUEBAS PASARON!
```

---

### 2. **test-customer-data-curl.sh** (Alternativa)

**Descripción**: Script BASH con curl para pruebas rápidas

**Características**:
- ✅ No requiere Node.js
- ✅ Funciona en cualquier terminal
- ✅ Útil para debugging rápido
- ✅ Soporta jq para parsing JSON (opcional)

**Uso**:
```bash
# Opción 1: Ejecutar directamente
bash Fronted/scripts/test-customer-data-curl.sh

# Opción 2: Darle permisos y ejecutar
chmod +x Fronted/scripts/test-customer-data-curl.sh
./Fronted/scripts/test-customer-data-curl.sh
```

**Salida esperada**:
```
╔════════════════════════════════════════════════════════════╗
║  🧪 Script de Prueba CURL - Guardado de Datos del Cliente ║
║                    ViveroWeb Test Suite                    ║
╚════════════════════════════════════════════════════════════╝

ℹ️  Usando BASE_URL: http://localhost:3000
Timestamp: 2025-11-13T15:30:45.123Z

============================================================
📋 TEST 1: Crear Preferencia de Pago con Datos del Cliente
============================================================

🧪 Enviando datos de preferencia...
✅ Preferencia creada exitosamente
✅ Preference ID: APP_12345678901234567890

[... más tests ...]
```

---

## 🚀 Quick Start

### Paso 1: Preparar el Servidor

```bash
# Terminal 1
cd ViveroWeb
npm run dev
```

### Paso 2: Ejecutar Pruebas

```bash
# Terminal 2
cd ViveroWeb/Fronted

# Opción A: Script Node.js (Recomendado)
node scripts/test-customer-data-flow.js

# Opción B: Script BASH con curl
bash scripts/test-customer-data-curl.sh
```

### Paso 3: Analizar Resultados

Busca al final del output:
- 🎉 **"¡TODAS LAS PRUEBAS PASARON!"** → Todo está bien
- ⚠️ **Algunos tests fallaron** → Revisa los errores arriba

---

## 📊 ¿Qué Prueba Cada Script?

| # | Test | Lo Que Hace | Valida |
|---|------|-----------|--------|
| 1 | Crear Preferencia | Envía datos a `/api/mercadopago/create-preference` | Status 200, preference_id |
| 2 | Crear Orden | Envía datos a `/api/orders` | Status 201, order.id |
| 3 | Obtener Detalles | GET `/api/orders/ORDER_ID` | Todos los campos existen |
| 3.1 | Validar Email | Verifica `customer_info.email` | Email correcto |
| 3.2 | Validar Nombre | Verifica `customer_info.name` | Nombre correcto |
| 3.3 | Validar Teléfono | Verifica `customer_info.phone` | Teléfono correcto |
| 3.4 | Validar Dirección | Verifica `customer_info.address.*` | Todos los campos |
| 3.5 | Validar Shipping | Verifica `customer_info.shipping_method` | 'delivery' o 'pickup' |
| 3.6 | Validar Timestamp | Verifica `customer_info.captured_at` | ISO timestamp |
| 4 | Modal Structure | Verifica todos required fields | Campos para UI |

---

## 🔧 Configuración

### Variables de Entorno

Por defecto, los scripts usan `http://localhost:3000`. Para cambiar:

```bash
# Terminal
export NEXT_PUBLIC_BASE_URL=https://mi-servidor.com
node scripts/test-customer-data-flow.js
```

O modificar en el script directamente (línea de configuración).

---

## 🐛 Solución de Problemas

### "Connection refused"

```bash
# Verifica que el servidor esté corriendo
# Terminal 1 debe mostrar: "ready - started server on 0.0.0.0:3000"
npm run dev
```

### "customer_info no existe"

Verifica que `orderService.ts` esté actualizado:

```bash
grep -n "customer_info:" Fronted/src/services/orderService.ts
# Debería mostrar la estructura expandida con address, shipping_method, etc.
```

### "Email incorrecto"

Verifica el flujo de datos:

```bash
# 1. Revisa que useCheckoutMP pase los datos
grep -n "shipping_method" Fronted/src/hooks/useCheckoutMP.ts

# 2. Revisa que create-preference los reciba
grep -n "shipping_method" Fronted/app/api/mercadopago/create-preference/route.ts

# 3. Revisa que webhook los guarde
grep -n "shipping_method" Fronted/app/api/mercadopago/webhook/route.ts
```

### "Dirección no existe"

Verifica que se guarde en `customer_info`:

```javascript
// En consola del navegador, en orden creada
const order = await fetch('/api/orders/ORDER_ID').then(r => r.json())
console.log(order.customer_info.address)  // Debe mostrar la dirección
```

---

## ✅ Checklist de Validación

Cuando ejecutes los scripts, verifica:

- [ ] ✅ Preferencia se crea sin errores
- [ ] ✅ Orden se crea con status 201
- [ ] ✅ `customer_info` contiene email correcto
- [ ] ✅ `customer_info` contiene nombre correcto
- [ ] ✅ `customer_info` contiene teléfono correcto
- [ ] ✅ `customer_info.address` existe y contiene:
  - [ ] ✅ `street`
  - [ ] ✅ `number`
  - [ ] ✅ `city`
  - [ ] ✅ `state`
  - [ ] ✅ `zip`
  - [ ] ✅ `additional_info`
- [ ] ✅ `customer_info.shipping_method` = 'delivery'
- [ ] ✅ `customer_info.captured_at` existe (ISO timestamp)
- [ ] ✅ 100% de pruebas pasan

---

## 📝 Notas Importantes

1. **Datos de Prueba**:
   - Los scripts usan IDs de productos ficticios
   - Si quieres usar productos reales, actualiza los IDs en `TEST_CART_ITEMS`

2. **Mercado Pago Sandbox**:
   - Los scripts NO interactúan con MP (solo crean orden directamente)
   - Para probar el flujo real, usa el formulario web

3. **Base de Datos**:
   - Los datos se guardan en tu BD de Supabase
   - Puedes limpiar con: `DELETE FROM orders WHERE customer_name = 'Test User Completo'`

4. **Logs**:
   - Revisa la consola del servidor (`npm run dev`) para ver logs detallados
   - Nivel de log: DEBUG (muestra todo)

---

## 🎯 Casos de Uso

### Caso 1: Verificar que tu código funciona
```bash
node scripts/test-customer-data-flow.js
# Si todo pasa ✅, tu implementación está correcta
```

### Caso 2: Debugging rápido
```bash
bash scripts/test-customer-data-curl.sh
# Más rápido si solo necesitas ver la respuesta
```

### Caso 3: Prueba real en UI
1. Abre http://localhost:3000
2. Agrega productos
3. Ve a /carrito/pago
4. Rellena formulario **COMPLETO**
5. Paga con Mercado Pago (test account)
6. Verifica en /admin/sales-history

---

## 📚 Referencias

- 📖 [GUIA-PRUEBA-CUSTOMER-DATA.md](./GUIA-PRUEBA-CUSTOMER-DATA.md) - Guía detallada
- 📖 [CHANGELOG.md](../CHANGELOG.md) - Cambios implementados
- 📖 [tasks.md](../tasks.md) - Tarea 45 completada

---

## 🆘 ¿Necesitas ayuda?

1. Revisa los logs en el servidor (`npm run dev`)
2. Abre DevTools (F12) → Network tab
3. Revisa la consola del navegador (F12 → Console)
4. Ejecuta el script con outputs detallados

```bash
# Más verbosidad
node scripts/test-customer-data-flow.js 2>&1 | tee test-output.log
```

---

¡Listo! Los scripts están listos para probar. 🚀

