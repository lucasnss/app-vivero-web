# 🚀 Checklist: Mercado Pago a Producción

Este documento te guiará paso a paso para pasar Mercado Pago de desarrollo a producción real.

---

## 📋 Estado Actual

- ✅ Código listo para producción (no necesita cambios)
- ✅ Sistema de webhooks implementado
- ✅ Detección automática de pagos test vs real
- ⚠️ **Usando credenciales de DESARROLLO** (debes cambiarlas)
- ⚠️ **Usando ngrok** (solo funciona en desarrollo)

---

## 🎯 Fase 1: Preparar Cuenta del Cliente (1-3 días)

### Paso 1.1: El cliente debe crear su cuenta de Mercado Pago

**El CLIENTE (dueño del vivero) debe hacer esto, no tú:**

- [ ] Ir a https://www.mercadopago.com.ar/
- [ ] Crear cuenta con su email
- [ ] Verificar email
- [ ] Completar datos personales

**Tiempo:** 10 minutos

---

### Paso 1.2: Verificar identidad del cliente

**El cliente debe:**

- [ ] Ir a: Mercado Pago → Mi perfil → Verificación de identidad
- [ ] Cargar foto de DNI (frente y dorso)
- [ ] Cargar CUIT o CUIL
- [ ] Validar número de teléfono
- [ ] Esperar aprobación de Mercado Pago

**Tiempo:** 1-3 días hábiles (depende de Mercado Pago)

---

### Paso 1.3: Vincular cuenta bancaria

**El cliente debe:**

- [ ] Ir a: Mercado Pago → Dinero → Agregar cuenta bancaria
- [ ] Ingresar CBU o CVU de su cuenta
- [ ] Validar cuenta (MP hace una transferencia de prueba)

**Tiempo:** 1 día hábil

---

### Paso 1.4: Activar cuenta para desarrolladores

**El cliente debe:**

- [ ] Ir a https://www.mercadopago.com.ar/developers
- [ ] Crear una "Aplicación" nueva:
  - Nombre: "Vivero Web - Ventas Online"
  - Descripción: "Sistema de ventas para vivero"
- [ ] Aceptar términos y condiciones

**Tiempo:** 5 minutos

---

### Paso 1.5: Obtener credenciales de PRODUCCIÓN

**El cliente debe enviarte estas credenciales:**

- [ ] Ir a: Developers → Tus integraciones → [Tu app] → Credenciales
- [ ] **Cambiar a modo: PRODUCCIÓN** (toggle arriba a la derecha)
- [ ] Copiar y enviar de forma SEGURA:
  - ✅ **Access Token** (empieza con `APP_USR-`)
  - ✅ **Public Key** (empieza con `APP_USR-`)

⚠️ **CRÍTICO:** 
- Las credenciales deben ser del modo **PRODUCCIÓN**, NO "Pruebas"
- El cliente NO debe compartir estas credenciales públicamente
- Guárdalas en un lugar seguro (password manager)

**Tiempo:** 2 minutos

---

## 🎯 Fase 2: Deploy a Vercel (10 minutos)

### Paso 2.1: Verificar que el build funciona

Ejecuta en tu terminal:

```bash
npm run build
```

✅ Debe completar sin errores

---

### Paso 2.2: Instalar CLI de Vercel (si no lo tienes)

```bash
npm install -g vercel
```

---

### Paso 2.3: Login en Vercel

```bash
vercel login
```

Sigue las instrucciones en pantalla.

---

### Paso 2.4: Deploy inicial

```bash
vercel --prod
```

**Importante:** Guarda la URL que te da Vercel. Ejemplo:
```
✅ Production: https://app-vivero-web-abc123.vercel.app
```

---

## 🎯 Fase 3: Configurar Variables de Entorno en Vercel (5 minutos)

### Paso 3.1: Ir al Dashboard de Vercel

- [ ] Ir a https://vercel.com/dashboard
- [ ] Seleccionar tu proyecto: `app-vivero-web`
- [ ] Click en: **Settings** → **Environment Variables**

---

### Paso 3.2: Agregar variables de Mercado Pago

Agrega estas variables con los valores del CLIENTE:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `MP_ACCESS_TOKEN` | `APP_USR-XXXXX...` | Access Token del cliente (PRODUCCIÓN) |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | `APP_USR-XXXXX...` | Public Key del cliente (PRODUCCIÓN) |
| `NEXT_PUBLIC_BASE_URL` | `https://tu-app.vercel.app` | URL de tu deploy en Vercel |

**Checklist:**
- [ ] MP_ACCESS_TOKEN agregado
- [ ] NEXT_PUBLIC_MP_PUBLIC_KEY agregado
- [ ] NEXT_PUBLIC_BASE_URL agregado (con tu URL de Vercel)

