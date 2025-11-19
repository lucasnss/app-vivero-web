# 🔄 PLAN ACTUALIZADO - Solo Admin e Invitados

## 🎯 **Nuevo Enfoque del Sistema**

El plan ha sido **completamente reestructurado** para eliminar el sistema de registro de usuarios y simplificar a:

### **👥 Tipos de Usuarios:**
- **🔐 Admin/Super Admin**: Login escondido para gestión del sistema
- **👤 Invitados**: Navegación libre y compras sin registro

---

## 📊 **Cambios Principales**

### **❌ ELIMINADO:**
- Sistema completo de registro de usuarios
- Tabla `users` con perfiles de usuario
- APIs de signup/registro de usuarios
- Páginas de perfil de usuario
- Historial de pedidos por usuario
- Sistema de autenticación Supabase Auth

### **✅ NUEVO ENFOQUE:**
- Solo login de admin (simple y directo)
- Tabla `admin_users` para administradores
- Pedidos de invitados con información embebida
- Checkout que recolecta datos al momento de compra
- Sistema de autenticación propio para admins

---

## 🗄️ **Esquema de Base de Datos Actualizado**

### **Tablas Finales:**
1. **`products`** ✅ (sin cambios)
2. **`categories`** ✅ (sin cambios)  
3. **`activity_logs`** ✅ (sin cambios)
4. **`orders`** 🔄 (ACTUALIZADA para invitados)
5. **`order_items`** 🔄 (ACTUALIZADA con snapshots)
6. **`admin_users`** 🆕 (NUEVA - solo admins)

### **Tabla Orders (Nueva Estructura):**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_info JSONB NOT NULL,      -- {name, email, phone, address}
  status TEXT NOT NULL,
  total_amount DECIMAL NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT,
  notes TEXT,                        -- Notas del cliente
  admin_notes TEXT,                  -- Notas internas del admin
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### **Tabla Admin Users:**
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',         -- 'admin' | 'super_admin'
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## 🔒 **Seguridad Simplificada (RLS)**

### **Políticas de Acceso:**

**📦 Products & Categories:**
- ✅ Lectura: **Pública** (todos)
- ✅ Escritura: **Solo admins autenticados**

**📋 Orders & Order Items:**
- ✅ Creación: **Pública** (invitados pueden crear pedidos)
- ✅ Lectura/Gestión: **Solo admins autenticados**

**👤 Admin Users:**
- ✅ **Solo admins autenticados** pueden acceder
- ✅ Super admins pueden gestionar otros admins

**📊 Activity Logs:**
- ✅ Lectura: **Solo admins**
- ✅ Escritura: **Sistema automático**

---

## 🛠️ **Servicios Actualizados**

### **Nuevos Servicios:**
1. **`adminAuthService.ts`** - Login/logout de admins
2. **`adminService.ts`** - Gestión de administradores  
3. **`orderService.ts`** - Pedidos de invitados actualizado

### **Servicios Sin Cambios:**
- ✅ `productService.ts`
- ✅ `categoryService.ts` 
- ✅ `cartService.ts`
- ✅ `logService.ts`

---

## 🌐 **API Routes Actualizadas**

### **Nuevas APIs de Admin:**
- `/app/api/admin/auth/login` - Login de admin
- `/app/api/admin/auth/logout` - Logout  
- `/app/api/admin/auth/me` - Perfil actual
- `/app/api/admin/users/*` - Gestión de admins

### **APIs de Pedidos Actualizadas:**
- `/app/api/orders` - CRUD de pedidos (solo admins leen)
- `/app/api/orders/guest/[email]` - Consulta de invitados por email

### **APIs Sin Cambios:**
- ✅ `/app/api/products`
- ✅ `/app/api/categories`
- ✅ `/app/api/cart` (será simplificada)

---

## 🎨 **Frontend Actualizado**

### **Nuevas Páginas/Componentes:**
- **Login de Admin**: Página oculta (ej: `/admin/login`)
- **Checkout de Invitados**: Formulario completo de datos del cliente
- **Consulta de Pedidos**: Página para que invitados consulten por email

### **Páginas Actualizadas:**
- **`/admin`**: Protegida con autenticación de admin
- **`/carrito/pago`**: Recolecta toda la información del cliente
- **`/carrito/revisar`**: Muestra resumen antes de confirmar

### **Páginas Eliminadas:**
- ❌ Registro/Login de usuarios
- ❌ Perfil de usuario  
- ❌ Historial de pedidos por usuario

---

## 📋 **Flujo de Compra para Invitados**

### **Proceso Simplificado:**
1. **Navegación libre** - Ver productos, categorías, agregar al carrito
2. **Ir al carrito** - Revisar productos seleccionados
3. **Checkout** - Llenar formulario con:
   - Información personal (nombre, email, teléfono)
   - Dirección de envío
   - Método de pago
   - Notas adicionales
4. **Confirmar pedido** - Crear pedido en la base de datos
5. **Confirmación** - Mostrar número de pedido y detalles
6. **Consulta posterior** - Consultar estado por email

---

## 🔧 **Beneficios del Nuevo Enfoque**

### **✅ Ventajas:**
- **Simplicidad**: Menos código, menos complejidad
- **UX Mejorada**: No fricción para comprar
- **Mantenimiento**: Menos tablas y relaciones
- **Seguridad**: Menos superficie de ataque
- **Performance**: Menos consultas complejas

### **📈 Funcionalidades Mantenidas:**
- ✅ Catálogo completo de productos
- ✅ Carrito de compras avanzado
- ✅ Panel de admin completo  
- ✅ Gestión de pedidos
- ✅ Sistema de búsqueda y filtros
- ✅ Logs de actividad

---

## 🚀 **Scripts Actualizados**

### **Archivos Nuevos:**
- ✅ `create-missing-tables-simplified.sql`
- ✅ `configure-rls-simplified.sql`
- ✅ `src/types/admin.ts`
- ✅ `src/types/order.ts` (actualizado)

### **Próximos Pasos:**
1. **Ejecutar scripts SQL** en Supabase
2. **Implementar servicios** de admin y pedidos
3. **Crear APIs** de admin y pedidos actualizadas
4. **Actualizar frontend** con login de admin y checkout de invitados

---

## 📞 **Notas Importantes**

- **Login de Admin**: Será una página escondida (ej: `/admin/login`)
- **Passwords**: Usar bcrypt para hash seguro
- **Tokens**: JWT simples para sesiones de admin
- **Consulta de Pedidos**: Los invitados pueden consultar por email
- **Sin Registro**: Los clientes nunca necesitan crear cuenta

Este enfoque es **mucho más simple** y adecuado para un vivero que quiere eliminar fricciones en las compras. 