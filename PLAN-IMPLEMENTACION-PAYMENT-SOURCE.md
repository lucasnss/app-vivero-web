# 📋 PLAN DETALLADO: Implementación de payment_source en Órdenes

## 🎯 Objetivo
Guardar órdenes de prueba (Mercado Pago test/sandbox) en la misma tabla que órdenes reales, pero diferenciadas por un campo `payment_source` que permita:
- ✅ Visualizar cuáles son test y cuáles son reales
- ✅ Filtrar las órdenes en el admin panel
- ✅ Borrar las órdenes de test cuando no sean necesarias

---

## 📊 ANÁLISIS PREVIO: Estructura Actual de BD

### Tabla `orders` - Estado Actual
```sql
-- Ver estructura actual (ejecutar en Supabase)
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY column_name;
```

**Campos que YA existen:**
- ✅ id (UUID, PK)
- ✅ status (varchar)
- ✅ total_amount (numeric)
- ✅ payment_method (varchar)
- ✅ payment_id (varchar, nullable)
- ✅ payment_status (varchar)
- ✅ customer_email (varchar)
- ✅ customer_name (varchar)
- ✅ customer_phone (varchar)
- ✅ customer_info (JSONB)
- ✅ shipping_address (JSONB)
- ✅ created_at, updated_at

**Campo a AGREGAR:**
- ❌ payment_source (varchar, 'real' | 'test')

---

## 🔧 SUBTAREA 1: Preparar Base de Datos

### PASO 1.1: Verificar Estructura Actual

**Ejecuta en Supabase SQL Editor:**

```sql
-- Script de verificación: Ver si la tabla existe y su estructura
\dt orders;

-- Ver todas las columnas de orders
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY column_name;

-- Ver constraints actuales
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'orders';

-- Ver índices actuales
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'orders';
```

**Resultado esperado:**
- Tabla existe: ✅
- Tiene columnas de customer: ✅
- payment_source NO existe aún: ❌

---

### PASO 1.2: SCRIPT PRINCIPAL - Agregar Campo payment_source

**Ejecuta esto en Supabase SQL Editor (⚠️ EN ORDEN):**

```sql
-- ========================================
-- 1. AGREGAR NUEVA COLUMNA payment_source
-- ========================================

ALTER TABLE orders 
ADD COLUMN payment_source VARCHAR(10) DEFAULT 'real'
CONSTRAINT check_payment_source CHECK (payment_source IN ('real', 'test'));

-- Ver que se agregó correctamente
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'payment_source';

-- ========================================
-- 2. CREAR ÍNDICE PARA FILTROS RÁPIDOS
-- ========================================

CREATE INDEX IF NOT EXISTS idx_orders_payment_source 
ON orders(payment_source, created_at DESC);

-- Verificar que el índice se creó
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'orders' AND indexname LIKE '%payment_source%';

-- ========================================
-- 3. CREAR ÍNDICE COMPUESTO PARA ADMIN
-- ========================================

CREATE INDEX IF NOT EXISTS idx_orders_payment_source_status 
ON orders(payment_source, status, created_at DESC);

-- ========================================
-- 4. VERIFICACIÓN FINAL
-- ========================================

-- Verificar que todas las órdenes existentes tienen payment_source = 'real'
SELECT COUNT(*), payment_source 
FROM orders 
GROUP BY payment_source;

-- Si tienes órdenes actuales, actualiza las que no tienen payment_source
UPDATE orders 
SET payment_source = 'real' 
WHERE payment_source IS NULL;

-- Verificar de nuevo
SELECT COUNT(*), payment_source 
FROM orders 
GROUP BY payment_source;
```

**Resultado esperado después de ejecutar:**
```
Count | Payment Source
------|----------------
 N    | real
```

---

### PASO 1.3: SCRIPT DE LIMPIEZA (Para después)

**Guarda este script, usarás cuando quieras limpiar órdenes de test:**

