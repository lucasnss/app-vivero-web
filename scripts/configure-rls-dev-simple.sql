-- Script SQL para configurar Row Level Security (RLS) en modo DESARROLLO
-- VERSIÓN SIMPLIFICADA - Solo products y categories
-- SOLO PARA TESTING Y DESARROLLO - NO USAR EN PRODUCCIÓN
-- Ejecutar este script en la interfaz de Supabase (SQL Editor)

-- Desactivar RLS temporalmente para hacer las configuraciones
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen en products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Only admins can create products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only super_admins can delete products" ON products;

-- Eliminar políticas existentes si existen en categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Only admins can create categories" ON categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
DROP POLICY IF EXISTS "Only super_admins can delete categories" ON categories;

-- Reactivar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PERMISIVAS PARA DESARROLLO

-- PRODUCTS - Acceso completo para desarrollo
CREATE POLICY "dev_products_full_access" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- CATEGORIES - Acceso completo para desarrollo  
CREATE POLICY "dev_categories_full_access" ON categories
  FOR ALL USING (true) WITH CHECK (true);

-- Comentarios para recordar que es temporal
COMMENT ON TABLE products IS 'RLS-DEV: Acceso completo temporal para desarrollo';
COMMENT ON TABLE categories IS 'RLS-DEV: Acceso completo temporal para desarrollo';

-- Mensaje de confirmación
SELECT 'RLS configurado para DESARROLLO - Políticas permisivas activas (products y categories)' AS status; 