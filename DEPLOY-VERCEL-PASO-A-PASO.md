# 🚀 Deploy a Vercel: Guía Paso a Paso

Esta guía te llevará desde cero hasta tener tu aplicación funcionando en Vercel.

---

## ✅ Pre-requisitos

Antes de empezar, asegúrate de tener:

- [ ] Node.js instalado (versión 18 o superior)
- [ ] npm o yarn instalado
- [ ] Cuenta en Vercel (gratuita): https://vercel.com/signup
- [ ] Código del proyecto en tu computadora
- [ ] Git instalado

---

## 📦 Paso 1: Verificar que el Build Funciona

Antes de hacer deploy, verifica que tu proyecto compile sin errores:

```bash
# En la carpeta raíz del proyecto
npm install

# Verificar el build
npm run build
```

✅ Debes ver: `Compiled successfully`  
❌ Si hay errores: Corrígelos antes de continuar

---

## 🔧 Paso 2: Instalar Vercel CLI

```bash
npm install -g vercel
```

Para verificar que se instaló:

```bash
vercel --version
```

Debes ver algo como: `Vercel CLI 33.0.0`

---

## 🔐 Paso 3: Login en Vercel

```bash
vercel login
```

Opciones de login:
- **Email:** Te enviarán un link de confirmación
- **GitHub:** Login con tu cuenta de GitHub (recomendado)
- **GitLab:** Login con GitLab
- **Bitbucket:** Login con Bitbucket

Sigue las instrucciones en pantalla.

---

## 🚀 Paso 4: Deploy Inicial

En la carpeta raíz del proyecto:

```bash
vercel
```

El CLI te hará algunas preguntas:

### 4.1: Set up and deploy?
```
? Set up and deploy "~/path/to/app-vivero-web"?
```
Respuesta: **Y** (yes)

### 4.2: Which scope?
```
? Which scope do you want to deploy to?
```
Respuesta: Selecciona tu cuenta personal

### 4.3: Link to existing project?
```
? Link to existing project?
```
Respuesta: **N** (no) - Es la primera vez

### 4.4: What's your project's name?
```
? What's your project's name?
```
Respuesta: `app-vivero-web` (o el nombre que prefieras)

### 4.5: In which directory is your code located?
```
? In which directory is your code located?
```
Respuesta: `./` (carpeta actual)

### 4.6: Auto-detected Project Settings
```
Auto-detected Project Settings (Next.js):
- Build Command: next build
- Output Directory: .next
- Development Command: next dev

? Want to modify these settings?
```
Respuesta: **N** (no) - Los detectó correctamente

---

## ⏳ Paso 5: Esperar el Deploy

Verás algo así:

```
🔗  Linked to your-username/app-vivero-web (created .vercel)
🔍  Inspect: https://vercel.com/your-username/app-vivero-web/...
✅  Preview: https://app-vivero-web-abc123.vercel.app
```

**Importante:** 
- La URL de **Preview** es temporal (para testing)
- Aún NO es tu URL de producción

---

## 🌐 Paso 6: Deploy a Producción

Para hacer el deploy de producción (la URL final):

```bash
vercel --prod
```

Verás:

```
✅  Production: https://app-vivero-web-xyz789.vercel.app
```

**¡Esta es tu URL de producción!** Guárdala, la necesitarás.

---

## 🔐 Paso 7: Configurar Variables de Entorno

### 7.1: Ir al Dashboard

1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto: `app-vivero-web`
3. Click en: **Settings**
4. Click en: **Environment Variables**

### 7.2: Agregar Variables

Para cada variable:
1. Click en: **Add New**
2. Name: (nombre de la variable)
3. Value: (valor de la variable)
4. Environments: Selecciona **Production**, **Preview**, **Development**
5. Click en: **Save**

### 7.3: Lista de Variables a Agregar

Copia estos valores desde tu archivo `.env.local`:

```
MP_ACCESS_TOKEN
NEXT_PUBLIC_MP_PUBLIC_KEY
NEXT_PUBLIC_BASE_URL (usa tu URL de Vercel)
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
JWT_SECRET (genera uno nuevo para producción)
EMAIL_USER
EMAIL_PASSWORD
NODE_ENV (valor: production)
```

**⚠️ IMPORTANTE:** 
- `NEXT_PUBLIC_BASE_URL` debe ser tu URL de Vercel: `https://app-vivero-web-xyz789.vercel.app`
- `MP_ACCESS_TOKEN` y `NEXT_PUBLIC_MP_PUBLIC_KEY` deben ser las credenciales del CLIENTE (no las tuyas)
- Genera un nuevo `JWT_SECRET` para producción:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

---

## 🔄 Paso 8: Re-deploy para Aplicar Variables

Después de agregar las variables:

```bash
vercel --prod
```

