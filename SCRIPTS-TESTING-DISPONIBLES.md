# 📋 Scripts de Testing Disponibles - ViveroWeb

## 🎯 Resumen Rápido

Tabla de scripts para probar carrito de compra y flujo de compra:

| Script | Comando | Qué prueba | Requisitos |
|--------|---------|-----------|-----------|
| **test-cart-checkout-integration.js** | `node Fronted/test-cart-checkout-integration.js` | ✅ Flujo E2E: Carrito → Checkout completo | npm run dev |
| **test-mercadopago-flow.js** | `node Fronted/scripts/test-mercadopago-flow.js` | ✅ Flujo completo de Mercado Pago | npm run dev + ADMIN_EMAIL, ADMIN_PASSWORD |
| **test-mercadopago-sandbox.js** | `node Fronted/scripts/test-mercadopago-sandbox.js` | ✅ Testing interactivo en MP Sandbox | npm run dev + credenciales admin |
| **test-webhook-manually.js** | `node Fronted/scripts/test-webhook-manually.js` | ✅ Simular webhook de MP | npm run dev |
| **test-login.js** | `node Fronted/test-login.js` | ✅ Probar login de admin/super_admin | npm run dev |
| **test-product-with-auth.js** | `node Fronted/test-product-with-auth.js` | ✅ CRUD de productos con autenticación | npm run dev |

---

## 📊 Scripts Detallados por Función

### 1️⃣ **test-cart-checkout-integration.js** (PARA CARRITO)
```bash
node Fronted/test-cart-checkout-integration.js
```

**✨ Qué prueba:**
- ✅ Obtener categorías
- ✅ Crear producto de prueba
- ✅ Agregar producto al carrito
- ✅ Validar datos del carrito
- ✅ Navegar al carrito (simulado)
- ✅ Revisar carrito
- ✅ Simular formulario de checkout
- ✅ Preparar orden
- ✅ Crear orden (sin pago)
- ✅ Validar flujo completo

**⚙️ Requisitos:**
- Servidor corriendo: `npm run dev`
- Base de datos conectada

**💡 Útil para:**
- Probar el flujo de agregar/validar carrito sin Mercado Pago
- Verificar que el checkout funciona
- Testing sin pago real

**🎯 Resultado:**
```
📊 Total de tests: 10
✅ Tests exitosos: 10
❌ Tests fallidos: 0
🎉 ¡Todos los tests pasaron!
```

---

### 2️⃣ **test-mercadopago-flow.js** (FLUJO AUTOMÁTICO)
```bash
node Fronted/scripts/test-mercadopago-flow.js
```

**✨ Qué prueba:**
- ✅ Inicializar y conectar servidor
- ✅ Login como admin
- ✅ Crear orden de prueba
- ✅ Crear preferencia de pago MP
- ✅ Simular webhook de pago
- ✅ Verificar actualización de orden
- ✅ Probar edge cases (webhooks inválidos, etc)

**⚙️ Requisitos:**
- Servidor corriendo: `npm run dev`
- Variables de entorno (en `.env` o como parámetros):
  - `ADMIN_EMAIL=admin@vivero.com`
  - `ADMIN_PASSWORD=admin123`
  - `NEXT_PUBLIC_BASE_URL=http://localhost:3000`

**💡 Útil para:**
- Automatizar test completo de MP (ideal para CI/CD)
- Verificar que el webhook se procesa correctamente
- Probar manejo de errores

**🎯 Resultado:**
```
🎉 TODOS LOS TESTS PASARON EXITOSAMENTE!
FASE 1 COMPLETADA AL 100%
```

---

### 3️⃣ **test-mercadopago-sandbox.js** (INTERACTIVO)
```bash
node Fronted/scripts/test-mercadopago-sandbox.js
```

