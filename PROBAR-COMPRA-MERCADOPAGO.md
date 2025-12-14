# 🧪 Cómo Probar una Compra con Mercado Pago

Guía paso a paso para probar tu sistema de pagos después del redeploy.

---

## ✅ Estado Actual

Tu deploy fue **exitoso**. Ahora:
- ✅ NODE_ENV = production está configurado
- ✅ Credenciales de MP están en Vercel
- ✅ Webhook está registrado en MP
- 🔄 Ahora: **Probar que todo funciona**

---

## 🎯 Plan de Pruebas

### Fase 1: Prueba con TARJETA DE TEST (sin dinero real)
**Tiempo:** 10 minutos
**Riesgo:** 0 (es simulación)

### Fase 2: Verificar en Supabase
**Tiempo:** 5 minutos
**Qué buscar:** ¿Se creó la orden?

### Fase 3: Verificar Logs en Vercel
**Tiempo:** 5 minutos
**Qué buscar:** ¿Funciona el webhook?

### Fase 4: Prueba con DINERO REAL (si Fase 1-3 funcionan)
**Tiempo:** 5 minutos
**Riesgo:** Mínimo (monto pequeño)

---

## 🧪 FASE 1: Prueba con Tarjeta de TEST

### Paso 1.1: Abre tu sitio

Abre en navegador:
```
https://app-vivero-web-git-mp-production-lksyayo-2570s-projects.vercel.app
```

### Paso 1.2: Agrega productos al carrito

1. Navega por los productos
2. Agrega 1-2 productos al carrito (elige económicos para prueba)
3. Ve al carrito
4. Click en: **Ir al checkout**

### Paso 1.3: Completa datos de cliente

Rellena:
- Nombre: (cualquiera, ej: "Test Prueba")
- Email: (cualquiera, ej: "test@viveroweb.com")
- Teléfono: (cualquiera, ej: "1123456789")
- Dirección: (cualquiera, ej: "Calle 123")
- Código postal: (cualquiera, ej: "1234")
- Método de envío: (elige uno)

Click en: **Continuar a Mercado Pago**

### Paso 1.4: Usa Tarjeta de TEST

En Mercado Pago, completa:

**Opción A: Tarjeta que APRUEBA el pago**
```
Número:  5031 7557 3453 0604
CVV:     123
Fecha:   11/25
Nombre:  APRO
DNI:     12345678
Email:   cualquiera@test.com
```

**Opción B: Tarjeta que RECHAZA el pago**
```
Número:  4111 1111 1111 1111
CVV:     123
Fecha:   11/25
Nombre:  OTHE
DNI:     12345678
```

**Opción C: Tarjeta con cuotas**
```
Número:  5031 7557 3453 0604
CVV:     123
Fecha:   11/25
Nombre:  APRO
DNI:     12345678
Cuotas:  3 (opcional)
```

### Paso 1.5: Completa el pago

- Click en: **Pagar** (o según lo que diga MP)
- Espera 2-3 segundos
- Debe redirigirte a: **Página de éxito** ✅

---

## 📊 FASE 2: Verificar en Supabase

Después del pago, verifica que se creó la orden.

### Paso 2.1: Abre tu Panel Admin

```
https://app-vivero-web-git-mp-production-lksyayo-2570s-projects.vercel.app/admin
```

Login con tu usuario admin.

### Paso 2.2: Busca la orden reciente

Click en: **Historial de Ventas** (si existe)

Debe aparecer una nueva orden con:
- ✅ Estado: "Pagada" o "Aprobada"
- ✅ Cliente: "Test Prueba" (el que pusiste)
- ✅ Monto: el total del carrito
- ✅ Método de pago: "Mercado Pago"

---

## 🔍 FASE 3: Verificar Logs en Vercel

Aquí es donde ves si el webhook funcionó correctamente.

### Paso 3.1: Abre Logs de Vercel

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Click en: **Functions**
4. Click en: **Logs**

### Paso 3.2: Busca el webhook

En los logs, busca (usa Ctrl+F):
- `🔔 Webhook procesado` ✅
- `payment_source: 'test'` ✅
- `Pago aprobado` ✅

### Paso 3.3: Verifica el contenido

Deberías ver algo como:

```
✅ 🔔 Webhook procesado: {
  order_id: 'xxxxx',
  payment_id: 'xxxxx',
  status: 'approved' ✅
}

✅ 📊 Tipo de pago: 🧪 TEST

✅ Pago aprobado, marcando orden como pagada

✅ Email: Se está enviando confirmación
```

**Si ves eso → ✅ TODO FUNCIONA**

---

## 💰 FASE 4: Prueba con DINERO REAL (OPCIONAL)

