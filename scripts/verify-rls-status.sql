-- Script para verificar el estado de Row Level Security
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estado de RLS en las tablas principales
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Habilitado'
    ELSE '❌ RLS Deshabilitado'
  END as status
FROM pg_tables
WHERE tablename IN ('products', 'categories', 'activity_logs', 'admins')
  AND schemaname = 'public';

-- 2. Verificar políticas existentes por tabla
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN policyname LIKE 'dev_%' THEN '🚧 DESARROLLO'
    ELSE '🔒 PRODUCCIÓN'
  END as policy_type
FROM pg_policies 
WHERE tablename IN ('products', 'categories', 'activity_logs', 'admins')
ORDER BY tablename, policyname;

-- 3. Verificar si la tabla admins existe y tiene datos
SELECT 
  'admins' as tabla,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM admins;

-- 4. Verificar usuario administrador específico
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  CASE 
    WHEN password_hash IS NOT NULL THEN '✅ Password configurado'
    ELSE '❌ Sin password'
  END as password_status
FROM admins 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 5. Mensaje de estado general
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'admins' 
      AND policyname = 'dev_users_full_access'
    ) THEN '✅ RLS configurado correctamente para autenticación'
    ELSE '❌ Falta política RLS para tabla users'
  END as auth_status; 