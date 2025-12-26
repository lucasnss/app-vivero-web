# 🧪 GUÍA: Prueba Real en Producción

## ⚠️ CRÍTICO - Hacer ANTES de lanzar

Este documento detalla cómo hacer una **prueba real de pago en producción** para verificar que TODO funciona.

---

## 📋 CHECKLIST PRE-PRUEBA

Antes de iniciar, verifica que:

- [ ] Credenciales de PRODUCCIÓN están configuradas en Vercel (`APP_USR-...`)
- [ ] Secret de webhook está configurado en Vercel
- [ ] Base de datos está actualizada
- [ ] Frontend está deployado
- [ ] Tienes acceso a la cuenta de Mercado Pago
- [ ] Tienes acceso a los logs de Vercel

---

## 🎯 PASO 1: Preparar el Producto

### 1a. Selecciona un producto de prueba

Usa una **planta barata** (ej: $100 ARS) para minimizar riesgo.

En la BD:
```sql
SELECT id, name, price, stock FROM products LIMIT 5;
```

**Ejemplo**: ID = `123`, Nombre = "Planta Test", Precio = $100

### 1b. Verifica el stock

```sql
SELECT id, name, stock FROM products WHERE id = '123';
```

Debería mostrar algo como:
```
id  | name        | stock
123 | Planta Test | 10
```

**Nota el stock actual**: 10 unidades

---

## 🛒 PASO 2: Simular Compra

### 2a. Abre la app en navegador

```
https://app-vivero-web.vercel.app/
```

### 2b. Agrega el producto al carrito

1. Busca la planta de prueba
2. Agrega 1 unidad al carrito
3. Ve al carrito
4. Verifica que el precio sea correcto ($100 ARS)

### 2c. Inicia el checkout

1. Click en "Proceder a pago"
2. Elige método de envío (Retiro o Domicilio)
3. Completa email y datos (usa **TU EMAIL**)
4. Click en "Ir a Mercado Pago"

**¿Qué debería pasar?**
```
✅ Se redirige a Mercado Pago Checkout
✅ Muestra monto $100 ARS
✅ Email correcto precompletado
```

---

## 💳 PASO 3: Pagar en Mercado Pago

### 3a. Datos de prueba (PRODUCCIÓN)

En Mercado Pago, **debes usar tarjeta real** (esto es PRODUCCIÓN, no test).

**Opciones:**
1. Pagar con tu tarjeta real (será cobrado de verdad)
2. Transferencia bancaria (más lento, puede ser pending)
3. Account Money (dinero en cuenta MP)

### 3b. Completa el pago

```
Tarjeta de crédito:
- Número: Tu tarjeta real
- Vencimiento: MM/AA
- CVV: 3 dígitos
- Titular: Tu nombre
- Email: tu_email@gmail.com
```

Click **"Pagar"**

---

## ✅ PASO 4: Verificar Webhook

Este es el paso **MÁS IMPORTANTE**.

### 4a. Abre Vercel Logs

```
https://vercel.com → Tu Proyecto → Logs
```

### 4b. Busca logs de webhook

Deberías ver algo como:
```
🔔 [WEBHOOK] Notificación recibida de MercadoPago
✅ [WEBHOOK] Firma validada correctamente
🔍 Buscando datos temporales de la preferencia...
✅ Orden real creada con external_reference: ...
📝 Actualizando orden con información de pago...
✅ Pago aprobado, marcando orden como pagada
📉 Reduciendo stock de productos...
✅ Stock reducido exitosamente para todos los productos
✅ [WEBHOOK] Procesamiento completado en XXXms
```

**Si ves esto:** ✅ **TODO FUNCIONA**

**Si ves 401 o error de firma:** 
```
❌ [WEBHOOK] FIRMA INVÁLIDA - RECHAZANDO
→ Verifica MERCADOPAGO_WEBHOOK_SECRET en Vercel
```

---

## 📊 PASO 5: Verificar ORDEN en BD

### 5a. Busca la orden en la BD

```sql
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 1;
```

Debería mostrar:
```
id           | customer_email    | payment_status | status    | total_amount | payment_id
abc123xyz    | tu_email@gmail... | approved       | confirmed | 100.00       | 12345678901
```

**Verifica:**
- [ ] `payment_status = 'approved'` ✅
- [ ] `status = 'confirmed'` ✅
- [ ] `customer_email` = tu email ✅
- [ ] `payment_id` NOT NULL ✅
- [ ] `total_amount = 100` ✅

### 5b. Verifica los items de la orden

```sql
SELECT oi.product_id, oi.product_name, oi.quantity, oi.unit_price
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
ORDER BY o.created_at DESC
LIMIT 5;
```

Debería mostrar:
```
product_id | product_name  | quantity | unit_price
123        | Planta Test   | 1        | 100.00
```

✅ **PERFECTO**

---

## 📦 PASO 6: Verificar STOCK DESCONTADO

### 6a. Consulta stock después del pago

```sql
SELECT id, name, stock FROM products WHERE id = '123';
```

Debería mostrar:
```
id  | name        | stock
123 | Planta Test | 9         ← BAJÓ DE 10 A 9 ✅
```

**Si el stock NO bajó:**
```
❌ PROBLEMA CRÍTICO
→ Verifica logs: "stock_reduction_error"
→ Checkea permisos de BD
```

---

## 📧 PASO 7: Verificar EMAIL

### 7a. Revisa tu inbox

Deberías recibir email con:
```
Asunto: Pedido Confirmado #abc123xyz
De: (email configurado)

Contenido:
- Número de orden
- Items comprados
- Monto total
- Método de pago
- Dirección de retiro/envío
```

