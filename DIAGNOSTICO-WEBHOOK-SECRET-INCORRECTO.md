# 🔴 DIAGNÓSTICO Y SOLUCIÓN: Webhooks Rechazados

## 📊 ANÁLISIS DE LOS LOGS

### ✅ LO QUE FUNCIONA (Buenas noticias)

```
1. ✅ Orden creada: fc5e6fe5-8242-450f-a5e5-f01898be6643
2. ✅ Pago aprobado: payment_id = 138472432031
3. ✅ Dinero en cuenta MP: Confirmado
4. ✅ Stock descontado: status = "confirmed"
5. ✅ Email capturado: lucasctmn@gmail.com
6. ✅ Fulfillment correcto: awaiting_pickup
```

**CONCLUSIÓN**: El sistema FUNCIONA, el dinero LLEGA, las órdenes se crean.

---

### ❌ EL PROBLEMA (Logs de Vercel)

**TODOS los webhooks están siendo RECHAZADOS**:

```
Línea 21: ❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE
Línea 25: Hash esperado: e4b19423fa36ab1f93271dbaccc69c65da8423caba9d4559fd10a650264dcc2d
Línea 26: Hash recibido: 769d22b73cf08d98784424451d36059dd8b130be4ddcd4a7b3d52feed6447484
Línea 28: 🚨 [WEBHOOK] FIRMA INVÁLIDA - RECHAZANDO
Línea 30: ❌ Webhook rechazado: firma inválida o secret no configurado
```

**Esto se repite en TODOS los webhooks** (líneas 1-431).

---

## 🔍 ¿POR QUÉ FUNCIONA SI EL WEBHOOK FALLA?

Tu sistema tiene un **FALLBACK** en `/pago/success`:

```
FLUJO ACTUAL:
1. Usuario paga en MP → Pago aprobado
2. MP envía webhook → RECHAZADO (firma inválida)
3. MP redirige a /pago/success
4. /pago/success crea la orden manualmente
5. ✅ Sistema funciona PERO sin webhook
```

**PROBLEMA**: Estás usando el PLAN B (redirect) en lugar del PLAN A (webhook).

---

## 🚨 EL PROBLEMA REAL

El **SECRET KEY configurado en Vercel es INCORRECTO**.

**Evidencia**:
```
Línea 13: Secret Key configurada: SÍ (longitud: 64) ✅
Línea 25: Hash esperado: e4b19... (calculado con tu secret)
Línea 26: Hash recibido: 769d2... (enviado por MP con SU secret)
         ↑ NO COINCIDEN
```

Esto significa que el secret que está en Vercel **NO es el mismo** que el que Mercado Pago está usando para firmar.

---

## ✅ SOLUCIÓN (3 PASOS - 10 MINUTOS)

### PASO 1: Obtener el Secret CORRECTO de Mercado Pago

1. Ir a: https://www.mercadopago.com.ar/developers/panel/app/174087864/webhooks

2. Buscar la sección **"Webhook signature secret"** o **"Secret para validar firma"**

3. Debería verse algo así:
   ```
   🔐 Secret para validar firma X-Signature:
   abc123def456ghi789...
   
   [Copiar]  [Regenerar]
   ```

4. Click en **"Copiar"** (NO regenerar, solo copiar)

5. **IMPORTANTE**: Verifica que sea de **PRODUCCIÓN** (no de test)

---

### PASO 2: Actualizar en Vercel

1. Ir a: https://vercel.com/tu-proyecto/settings/environment-variables

2. Buscar: `MERCADOPAGO_WEBHOOK_SECRET`

3. Click en "Edit"

4. **Reemplazar** el valor actual con el secret copiado

5. **VERIFICAR**:
   - Longitud: debe ser 64 caracteres
   - Sin espacios al inicio/final
   - Exactamente como lo copiaste de MP

6. Click "Save"

7. **REDEPLOY**:
   ```bash
   # Opción A: Push cualquier cambio
   git commit --allow-empty -m "trigger redeploy"
   git push
   
   # Opción B: Redeploy manual en Vercel Dashboard
   Deployments → ... → Redeploy
   ```

8. Esperar 2-3 minutos a que el deploy termine

---

### PASO 3: Verificar que Funciona

1. **Hacer otra compra de prueba** ($10 ARS)

2. **Ir a Vercel Logs** inmediatamente después de pagar

3. **Buscar en logs**:
   ```
   ❌ ANTES (error):
   ❌ [MP_SIGNATURE] Firma de MercadoPago inválida
   
   ✅ DESPUÉS (correcto):
   ✅ [WEBHOOK] Firma validada correctamente
   🔔 [WEBHOOK] Notificación recibida de MercadoPago
   ✅ Pago aprobado, marcando orden como pagada
   📉 Reduciendo stock de productos...
   ✅ [WEBHOOK] Procesamiento completado
   ```

4. **Si ves** "✅ Firma validada correctamente" → **LISTO**

5. **Si sigues viendo** "❌ Firma inválida" → El secret sigue mal

