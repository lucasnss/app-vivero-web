# 📊 PROMPT PARA CREAR DIAGRAMA DE FLUJO - ViveroWeb

## 🎯 Objetivo
Crear un diagrama de flujo completo que represente el sistema actual de ViveroWeb, incluyendo todos los flujos de usuario, procesos de negocio y componentes principales.

---

## 📋 Información del Sistema

### **Arquitectura General**
- **Framework**: Next.js 14 (App Router)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: JWT para administradores
- **Pago**: MercadoPago (integración)
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes

### **Tipos de Usuarios**
1. **Invitados (Guest)**: Navegación libre sin registro
2. **Administradores (Admin)**: Acceso al panel de administración con login

---

## 🔄 Flujos Principales a Documentar

### **1. FLUJO DE CLIENTE INVITADO (Compra)**

#### **1.1 Navegación y Búsqueda**
- Usuario accede a la página principal (`/`)
- Visualiza productos destacados
- Navega por categorías (`/plantas`, `/macetas`, `/categorias`)
- Busca productos usando la barra de búsqueda
- Filtra productos por categoría
- Visualiza detalles de producto

#### **1.2 Carrito de Compras**
- Agrega productos al carrito (almacenado en localStorage)
- Accede a `/carrito`
- Modifica cantidades
- Elimina productos
- Selecciona opción de envío a domicilio
- Calcula total

#### **1.3 Checkout y Pago**
- Accede a `/carrito/pago`
- Completa formulario con:
  - Información personal (nombre, email, teléfono)
  - Dirección de envío completa
  - Método de pago (MercadoPago o Efectivo)
  - Notas adicionales
- Valida información del cliente
- Valida stock disponible

#### **1.4 Proceso de Pago**

**Si elige MercadoPago:**
- Crea preferencia de pago en `/api/mercadopago/create-preference`
- Crea orden en estado "pending" en base de datos
- Redirige a MercadoPago
- Usuario completa pago en MercadoPago
- Webhook de MercadoPago notifica resultado (`/api/mercadopago/webhook`)
- Si pago exitoso:
  - Orden se marca como "approved"
  - Stock se reduce automáticamente
  - Redirige a `/pago/success`
- Si pago fallido:
  - Orden se marca como "rejected"
  - Redirige a `/pago/failure`
- Si pago pendiente:
  - Orden queda en "pending"
  - Redirige a `/pago/pending`

**Si elige Efectivo:**
- Crea orden en estado "pending" en base de datos
- Orden queda pendiente de confirmación manual por admin
- Redirige a página de confirmación

#### **1.5 Consulta de Pedidos**
- Invitado puede consultar pedidos por email
- Accede a endpoint `/api/orders/guest/[email]`
- Visualiza estado y detalles del pedido

---

### **2. FLUJO DE ADMINISTRADOR**

#### **2.1 Autenticación**
- Accede a `/login`
- Ingresa email y contraseña
- Sistema valida credenciales en `/api/admin/auth/login`
- Verifica usuario en tabla `admins` de Supabase
- Genera token JWT
- Almacena token en cookie `admin-token`
- Redirige a `/admin`

#### **2.2 Panel de Administración**
- Accede a `/admin` (protegido por middleware)
- Middleware verifica token JWT
- Si no autenticado, redirige a `/login?returnUrl=/admin`

#### **2.3 Gestión de Productos**
- Visualiza lista de productos
- Busca y filtra productos
- **Crear producto:**
  - Completa formulario
  - Sube imágenes (máximo 3)
  - Selecciona categoría
  - Define precio, stock, descripción
  - Guarda en `/api/products` (POST)
- **Editar producto:**
  - Modifica información
  - Actualiza imágenes
  - Guarda cambios en `/api/products/[id]` (PUT)
- **Eliminar producto:**
  - Confirma eliminación
  - Elimina en `/api/products/[id]` (DELETE)
- **Importar productos:**
  - Sube archivo Excel/CSV
  - Sistema procesa y valida datos
  - Crea productos masivamente

#### **2.4 Gestión de Pedidos**
- Visualiza lista de pedidos en `/admin`
- Filtra por estado (pending, confirmed, completed, cancelled)
- **Ver detalle de pedido:**
  - Abre modal con información completa
  - Visualiza items, cliente, dirección
  - Ve historial de cambios
- **Gestionar pedido:**
  - Marca como completado
  - Cancela pedido
  - Actualiza estado de cumplimiento
  - Agrega notas internas
  - Actualiza en `/api/orders/[id]` (PUT)

#### **2.5 Gestión de Categorías**
- Visualiza categorías existentes
- Crea nuevas categorías
- Edita categorías
- Elimina categorías (si no tienen productos)

#### **2.6 Historial de Ventas**
- Accede a `/admin/sales-history`
- Visualiza reportes de ventas
- Filtra por fechas
- Exporta datos