---

### Paso 3.3: Agregar variables de Supabase

Copia desde tu `.env.local`:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | (copiar de .env.local) |
| `SUPABASE_SERVICE_ROLE_KEY` | (copiar de .env.local) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (copiar de .env.local) |

**Checklist:**
- [ ] NEXT_PUBLIC_SUPABASE_URL agregado
- [ ] SUPABASE_SERVICE_ROLE_KEY agregado
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY agregado

---

### Paso 3.4: Agregar variables de Email

Copia desde tu `.env.local`:

| Variable | Valor |
|----------|-------|
| `EMAIL_USER` | (tu email de Gmail) |
| `EMAIL_PASSWORD` | (tu App Password de Gmail) |

**Checklist:**
- [ ] EMAIL_USER agregado
- [ ] EMAIL_PASSWORD agregado

---

### Paso 3.5: Agregar variables de seguridad

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `JWT_SECRET` | (genera uno nuevo) | Secreto para JWT |
| `NODE_ENV` | `production` | Ambiente de ejecución |

**Para generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Checklist:**
- [ ] JWT_SECRET agregado (uno nuevo, NO usar el de desarrollo)
- [ ] NODE_ENV agregado con valor `production`

---

### Paso 3.6: Re-deploy después de configurar variables

```bash
vercel --prod
```

Esto hace que las variables tomen efecto.

---

## 🎯 Fase 4: Registrar Webhook en Mercado Pago (5 minutos)

### Paso 4.1: Ir al panel de Mercado Pago

**El CLIENTE debe hacer esto desde su cuenta:**

- [ ] Ir a https://www.mercadopago.com.ar/developers
- [ ] Seleccionar su aplicación
- [ ] Click en: **Webhooks** (menú lateral)

---

### Paso 4.2: Agregar URL de webhook

- [ ] Click en: **Configurar webhooks**
- [ ] Modo: **PRODUCCIÓN** (importante!)
- [ ] URL: `https://tu-app.vercel.app/api/mercadopago/webhook`
- [ ] Eventos a escuchar:
  - ✅ **Pagos (payments)** → Marcar
  - ❌ Merchant orders → Desmarcar
  - ❌ Chargebacks → Desmarcar
  - ❌ Otros → Desmarcar
- [ ] Click en **Guardar**

---

### Paso 4.3: Probar webhook

Mercado Pago enviará una petición GET de prueba. Verifica:

- [ ] Estado: "Webhook activo" ✅
- [ ] No hay errores

Si hay error, verifica:
- La URL está correcta (con `https://` y sin espacios)
- Tu app está deployada en Vercel
- Las variables de entorno están configuradas

---

## 🎯 Fase 5: Pruebas (30 minutos)

### Paso 5.1: Prueba con tarjeta de TEST

Usa estas credenciales de tarjeta de prueba de Mercado Pago:

```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/25
Nombre: APRO
DNI: 12345678
```

**Proceso de prueba:**
- [ ] Ir a tu sitio en Vercel: `https://tu-app.vercel.app`
- [ ] Agregar productos al carrito
- [ ] Ir a checkout
- [ ] Llenar formulario con datos de prueba
- [ ] Usar la tarjeta de test
- [ ] Completar el pago

**Verificar que:**
- [ ] ✅ Se crea la orden en Supabase
- [ ] ✅ El webhook procesa el pago (revisar logs en Vercel)
- [ ] ✅ El email de confirmación se envía
- [ ] ✅ El stock se reduce en la BD
- [ ] ✅ La orden aparece en `/admin/sales-history`
- [ ] ✅ En logs dice: `payment_source: 'test'`

---

### Paso 5.2: Verificar logs en Vercel

- [ ] Ir a: Vercel Dashboard → Functions → Logs
- [ ] Buscar: "🔔 Webhook procesado"
- [ ] Verificar que no haya errores
- [ ] Confirmar que `payment_source` sea `'test'`

---

### Paso 5.3: Prueba con pago REAL pequeño

**IMPORTANTE:** Solo hacer esto cuando estés seguro de que todo funciona.

- [ ] Usar tu propia tarjeta personal
- [ ] Comprar un producto económico (ej: $100 ARS)
- [ ] Completar el pago

**Verificar que:**
- [ ] ✅ El pago se procesa correctamente
- [ ] ✅ En logs dice: `payment_source: 'real'`
- [ ] ✅ **El dinero llega a la cuenta del CLIENTE** (no a la tuya)

⚠️ **MUY IMPORTANTE:** 
Si el dinero llega a TU cuenta, significa que usaste TUS credenciales.
Debes reemplazar las credenciales en Vercel por las del cliente.

---

## 🎯 Fase 6: Activación (5 minutos)

