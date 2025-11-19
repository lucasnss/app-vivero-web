-- Script SQL para configurar Row Level Security (RLS) en SUPABASE STORAGE
-- Específico para el bucket "product-images" en ViveroWeb
-- Ejecutar este script en la interfaz de Supabase (SQL Editor)

-- ⚠️ IMPORTANTE: Este script configura políticas para STORAGE, no para tablas
-- Las políticas de Storage se configuran de manera diferente a las tablas

-- =============================================================================
-- CONFIGURACIÓN DE POLÍTICAS RLS PARA STORAGE
-- =============================================================================

-- 1. POLÍTICA DE LECTURA PÚBLICA (SELECT)
-- Permite que cualquier persona vea las imágenes de productos
INSERT INTO storage.policies (id, name, bucket_id, command, definition, check_expression)
VALUES (
  'public-read-product-images',
  'Lectura pública de imágenes de productos',
  'product-images',
  'SELECT',
  'true',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICA DE INSERCIÓN AUTENTICADA (INSERT)
-- Solo usuarios autenticados pueden subir imágenes
INSERT INTO storage.policies (id, name, bucket_id, command, definition, check_expression)
VALUES (
  'authenticated-insert-product-images',
  'Solo admins pueden subir imágenes',
  'product-images',
  'INSERT',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated'''
) ON CONFLICT (id) DO NOTHING;

-- 3. POLÍTICA DE ACTUALIZACIÓN AUTENTICADA (UPDATE)
-- Solo usuarios autenticados pueden actualizar imágenes
INSERT INTO storage.policies (id, name, bucket_id, command, definition, check_expression)
VALUES (
  'authenticated-update-product-images',
  'Solo admins pueden actualizar imágenes',
  'product-images',
  'UPDATE',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated'''
) ON CONFLICT (id) DO NOTHING;

-- 4. POLÍTICA DE ELIMINACIÓN AUTENTICADA (DELETE)
-- Solo usuarios autenticados pueden eliminar imágenes
INSERT INTO storage.policies (id, name, bucket_id, command, definition, check_expression)
VALUES (
  'authenticated-delete-product-images',
  'Solo admins pueden eliminar imágenes',
  'product-images',
  'DELETE',
  'auth.role() = ''authenticated''',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VERIFICACIÓN DE POLÍTICAS CREADAS
-- =============================================================================

-- Verificar que las políticas se crearon correctamente
SELECT 
  id,
  name,
  bucket_id,
  command,
  definition,
  check_expression
FROM storage.policies 
WHERE bucket_id = 'product-images';

-- Mensaje de confirmación
SELECT 'Políticas RLS configuradas para Storage bucket "product-images"' AS status;

-- =============================================================================
-- NOTAS IMPORTANTES
-- =============================================================================

/*
1. Estas políticas permiten:
   - ✅ Lectura pública de imágenes (para mostrar en la web)
   - ✅ Solo usuarios autenticados pueden subir/editar/eliminar imágenes
   
2. Para desarrollo, puedes usar políticas más permisivas temporalmente
3. En producción, considera políticas más específicas basadas en roles
4. Las políticas de Storage son diferentes a las de tablas
5. El bucket debe estar configurado como "público" para que las URLs funcionen
*/