```sql
-- ========================================
-- SCRIPT DE LIMPIEZA DE ÓRDENES TEST
-- ========================================

-- 1. VER CUÁNTAS ÓRDENES DE TEST TIENES
SELECT COUNT(*) as total_test_orders 
FROM orders 
WHERE payment_source = 'test';

-- 2. VER DETALLES DE ÓRDENES TEST (antes de borrar)
SELECT id, customer_email, payment_source, created_at, total_amount 
FROM orders 
WHERE payment_source = 'test' 
ORDER BY created_at DESC;

-- 3. OPCIÓN A: BORRAR TODAS LAS ÓRDENES DE TEST
DELETE FROM orders 
WHERE payment_source = 'test';

-- 3. OPCIÓN B: BORRAR SOLO LAS ANTIGUAS (MÁS DE 7 DÍAS)
DELETE FROM orders 
WHERE payment_source = 'test' 
  AND created_at < NOW() - INTERVAL '7 days';

-- 3. OPCIÓN C: BORRAR PERO GUARDAR LAS ÚLTIMAS 10
DELETE FROM orders 
WHERE payment_source = 'test' 
  AND id NOT IN (
    SELECT id FROM orders 
    WHERE payment_source = 'test' 
    ORDER BY created_at DESC 
    LIMIT 10
  )
  AND created_at < NOW() - INTERVAL '7 days';

-- 4. VERIFICAR RESULTADO
SELECT COUNT(*) as remaining_test_orders 
FROM orders 
WHERE payment_source = 'test';
```

---

## 🔧 SUBTAREA 2: Función para Detectar si es Test

### Ubicación del archivo
`Fronted/app/api/mercadopago/webhook/route.ts`

### PASO 2.1: Agregar función al final del archivo

**Busca la línea final del archivo y agrega ANTES del último `}`:**

```typescript
// ========================================
// FUNCIÓN AUXILIAR: Detectar si es pago de TEST
// ========================================

/**
 * Determina si un pago de Mercado Pago es de prueba o real
 * Criterios:
 * 1. payment_method_id = 'account_money' (transferencia entre cuentas MP)
 * 2. transaction_amount < 1 (monto muy bajo)
 * 3. payment_id comienza con '0' (IDs de test en algunos casos)
 * 4. payer_email contiene 'test'
 */
function detectarSiEsTest(paymentInfo: any): boolean {
  // Criterio 1: Transferencia de cuenta (típico en test)
  if (paymentInfo.payment_method_id === 'account_money') {
    console.log('🧪 Test detectado: payment_method_id = account_money')
    return true
  }
  
  // Criterio 2: Monto muy bajo
  if (paymentInfo.transaction_amount && paymentInfo.transaction_amount < 1) {
    console.log('🧪 Test detectado: transaction_amount < 1')
    return true
  }
  
  // Criterio 3: Payment ID comienza con 0
  if (paymentInfo.payment_id?.toString().startsWith('0')) {
    console.log('🧪 Test detectado: payment_id comienza con 0')
    return true
  }
  
  // Criterio 4: Email de test
  if (paymentInfo.payer_email?.toLowerCase().includes('test')) {
    console.log('🧪 Test detectado: email contiene "test"')
    return true
  }
  
  console.log('✅ Pago detectado como REAL')
  return false
}
```

### PASO 2.2: Verificar que la función está importada

**En las líneas 1-7 del webhook/route.ts, verifica que tengas:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { mercadopagoService } from '@/services/mercadopagoService'
import { orderService } from '@/services/orderService'
import { logService } from '@/services/logService'
import { WebhookNotification } from '@/types/order'
import { supabase } from '@/lib/supabaseClient'

// ✅ Ya están todos importados
```

---

## 🔧 SUBTAREA 3: Modificar Webhook para Detectar y Pasar payment_source

### Ubicación
`Fronted/app/api/mercadopago/webhook/route.ts` - Línea ~71

### PASO 3.1: Agregar detección de test

**Encuentra esta línea (~71):**

```typescript
// Procesar la notificación
console.log('🔄 Procesando pago:', paymentId)
const paymentInfo = await mercadopagoService.processWebhookNotification(body)

