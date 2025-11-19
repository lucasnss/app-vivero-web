# 📊 Guía Visual: Cuándo Usar Cada Script

## 🎯 Diagrama de Decisión

```
┌─ ¿QUÉ NECESITAS PROBAR?
│
├─→ "Carrito de compra (sin pagar)"
│   └─→ test-cart-checkout-integration.js
│       ✅ Agrega producto al carrito
│       ✅ Valida cantidad/precio
│       ✅ Simula checkout
│
├─→ "Todo el flujo de Mercado Pago"
│   ├─→ "Automatizado (CI/CD)"
│   │   └─→ test-mercadopago-flow.js
│   │       ✅ Crea orden
│   │       ✅ Crea preferencia MP
│   │       ✅ Simula webhook
│   │       ⏱️ ~1 minuto
│   │
│   └─→ "Interactivo (Testing Manual)"
│       └─→ test-mercadopago-sandbox.js
│           ✅ Menú con 7 opciones
│           ✅ Paga con tarjeta de prueba
│           ✅ Verifica cada paso
│           ⏱️ ~5 minutos
│
├─→ "Webhook recibe notificaciones"
│   └─→ test-webhook-manually.js
│       ✅ Simula webhook de MP
│       ✅ Verifica que llegó a BD
│       ✅ Checks de idempotencia
│
├─→ "Login de usuarios"
│   └─→ test-login.js
│       ✅ Admin login
│       ✅ Super Admin login
│       ✅ Roles y permisos
│
└─→ "Crear/Editar/Borrar Productos"
    └─→ test-product-with-auth.js
        ✅ CRUD con autenticación
        ✅ Manejo de imágenes
        ✅ Validaciones
```

---

## 🎬 Escenarios de Testing

### Escenario 1: "Quiero probar rápido que todo funciona" ⚡
```
⏱️ TIEMPO: 5 minutos
💰 DINERO: No se gasta
💻 COMPLEJIDAD: Baja

PASOS:
1. npm run dev
2. node test-login.js
3. node test-product-with-auth.js
4. node test-cart-checkout-integration.js

RESULTADO:
✅ Auth funciona
✅ Productos CRUD funciona
✅ Carrito funciona
```

---

### Escenario 2: "Voy a usar Mercado Pago hoy" 💳
```
⏱️ TIEMPO: 10 minutos
💰 DINERO: No (sandbox)
💻 COMPLEJIDAD: Media

PASOS:
1. npm run dev
2. ngrok http 3000
3. Actualizar Dashboard MP con URL ngrok
4. node scripts/test-mercadopago-flow.js

RESULTADO:
✅ MP integración funciona
✅ Webhook llega correctamente
✅ Orden se crea desde webhook
```

---

### Escenario 3: "Necesito hacer testing real paso a paso" 🎮
```
⏱️ TIEMPO: 15 minutos
💰 DINERO: No (sandbox)
💻 COMPLEJIDAD: Alta (pero interactiva)

PASOS:
1. npm run dev
2. ngrok http 3000
3. Actualizar Dashboard MP
4. node scripts/test-mercadopago-sandbox.js
5. Seleccionar opción 7: "Ejecutar flujo completo"
6. Pagar con tarjeta de prueba en MP
7. Verificar en /admin/sales-history

RESULTADO:
✅ Todo funciona end-to-end
✅ Puedes ver cada paso
✅ Debugging más fácil
```

---

### Escenario 4: "El webhook no recibe datos" 🔔
```
⏱️ TIEMPO: 5 minutos
💰 DINERO: No
💻 COMPLEJIDAD: Baja

PASOS:
1. npm run dev
2. Hacer un checkout real en http://localhost:3000/carrito
3. node scripts/test-webhook-manually.js

RESULTADO:
✅ Verificas que webhook recibe
✅ O identificas qué falta
```

---

### Escenario 5: "SOLO CARRITO, sin Mercado Pago" 🛒
```
⏱️ TIEMPO: 1 minuto
💰 DINERO: No
💻 COMPLEJIDAD: Muy baja

PASOS:
1. npm run dev
2. node test-cart-checkout-integration.js

RESULTADO:
✅ Carrito funciona
✅ Rápido y simple
```

---

## 🗺️ Mapa Completo de Scripts

```
                    ┌─────────────────┐
                    │   npm run dev   │ ← SIEMPRE PRIMERO
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ ¿Qué probar?    │
                    └────────┬────────┘
                      ┌──────┼──────┬──────────┬─────────┐
                      ▼      ▼      ▼          ▼         ▼
                    AUTH   CRUD   CARRITO    MP       WEBHOOK
                      │      │      │         │         │
    ┌─────────────────┘      │      │         │         │
    │                        │      │         │         │
    ▼                        ▼      ▼         ▼         ▼
test-login.js    test-product   test-cart   test-mp   test-webhook
                 -with-auth     -checkout   -flow     -manually
                                           /
                                    test-mp-sandbox
                                  (interactivo menú)
```

---

## ⏱️ Comparativa de Tiempos

| Script | Correr | Resultado | Dinero |
|--------|--------|-----------|--------|
| test-login | 10s | Login ok ✅ | No |
| test-product-with-auth | 20s | CRUD ok ✅ | No |
| test-cart-checkout-integration | 30s | Carrito ok ✅ | No |
| test-mercadopago-flow | 60s | MP ok ✅ | No |
| test-webhook-manually | 15s | Webhook ok ✅ | No |
| test-mercadopago-sandbox | 300s | Completo ✅ | No |