### Paso 6.1: Verificar checklist final

- [ ] Credenciales del CLIENTE configuradas (no tuyas)
- [ ] Webhook registrado y activo
- [ ] Prueba con tarjeta de test: ✅
- [ ] Prueba con pago real: ✅
- [ ] Dinero llega a cuenta del vivero: ✅
- [ ] Emails se envían: ✅
- [ ] Stock se reduce: ✅
- [ ] Admin puede ver órdenes: ✅

---

### Paso 6.2: Informar al cliente

**Envía este mensaje al cliente:**

---

¡Hola! Tu sistema de pagos con Mercado Pago ya está ACTIVO en producción. 🎉

**URLs importantes:**
- Tu tienda: https://tu-app.vercel.app
- Panel admin: https://tu-app.vercel.app/admin
- Panel de Mercado Pago: https://www.mercadopago.com.ar/activities

**Información sobre pagos:**

1. **Comisiones de Mercado Pago:**
   - ~3.49% + $5 ARS por transacción
   - Mercado Pago cobra automáticamente (lo descuenta del pago)

2. **Acreditación del dinero:**
   - 14-21 días para cuenta nueva
   - 1-2 días si tu cuenta está verificada y tiene historial

3. **¿Dónde ver tus ventas?**
   - Panel admin del sitio: https://tu-app.vercel.app/admin/sales-history
   - Mercado Pago: https://www.mercadopago.com.ar/activities

4. **Emails:**
   - Los clientes reciben email con confirmación y PDF de la orden
   - Tú recibes copia de cada venta

5. **Stock:**
   - Se descuenta automáticamente al confirmar el pago
   - Puedes gestionarlo desde el panel admin

**Soporte:**
- Problemas técnicos: (tu contacto)
- Problemas con Mercado Pago: https://www.mercadopago.com.ar/ayuda

¡El sistema está listo para recibir ventas reales! 🚀

---

---

## 📊 Script de Verificación

Creé un script para verificar que todo esté configurado correctamente.

**En desarrollo local:**
```bash
node scripts/verify-mp-production-config.js
```

**En producción (Vercel):**
Puedes revisar los logs en: Vercel Dashboard → Functions → Logs

---

## 🆘 Solución de Problemas

### Error: "MP_ACCESS_TOKEN no está configurado"

**Solución:**
- Verifica que agregaste la variable en Vercel
- Verifica que hiciste re-deploy después de agregar variables
- Verifica que el nombre sea exacto: `MP_ACCESS_TOKEN`

---

### Error: "Webhook no funciona"

**Solución:**
- Verifica la URL en Mercado Pago (sin espacios, con `https://`)
- Verifica que esté en modo PRODUCCIÓN
- Verifica que seleccionaste el evento "Pagos (payments)"
- Revisa logs en Vercel para ver el error específico

---

### El dinero llega a mi cuenta y no a la del cliente

**Solución:**
- Estás usando TUS credenciales en lugar de las del cliente
- Ve a Vercel → Settings → Environment Variables
- Reemplaza `MP_ACCESS_TOKEN` y `NEXT_PUBLIC_MP_PUBLIC_KEY`
- Usa las credenciales del CLIENTE
- Haz re-deploy: `vercel --prod`

---

### No se envían los emails

**Solución:**
- Verifica `EMAIL_USER` y `EMAIL_PASSWORD` en Vercel
- Verifica que uses una "Contraseña de aplicación" de Google, no tu contraseña normal
- Verifica que tengas 2FA activado en Gmail
- Revisa logs en Vercel para ver el error específico

---

## 📞 Contactos Útiles

- **Soporte Mercado Pago:** https://www.mercadopago.com.ar/ayuda
- **Documentación MP:** https://www.mercadopago.com.ar/developers/es/docs
- **Soporte Vercel:** https://vercel.com/support
- **Logs de Vercel:** https://vercel.com/dashboard → Tu proyecto → Functions → Logs

---

## ✅ Resumen: ¿Qué debo hacer YO?

1. ✅ Pedir al cliente que cree su cuenta de Mercado Pago
2. ✅ Pedir al cliente sus credenciales de PRODUCCIÓN
3. ✅ Hacer deploy a Vercel: `vercel --prod`
4. ✅ Configurar variables de entorno en Vercel Dashboard
5. ✅ Pedir al cliente que registre el webhook
6. ✅ Hacer pruebas con tarjeta de test
7. ✅ Hacer prueba con pago real pequeño
8. ✅ Verificar que el dinero llegue a la cuenta del cliente
9. ✅ Informar al cliente que está activo

---

**Tiempo total estimado:** 
- Preparación cuenta del cliente: 1-3 días
- Configuración técnica: 1 hora
- Pruebas: 30 minutos

**¡Éxito! 🚀**