if (!paymentInfo) {
  console.log('ℹ️ No se pudo procesar el webhook')
  return NextResponse.json({ status: 'not_processed' })
}
```

**REEMPLAZA con:**

```typescript
// Procesar la notificación
console.log('🔄 Procesando pago:', paymentId)
const paymentInfo = await mercadopagoService.processWebhookNotification(body)

if (!paymentInfo) {
  console.log('ℹ️ No se pudo procesar el webhook')
  return NextResponse.json({ status: 'not_processed' })
}

// ✅ NUEVO: Detectar si es pago de test o real
const isTestPayment = detectarSiEsTest(paymentInfo)
console.log(`📊 Tipo de pago: ${isTestPayment ? '🧪 TEST' : '✅ REAL'}`)
```

### PASO 3.2: Pasar payment_source al crear orden

**Encuentra esta línea (~115-130) donde crea el createOrderRequest:**

```typescript
const createOrderRequest: any = {
  items: tempOrderData.items,
  shipping_address: tempOrderData.shipping_address,
  payment_method: 'mercadopago',
  customer_email: tempOrderData.customer_email,
  customer_name: tempOrderData.customer_name,
  customer_phone: tempOrderData.customer_phone || '',
  shipping_method: tempOrderData.shipping_method,
  notes: `Orden creada automáticamente desde webhook MP`
}
```

**AGREGA esta línea al final:**

```typescript
const createOrderRequest: any = {
  items: tempOrderData.items,
  shipping_address: tempOrderData.shipping_address,
  payment_method: 'mercadopago',
  customer_email: tempOrderData.customer_email,
  customer_name: tempOrderData.customer_name,
  customer_phone: tempOrderData.customer_phone || '',
  shipping_method: tempOrderData.shipping_method,
  notes: `Orden creada automáticamente desde webhook MP`,
  
  // ✅ NUEVO: Pasar si es test o real
  payment_source: isTestPayment ? 'test' : 'real'
}
```

---

## 🔧 SUBTAREA 4: Actualizar orderService.ts

### Ubicación
`Fronted/src/services/orderService.ts` - Función `createGuestOrder()`

### PASO 4.1: Asegurar que guarde payment_source

**En la función `createGuestOrder()` (línea ~97-150), busca:**

```typescript
const insertData: any = {
  status: 'pending',
  total_amount,
  shipping_address: orderData.shipping_address,
  payment_method: orderData.payment_method,
  notes: orderData.notes,
  customer_info: {
    // ... datos ...
  }
}
```

**AGREGA payment_source al insertData:**

```typescript
const insertData: any = {
  status: 'pending',
  total_amount,
  shipping_address: orderData.shipping_address,
  payment_method: orderData.payment_method,
  notes: orderData.notes,
  
  // ✅ NUEVO: Guardar si es test o real
  payment_source: (orderData as any).payment_source || 'real',
  
  customer_info: {
    // ... datos ...
  }
}
```

### PASO 4.2: Verificar que el INSERT incluya el campo

**Verifica que la línea del INSERT tenga:**

```typescript
const { data: order, error } = await supabase
  .from('orders')
  .insert(insertData)  // ✅ insertData YA incluye payment_source
  .select()
  .single()
```

---

## 🔧 SUBTAREA 5: Actualizar Tipos TypeScript

### Ubicación
`Fronted/src/types/order.ts`

### PASO 5.1: Agregar a interface Order

**Encuentra la interface Order (línea ~3-29) y AGREGA al final:**

```typescript
export interface Order {
  id: string
  status: OrderStatus
  total_amount: number
  shipping_address: ShippingAddress
  payment_method: PaymentMethod
  notes?: string
  created_by_admin?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
  customer_email: string
  customer_name: string
  customer_phone: string
  
  // Campos de Mercado Pago
  payment_id?: string
  comprobante_url?: string
  metodo_pago?: string
  email_comprador?: string
  fecha_pago?: string
  payment_status: PaymentStatus
  preference_id?: string
  payment_type?: string
  merchant_order_id?: string
  external_reference?: string
  
  // ✅ NUEVO: Tipo de pago (test o real)
  payment_source?: 'real' | 'test'
}
```

### PASO 5.2: Agregar a interface CreateOrderRequest

**Encuentra CreateOrderRequest (línea ~68-79) y AGREGA:**

```typescript
export interface CreateOrderRequest {
  items: Omit<CartItem, 'id'>[]
  shipping_address: ShippingAddress
  payment_method: PaymentMethod
  customer_email: string
  customer_name: string
  customer_phone: string
  shipping_method?: 'pickup' | 'delivery'
  notes?: string
  created_by_admin?: string
  
  // ✅ NUEVO: Tipo de pago (test o real)
  payment_source?: 'real' | 'test'
}
```

### PASO 5.3: Crear tipo para payment_source (Opcional pero bueno)

**AGREGA después de los otros tipos (línea ~30+):**

```typescript
export type PaymentSource = 'real' | 'test'
```

---

## 🔧 SUBTAREA 6: Mostrar Indicador en Admin

### Ubicación
Depende de dónde muestres las órdenes. Típicamente: `/admin/sales-history` o componente que liste órdenes

### Ejemplo de cómo mostrar

**Si usas tabla o componente similar:**

```typescript
// Importar si es necesario
import { Order } from '@/types/order'

// En el render de la tabla/lista:
{orders.map((order) => (
  <tr 
    key={order.id} 
    className={order.payment_source === 'test' ? 'bg-yellow-50' : ''}
  >
    <td>{order.customer_name}</td>
    <td>{order.customer_email}</td>
    
    {/* ✅ NUEVO: Columna de tipo de pago */}
    <td>
      {order.payment_source === 'test' ? (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
          🧪 TEST
        </span>
      ) : (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
          ✅ REAL
        </span>
      )}
    </td>
    
    <td>${order.total_amount}</td>
    <td>{order.status}</td>
    {/* ... más columnas ... */}
  </tr>
))}
```

---

## 🔧 SUBTAREA 7: (OPCIONAL) Filtro en API

### Ubicación
`Fronted/app/api/orders/route.ts` - Método GET

### Agregar parámetro de filtro

**En la función GET, busca donde procesa los query params (~20-30):**

```typescript
// Obtener parámetros de query
const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')
const status = request.nextUrl.searchParams.get('status') || undefined
const email = request.nextUrl.searchParams.get('email') || undefined

// ✅ NUEVO: Agregar parámetro para excluir test
const excludeTest = request.nextUrl.searchParams.get('exclude_test') === 'true'
```

**Luego en la query de Supabase (~50+):**

```typescript
let query = supabase
  .from('orders')
  .select('*', { count: 'exact' })

// ... aplicar filtros existentes ...

// ✅ NUEVO: Filtro para excluir órdenes de test
if (excludeTest) {
  query = query.eq('payment_source', 'real')
}

// ... resto de query ...
```

**Ahora puedes usar en frontend:**

```typescript
// Obtener solo órdenes reales (excluyendo test)
const response = await fetch('/api/orders?exclude_test=true&page=1')

// Obtener todas las órdenes (incluyendo test)
const response = await fetch('/api/orders?page=1')
```

---

## 🔧 SUBTAREA 8: Script de Limpieza

**Crea archivo: `Fronted/scripts/cleanup-test-orders.sql`**

```sql
-- ========================================
-- SCRIPT DE LIMPIEZA DE ÓRDENES DE TEST
-- ========================================
-- Ejecutar en Supabase cuando no necesites más órdenes de test
-- Hay 3 opciones: Borrar todo / Borrar antiguas / Borrar menos últimas

-- ANTES DE BORRAR: VER CUÁNTAS HAY
SELECT COUNT(*) as total_test_orders, 
       COUNT(DISTINCT DATE(created_at)) as days_with_test_orders
FROM orders 
WHERE payment_source = 'test';

-- ANTES DE BORRAR: VER DETALLES
SELECT id, customer_email, created_at, total_amount, payment_status
FROM orders 
WHERE payment_source = 'test' 
ORDER BY created_at DESC
LIMIT 20;

