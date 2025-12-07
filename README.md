# 🌿 ViveroWeb - Sistema de E-commerce para Vivero

![Versión](https://img.shields.io/badge/version-2.1.0-green)
![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

Sistema de e-commerce completo para vivero con gestión de productos, carrito de compras, integración con MercadoPago y panel de administración.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Deployment](#-deployment)
- [Panel de Administración](#-panel-de-administración)
- [API](#-api)
- [Troubleshooting](#-troubleshooting)
- [Documentación Adicional](#-documentación-adicional)

---

## ✨ Características

### Para Clientes
- 🛍️ **Catálogo de Productos**: Navegación intuitiva con búsqueda y filtros
- 🗂️ **Categorías**: Organización por Plantas, Macetas, etc.
- 🛒 **Carrito de Compras**: Sistema optimizado con SWR (0 requests al modificar)
- 💳 **Checkout con MercadoPago**: Integración completa de pagos
- 📧 **Confirmación por Email**: Con PDF adjunto de la orden
- 📦 **Descuento Automático de Stock**: Al completar la compra
- ⚡ **Navegación Instantánea**: Sistema de caché inteligente (70% menos requests)

### Para Administradores
- 🔐 **Panel de Administración**: Acceso seguro con JWT
- ➕ **Gestión de Productos**: Crear, editar, eliminar
- 🖼️ **Carga de Imágenes**: Integración con Supabase Storage
- 📊 **Importación Masiva**: Desde archivos Excel
- 📈 **Historial de Ventas**: Con filtros y búsqueda avanzada
- 📄 **Generación de PDFs**: De órdenes individuales
- 🔍 **Filtros Avanzados**: Sin stock, stock bajo, por categoría
- ✅ **Toggle de Estado**: Marcar órdenes como completadas

---

## 🛠 Tecnologías

### Frontend
- **Next.js 14** (App Router) - Framework React
- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **SWR** - Data fetching y caché
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconos

### Backend
- **Next.js API Routes** - Backend serverless
- **Supabase** - Base de datos PostgreSQL
- **JWT** - Autenticación de administradores
- **bcryptjs** - Hashing de contraseñas

### Integraciones
- **MercadoPago SDK** - Procesamiento de pagos
- **Nodemailer** - Envío de emails
- **jsPDF** - Generación de PDFs
- **XLSX** - Importación de Excel

### Testing
- **Vitest** - Framework de testing
- **Testing Library** - Testing de componentes React
- **Happy DOM** - Entorno DOM para tests

---

## 📦 Requisitos Previos

- **Node.js** 18.0 o superior (recomendado: 20+)
- **npm** 10.0 o superior
- **Cuenta de Supabase** (gratuita)
- **Cuenta de MercadoPago** (vendedor registrado)
- **Cuenta de Gmail** (para envío de emails con App Password)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd app-vivero-web
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp env.example .env.local
```

Edita `.env.local` con tus credenciales (ver sección de Configuración)

### 4. Ejecutar migraciones de base de datos

Los scripts SQL están en la carpeta `scripts/`:
- `create-missing-tables-simplified.sql`
- `configure-rls-simplified.sql`

Ejecuta estos scripts en tu panel de Supabase (SQL Editor)

### 5. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración

### Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=tu_secreto_jwt_seguro

# MercadoPago
MP_ACCESS_TOKEN=tu_access_token_de_mercadopago
NEXT_PUBLIC_MP_PUBLIC_KEY=tu_public_key_de_mercadopago
NEXT_PUBLIC_BASE_URL=tu_url_base_para_webhooks

# Email (Gmail)
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_app_password_de_16_caracteres

# ngrok (opcional, solo para desarrollo con webhooks)
NGROK_AUTHTOKEN=tu_token_de_ngrok
```

### Obtener Credenciales

#### Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a `Settings > API`
3. Copia URL, anon key y service_role key

#### MercadoPago
1. Regístrate en [mercadopago.com.ar](https://www.mercadopago.com.ar)
2. Ve a `Developers > Credenciales`
3. Copia Access Token y Public Key (modo test o producción)

#### Gmail App Password
1. Habilita 2FA en tu cuenta de Google
2. Ve a `Seguridad > Contraseñas de aplicación`
3. Genera una nueva contraseña para "Mail"
4. Copia la contraseña de 16 caracteres

---

## 💻 Uso

### Acceso al Panel de Administración

**URL**: `http://localhost:3000/admin` (o tu dominio `/admin`)

**Credenciales iniciales**:
- Email: `[CONFIGURAR_EN_BD]`
- Password: `[CONFIGURAR_EN_BD]`

Para crear el primer usuario admin, ejecuta este SQL en Supabase:

```sql
INSERT INTO admin_users (id, email, password_hash, full_name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@vivero.com',
  '$2a$10$[HASH_BCRYPT_DE_TU_PASSWORD]', -- Usar bcryptjs para generar
  'Administrador',
  'admin',
  NOW(),
  NOW()
);
```

### Funciones del Panel Admin

1. **Productos**: `/admin` - Gestión completa de productos
2. **Ventas**: `/admin/sales-history` - Historial de ventas con filtros

### Importación Masiva de Productos

1. Descarga la plantilla: `data/Ejemplo_Importacion_Productos.xlsx`
2. Completa con tus productos
3. En el panel admin, haz clic en "Importar Excel"
4. Selecciona tu archivo
5. Verifica y confirma

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Genera build optimizado
npm run start        # Inicia servidor de producción

# Testing
npm run test         # Ejecuta tests en modo watch
npm run test:run     # Ejecuta tests una vez
npm run test:coverage # Tests con reporte de cobertura

# Utilidades
npm run lint         # Linter de código
npm run migrate      # Ejecuta migraciones (si aplica)
```

---

## 📁 Estructura del Proyecto

```
app-vivero-web/
├── app/                          # Next.js App Router
│   ├── admin/                    # Rutas del panel admin
│   │   ├── page.tsx              # Gestión de productos
│   │   └── sales-history/        # Historial de ventas
│   ├── api/                      # API Routes
│   │   ├── products/             # CRUD de productos
│   │   ├── orders/               # CRUD de órdenes
│   │   ├── mercadopago/          # Integración MP
│   │   └── auth/                 # Autenticación
│   ├── carrito/                  # Carrito y checkout
│   ├── categorias/               # Página de categorías
│   ├── plantas/                  # Catálogo de plantas
│   ├── macetas/                  # Catálogo de macetas
│   └── pago/                     # Páginas de resultado de pago
│       ├── success/
│       ├── pending/
│       └── failure/
├── components/                   # Componentes React
│   ├── ui/                       # Componentes base (shadcn)
│   ├── hero.tsx                  # Hero section
│   ├── product-card.tsx          # Tarjeta de producto
│   ├── cart-item.tsx             # Item del carrito
│   └── ...
├── lib/                          # Utilidades y configuración
│   ├── hooks/                    # Hooks personalizados
│   │   ├── useProducts.ts        # Hook de productos con SWR
│   │   ├── useCategories.ts      # Hook de categorías con SWR
│   │   └── useCartProducts.ts    # Hook del carrito
│   ├── products.ts               # Funciones de productos
│   ├── categories.ts             # Funciones de categorías
│   ├── cart.ts                   # Lógica del carrito
│   └── validations.ts            # Validaciones con Zod
├── src/                          # Lógica de backend
│   ├── services/                 # Servicios de negocio
│   │   ├── productService.ts     # Servicio de productos
│   │   ├── orderService.ts       # Servicio de órdenes
│   │   ├── cartService.ts        # Servicio del carrito
│   │   ├── emailService.ts       # Servicio de emails
│   │   └── pdfService.ts         # Servicio de PDFs
│   ├── types/                    # Tipos TypeScript
│   └── utils/                    # Utilidades compartidas
├── scripts/                      # Scripts SQL y utilidades
│   ├── create-missing-tables-simplified.sql
│   └── configure-rls-simplified.sql
├── data/                         # Datos de ejemplo
│   ├── Ejemplo_Importacion_Productos.xlsx
│   └── products.json
├── public/                       # Archivos estáticos
│   └── images/
├── CHANGELOG.md                  # Historial de cambios
├── tasks.md                      # Estado del proyecto
├── documentacion-final.md        # Análisis de completitud
├── ANALISIS-PRE-ENTREGA.md      # Análisis pre-entrega
└── README.md                     # Este archivo
```

---

## 🌐 Deployment

### Deploy a Vercel (Recomendado)

1. **Instala Vercel CLI**:
```bash
npm install -g vercel
```

2. **Inicia sesión**:
```bash
vercel login
```

3. **Deploy**:
```bash
# Build de prueba
npm run build

# Deploy a producción
vercel --prod
```

4. **Configura variables de entorno**:
   - Ve al dashboard de Vercel
   - Proyecto > Settings > Environment Variables
   - Agrega TODAS las variables de `.env.local`

5. **Configura dominio** (opcional):
   - Domains > Add Domain
   - Sigue las instrucciones de DNS

### Verificaciones Post-Deploy

- [ ] La app carga correctamente
- [ ] Login admin funciona
- [ ] Catálogo se muestra
- [ ] Carrito funciona
- [ ] Checkout con MercadoPago funciona
- [ ] Webhooks de MercadoPago funcionan
- [ ] Emails se envían correctamente

---

## 🔐 Panel de Administración

### Acceso
- **URL**: `/admin`
- **Requiere**: Login con credenciales de admin

### Funcionalidades

#### Gestión de Productos
- ➕ Crear nuevo producto
- ✏️ Editar producto existente
- 🗑️ Eliminar producto
- 🖼️ Subir/eliminar imágenes (Supabase Storage)
- 📊 Importar desde Excel (masivo)

#### Historial de Ventas
- 📋 Ver todas las órdenes
- 🔍 Buscar por número de orden, email, nombre
- 🏷️ Filtrar por estado (pending, approved, rejected)
- 📄 Descargar PDF de orden individual
- ✅ Marcar orden como completada
- 📊 Estadísticas: Total ventas, promedio, cantidad de órdenes

#### Filtros Especiales
- **Sin stock**: Productos con stock = 0
- **Stock bajo**: Productos con stock < 5
- **Por categoría**: Plantas, Macetas, etc.

---

## 🔌 API

### Endpoints Principales

#### Productos
- `GET /api/products` - Listar productos (con paginación)
- `GET /api/products/[id]` - Obtener producto por ID
- `POST /api/products` - Crear producto (requiere auth)
- `PUT /api/products/[id]` - Actualizar producto (requiere auth)
- `DELETE /api/products/[id]` - Eliminar producto (requiere auth)

#### Órdenes
- `GET /api/orders` - Listar órdenes (requiere auth)
- `GET /api/orders/[id]` - Obtener orden por ID
- `POST /api/orders` - Crear orden
- `PUT /api/orders/[id]` - Actualizar orden (requiere auth)

#### MercadoPago
- `POST /api/mercadopago/create-preference` - Crear preferencia de pago
- `POST /api/mercadopago/webhook` - Webhook de notificaciones

#### Autenticación
- `POST /api/admin/auth/login` - Login de admin
- `GET /api/admin/auth/me` - Verificar sesión

### Autenticación de Admin

Las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer [TOKEN_JWT]
```

El middleware verifica automáticamente el token en rutas `/admin/*`

---

## 🐛 Troubleshooting

### Build Errors

**Problema**: "Module not found"
```bash
# Solución: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

**Problema**: "Type errors in TypeScript"
```bash
# Solución: Verificar tipos
npm run build
# Corregir los errores mostrados
```

### MercadoPago

**Problema**: Webhooks no funcionan en desarrollo
```bash
# Solución: Usar ngrok para tunnel
npm install -g ngrok
ngrok http 3000
# Actualizar NEXT_PUBLIC_BASE_URL con la URL de ngrok
```

**Problema**: Error "Invalid credentials"
- Verifica que estés usando las credenciales correctas (test o producción)
- Asegúrate de que MP_ACCESS_TOKEN sea válido
- Verifica que NEXT_PUBLIC_MP_PUBLIC_KEY corresponda al mismo entorno

### Emails

**Problema**: Emails no se envían
- Verifica que 2FA esté habilitado en Gmail
- Usa App Password (16 caracteres) y no tu contraseña normal
- Verifica GMAIL_USER y GMAIL_APP_PASSWORD en `.env.local`

**Problema**: Email marcado como spam
- Agrega remitente a contactos
- Considera usar servicio profesional (SendGrid, AWS SES)

### Supabase

**Problema**: "Invalid API key"
- Verifica que NEXT_PUBLIC_SUPABASE_URL sea correcto
- Verifica que las keys (anon y service_role) correspondan al proyecto

**Problema**: RLS policies
- Asegúrate de ejecutar `configure-rls-simplified.sql`
- Verifica permisos en Supabase Dashboard > Authentication > Policies

---

## 📚 Documentación Adicional

### Archivos de Documentación
- **CHANGELOG.md**: Historial completo de cambios y versiones
- **tasks.md**: Estado detallado del proyecto y tareas
- **documentacion-final.md**: Análisis de completitud (85-90%)
- **ANALISIS-PRE-ENTREGA.md**: Análisis pre-entrega completo
- **DIAGRAMA-FLUJO-SISTEMA.md**: Diagramas de flujo en Mermaid
- **PROMPT-DIAGRAMA-FLUJO.md**: Documentación de arquitectura

### Guías en la carpeta `scripts/`
- **README-SCRIPTS-FINALES.md**: Guía de scripts SQL
- **README-FASE-1.md**: Documentación de Fase 1
- **README-INSERTAR-CATEGORIAS.md**: Cómo insertar categorías

### Ejemplos
- **Ejemplo_Importacion_Productos.xlsx**: Plantilla para importación masiva
- **Ejemplo_Importacion_Productos.csv**: Versión CSV de la plantilla

---

## 📊 Estado del Proyecto

**Versión actual**: 2.1.0  
**Build status**: ✅ Exitoso  
**Funcionalidades core**: ✅ 100% completas  
**Optimizaciones**: ✅ Implementadas (SWR, caché)  
**Listo para producción**: ✅ Sí

### Próximas Mejoras (Post-lanzamiento)
- Optimizar modal "Ver Detalle" en historial
- Implementar Optimistic UI en completar orden
- Actualizar Node.js a v20+
- Implementar monitoreo en producción

---

## 👥 Soporte

Para problemas o consultas:
- Revisa la sección de [Troubleshooting](#-troubleshooting)
- Consulta la documentación en `/docs`
- Contacta al desarrollador: [TU_EMAIL]

---

## 📝 Licencia

Proyecto privado - Todos los derechos reservados

---

## 🙏 Agradecimientos

Construido con:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [MercadoPago](https://www.mercadopago.com.ar/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [SWR](https://swr.vercel.app/)

---

**Desarrollado con ❤️ para ViveroWeb**
