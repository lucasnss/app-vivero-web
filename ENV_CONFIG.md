# 📧 Configuración de Variables de Entorno para Email

Este documento detalla las variables de entorno necesarias para el envío automático de emails con PDF adjunto cuando se completa un pedido.

## ⚠️ Importante: Actualización de Dependencias (19 Nov 2025)

Se cambió de `pdfkit` a `pdf-lib` porque `pdfkit` no funciona correctamente en Next.js Server. Ver `SOLUCION_ERRORES_EMAIL_PDF.md` para detalles técnicos.

## 📝 Variables Requeridas

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# =============================================================================
# 📧 CONFIGURACIÓN DE EMAIL (Nodemailer)
# =============================================================================
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-de-gmail
```

## 🔐 Cómo Obtener una App Password de Gmail

Para usar Gmail con Nodemailer, necesitas una **App Password** (contraseña de aplicación) porque Gmail no permite usar tu contraseña normal en aplicaciones de terceros.

### Pasos para crear una App Password

1. **Ir a tu cuenta de Google**
   - Ve a [https://myaccount.google.com/](https://myaccount.google.com/)

2. **Activar Verificación en 2 pasos**
   - En el menú lateral, ve a **Seguridad**
   - Busca **Verificación en 2 pasos** y actívala si no lo está
   - Sigue las instrucciones para configurarla

3. **Generar Contraseña de Aplicación**
   - Una vez activada la verificación en 2 pasos, ve nuevamente a **Seguridad**
   - Busca **Contraseñas de aplicaciones**
   - Selecciona **Correo** como aplicación
   - Selecciona el dispositivo (puedes poner "Computadora Windows" o "Otro")
   - Click en **Generar**

4. **Copiar la Contraseña**
   - Google te mostrará una contraseña de 16 caracteres
   - Cópiala (sin espacios)
   - Úsala como valor de `EMAIL_PASSWORD` en tu `.env.local`

### Ejemplo de configuración

```env
EMAIL_USER=viveroexample@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Los espacios son solo visuales, cópiala sin ellos
```

**Importante:** Esta contraseña es específica para tu aplicación y es diferente a tu contraseña de Gmail normal.

## 🔄 Alternativas a Gmail

Si prefieres usar otro proveedor de email, aquí hay algunas opciones:

### Resend (Recomendado para producción)

```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_tu_api_key
```

### SendGrid

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.tu_api_key
```

### Outlook/Hotmail

```env
EMAIL_USER=tu-email@outlook.com
EMAIL_PASSWORD=tu-contraseña
```

## ✅ Verificar Configuración

Para verificar que la configuración está correcta:

1. Reinicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

2. Marca un pedido como completado desde el historial de ventas

3. Revisa los logs de la consola del servidor:
   - ✅ Si ves `Email enviado exitosamente`, la configuración es correcta
   - ❌ Si ves errores de autenticación, verifica tu email y contraseña

## 🔒 Seguridad

**NUNCA** subas tu archivo `.env.local` a Git. Este archivo ya está en `.gitignore` por defecto.

## 📧 Contenido del Email

Cuando se marca un pedido como completado, el cliente recibe:

- ✅ Email personalizado según el método de envío:
  - **Delivery:** Mensaje con tiempo estimado de entrega (1-3 días)
  - **Pickup:** Mensaje indicando que el pedido está listo para retirar
- 📄 PDF adjunto con el comprobante de compra
- 💬 Link directo a WhatsApp para contacto
- 📱 Número de teléfono: +54 9 381 355-4711

## 🚨 Solución de Problemas

### Error: "Invalid login"

- Verifica que hayas copiado correctamente la App Password
- Asegúrate de que la verificación en 2 pasos esté activada
- Intenta generar una nueva App Password

### Error: "Connection timeout"

- Verifica tu conexión a internet
- Asegúrate de que el puerto 587 o 465 no esté bloqueado por un firewall

### El email no llega

- Revisa la carpeta de spam del cliente
- Verifica que el email del cliente sea correcto en la base de datos
- Revisa los logs del servidor para ver si hubo errores