#### **2.7 Logout**
- Cierra sesión
- Elimina token JWT
- Redirige a página principal

---

### **3. FLUJOS TÉCNICOS**

#### **3.1 Middleware de Autenticación**
- Intercepta todas las rutas `/admin/*`
- Verifica token JWT en cookies o headers
- Valida token con Supabase
- Agrega headers `x-admin-id`, `x-admin-email`, `x-admin-role` a request
- Si no autenticado, redirige a login

#### **3.2 Gestión de Carrito (LocalStorage)**
- Almacena items en `localStorage`
- Eventos `cart-updated` para sincronización
- Validación de stock antes de agregar
- Limpieza automática de items inválidos

#### **3.3 Subida de Imágenes**
- Usuario selecciona imágenes
- Validación de formato y tamaño
- Subida a Supabase Storage (`/api/images/upload`)
- URLs almacenadas en base de datos
- Optimización de imágenes

#### **3.4 Webhook de MercadoPago**
- MercadoPago envía notificación POST a `/api/mercadopago/webhook`
- Sistema verifica firma de MercadoPago
- Actualiza estado de orden
- Si pago aprobado:
  - Marca orden como "approved"
  - Reduce stock de productos
  - Registra actividad en logs
- Si pago rechazado:
  - Marca orden como "rejected"
  - Registra error en logs

#### **3.5 Sistema de Logs**
- Registra todas las acciones importantes
- Almacena en tabla `activity_logs`
- Incluye: acción, usuario, entidad, detalles, timestamp

---

## 🗄️ Estructura de Base de Datos

### **Tablas Principales**
1. **`products`**: Productos del catálogo
2. **`categories`**: Categorías de productos
3. **`orders`**: Pedidos de clientes
4. **`order_items`**: Items de cada pedido (con snapshots)
5. **`admins`**: Usuarios administradores
6. **`activity_logs`**: Registro de actividades

---

## 📐 Especificaciones del Diagrama

### **Elementos a Incluir**
1. **Nodos de inicio/fin**: Para cada flujo principal
2. **Procesos**: Operaciones del sistema
3. **Decisiones**: Puntos de bifurcación (diamantes)
4. **Conectores**: Flechas con etiquetas descriptivas
5. **Notas**: Aclaraciones importantes
6. **Swimlanes**: Separar flujos de cliente y admin

### **Colores Sugeridos**
- 🔵 Azul: Flujos de cliente invitado
- 🟢 Verde: Flujos de administrador
- 🟡 Amarillo: Procesos de pago
- 🔴 Rojo: Errores y validaciones
- ⚪ Gris: Procesos técnicos/backend

### **Niveles de Detalle**
1. **Nivel 1 (Alto)**: Flujos principales (cliente, admin, pago)
2. **Nivel 2 (Medio)**: Subprocesos dentro de cada flujo
3. **Nivel 3 (Bajo)**: Detalles técnicos y validaciones

---

## 📝 Notas Importantes

1. **Sin registro de usuarios**: El sistema NO tiene registro de usuarios. Solo admins tienen cuentas.
2. **Carrito en localStorage**: El carrito se almacena localmente, no en servidor.
3. **Validación de stock**: Se valida stock en múltiples puntos (agregar al carrito, checkout, pago).
4. **Snapshots en order_items**: Los items de pedido guardan snapshot del producto al momento de la compra.
5. **Middleware global**: Todas las rutas `/admin/*` están protegidas por middleware.
6. **Webhook asíncrono**: El webhook de MercadoPago procesa pagos de forma asíncrona.

---

## 🎨 Herramientas Recomendadas

- **Mermaid**: Para diagramas en Markdown
- **Draw.io / diagrams.net**: Para diagramas más complejos
- **Lucidchart**: Para diagramas profesionales
- **PlantUML**: Para diagramas basados en texto

---

## ✅ Checklist de Elementos

- [ ] Flujo completo de compra (invitado)
- [ ] Flujo de autenticación de admin
- [ ] Flujo de gestión de productos
- [ ] Flujo de gestión de pedidos
- [ ] Flujo de pago con MercadoPago
- [ ] Flujo de webhook de MercadoPago
- [ ] Validaciones y puntos de error
- [ ] Integración con base de datos
- [ ] Middleware y seguridad
- [ ] Sistema de logs

---

## 📌 Ejemplo de Estructura Sugerida

```
DIAGRAMA PRINCIPAL
├── FLUJO CLIENTE INVITADO
│   ├── Navegación
│   ├── Carrito
│   ├── Checkout
│   └── Pago
├── FLUJO ADMINISTRADOR
│   ├── Login
│   ├── Panel Admin
│   ├── Gestión Productos
│   └── Gestión Pedidos
└── FLUJOS TÉCNICOS
    ├── Middleware
    ├── Webhook MP
    └── Base de Datos
```

---

**Fecha de creación**: 2025-01-27
**Versión del sistema**: 2.0.0