**✨ Qué prueba (menú interactivo):**
1. Crear orden de prueba
2. Crear preferencia de pago
3. Esperar completación de pago
4. Verificar estado del pago
5. Verificar actualización de orden
6. Test endpoint webhook
7. Ejecutar flujo completo
8. Salir

**⚙️ Requisitos:**
- Servidor corriendo: `npm run dev`
- Credenciales admin válidas
- Para pagar realmente: tarjetas de prueba de MP Sandbox
  - ✅ Aprobada: `4509 9535 6623 3704`
  - ❌ Rechazada: `4000 0000 0000 0002`
  - ⏳ Pendiente: `4000 0000 0000 0101`
  - CVV: `123`, Fecha: `12/25`, DNI: `12345678`

**💡 Útil para:**
- Testing manual y paso a paso
- Debuggear problemas específicos
- Probar con pagos reales de sandbox
- Interactuar con MP realmente

**🎯 Workflow:**
```
1. Script crea orden
2. Script crea preferencia de pago
3. ¡PAUSA! → Script te abre URL para pagar
4. Paga en MP Sandbox con tarjeta de prueba
5. Regresa y presiona Enter
6. Script verifica estado del pago
7. Script verifica webhook
```

---

### 4️⃣ **test-webhook-manually.js** (SIMULAR WEBHOOK)
```bash
node Fronted/scripts/test-webhook-manually.js
```

**✨ Qué prueba:**
- ✅ Verifica que servidor esté corriendo
- ✅ Cuenta órdenes antes
- ✅ Envía webhook simulado a `/api/mercadopago/webhook`
- ✅ Cuenta órdenes después
- ✅ Verifica si se creó nueva orden
- ✅ Detecta problemas con datos temporales

**⚙️ Requisitos:**
- Servidor corriendo: `npm run dev`
- (Opcional) Haber hecho un checkout previo con datos temporales

**💡 Útil para:**
- Verificar que el endpoint webhook funciona
- Debuggear problemas de webhook
- Validar que lleguen datos a la BD

**🎯 Resultado:**
```
Si orden se creó: ✅ Webhook funciona perfectamente
Si orden NO se creó: ⚠️ Faltan datos temporales (hacer checkout real)
```

---

### 5️⃣ **test-login.js** (PROBAR LOGIN)
```bash
node Fronted/test-login.js
```

**✨ Qué prueba:**
- ✅ Login con usuario admin
- ✅ Login con super_admin
- ✅ Obtener rol correcto
- ✅ Obtener email correcto
- ✅ Obtener nombre correcto

**⚙️ Requisitos:**
- Servidor corriendo: `npm run dev`
- Usuarios en BD:
  - `admin@vivero.com` / `admin123`
  - `superadmin@vivero.com` / `super123`

**💡 Útil para:**
- Verificar que el sistema de autenticación funciona
- Validar que los roles se asignan correctamente

**🎯 Resultado:**
```
✅ LOGIN EXITOSO!
👤 Usuario: Admin Name
🔑 Rol: admin
📧 Email: admin@vivero.com
```

---

### 6️⃣ **test-product-with-auth.js** (CRUD DE PRODUCTOS)
```bash
node Fronted/test-product-with-auth.js
```

**✨ Qué prueba:**
- ✅ Login admin
- ✅ Obtener categorías
- ✅ Crear producto SIN imagen
- ✅ Crear producto CON imagen
- ✅ Actualizar producto
- ✅ Obtener todos los productos
- ✅ Eliminar productos de prueba

**⚙️ Requisitos:**
- Servidor corriendo: `npm run dev`
- Credenciales admin válidas

**💡 Útil para:**
- Verificar CRUD de productos funciona
- Probar autenticación con tokens
- Validar creación y eliminación de productos

**🎯 Resultado:**
```
✅ Login de admin
✅ Obtener categorías
✅ Crear producto sin imagen
✅ Crear producto con imagen
✅ Actualizar producto
✅ Obtener todos los productos
✅ Eliminar primer producto
✅ Eliminar segundo producto
=== TESTS CON AUTENTICACIÓN COMPLETADOS ===
```