Esto hace que las variables de entorno tomen efecto.

---

## ✅ Paso 9: Verificar que Funciona

### 9.1: Abrir tu sitio

Abre en el navegador: `https://tu-app.vercel.app`

### 9.2: Verificar páginas principales

- [ ] Página de inicio carga correctamente
- [ ] Puedes navegar entre páginas
- [ ] Los productos se muestran
- [ ] El carrito funciona
- [ ] Puedes llegar a la página de checkout

### 9.3: Verificar logs (si hay errores)

Si algo no funciona:

1. Ve a: Vercel Dashboard → Tu proyecto
2. Click en: **Functions** → **Logs**
3. Busca mensajes de error en rojo
4. Lee el error y corrígelo

---

## 🔗 Paso 10: (Opcional) Configurar Dominio Personalizado

Si tienes un dominio propio (ej: `www.vivero-yayo.com`):

### 10.1: Agregar dominio en Vercel

1. Ve a: Vercel Dashboard → Tu proyecto
2. Click en: **Settings** → **Domains**
3. Click en: **Add**
4. Ingresa tu dominio: `www.vivero-yayo.com`
5. Click en: **Add**

### 10.2: Configurar DNS

Vercel te mostrará registros DNS que debes agregar en tu proveedor de dominio:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 10.3: Esperar propagación

Puede tomar de 5 minutos a 48 horas (usualmente ~1 hora).

---

## 📊 Paso 11: Monitorear tu Aplicación

### Ver analytics (visitas)

1. Ve a: Vercel Dashboard → Tu proyecto
2. Click en: **Analytics**

### Ver logs en tiempo real

1. Ve a: Vercel Dashboard → Tu proyecto
2. Click en: **Functions** → **Logs**
3. Filtra por: **All Functions** o **Error**

### Ver deployments

1. Ve a: Vercel Dashboard → Tu proyecto
2. Click en: **Deployments**
3. Verás historial de todos tus deploys

---

## 🔄 Paso 12: Actualizar tu Aplicación

Cada vez que hagas cambios en el código:

```bash
# Opción 1: Deploy automático (si conectaste con Git)
git add .
git commit -m "Descripción del cambio"
git push

# Opción 2: Deploy manual
vercel --prod
```

---

## 🆘 Solución de Problemas Comunes

### Error: "Command failed: npm run build"

**Causa:** Hay errores de compilación en tu código.

**Solución:**
1. Ejecuta local: `npm run build`
2. Lee el error y corrígelo
3. Vuelve a intentar el deploy

---

### Error: "Environment variable not found"

**Causa:** Falta una variable de entorno.

**Solución:**
1. Ve a: Vercel Dashboard → Settings → Environment Variables
2. Agrega la variable faltante
3. Haz re-deploy: `vercel --prod`

---

### Error: "Internal Server Error" (500)

**Causa:** Error en tu código al ejecutar en servidor.

**Solución:**
1. Ve a: Vercel Dashboard → Functions → Logs
2. Busca el error específico (en rojo)
3. Lee el mensaje y corrígelo
4. Haz re-deploy

---

### La página se ve sin estilos

**Causa:** Error al cargar CSS o configuración incorrecta.

**Solución:**
1. Verifica que `next.config.js` esté correcto
2. Limpia la caché: `rm -rf .next`
3. Vuelve a hacer build: `npm run build`
4. Haz re-deploy: `vercel --prod`

---

## 📞 Recursos Útiles

- **Documentación Vercel:** https://vercel.com/docs
- **Vercel Status:** https://vercel-status.com
- **Soporte Vercel:** https://vercel.com/support
- **Logs en tiempo real:** Vercel Dashboard → Functions → Logs

---

## 📝 Resumen de Comandos

```bash
# Verificar build local
npm run build

# Login en Vercel
vercel login

# Deploy inicial (preview)
vercel

# Deploy a producción
vercel --prod

# Ver información del proyecto
vercel inspect

# Ver logs
vercel logs

# Ver lista de deployments
vercel ls
```

---

## ✅ Checklist Final

Antes de considerar el deploy completo:

- [ ] Build local funciona sin errores
- [ ] Deploy a Vercel exitoso
- [ ] URL de producción guardada
- [ ] Todas las variables de entorno configuradas en Vercel
- [ ] Re-deploy después de configurar variables
- [ ] Sitio carga correctamente en producción
- [ ] Navegación funciona
- [ ] Productos se muestran
- [ ] Carrito funciona
- [ ] No hay errores en los logs
- [ ] (Opcional) Dominio personalizado configurado

---

**¡Listo! Tu aplicación está en producción. 🎉**

Siguiente paso: Configurar Mercado Pago siguiendo la guía:  
`PRODUCCION-MERCADOPAGO-CHECKLIST.md`

