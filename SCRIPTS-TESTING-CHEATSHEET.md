# ⚡ Scripts Testing Cheatsheet - ViveroWeb

## 🎯 Lo Esencial (5 segundos)

```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Elige UNO de estos:

# Para probar CARRITO sin pagar
node Fronted/test-cart-checkout-integration.js

# Para probar MERCADO PAGO automático
node Fronted/scripts/test-mercadopago-flow.js

# Para probar WEBHOOK recibiendo datos
node Fronted/scripts/test-webhook-manually.js

# Para probar LOGIN
node Fronted/test-login.js

# Para probar CRUD de PRODUCTOS
node Fronted/test-product-with-auth.js

# Para probar TODO paso a paso (INTERACTIVO)
node Fronted/scripts/test-mercadopago-sandbox.js
```

---

## 📊 Matriz Rápida

| Script | Línea | Prueba | Tiempo |
|--------|-------|--------|--------|
| test-cart-checkout-integration | `🛒` | Carrito E2E | ~30s |
| test-mercadopago-flow | `💳` | MP automático | ~1m |
| test-mercadopago-sandbox | `🎮` | MP interactivo | ~5m |
| test-webhook-manually | `🔔` | Webhook | ~15s |
| test-login | `🔐` | Autenticación | ~10s |
| test-product-with-auth | `📦` | CRUD | ~20s |

---

## ✅ Checklist: Qué Usar Para...

```
□ Probar flujo de carrito simple
  → node Fronted/test-cart-checkout-integration.js

□ Verificar que Mercado Pago funciona (automático)
  → node Fronted/scripts/test-mercadopago-flow.js

□ Pagar con tarjeta de prueba real (interactivo)
  → node Fronted/scripts/test-mercadopago-sandbox.js
  → Opción 7: Ejecutar flujo completo

□ Verificar que webhook recibe datos
  → node Fronted/scripts/test-webhook-manually.js

□ Probar login admin/super_admin
  → node Fronted/test-login.js

□ Probar crear/editar/borrar productos
  → node Fronted/test-product-with-auth.js
```

---

## 🔧 Setup Antes de Correr

```bash
# 1. Asegurate de que npm run dev esté corriendo
npm run dev

# 2. Verifica que .env tiene las variables
cat .env | grep SUPABASE
cat .env | grep MERCADO_PAGO

# 3. (Opcional) Inicia ngrok si necesitas webhooks
ngrok http 3000

# 4. Actualiza URL en Dashboard de Mercado Pago (si usas ngrok)
# https://[tu-ngrok-id].ngrok.io/api/mercadopago/webhook
```

---

## 🚀 Quick Flows

### Flow 1: Probar Carrito SIN Mercado Pago (1 minuto)
```bash
Terminal 1: npm run dev
Terminal 2: node Fronted/test-cart-checkout-integration.js
```
**Resultado:** ✅ Carrito funciona correctamente

---

### Flow 2: Probar Mercado Pago AUTOMATIZADO (2 minutos)
```bash
Terminal 1: npm run dev
Terminal 2: node Fronted/scripts/test-mercadopago-flow.js
```
**Resultado:** ✅ Todo el flujo MP está ok

---

### Flow 3: Pagar REALMENTE en Sandbox (5 minutos)
```bash
Terminal 1: npm run dev
Terminal 2: node Fronted/scripts/test-mercadopago-sandbox.js

Menú:
1. Crear orden
2. Crear preferencia
3. Pagar (se abre URL de MP)
   → Usa tarjeta: 4509 9535 6623 3704
   → CVV: 123, Fecha: 12/25, DNI: 12345678
7. Ejecutar flujo completo (verificar todo)
```
**Resultado:** ✅ Pago completado y verificado

---

### Flow 4: Verificar Webhook Recibe Datos (1 minuto)
```bash
Requisito: Haber hecho un checkout real primero

Terminal 1: npm run dev
Terminal 2: node Fronted/scripts/test-webhook-manually.js
```
**Resultado:** ✅ Webhook procesó notificación

---

## 🎯 Tarjetas de Prueba Mercado Pago

```
APROBADA:
  4509 9535 6623 3704
  
RECHAZADA:
  4000 0000 0000 0002
  
PENDIENTE:
  4000 0000 0000 0101
  
Para TODAS:
  CVV: 123
  Fecha: 12/25
  DNI: 12345678
```

---

## 📊 Monitoreo en Paralelo

Abre en navegadores diferentes:

```
1. http://localhost:3000           → App
2. http://localhost:3000/admin     → Admin panel
3. http://localhost:4040           → ngrok dashboard
4. Consola de npm run dev          → Logs del servidor
```

---

## 🐛 Si Algo Falla

```
Script dice: "Servidor no responde"
→ npm run dev en otra terminal

Script dice: "Login falló"
→ Verificar admin@vivero.com existe en BD

Script dice: "No hay productos"
→ Crear al menos 1 producto desde admin

Webhook no funciona:
→ Verificar ngrok activo
→ Verificar URL en Dashboard de MP
→ Ver logs en "npm run dev"

Mercado Pago no carga:
→ Verificar API Key en .env
→ Verificar ngrok URL en Dashboard
```

---

## 💡 Tips Profesionales

1. **Correr tests en CI/CD:**
   ```bash
   npm run dev &
   sleep 5
   node Fronted/scripts/test-mercadopago-flow.js
   ```

2. **Monitorear logs en tiempo real:**
   ```bash
   Terminal 1: npm run dev | grep -E "Webhook|mercadopago|webhook"
   ```

3. **Debuggear webhooks:**
   - Abre http://localhost:4040 (ngrok dashboard)
   - Busca POST a /api/mercadopago/webhook
   - Ver request/response

4. **Probar manualmente:**
   - Abre http://localhost:3000/carrito
   - Agrega un producto
   - Completa checkout real
   - Verifica compra en /admin/sales-history

---

## 📋 Scripts en package.json

```bash
npm run test:webhook    # test-webhook-manually.js
npm run debug:webhook   # debug-webhook-flow.js
npm run check:webhook   # check-webhook-processing.js
```

---

## ✨ TL;DR

```
CARRITO:     node test-cart-checkout-integration.js
MP AUTO:     node scripts/test-mercadopago-flow.js
MP MANUAL:   node scripts/test-mercadopago-sandbox.js
WEBHOOK:     node scripts/test-webhook-manually.js
LOGIN:       node test-login.js
PRODUCTOS:   node test-product-with-auth.js
```

**Siempre primero:** `npm run dev` en otra terminal



