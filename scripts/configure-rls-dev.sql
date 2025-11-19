-- Script SQL para configurar Row Level Security (RLS) en modo DESARROLLO
-- SOLO PARA TESTING Y DESARROLLO - NO USAR EN PRODUCCIÓN
-- Ejecutar este script en la interfaz de Supabase (SQL Editor)

-- Desactivar RLS temporalmente para hacer las configuraciones
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
-- Agregar tabla users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Only admins can create products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only super_admins can delete products" ON products;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Only admins can create categories" ON categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
DROP POLICY IF EXISTS "Only super_admins can delete categories" ON categories;

DROP POLICY IF EXISTS "Only admins can view activity logs" ON activity_logs;
DROP POLICY IF EXISTS "System can create activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Only super_admins can update activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Only super_admins can delete activity logs" ON activity_logs;

-- Eliminar políticas de users si existen
DROP POLICY IF EXISTS "Only admins can view users" ON users;
DROP POLICY IF EXISTS "Only super_admins can create users" ON users;
DROP POLICY IF EXISTS "Only super_admins can update users" ON users;
DROP POLICY IF EXISTS "Only super_admins can delete users" ON users;

-- Reactivar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
-- Reactivar RLS para users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PERMISIVAS PARA DESARROLLO

-- PRODUCTS - Acceso completo para desarrollo
CREATE POLICY "dev_products_full_access" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- CATEGORIES - Acceso completo para desarrollo  
CREATE POLICY "dev_categories_full_access" ON categories
  FOR ALL USING (true) WITH CHECK (true);

-- ACTIVITY_LOGS - Acceso completo para desarrollo
CREATE POLICY "dev_activity_logs_full_access" ON activity_logs
  FOR ALL USING (true) WITH CHECK (true);

-- USERS - Acceso completo para desarrollo (CRÍTICO para autenticación)
CREATE POLICY "dev_users_full_access" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Comentarios para recordar que es temporal
COMMENT ON TABLE products IS 'RLS-DEV: Acceso completo temporal para desarrollo';
COMMENT ON TABLE categories IS 'RLS-DEV: Acceso completo temporal para desarrollo';
COMMENT ON TABLE activity_logs IS 'RLS-DEV: Acceso completo temporal para desarrollo';
COMMENT ON TABLE users IS 'RLS-DEV: Acceso completo temporal para desarrollo';

-- Mensaje de confirmación
SELECT 'RLS configurado para DESARROLLO - Políticas permisivas activas para products, categories, activity_logs y users' AS status; 