---

## 🔍 TROUBLESHOOTING

### Problema: "Sigo viendo firma inválida después de actualizar"

**Causas posibles**:

1. **El secret tiene espacios**
   ```bash
   ❌ " abc123... "  (con espacios)
   ✅ "abc123..."    (sin espacios)
   ```

2. **Copiaste el secret de TEST en lugar de PRODUCCIÓN**
   - Verifica en MP Dashboard que estás en modo PRODUCCIÓN (toggle arriba a la derecha)

3. **El deploy no se completó**
   - Espera 2-3 minutos después del redeploy
   - Verifica en Vercel que el deploy tiene estado "Ready"

4. **Vercel está cacheando la variable vieja**
   - Solución: Redeploy manual desde Vercel Dashboard

---

### Problema: "No encuentro el secret en MP Dashboard"

**Pasos**:

1. Ir a: https://www.mercadopago.com.ar/developers/panel

2. Click en tu aplicación (ID: 4015405103617799)

3. En el menú izquierdo, buscar **"Webhooks"** o **"Integraciones"**

4. Debería aparecer:
   ```
   URL de webhook: https://app-vivero-web.vercel.app/api/mercadopago/webhook
   
   🔐 Secret para validar firma:
   [Tu secret aquí]
   ```

5. Si NO aparece el secret:
   - Click en "Configuración avanzada"
   - O contactar soporte de MP

---

## 📋 CHECKLIST FINAL

Después de actualizar el secret:

```
- [ ] Secret copiado de MP Dashboard (PRODUCCIÓN)
- [ ] Secret actualizado en Vercel (sin espacios)
- [ ] Redeploy completado (status: Ready)
- [ ] Compra de prueba realizada
- [ ] Logs muestran "✅ Firma validada correctamente"
- [ ] Orden creada por webhook (no por fallback)
- [ ] Stock descontado
- [ ] Email enviado
```

---

## 🎯 ESTADO ACTUAL VS DESEADO

### ACTUAL (funcionando pero mal)
```
Usuario paga → MP webhook RECHAZADO → Redirect a /pago/success → Orden creada
                       ↑ PROBLEMA
```

### DESEADO (después de fix)
```
Usuario paga → MP webhook ACEPTADO → Orden creada instantáneamente
                       ↑ SOLUCIÓN
```

---

## 💡 ¿POR QUÉ ES IMPORTANTE ARREGLARLO?

```
CON WEBHOOK RECHAZADO (actual):
❌ Usuario debe esperar redirect (más lento)
❌ Si usuario cierra navegador, puede perder orden
❌ Reintentos de MP fallan (error 401)
❌ No es profesional (logs llenos de errores)

CON WEBHOOK FUNCIONANDO (después del fix):
✅ Orden se crea instantáneamente
✅ Funciona aunque usuario cierre navegador
✅ MP puede reintentar si falla
✅ Sistema robusto y profesional
```

---

## 📝 RESUMEN EJECUTIVO

```
PROBLEMA:
→ Secret key en Vercel es INCORRECTA
→ Webhooks rechazados con HTTP 401
→ Sistema funciona por fallback (no por webhook)

SOLUCIÓN:
1. Copiar secret CORRECTO de MP Dashboard (2 min)
2. Actualizar en Vercel + redeploy (5 min)
3. Hacer compra de prueba (3 min)
Total: 10 minutos

RESULTADO:
✅ Webhooks aceptados
✅ Sistema robusto
✅ Sin errores 401 en logs
```

---

## 🚀 PRÓXIMOS PASOS (EN ORDEN)

```
AHORA MISMO:
1. Ve a MP Dashboard
2. Copia el secret correcto
3. Actualiza en Vercel
4. Redeploy
5. Compra de prueba
6. Verifica logs

DESPUÉS (si logs muestran ✅):
→ Sistema está 100% funcional
→ Puedes lanzar con confianza
→ Implementar mejoras (estados pending/rejected) en próximos días

DESPUÉS (si logs siguen mostrando ❌):
→ Screenshot del secret en MP (ocultar últimos caracteres)
→ Screenshot de Vercel environment variables
→ Volver a analizar
```

---

## 📞 PARA CURSOR (CONTEXTO COMPLETO)

```
SITUACIÓN:
- Sistema funciona (órdenes se crean, dinero llega)
- PERO webhooks son rechazados (firma inválida)
- Causa: Secret en Vercel ≠ Secret en Mercado Pago

SOLUCIÓN:
- Actualizar MERCADOPAGO_WEBHOOK_SECRET en Vercel
- Con el secret CORRECTO de MP Dashboard (sección Webhooks)
- Redeploy para aplicar cambios

VERIFICACIÓN:
- Hacer compra de prueba
- Logs deben mostrar "✅ Firma validada correctamente"
- NO "❌ Firma inválida"
```

---

**Creado**: 2025-12-26
**Última actualización**: Después de análisis de logs
**Estado**: PENDIENTE DE APLICAR SOLUCIÓN

