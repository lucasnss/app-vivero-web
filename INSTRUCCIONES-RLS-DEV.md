# 🔧 Instrucciones: Configurar RLS para Desarrollo

## 🚨 Problema Identificado

Los tests de creación de productos están fallando con el error:
```
"new row violates row-level security policy for table 'products'"
```

Esto se debe a que **Row Level Security (RLS)** está activo en Supabase y las políticas actuales requieren autenticación de administrador para crear productos.

## 🎯 Solución Temporal

Para continuar con el desarrollo y testing, necesitamos configurar políticas de RLS más permisivas.

## 📝 Pasos a Seguir

### 1. Acceder a Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto ViveroWeb
4. Ve a la sección **SQL Editor**

### 2. Ejecutar Script de Desarrollo

1. En el SQL Editor, copia y pega todo el contenido del archivo:
   ```
   Fronted/scripts/configure-rls-dev.sql
   ```

2. **Ejecuta el script** haciendo clic en "Run"

3. Deberías ver un mensaje de confirmación:
   ```
   RLS configurado para DESARROLLO - Políticas permisivas activas
   ```

### 3. Verificar Configuración

Después de ejecutar el script, verifica que:
- ✅ Las tablas `products`, `categories`, y `activity_logs` tengan RLS activo
- ✅ Existan políticas con nombres que empiecen con `dev_`
- ✅ Los comentarios de las tablas mencionen "RLS-DEV"

## 🧪 Probar los Cambios

Una vez ejecutado el script:

1. **Regresa a tu terminal** en el proyecto
2. **Ejecuta el test de debug:**
   ```bash
   cd Fronted
   node test-debug-create.js
   ```
3. **Deberías ver:** Status 201 (éxito) en lugar de Status 500

## ⚠️ IMPORTANTE - Seguridad

### 🔒 Para Producción

Este script es **SOLO PARA DESARROLLO**. En producción:

1. **NO uses** `configure-rls-dev.sql`
2. **Usa** `configure-rls.sql` (políticas seguras)
3. **Implementa** autenticación de administradores
4. **Configura** roles y permisos apropiados

### 🔄 Restaurar Políticas Seguras

Cuando termines el desarrollo, ejecuta:
```sql
-- Eliminar políticas de desarrollo
DROP POLICY "dev_products_full_access" ON products;
DROP POLICY "dev_categories_full_access" ON categories;
DROP POLICY "dev_activity_logs_full_access" ON activity_logs;

-- Luego ejecutar configure-rls.sql para políticas de producción
```

## 📊 Resultado Esperado

Después de la configuración:
- ✅ Tests de API funcionando al 100%
- ✅ Creación de productos exitosa
- ✅ Todas las operaciones CRUD funcionando
- ✅ Validaciones de datos operativas

## 🔗 Próximos Pasos

1. **Corregir RLS** (este documento)
2. **Completar testing** de todos los endpoints
3. **Implementar autenticación** de administradores
4. **Migrar a políticas** de producción

---

**🎯 Objetivo:** Tener un entorno de desarrollo completamente funcional para poder continuar con la implementación de funcionalidades sin obstáculos de permisos. 