**TOTAL SIN INTERACTIVO:** ~135 segundos (2.5 minutos)
**TOTAL CON INTERACTIVO:** ~435 segundos (7.5 minutos)

---

## 🎯 Cuál Script Usar: Decisión Rápida

```
¿Cambié el código de CARRITO?
├─ SÍ → Corre: test-cart-checkout-integration.js
└─ NO ✓

¿Cambié el código de AUTENTICACIÓN?
├─ SÍ → Corre: test-login.js
└─ NO ✓

¿Cambié el código de PRODUCTOS?
├─ SÍ → Corre: test-product-with-auth.js
└─ NO ✓

¿Cambié algo de MERCADO PAGO?
├─ SÍ → Corre: test-mercadopago-flow.js
└─ NO ✓

¿Cambié el WEBHOOK?
├─ SÍ → Corre: test-webhook-manually.js
└─ NO ✓

¿Quieres hacer TESTING COMPLETO?
├─ SÍ → Corre TODOS los anteriores
└─ NO ✓

¿Necesitas DEBUGGEAR PASO A PASO?
├─ SÍ → Corre: test-mercadopago-sandbox.js (menú interactivo)
└─ NO ✓
```

---

## 📋 Checklist: QA Testing Antes de Deploy

```
□ npm run dev esté corriendo
□ .env configurado correctamente
□ ngrok activo (si usas webhooks)
□ URL de ngrok en Dashboard de MP

TESTS:
□ node test-login.js                              (AUTH ✅)
□ node test-product-with-auth.js                 (CRUD ✅)
□ node test-cart-checkout-integration.js         (CARRITO ✅)
□ node scripts/test-mercadopago-flow.js          (MP ✅)
□ node scripts/test-webhook-manually.js          (WEBHOOK ✅)

VERIFICACIÓN MANUAL:
□ Abre http://localhost:3000 (app funciona)
□ Abre http://localhost:3000/admin (admin ok)
□ Abre http://localhost:4040 (ngrok webhooks)

RESULTADO:
□ Todos los tests pasan ✅
□ Cero errores en consola
□ Lista para deploy ✨
```

---

## 🚀 Orden Recomendado para Primera Vez

```
1️⃣ BÁSICOS (5 minutos)
   npm run dev
   node test-login.js
   node test-product-with-auth.js

2️⃣ CARRITO (2 minutos)
   node test-cart-checkout-integration.js

3️⃣ MERCADO PAGO SIMPLE (2 minutos)
   node scripts/test-mercadopago-flow.js

4️⃣ WEBHOOK (1 minuto)
   node scripts/test-webhook-manually.js

5️⃣ MERCADO PAGO INTERACTIVO (5 minutos, opcional)
   node scripts/test-mercadopago-sandbox.js
   Selecciona opción 7

TOTAL: ~15 minutos para validar TODO
```

---

## 💡 Pro Tips

### Tip 1: Correr en Background
```bash
npm run dev > server.log 2>&1 &
# El servidor corre en background
# Ver logs: tail -f server.log
```

### Tip 2: Correr Múltiples Scripts Seguidos
```bash
node test-login.js && \
node test-product-with-auth.js && \
node test-cart-checkout-integration.js && \
echo "✅ Todos los tests pasaron!"
```

### Tip 3: Monitorear ngrok en Paralelo
```bash
# Terminal 1: npm run dev
# Terminal 2: ngrok http 3000
# Terminal 3: Abre http://localhost:4040 en navegador
# Terminal 4: node scripts/...
```

### Tip 4: Ver Logs de Servidor Mientras Corres Test
```bash
# En la misma terminal de "npm run dev" verás:
🔔 Webhook recibido de Mercado Pago: { id: '...' }
🔄 Procesando pago: 999...
✅ Webhook procesado exitosamente
```

---

## 🎯 Resumen Visual

```
┌────────────────────────────────────────────────────┐
│         FLUJO DE TESTING RECOMENDADO              │
├────────────────────────────────────────────────────┤
│                                                    │
│  1. npm run dev ────────────────┐                 │
│                                 │                 │
│  2. test-login ────────────────┬┴─ Verifica OK   │
│     test-product-with-auth     │                 │
│     test-cart-checkout          │                 │
│                                 │                 │
│  3. test-mercadopago-flow ─────┴──ó─ Todo OK    │
│                                  ╱   ? Error     │
│  4. test-webhook-manually ──────╱   Debuggear   │
│                                  ╲   test-mp-   │
│  5. (opt) test-mp-sandbox ───────╲─ sandbox    │
│                                                   │
└────────────────────────────────────────────────────┘
```

---

## ✨ Final: Usa Esta Guía Cuando...

```
┌──────────────────────────────────────────────┐
│ Guardé la guía porque necesito:             │
├──────────────────────────────────────────────┤
│ ✅ Saber qué script probar qué cosa         │
│ ✅ Encontrar cuál script usar rápidamente   │
│ ✅ Entender el flujo de testing              │
│ ✅ Saber el tiempo que tarda cada test      │
│ ✅ No quiero leer documentación larga        │
│ ✅ Solo quiero ver la guía visual            │
└──────────────────────────────────────────────┘
```



