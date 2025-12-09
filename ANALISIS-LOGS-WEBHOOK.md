# 🔍 Análisis de Logs: ¿Qué está pasando?

## Tu Situación en los Logs (líneas 913-1014)

```
🔧 Mercado Pago configurado (DESARROLLO):
   - Base URL: https://ecd138690ea2.ngrok-free.app
```

⚠️ **PRIMER PROBLEMA:** Dice `(DESARROLLO)`, debería decir `(PRODUCCIÓN)`

---

## 📊 Problema 1: Webhooks Duplicados (Llegan 4 veces)

### ¿Qué está pasando?

El webhook llega **4 veces** (líneas 921, 938, 984, 999):

```
🔍 Query params recibidos: { id: '36280438604', topic: 'merchant_order' }
ℹ️ Webhook ignorado, no es de tipo payment: merchant_order
POST /api/mercadopago/webhook?id=36280438604&topic=merchant_order 400
```

### ¿Por qué llega 4 veces?

**Razón 1: Respuesta incorrecta del endpoint**
- Tu endpoint responde con **400** (error)
- Mercado Pago intenta reintentar automáticamente
- Por eso llega múltiples veces

**Razón 2: El webhook está registrado múltiples veces en MP**
- Posible: Registraste el webhook 2+ veces en Mercado Pago
- Verifica en MP → Webhooks → Configuración

---

## 📊 Problema 2: Llega como 'merchant_order' en lugar de 'payment'

### ¿Qué está pasando?

```
ℹ️ Webhook ignorado, no es de tipo payment: merchant_order
```

El webhook llega con `topic: 'merchant_order'` pero tu código solo acepta `type: 'payment'`.

### ¿Por qué?

Mercado Pago envía dos tipos de notificaciones:

| Tipo | Cuándo | Qué contiene |
|------|--------|-------------|
| `payment` | Se procesa un pago | Detalles del pago |
| `merchant_order` | Se completa una orden | Detalles de la orden |

Tu código solo escucha `payment`:

```javascript
if (notification.type !== 'payment') {
  console.log(`Webhook ignorado, tipo: ${notification.type}`)
  return null
}
```

**Eso está bien**, pero Mercado Pago está enviando `merchant_order` en lugar de `payment`.

---

## 🚨 Problema 3: "Tipo de tarjeta no se aceptan"

Esta es la clave del problema.

### ¿Por qué rechaza tarjetas de prueba?

```
❌ Tarjeta 5031 7557 3453 0604 → RECHAZADA
❌ "Ese tipo de tarjeta no se aceptan"
```

**Causa probable: Estás usando CREDENCIALES DE PRUEBA en una app de PRODUCCIÓN**

Cuando haces eso:
1. MP envía `merchant_order` en lugar de `payment`
2. Las tarjetas de test son rechazadas
3. Los webhooks no funcionan correctamente

---

## 🔴 LA CAUSA RAÍZ

Mira esta línea:

```
🔧 Mercado Pago configurado (DESARROLLO):
   - Base URL: https://ecd138690ea2.ngrok-free.app
```

Esto viene de [`src/lib/mercadopagoConfig.ts`](src/lib/mercadopagoConfig.ts) línea 101-105:

```typescript
if (mercadoPagoConfig.development.enableLogging) {
  console.log('🔧 Mercado Pago configurado (DESARROLLO):')
  // ...
}
```

Esto se activa cuando `NODE_ENV === 'development'`.

### ¿Cuál es el problema?

**En Vercel, NO configuraste `NODE_ENV=production`**

- Debería ser: `NODE_ENV=production` ✅
- Está siendo: `development` ❌

Cuando está en `development` y tienes credenciales de PRUEBA (TEST-):
- MP activa modo SANDBOX
- Las tarjetas de test son rechazadas
- Envía merchant_order en lugar de payment

---

## ✅ SOLUCIÓN

### Paso 1: Verificar Variables en Vercel

Ve a: **Vercel Dashboard → Settings → Environment Variables**

Busca:

- [ ] `NODE_ENV` = `production` ← ¿ESTÁ?
- [ ] `MP_ACCESS_TOKEN` = `APP_USR-...` ← ¿Empieza con `APP_USR-`?
- [ ] `NEXT_PUBLIC_MP_PUBLIC_KEY` = `APP_USR-...` ← ¿Empieza con `APP_USR-`?

### Paso 2: Si faltan variables

**Agrega (o corrige si está mal):**

```
NODE_ENV = production
MP_ACCESS_TOKEN = APP_USR-350052043144903-080510-d8a608c86017f184f5822bbc8236f975-2608760446
NEXT_PUBLIC_MP_PUBLIC_KEY = APP_USR-0d60011a-20e6-431c-8c23-dddb8ebe4e19
NEXT_PUBLIC_BASE_URL = https://app-vivero-web-git-mp-production-lksyayo-2570s-projects.vercel.app
```

### Paso 3: Re-deploy

```bash
vercel --prod
```

### Paso 4: Después del deploy, prueba nuevamente

El webhook debería:
1. Llegar UNA SOLA VEZ (no 4)
2. Llegar como `type: 'payment'` (no `merchant_order`)
3. Aceptar tarjetas de test

---

## 🔧 Checklist para Verificar

En Vercel Dashboard, verifica ESTAS variables:

```
✅ NODE_ENV = production
✅ MP_ACCESS_TOKEN = APP_USR-... (no TEST-)
✅ NEXT_PUBLIC_MP_PUBLIC_KEY = APP_USR-... (no TEST-)
✅ NEXT_PUBLIC_BASE_URL = tu URL de Vercel
✅ NEXT_PUBLIC_SUPABASE_URL = ...
✅ SUPABASE_SERVICE_ROLE_KEY = ...
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = ...
✅ EMAIL_USER = ...
✅ EMAIL_PASSWORD = ...
✅ JWT_SECRET = (valor único, no el de desarrollo)

❌ NEXT_PUBLIC_APP_URL (eliminar)
❌ NGROK_AUTHTOKEN (eliminar)
```

---

## 📝 ¿Qué cambió en Vercel desde la última vez?

Posible que:
1. No agregaste `NODE_ENV = production`
2. No re-hiciste deploy después de agregar variables
3. Las credenciales son de TEST, no de PRODUCCIÓN

**Solución rápida:**
```bash
vercel --prod
```

Esto re-deploya con las variables actuales.

---

## 🧪 Después de arreglarlo, verás:

```
✅ 🔧 Mercado Pago configurado (PRODUCCIÓN):
✅ Webhook llega UNA SOLA VEZ
✅ ✅ Pago aprobado, marcando orden como pagada
✅ Tarjetas de test se aceptan
```

---

## 🆘 Si Aún No Funciona

Comparte:
1. `vercel env ls` (para ver qué variables tienes en Vercel)
2. El output completo de un nuevo intento de pago
3. Logs de Vercel: Dashboard → Functions → Logs

Pero primero verifica:
- [ ] `NODE_ENV=production` en Vercel
- [ ] Credenciales son `APP_USR-`, no `TEST-`
- [ ] Hiciste `vercel --prod` después de cambiar variables