**Si NO llegó email:**
```
❌ REVISAR:
1. Logs de error en "email_sending"
2. Credenciales de Gmail en Vercel
3. Carpeta de SPAM
```

---

## 💰 PASO 8: Verificar DINERO en Mercado Pago

### 8a. Ve al Dashboard de Mercado Pago

```
https://www.mercadopago.com.ar/balance
```

### 8b. Busca la transacción

En el historial de movimientos, deberías ver:
```
Movimiento: +$100 ARS (después de comisión)
Concepto: Venta / Pago de cliente
Fecha: HOY
Estado: Disponible o Pendiente de acreditación
```

**Si NO aparece:**
```
❌ PROBLEMA CRÍTICO
→ Verifica credenciales de producción
→ Verifica que pago esté en "approved" en BD
```

---

## 👁️ PASO 9: Verificar en ADMIN

### 9a. Login en admin

```
https://app-vivero-web.vercel.app/admin
User: tu-usuario
Pass: tu-contraseña
```

### 9b. Ir a "Historial de Ventas"

Deberías ver la orden recién creada en el listado:
```
Orden ID       | Cliente      | Monto  | Estado     | Pago
abc123xyz      | tu_email...  | $100   | Confirmada | Aprobado ✅
```

### 9c. Click en "Ver Detalle"

Deberías ver:
```
📋 DETALLES DE ORDEN
- ID de Orden: abc123xyz
- Email: tu_email@gmail.com
- Estado: Confirmada
- Pago: Aprobado ✅
- Método: Mercado Pago
- Tarjeta: Débito Visa (últimos 4 dígitos)
- ID de Pago: 12345678901

📦 ITEMS
- Planta Test × 1 = $100

📊 TOTAL: $100
```

Click en "ID de Pago" → Debería redirigirse a Mercado Pago.

---

## 🎉 PASO 10: Verificar ACTIVIDAD (Logs)

### 10a. Revisa activity_logs

```sql
SELECT action, entity_type, entity_id, created_at 
FROM activity_logs 
WHERE created_at > NOW() - INTERVAL 10 MINUTES
ORDER BY created_at DESC;
```

Deberías ver:
```
action                      | entity_type | entity_id | created_at
webhook_received            | mercadopago | 1234...   | 2025-12-XX
webhook_processed           | mercadopago | 1234...   | 2025-12-XX
order_paid                  | order       | abc123... | 2025-12-XX
webhook_processed_success   | order       | abc123... | 2025-12-XX
```

---

## ✅ CHECKLIST FINAL

Si TODOS estos puntos están ✅, puedes lanzar sin miedo:

- [ ] Webhook procesado correctamente (logs en Vercel)
- [ ] Orden creada en BD con `payment_status = 'approved'`
- [ ] Stock descontado en BD
- [ ] Email enviado al cliente
- [ ] Dinero visible en cuenta Mercado Pago
- [ ] Orden visible en admin
- [ ] Actividad registrada en logs

---

## 🚨 SI ALGO FALLA

### Problema: Webhook no procesado

**Síntoma:**
```
No aparecen logs de webhook en Vercel
```

**Causas comunes:**
1. URL de webhook mal configurada en MP
2. Secret de webhook no configurado
3. Endpoint `/api/mercadopago/webhook` retorna 401

**Solución:**
```bash
# Ir a MP Dashboard → Webhooks
# Verificar URL: https://app-vivero-web.vercel.app/api/mercadopago/webhook
# Click en "Test" → ver resultado en Vercel logs
```

### Problema: Orden creada pero stock NO descontado

**Síntoma:**
```
BD: stock = 10 (no cambió)
Logs: "stock_reduction_error"
```

**Causa:** Error en BD o permisos.

**Solución:**
```sql
-- Descontar manualmente (último recurso)
UPDATE products 
SET stock = stock - 1 
WHERE id = '123';
```

### Problema: Email no enviado

**Síntoma:**
```
No email en inbox
Logs: "error_sending_email"
```

**Causas:** Credenciales Gmail incorrectas.

**Solución:**
```bash
# Verifica en Vercel:
# Settings → Environment Variables
# EMAIL_USER y EMAIL_PASSWORD deben ser válidos
```

---

## 📞 SIGUIENTES PASOS

Después de pasar esta prueba:

1. ✅ **Genera 3-5 más** (montos diferentes, métodos diferentes)
2. ✅ **Prueba reembolso** en Mercado Pago (verifica que manejo sea correcto)
3. ✅ **Prueba pago rechazado** (máquina sin fondos)
4. ✅ **Notifica a cliente** que sistema está listo

---

## 📝 DOCUMENTAR RESULTADO

Después de pasar la prueba, actualiza:

```markdown
# VERIFICACIÓN PRE-PRODUCCIÓN

✅ Prueba Real Completada: 2025-12-XX
- Monto: $100 ARS
- Producto: Planta Test (ID: 123)
- Pago: Aprobado
- Stock: Descontado correctamente
- Email: Enviado
- Orden: Visible en admin

Auditor: [Tu Nombre]
Timestamp: [Fecha/Hora exacta]
```

Agrega esto a `CHANGELOG.md`.

---

## 🔒 NOTAS DE SEGURIDAD

- [ ] Usa **credenciales de PRODUCCIÓN** (APP_USR-...), NO TEST
- [ ] Después de la prueba, **revisa que no quedó nada de debug**
- [ ] **NO hagas commit de credenciales reales**
- [ ] **Limpia logs sensibles después de testing**

