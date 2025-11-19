# 📂 Scripts Finales de Base de Datos - Vivero Web

## 🧹 **Limpieza Completada**

Se han eliminado **8 scripts obsoletos** del sistema anterior que usaba usuarios registrados. El proyecto ahora utiliza un sistema simplificado con **solo administradores e invitados**.

---

## 📋 **Scripts Actuales Disponibles**

### **🚀 Scripts de Configuración Principal**

#### **1. `create-missing-tables-simplified.sql`**

- **Propósito**: Crear todas las tablas necesarias para el sistema simplificado
- **Tablas que crea**:
  - `orders` - Pedidos de invitados con información embebida
  - `order_items` - Items de pedidos con snapshots de productos
  - `admin_users` - Solo para administradores del sistema
- **Cuándo usar**: Primera configuración del proyecto
- **Estado**: ✅ Actualizado para sistema actual

#### **2. `configure-rls-simplified.sql`**

- **Propósito**: Configurar Row Level Security para producción
- **Políticas que crea**:
  - Productos: lectura pública, escritura solo admins autenticados
  - Categorías: lectura pública, escritura solo admins autenticados
  - Pedidos: creación pública, gestión solo admins
  - Admin Users: solo admins autenticados
- **Cuándo usar**: Para configurar seguridad de producción
- **Estado**: ✅ Actualizado para sistema actual

#### **3. `configure-rls-dev-simple.sql`**

- **Propósito**: RLS permisivo para desarrollo y testing
- **Configuración**: Políticas que permiten acceso completo a products y categories
- **Cuándo usar**: Durante desarrollo para evitar problemas de permisos
- **Estado**: ✅ En uso actualmente (según Tarea 5.1.2 en tasks.md)

---

### **🔧 Scripts de Utilidad**

#### **4. `verify-rls-status.sql`**

- **Propósito**: Verificar el estado de RLS y políticas activas
- **Información que muestra**:
  - Estado de RLS en cada tabla
  - Políticas existentes
  - Tipo de política (desarrollo vs producción)
- **Cuándo usar**: Para diagnóstico y verificación
- **Estado**: ✅ Útil para mantenimiento

#### **5. `check-database-schema.ts`**

- **Propósito**: Script TypeScript para verificar esquema de BD
- **Funcionalidad**: Validación programática de estructura
- **Cuándo usar**: Testing automatizado o verificación desde código
- **Estado**: ✅ Útil para automatización

#### **6. `check-tables-simple.ts`**
- **Propósito**: Verificación rápida de tablas principales
- **Funcionalidad**: Check básico de existencia de tablas
- **Cuándo usar**: Verificación rápida durante desarrollo
- **Estado**: ✅ Útil para desarrollo

#### **7. `remove-unnecessary-product-columns.sql`**
- **Propósito**: Limpiar columnas innecesarias de la tabla products
- **Funcionalidad**: Elimina columnas que no se usan en el frontend
- **Cuándo usar**: Si se necesita limpiar estructura de products
- **Estado**: ✅ Disponible si se necesita

---

### **🧹 Script Maestro de Limpieza**

#### **8. `database-cleanup-master.sql` (NUEVO)**
- **Propósito**: Resetear completamente la base de datos al estado inicial
- **Funcionalidades**:
  - ❌ Elimina TODOS los datos de todas las tablas
  - 🔄 Resetea políticas RLS a modo desarrollo
  - 🏗️ Recrea estructura básica si es necesario
  - 📊 Inserta datos básicos de ejemplo (5 categorías, 4 productos)
  - ⚡ Configura triggers y funciones
- **Cuándo usar**:
  - Al iniciar desarrollo desde cero
  - Después de cambios importantes en el esquema
  - Para limpiar datos de testing
  - Cuando la DB esté en estado inconsistente
- **⚠️ ADVERTENCIA**: SOLO para desarrollo - NUNCA en producción

---

## 🗑️ **Scripts Eliminados (Obsoletos)**

Los siguientes scripts fueron eliminados porque usaban el sistema anterior:

1. ❌ `create-missing-tables.sql` - Usaba tabla `users` con `auth.users`
2. ❌ `configure-rls.sql` - Políticas para `auth.users`
3. ❌ `create-admin-user.sql` - Creaba admin en tabla `users` vieja
4. ❌ `create-admin-user-corrected.sql` - Seguía usando tabla `users`
5. ❌ `simplify-to-single-role.sql` - Modificaba tabla `users` obsoleta
6. ❌ `migrate-data.ts` - Script de migración ya ejecutado
7. ❌ `migrate-data-with-env.ts` - Script de migración ya ejecutado
8. ❌ `create-activity-logs-table.sql` - Usaba `auth.users` inexistente

---

## 🚀 **Flujo de Configuración Recomendado**

### **Para Nueva Instalación:**
1. Ejecutar `create-missing-tables-simplified.sql`
2. Ejecutar `configure-rls-dev-simple.sql` (para desarrollo)
3. Verificar con `verify-rls-status.sql`

### **Para Desarrollo:**
- Usar `configure-rls-dev-simple.sql` (políticas permisivas)
- Usar `database-cleanup-master.sql` cuando necesites resetear

### **Para Producción (Futuro):**
1. Asegurar que la autenticación de admin funciona
2. Crear administradores en tabla `admin_users`
3. Migrar a `configure-rls-simplified.sql` (políticas seguras)
4. Verificar con `verify-rls-status.sql`

---

## 📋 **Estado Actual del Proyecto**

Según `tasks.md`, el proyecto está en:
- ✅ **FASE 1-4**: Completadas (servicios, APIs, autenticación)
- ⚠️ **Tarea 19**: Pendiente - Migrar RLS de desarrollo a producción
- 🔒 **RLS Actual**: Modo desarrollo (políticas permisivas)

---

## 🔄 **Próximos Pasos**

1. **Inmediato**: Continuar usando `configure-rls-dev-simple.sql`
2. **Cuando esté listo para producción**: 
   - Completar Tarea 19 en `tasks.md`
   - Migrar a `configure-rls-simplified.sql`
3. **Para limpiar DB**: Usar `database-cleanup-master.sql`

---

## 📞 **Notas Importantes**

- **Sistema Actual**: Solo admin e invitados (NO hay registro de usuarios)
- **RLS**: Configurado en modo desarrollo (acceso permisivo)
- **Limpieza**: El script maestro es seguro solo para desarrollo
- **Producción**: Requiere migración a políticas RLS seguras

---

**Última actualización**: Scripts limpiados y organizados según sistema simplificado actual