-- ========================================
-- OPCIÓN A: BORRAR TODAS LAS ÓRDENES DE TEST
-- ========================================
DELETE FROM orders 
WHERE payment_source = 'test';

-- ========================================
-- OPCIÓN B: BORRAR SOLO LAS ANTIGUAS (> 7 DÍAS)
-- ========================================
DELETE FROM orders 
WHERE payment_source = 'test' 
  AND created_at < NOW() - INTERVAL '7 days';

-- ========================================
-- OPCIÓN C: GUARDAR LAS 10 MÁS RECIENTES
-- ========================================
DELETE FROM orders 
WHERE payment_source = 'test' 
  AND id NOT IN (
    SELECT id FROM orders 
    WHERE payment_source = 'test' 
    ORDER BY created_at DESC 
    LIMIT 10
  );

-- DESPUÉS DE BORRAR: VERIFICAR
SELECT COUNT(*) as remaining_test_orders 
FROM orders 
WHERE payment_source = 'test';
```

---

## 🔧 SUBTAREA 9: Documentación

**Actualizar en `tasks.md` y `CHANGELOG.md`:**

```markdown
## ✅ TAREA COMPLETADA: Implementar payment_source en órdenes

### Objetivo
Guardar órdenes de test en la misma tabla que órdenes reales, diferenciadas por campo `payment_source`.

### ✅ Implementado
- [x] SUBTAREA 1: Estructura de BD - Agregar columna payment_source + índices
- [x] SUBTAREA 2: Función detectarSiEsTest() en webhook
- [x] SUBTAREA 3: Webhook pasa payment_source al crear orden
- [x] SUBTAREA 4: OrderService guarda payment_source
- [x] SUBTAREA 5: Tipos actualizados en order.ts
- [x] SUBTAREA 6: Indicador visual en admin panel
- [x] SUBTAREA 7: Filtro en API para excluir test
- [x] SUBTAREA 8: Script de limpieza de órdenes test

### Impacto
- ✅ Órdenes test y reales en misma tabla
- ✅ Diferenciadas visualmente (🧪 vs ✅)
- ✅ Fácil de filtrar y borrar
- ✅ Listo para pasar a producción
```

---

## ✅ RESUMEN DE CAMBIOS

| Archivo | Cambio | Tipo |
|---------|--------|------|
| `Supabase SQL` | Agregar columna + índices | DB |
| `webhook/route.ts` | Función detectarSiEsTest() + lógica | Backend |
| `orderService.ts` | Guardar payment_source en INSERT | Backend |
| `order.ts` | Agregar tipo payment_source | TypeScript |
| `admin panel` | Mostrar indicador visual | Frontend |
| `api/orders/route.ts` | Filtro exclude_test (opcional) | Backend |
| `cleanup-test-orders.sql` | Script de limpieza | DB |

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

- [ ] PASO 1.1: Ejecutar script de verificación en Supabase
- [ ] PASO 1.2: Ejecutar script principal (agregar columna + índices)
- [ ] PASO 2.1: Agregar función `detectarSiEsTest()` en webhook
- [ ] PASO 3.1: Agregar detección en webhook
- [ ] PASO 3.2: Pasar payment_source en createOrderRequest
- [ ] PASO 4.1: Guardar payment_source en orderService
- [ ] PASO 5.1: Actualizar interface Order
- [ ] PASO 5.2: Actualizar interface CreateOrderRequest
- [ ] PASO 6: Mostrar indicador en admin
- [ ] PASO 7: (OPCIONAL) Agregar filtro en API
- [ ] PASO 8: Guardar script de limpieza
- [ ] PASO 9: Documentar en tasks.md y CHANGELOG.md
- [ ] PRUEBA: Realizar compra de test y verificar que aparece 🧪 en admin
- [ ] PRUEBA: Limpiar órdenes de test con script SQL

---

Creado: 13 Noviembre 2025
Versión: 1.0 - Plan Completo de Implementación