**SOLO si Fases 1-3 funcionaron correctamente.**

### ⚠️ Antes de Hacer Esto

Verifica en los logs que dijeron:

```
✅ payment_source: 'test'
```

Si dice `'real'`, es dinero REAL.

### Paso 4.1: Usa Tu Tarjeta Personal

Haz el mismo proceso pero con:

```
Número:  Tu tarjeta personal
CVV:     Tu CVV real
Fecha:   Tu fecha real
Nombre:  Tu nombre real
DNI:     Tu DNI
```

### Paso 4.2: Usa MONTO PEQUEÑO

Compra algo económico:
- Opción 1: Un producto pequeño ($50-$100)
- Opción 2: Varios productos para llegar a ~$100

### Paso 4.3: Verifica Dinero en Cuenta del Cliente

**CRÍTICO:** El dinero debe llegar a la cuenta del CLIENTE, no a la tuya.

En los logs, deberías ver:

```
✅ payment_source: 'real'
```

En la orden en admin:

```
Método de pago: Mercado Pago
Estado: Pagada
Email: xxx@gmail.com (el que pusiste)
```

El cliente recibirá un email con confirmación.

---

## 🆘 Si Algo No Funciona

### Error: "Tarjeta rechazada"

Causas posibles:
- ❌ Todavía usas credenciales de TEST
- ❌ NODE_ENV no está en production
- ✅ Solución: Verifica que `NODE_ENV=production` en Vercel

### Error: "Página en blanco después del pago"

Causas:
- ❌ Error en redirección
- ❌ URL de webhook incorrecta
- ✅ Solución: Revisa logs en Vercel

### Error: "Webhook no llega"

Causas:
- ❌ Webhook no está registrado en MP
- ❌ URL es incorrecta
- ❌ El endpoint no existe
- ✅ Solución: Verifica webhook en Mercado Pago

### Orden aparece pero sin pago

Causas:
- ❌ El webhook llegó pero no se procesó
- ❌ Error al actualizar el estado
- ✅ Solución: Revisa logs de error en Vercel

---

## 📋 Checklist: Antes de Empezar Fase 4 (Dinero Real)

- [ ] Fase 1 (Tarjeta Test) funcionó ✅
- [ ] Fase 2 (Supabase) mostró la orden ✅
- [ ] Fase 3 (Logs) mostró "payment_source: 'test'" ✅
- [ ] Logs NO mostraron errores ✅
- [ ] El webhook llegó una sola vez (no 4) ✅
- [ ] Email de confirmación se envió ✅

Si todos ✅, puedes hacer Fase 4 con confianza.

---

## 📊 ¿Qué Debe Pasar en Cada Fase?

| Fase | Acción | Resultado Esperado | Si Falla |
|------|--------|-------------------|---------|
| 1 | Compra con tarjeta test | Redirige a página de éxito | Revisa logs MP |
| 2 | Verifica en Supabase | Aparece orden con estado "Pagada" | Verifica webhook |
| 3 | Revisa logs Vercel | Ves "🔔 Webhook procesado" | Verifica URL webhook |
| 4 | Compra con dinero real | Dinero llega a cuenta cliente | Verifica credenciales |

---

## 🎯 Resultado Final Esperado

Después de una compra exitosa:

### En tu sitio:
```
✅ Página de éxito
✅ Muestra "Gracias por tu compra"
✅ Número de orden
```

### En Supabase (órdenes):
```
✅ Nueva orden creada
✅ Estado: "Completada" o "Pagada"
✅ payment_status: "approved"
✅ payment_id: (ID de MP)
```

### En Email:
```
✅ Cliente recibe email con:
  - Detalles de la orden
  - PDF adjunto
  - Confirmación de pago
```

### En Logs Vercel:
```
✅ 🔔 Webhook procesado
✅ ✅ Pago aprobado
✅ 📧 Email enviado
✅ 📉 Stock reducido
```

### En Mercado Pago:
```
✅ Pago aparece en tu panel
✅ Estado: "Aprobado"
✅ (Si dinero real) Dinero disponible para retirar
```

---

## 🚀 Próximos Pasos

1. **AHORA:** Sigue Fases 1-3 (tarjeta de test)
2. **Comparte:** Los resultados conmigo
3. **Después:** Fase 4 (si todo funciona)
4. **Finalmente:** Comunica al cliente que está listo

---

## 📞 Me Necesitas?

Si algo no funciona:

1. Comparte el OUTPUT de los logs de Vercel
2. Dime en qué fase se atascó
3. Dime qué error ves

**Pero primero prueba todo hasta Fase 3. Verás que funciona. 🚀**

