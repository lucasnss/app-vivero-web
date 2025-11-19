-- 🔄 MIGRACIÓN: ELIMINAR SUPER_ADMIN Y DEJAR SOLO ADMIN
-- Script para simplificar el sistema de roles administrativos
-- Ejecutar después de setup-database-from-zero.sql

-- =============================================================================
-- 📋 OBJETIVO: Migrar de super_admin a admin (un solo nivel)
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. MIGRAR DATOS EXISTENTES
-- =============================================================================

-- Actualizar todos los registros de super_admin a admin
UPDATE admins 
SET role = 'admin' 
WHERE role = 'super_admin';

-- Verificar migración
SELECT 
    'Migración de datos completada' as status,
    role,
    COUNT(*) as cantidad
FROM admins 
GROUP BY role;

-- =============================================================================
-- 2. ACTUALIZAR SCHEMA DE LA TABLA
-- =============================================================================

-- Eliminar el constraint existente
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_role_check;

-- Cambiar el default de la columna
ALTER TABLE admins ALTER COLUMN role SET DEFAULT 'admin';

-- Agregar nuevo constraint que solo permite 'admin'
ALTER TABLE admins ADD CONSTRAINT admins_role_check 
    CHECK (role IN ('admin'));

-- =============================================================================
-- 3. ACTUALIZAR COMENTARIOS
-- =============================================================================

COMMENT ON COLUMN admins.role IS 'Rol del administrador: solo admin (simplificado)';

-- =============================================================================
-- 4. VERIFICACIÓN FINAL
-- =============================================================================

SELECT 
    '✅ MIGRACIÓN COMPLETADA' as status,
    COUNT(*) as total_admins,
    string_agg(DISTINCT role, ', ') as roles_existentes,
    NOW() as timestamp_migracion
FROM admins;

-- Mostrar admin por defecto actualizado
SELECT 
    'Admin por defecto actualizado:' as info,
    email,
    full_name,
    role,
    is_active
FROM admins 
WHERE email = 'admin@vivero.com';

COMMIT;

-- =============================================================================
-- 📋 PRÓXIMOS PASOS
-- =============================================================================
-- 
-- ✅ Base de datos migrada exitosamente
-- 🔄 Ahora actualizar código TypeScript:
--   1. src/types/admin.ts
--   2. src/types/user.ts
--   3. src/services/adminAuthService.ts
--   4. src/services/adminService.ts
--   5. src/lib/authorization.ts
--   6. src/lib/authMiddleware.ts
--   7. src/lib/validations.ts
-- 
-- 🧪 Testing recomendado después de cambios:
--   - Login de administrador
--   - Verificación de permisos
--   - CRUD de productos/categorías
-- 
-- =============================================================================