---

## 🚀 Cómo Ejecutar los Scripts

### Opción 1: Directamente con Node
```bash
cd Fronted
node test-cart-checkout-integration.js
node scripts/test-mercadopago-flow.js
node scripts/test-mercadopago-sandbox.js
```

### Opción 2: Con npm scripts (en package.json)
```bash
npm run test:webhook       # test-webhook-manually.js
npm run debug:webhook      # debug-webhook-flow.js
npm run check:webhook      # check-webhook-processing.js
```

---

## 📋 Orden Recomendado de Testing

### Para Testing Básico de Carrito (SIN DINERO)
```bash
1. npm run dev                                    # Terminal 1
2. node Fronted/test-login.js                   # Terminal 2 - Verificar auth
3. node Fronted/test-product-with-auth.js       # Terminal 2 - Verificar productos
4. node Fronted/test-cart-checkout-integration.js # Terminal 2 - Flujo E2E
```

### Para Testing Completo de Mercado Pago (AUTOMÁTICO)
```bash
1. npm run dev                                       # Terminal 1
2. node Fronted/scripts/test-mercadopago-flow.js   # Terminal 2
```

### Para Testing Interactivo con MP Sandbox
```bash
1. npm run dev                                       # Terminal 1
2. node Fronted/scripts/test-mercadopago-sandbox.js # Terminal 2
3. Seguir el menú interactivo
```

### Para Testing Manual de Webhook
```bash
1. npm run dev                                     # Terminal 1
2. Hacer un checkout real en http://localhost:3000/carrito
3. node Fronted/scripts/test-webhook-manually.js # Terminal 2
```

---

## ⚡ Quick Reference - Qué Script Usar

| Necesito probar... | Script |
|-------------------|--------|
| Que pueda agregar productos al carrito | `test-cart-checkout-integration.js` |
| Que el checkout valida datos | `test-cart-checkout-integration.js` |
| Que el login funciona | `test-login.js` |
| Que puedo crear/editar/borrar productos | `test-product-with-auth.js` |
| Que Mercado Pago integra bien | `test-mercadopago-flow.js` |
| Que el webhook recibe las notificaciones | `test-webhook-manually.js` |
| El flujo completo interactivo | `test-mercadopago-sandbox.js` |

---

## 🐛 Troubleshooting

### ❌ Error: "El servidor no está corriendo"
```bash
✓ Solución: npm run dev en otra terminal
```

### ❌ Error: "No se puede conectar a Mercado Pago"
```bash
✓ Solución: Verificar variables de entorno en .env
✓ Solución: Verificar que ngrok está activo (si se usa)
```

### ❌ Error: "Login falló"
```bash
✓ Solución: Verificar que admin existe en BD
✓ Solución: Verificar credenciales en .env
```

### ❌ Error: "La orden no se creó"
```bash
✓ Solución: Verificar que hay productos en BD
✓ Solución: Verificar que hay categorías en BD
```

---

## 📝 Notas Importantes

1. **Todos los scripts necesitan que npm run dev esté corriendo**
2. **Los scripts no eliminan datos excepto lo que crean (usar con cuidado)**
3. **Usar tarjetas de prueba MP SOLO en modo sandbox**
4. **Los logs se muestran en la terminal del servidor (npm run dev)**
5. **Verificar ngrok dashboard en http://localhost:4040 para ver webhooks**

---

## 🎯 Resumen Final

```
Para testing RÁPIDO SIN dinero:
→ test-cart-checkout-integration.js

Para testing COMPLETO de MP:
→ test-mercadopago-flow.js

Para testing INTERACTIVO:
→ test-mercadopago-sandbox.js

Para testing manual de WEBHOOK:
→ test-webhook-manually.js

Para verificar AUTH:
→ test-login.js

Para verificar CRUD:
→ test-product-with-auth.js
```



