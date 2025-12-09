# ⚡ Comandos Rápidos - Referencia

Comandos útiles para desarrollo y deploy del proyecto.

---

## 🏗️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:3000
```

---

## 🔍 Verificación

```bash
# Verificar que el build funciona
npm run build

# Ejecutar el build localmente
npm start

# Verificar configuración de Mercado Pago
node scripts/verify-mp-production-config.js

# Verificar linter
npm run lint
```

---

## 🚀 Deploy a Vercel

```bash
# Login en Vercel (solo primera vez)
vercel login

# Deploy de prueba (preview)
vercel

# Deploy a producción
vercel --prod

# Ver información del proyecto actual
vercel inspect

# Ver lista de deployments
vercel ls

# Ver logs en tiempo real
vercel logs
```

---

## 🔐 Generar Secrets

```bash
# Generar JWT_SECRET para producción
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar token aleatorio
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 📦 Base de Datos (Supabase)

```bash
# Conectar a Supabase (si usas Supabase CLI)
supabase login

# Ver estado de migraciones
supabase migration list

# Ejecutar migraciones
supabase db push
```

---

## 🧹 Limpieza

```bash
# Limpiar cache de Next.js
rm -rf .next

# Limpiar node_modules (si hay problemas)
rm -rf node_modules
npm install

# Limpiar cache de npm
npm cache clean --force
```

---

## 🔧 Scripts Personalizados

```bash
# Verificar configuración de MP para producción
npm run verify-mp-config
# O directamente:
node scripts/verify-mp-production-config.js
```

---

## 🌐 Ngrok (Solo Desarrollo)

```bash
# Iniciar ngrok (para testing de webhooks local)
ngrok http 3000

# Con token de autenticación
ngrok authtoken TU_TOKEN
ngrok http 3000
```

**Nota:** NO usar ngrok en producción. Usar Vercel directamente.

---

## 📊 Monitoreo en Producción

### Ver logs de Vercel

**Opción 1: CLI**
```bash
vercel logs
vercel logs --follow  # Seguir logs en tiempo real
```

**Opción 2: Dashboard**
1. https://vercel.com/dashboard
2. Tu proyecto → Functions → Logs

### Ver analytics

1. https://vercel.com/dashboard
2. Tu proyecto → Analytics

---

## 🐛 Debug

```bash
# Correr con logs detallados
NODE_ENV=development npm run dev

# Ver variables de entorno (sin valores sensibles)
npm run env

# Verificar versión de Node
node -v

# Verificar versión de npm
npm -v

# Info del sistema
npx envinfo --system --binaries
```

---

## 📝 Git (Control de Versiones)

```bash
# Ver cambios
git status

# Agregar cambios
git add .

# Commit
git commit -m "Descripción del cambio"

# Push a GitHub
git push origin main

# Ver historial
git log --oneline

# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Volver a main
git checkout main
```

---

## 🔄 Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas (con cuidado)
npm update

# Actualizar una específica
npm install nombre-paquete@latest

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades (con cuidado)
npm audit fix
```

---

## 💾 Backup

```bash
# Backup de .env.local
cp .env.local .env.local.backup

# Backup de base de datos (Supabase)
# Hacer desde el dashboard de Supabase:
# Settings → Database → Backup & Restore
```

---

## 🎯 Workflow Típico de Desarrollo

```bash
# 1. Iniciar servidor local
npm run dev

# 2. Hacer cambios en el código

# 3. Verificar que funciona localmente
# (navegar en http://localhost:3000)

# 4. Verificar build
npm run build

# 5. Deploy a Vercel
vercel --prod

# 6. Verificar en producción
# (abrir tu URL de Vercel)

# 7. Si hay errores, ver logs
vercel logs
```

---

## 📚 Recursos

- **Documentación Next.js:** https://nextjs.org/docs
- **Documentación Vercel:** https://vercel.com/docs
- **Documentación Mercado Pago:** https://www.mercadopago.com.ar/developers/es/docs
- **Documentación Supabase:** https://supabase.com/docs

---

## 🆘 Contactos de Soporte

- **Vercel:** https://vercel.com/support
- **Mercado Pago:** https://www.mercadopago.com.ar/ayuda
- **Supabase:** https://supabase.com/dashboard/support
- **Next.js:** https://github.com/vercel/next.js/discussions

