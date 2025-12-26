# 🔐 GUÍA: Configurar MERCADOPAGO_WEBHOOK_SECRET

## ⚠️ CRÍTICO PARA PRODUCCIÓN

Este documento es **obligatorio** para hacer deploy. Sin este secret, los webhooks son **vulnerables a suplantación de identidad**.

---

## 🎯 ¿Por qué es necesario?

Tu sistema ahora **rechaza** webhooks sin firma válida (línea 116-122 de `webhook/route.ts`).

Para validar la firma, necesitas el **secret key que te proporciona Mercado Pago**.

---

## 📋 PASO 1: Obtener el Secret en Mercado Pago

### 1a. Ir al Dashboard de Mercado Pago
```
https://www.mercadopago.com.ar/developers/panel
```

### 1b. Ir a Configuración de Webhooks
```
Dashboard → Webhooks → Configuración
```

### 1c. Encontrar el Secret Key
Busca una sección llamada:
- **"Webhook Secret"** o
- **"X-Signature secret"** o
- **"Signature validation key"**

Debería verse así:
```
🔐 Secret Key (para validar firmas X-Signature):
xxxxxxxxxxxxxxxxxxxxxxxxxx (copiar este valor)
```

### 1d. Copiar el valor
```bash
# Ejemplo (NO uses este, es fake):
MERCADOPAGO_WEBHOOK_SECRET=sk_test_abc123def456ghi789jkl...
```

---

## 📋 PASO 2: Agregar a `.env.local` (Desarrollo)

Si quieres probar en local con ngrok:

```bash
# En app-vivero-web/.env.local
MERCADOPAGO_WEBHOOK_SECRET=sk_test_abc123def456ghi789jkl...
```

Luego reinicia:
```bash
npm run dev
```

---

## 📋 PASO 3: Configurar en Vercel (PRODUCCIÓN)

Este es el paso **MÁS IMPORTANTE**:

### 3a. Ir a Vercel Dashboard
```
https://vercel.com → Tu Proyecto → Settings → Environment Variables
```

### 3b. Agregar variable
```
Variable Name:  MERCADOPAGO_WEBHOOK_SECRET
Value:          sk_prod_abc123def456ghi789jkl...
Environments:   Production (checkear SOLO production)
```

### 3c. Deploy
```bash
git add .
git commit -m "chore: configure webhook secret for production"
git push
```

Vercel redeploy automático → las variables se aplican.

---

## ✅ VERIFICACIÓN

### ✅ En desarrollo (local):

1. Abre tu ngrok:
```bash
ngrok http 3000
```

2. Configura el webhook en MP:
```
URL: https://tu-ngrok-url.ngrok.io/api/mercadopago/webhook
```

3. Prueba enviando un webhook manual:
```bash
curl -X POST https://tu-ngrok-url.ngrok.io/api/mercadopago/webhook \
  -H "x-signature: ts=1742505638683,v1=ced36ab6d33566bb1e16c125819b8d840d6b8ef136b0b9127c76064466f5229b" \
  -H "x-request-id: test-request-123" \
  -H "Content-Type: application/json" \
  -d '{"data":{"id":"12345"},"type":"payment"}'
```

**Resultado esperado:**
```
❌ 401 Invalid signature
(porque el hash es fake)
```

✅ **Esto es lo que queremos** - rechaza firmas inválidas.

### ✅ En producción (Vercel):

1. Después de hacer deploy, busca en **Vercel Logs**:
```
Vercel → Tu Proyecto → Logs
```

2. Haz un pago real con Mercado Pago

3. Deberías ver:
```
✅ [WEBHOOK] Firma validada correctamente
📝 Actualizando orden con información de pago...
```

---

## 🚨 SI NO FUNCIONA

### Problema: "MERCADOPAGO_WEBHOOK_SECRET no configurado"

**Solución:**
1. Verificá que esté en Vercel Environment Variables
2. Espera 2 minutos (Vercel tarda en actualizar)
3. Haz redeploy manual:
   ```bash
   git push
   ```

### Problema: "Firma inválida en cada webhook"

**Solución:**
1. Verifica que el secret sea **EXACTO** (copiar sin espacios)
2. Verifica que esté en el **mismo ambiente** (prod/test)
3. Comprueba que MP esté enviando a **la URL correcta**

---

## 📝 CHECKLIST ANTES DE LANZAR

- [ ] Secret copiado desde MP Dashboard
- [ ] Agregado a `.env.local` para testing
- [ ] Agregado a Vercel Environment Variables
- [ ] Deploy completado
- [ ] Pago real realizado y verificado
- [ ] Logs muestran "Firma validada correctamente"
- [ ] Stock descontado en BD
- [ ] Email enviado al cliente

---

## 🔒 Seguridad

**NUNCA**:
- ❌ Hagas commit del `.env.local` con el secret
- ❌ Compartas el secret en Slack/email
- ❌ Uses el mismo secret en test y producción

**SIEMPRE**:
- ✅ Usa `.env.local` en gitignore
- ✅ Regenera secrets periódicamente
- ✅ Usa credenciales separadas por ambiente

---

## 📞 Soporte

Si tienes dudas:
1. Revisar logs en Vercel
2. Contactar a Mercado Pago support
3. Revisar documentación oficial: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks

