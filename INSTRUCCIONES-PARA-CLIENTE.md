# 📧 Instrucciones para el Cliente del Vivero

Hola, para activar los pagos en línea en tu tienda, necesito que completes estos pasos en tu cuenta de Mercado Pago.

---

## 🎯 ¿Qué vamos a hacer?

Configurar tu cuenta de Mercado Pago para que puedas recibir pagos de clientes que compren en tu tienda online.

**Tiempo estimado:** 15 minutos + 1-3 días de espera (verificación de Mercado Pago)

---

## 📝 Paso 1: Crear o Verificar tu Cuenta de Mercado Pago

### Si NO tienes cuenta de Mercado Pago:

1. Ve a: https://www.mercadopago.com.ar/
2. Click en **"Crear cuenta"**
3. Ingresa tu email y crea una contraseña
4. Verifica tu email (revisa tu bandeja de entrada)

### Si YA tienes cuenta de Mercado Pago:

1. Ve a: https://www.mercadopago.com.ar/
2. Inicia sesión con tu email y contraseña

---

## 🆔 Paso 2: Verificar tu Identidad

**Esto es obligatorio para recibir pagos:**

1. Inicia sesión en Mercado Pago
2. Ve a: **"Mi perfil"** → **"Tus datos"** → **"Verificar identidad"**
3. Completa los siguientes datos:
   - 📸 **Foto de DNI** (frente y dorso)
   - 📝 **CUIT o CUIL**
   - 📞 **Número de teléfono** (te enviarán un código)

4. Espera la aprobación (1-3 días hábiles)

**Recibirás un email cuando tu identidad esté verificada.**

---

## 🏦 Paso 3: Vincular Cuenta Bancaria

**Para que el dinero de las ventas llegue a tu cuenta:**

1. Ve a: **"Dinero"** → **"Agregar cuenta bancaria"**
2. Ingresa tu **CBU** o **CVU**
   - Lo encuentras en tu home banking
   - Son 22 números
3. Mercado Pago hará una transferencia pequeña de prueba
4. Confirma el monto que te llegó

**El dinero de tus ventas se depositará automáticamente en esta cuenta.**

---

## 🔧 Paso 4: Activar Cuenta para Desarrolladores

**Necesario para conectar tu tienda online:**

1. Ve a: https://www.mercadopago.com.ar/developers
2. Si es tu primera vez:
   - Click en **"Empezar"**
   - Acepta los términos y condiciones
3. Click en: **"Tus integraciones"**
4. Click en: **"Crear aplicación"**
5. Completa:
   - **Nombre:** `Vivero Web - Ventas Online`
   - **Descripción:** `Sistema de ventas en línea para el vivero`
   - **Categoría:** E-commerce
6. Click en: **"Crear aplicación"**

---

## 🔑 Paso 5: Obtener Credenciales de PRODUCCIÓN

**Estas credenciales son las que me permiten conectar tu tienda con Mercado Pago:**

1. Dentro de tu aplicación, ve a: **"Credenciales"**
2. **MUY IMPORTANTE:** Cambia el toggle de **"Prueba"** a **"PRODUCCIÓN"** (arriba a la derecha)
   - 🔴 Si está en "Prueba" → NO funcionará en producción
   - 🟢 Debe estar en "PRODUCCIÓN"
3. Copia estos dos valores y envíamelos de forma **SEGURA** (WhatsApp, email):

   **a) Access Token:**
   ```
   APP_USR-XXXXXXXX-XXXXXX-XXXXXXXXXXXXXXXX-XXXXXXXX
   ```
   
   **b) Public Key:**
   ```
   APP_USR-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```

⚠️ **IMPORTANTE:**
- Deben empezar con `APP_USR-` (si empiezan con `TEST-`, estás en modo Prueba)
- NO compartas estas credenciales públicamente
- Solo envíamelas a mí de forma privada
- Son como las claves de tu cuenta bancaria

---

## 🔔 Paso 6: Configurar Webhooks (Lo haremos juntos)

Cuando tengas las credenciales, te contactaré para que hagamos este paso juntos en una videollamada. Es rápido (5 minutos) y así me aseguro de que quede bien configurado.

---

## ✅ Resumen: ¿Qué necesito que me envíes?

Por favor envíame:

1. ✅ Confirmación de que tu identidad fue verificada por Mercado Pago
2. ✅ Confirmación de que vinculaste tu cuenta bancaria
3. ✅ **Access Token** (empieza con APP_USR-)
4. ✅ **Public Key** (empieza con APP_USR-)

Con esto podré configurar tu tienda para que empieces a recibir pagos reales. 🎉

---

## 📞 ¿Dudas?

Si tienes alguna duda en el proceso, contáctame:

- 📱 WhatsApp: [Tu número]
- 📧 Email: [Tu email]
- 💬 Llamada: [Tu teléfono]

También puedes contactar al soporte de Mercado Pago:
- https://www.mercadopago.com.ar/ayuda

---

## 💰 Información sobre Comisiones

**Mercado Pago cobra:**
- ~3.49% + $5 ARS por cada transacción
- Este costo lo descuenta automáticamente antes de depositarte el dinero

**Ejemplo:**
- Venta: $1000
- Comisión MP: ~$40 (3.49% + $5)
- Recibes: ~$960

**Acreditación del dinero:**
- Cuenta nueva: 14-21 días
- Cuenta verificada con historial: 1-2 días
- Puedes adelantar el dinero pagando una comisión adicional

---

**¡Gracias! Apenas tengas las credenciales, configuraremos todo y tu tienda estará lista para vender. 🚀**

