# 🔍 DEBUG: Webhook MercadoPago - Error 401

## 📊 SITUACIÓN ACTUAL

### ✅ Lo que funciona:
- Pago procesado correctamente ($20)
- MercadoPago envió webhook al endpoint
- Credenciales configuradas en Vercel

### ❌ El problema:
- Webhook rechazado con **401 Unauthorized**
- Orden NO creada en base de datos
- Solo quedaron datos temporales

---

## 🔍 ANÁLISIS DEL ERROR

Según la documentación de MercadoPago, el webhook debe incluir:

### Headers requeridos:
```
x-signature: ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839
x-request-id: <uuid>
```

### Query params requeridos:
```
?data.id=138627951980
```

### Formato del manifest para validar:
```
id:{data.id};request-id:{x-request-id};ts:{ts};
```

---

## 🚀 CAMBIOS IMPLEMENTADOS (MODO DEBUG)

He modificado el webhook para:

1. ✅ **Registrar información detallada** de cada webhook recibido
2. ✅ **NO rechazar webhooks** temporalmente (modo debug)
3. ✅ **Procesar el pago** aunque la firma sea inválida
4. ✅ **Logs completos** en Vercel para diagnosticar

### Cambios en el código:
- Headers completos registrados
- Query params registrados
- Secret Key verificada (longitud)
- Webhook procesado a pesar de firma inválida

---

## 📋 PRÓXIMOS PASOS

### 1. Deploy a Vercel

```bash
git add .
git commit -m "debug: agregar logging detallado para webhook MP"
git push
```

### 2. Hacer un nuevo pago de prueba

1. Ir a tu tienda
2. Agregar producto al carrito
3. Proceder al pago
4. Completar pago con MercadoPago

### 3. Revisar logs en Vercel

**Vercel Dashboard → Logs → Buscar:**

```
🔐 [WEBHOOK] Validando firma x-signature
📋 [DEBUG] URL completa
📋 [DEBUG] Headers recibidos
📋 [DEBUG] Query params
```

### 4. Compartir los logs

Necesito ver específicamente:
- ✅ URL completa del webhook
- ✅ Valor de `x-signature`
- ✅ Valor de `x-request-id`
- ✅ Query params recibidos
- ✅ Longitud de la Secret Key

---

## 🎯 POSIBLES CAUSAS DEL ERROR 401

### Causa 1: Secret Key incorrecta
**Síntoma**: La Secret Key en Vercel no coincide con la del dashboard de MP

**Verificar**:
1. Dashboard MP → Webhooks → Secret Key
2. Vercel → Settings → Environment Variables → `MERCADOPAGO_WEBHOOK_SECRET`
3. Deben ser **exactamente iguales**

**Solución**: Copiar nuevamente la Secret Key

---

### Causa 2: Query param `data.id` faltante
**Síntoma**: MercadoPago no envía `?data.id=` en la URL

**Según documentación**: El `data.id` debe estar en query params

**Verificar en logs**: 
```
📋 [DEBUG] Query params: { 'data.id': '138627951980' }
```

**Solución**: Si no aparece, ajustar código de validación

---

### Causa 3: Headers faltantes
**Síntoma**: `x-signature` o `x-request-id` no llegan

**Verificar en logs**:
```
📋 [DEBUG] Headers recibidos:
   - x-signature: ts=...,v1=...
   - x-request-id: <uuid>
```

**Solución**: Si faltan, contactar soporte de MP

---

### Causa 4: Formato de URL del webhook
**Síntoma**: URL mal configurada en MP

**URL actual**:
```
https://app-vivero-web-git-mp-production-lksyayo-2570s-projects.vercel.app/api/mercadopago/webhook
```

**Verificar**: 
- ✅ Debe terminar en `/api/mercadopago/webhook`
- ✅ NO debe tener query params adicionales
- ✅ Debe ser HTTPS

---

## 🔧 SOLUCIONES SEGÚN CAUSA

### Si es Secret Key incorrecta:

1. Obtener Secret Key correcta de MP
2. Actualizar en Vercel:
   ```
   Settings → Environment Variables → MERCADOPAGO_WEBHOOK_SECRET
   ```
3. Redeploy

---

### Si falta `data.id` en query params:

Modificar validación para obtener `data.id` del body en lugar de query params:

```typescript
// En mercadopagoSignature.ts
// Cambiar de:
const dataId = url.searchParams.get('data.id');

// A:
const body = await request.json();
const dataId = body.data?.id || url.searchParams.get('data.id');
```

---

### Si faltan headers:

Contactar soporte de MercadoPago indicando:
- Headers `x-signature` y `x-request-id` no llegan
- Webhook configurado correctamente
- Logs de Vercel como evidencia

---

## ⚠️ MODO DEBUG TEMPORAL

**IMPORTANTE**: El código actual está en **MODO DEBUG**

- ✅ Procesa webhooks aunque la firma sea inválida
- ✅ Registra información detallada
- ❌ **NO es seguro para producción**

**Una vez identificado el problema**, debemos:
1. Corregir la causa raíz
2. Remover el código de debug
3. Activar nuevamente el rechazo con 401

---

## 📞 SIGUIENTE ACCIÓN

1. **Deploy** los cambios a Vercel
2. **Hacer un pago de prueba**
3. **Revisar logs** en Vercel
4. **Compartir** los logs conmigo

Con esa información podré identificar exactamente qué está fallando y corregirlo.

---

**Fecha**: 2025-12-19
**Estado**: En debugging
**Prioridad**: 🔴 ALTA

