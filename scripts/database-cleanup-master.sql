-- 🧹 SCRIPT MAESTRO DE LIMPIEZA DE BASE DE DATOS - VIVERO WEB
-- ⚠️  SOLO PARA DESARROLLO - NO EJECUTAR EN PRODUCCIÓN
-- Este script resetea completamente la base de datos al estado inicial

-- =============================================================================
-- 🚨 ADVERTENCIA DE SEGURIDAD
-- =============================================================================
-- Este script ELIMINARÁ TODOS LOS DATOS de la base de datos
-- Solo ejecutar en entorno de desarrollo o testing
-- =============================================================================

-- 🧹 Iniciando limpieza completa de base de datos...

-- =============================================================================
-- PASO 1: DESACTIVAR RLS Y ELIMINAR POLÍTICAS
-- =============================================================================

-- 📋 Paso 1: Desactivando RLS y eliminando políticas...

-- Desactivar RLS en todas las tablas
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Only admins can create products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only super_admins can delete products" ON products;
DROP POLICY IF EXISTS "Only authenticated admins can create products" ON products;
DROP POLICY IF EXISTS "Only authenticated admins can update products" ON products;
DROP POLICY IF EXISTS "dev_products_full_access" ON products;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Only admins can create categories" ON categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
DROP POLICY IF EXISTS "Only super_admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Only authenticated admins can create categories" ON categories;
DROP POLICY IF EXISTS "Only authenticated admins can update categories" ON categories;
DROP POLICY IF EXISTS "dev_categories_full_access" ON categories;

-- Eliminar políticas de otras tablas si existen
DROP POLICY IF EXISTS "Only admins can view activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Only admins can view orders" ON orders;
DROP POLICY IF EXISTS "Only admins can view order items" ON order_items;
DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users;

-- =============================================================================
-- PASO 2: LIMPIAR DATOS DE TODAS LAS TABLAS
-- =============================================================================

-- 🗑️  Paso 2: Eliminando todos los datos...

-- Limpiar datos en orden correcto (respetando foreign keys)
DO $$
BEGIN
    -- Truncar tablas en orden correcto si existen
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        TRUNCATE TABLE order_items CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        TRUNCATE TABLE orders CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        TRUNCATE TABLE activity_logs CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        TRUNCATE TABLE admin_users CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        TRUNCATE TABLE users CASCADE;
    END IF;
    
    -- Verificar tablas principales antes de truncar
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        TRUNCATE TABLE products CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        TRUNCATE TABLE categories CASCADE;
    END IF;
END $$;

-- =============================================================================
-- PASO 3: ELIMINAR TABLAS OBSOLETAS (si existen)
-- =============================================================================

-- 🔨 Paso 3: Eliminando tablas obsoletas...

-- Eliminar tabla users del sistema viejo si existe
DROP TABLE IF EXISTS users CASCADE;

-- =============================================================================
-- PASO 4: RESETEAR SECUENCIAS Y FUNCIONES
-- =============================================================================

-- 🔄 Paso 4: Reseteando secuencias y funciones...

-- Recrear función de updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- PASO 5: RECREAR ESTRUCTURA BÁSICA SI ES NECESARIO
-- =============================================================================

-- 🏗️  Paso 5: Verificando estructura básica...

-- Verificar que la tabla products existe con estructura correcta
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID,
  price DECIMAL NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image TEXT,
  images TEXT[] DEFAULT '{}',
  scientific_name TEXT,
  care TEXT,
  characteristics TEXT,
  origin TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verificar que la tabla categories existe
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar foreign key de products a categories si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_category_id_fkey'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT products_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =============================================================================
-- PASO 6: RECREAR TRIGGERS
-- =============================================================================

-- ⚡ Paso 6: Recreando triggers...

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;

-- Recrear triggers
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- PASO 7: CONFIGURAR RLS PARA DESARROLLO
-- =============================================================================

-- 🔒 Paso 7: Configurando RLS para desarrollo...

-- Activar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo
CREATE POLICY "dev_products_full_access" ON products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "dev_categories_full_access" ON categories
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- PASO 8: INSERTAR DATOS BÁSICOS DE DESARROLLO
-- =============================================================================

-- 📊 Paso 8: Insertando datos básicos...

-- Insertar categorías básicas
INSERT INTO categories (name, description, display_order) VALUES
('Plantas de Interior', 'Plantas ideales para decorar espacios interiores', 1),
('Plantas de Exterior', 'Plantas resistentes para jardines y balcones', 2),
('Macetas y Contenedores', 'Macetas de diferentes tamaños y materiales', 3),
('Herramientas de Jardinería', 'Herramientas básicas para el cuidado de plantas', 4),
('Sustratos y Fertilizantes', 'Tierra, abonos y productos para el crecimiento', 5)
ON CONFLICT (name) DO NOTHING;

-- Obtener IDs de categorías para productos de ejemplo
DO $$
DECLARE
    cat_interior UUID;
    cat_exterior UUID;
    cat_macetas UUID;
BEGIN
    SELECT id INTO cat_interior FROM categories WHERE name = 'Plantas de Interior' LIMIT 1;
    SELECT id INTO cat_exterior FROM categories WHERE name = 'Plantas de Exterior' LIMIT 1;
    SELECT id INTO cat_macetas FROM categories WHERE name = 'Macetas y Contenedores' LIMIT 1;
    
    -- Insertar productos básicos de ejemplo
    INSERT INTO products (name, description, category_id, price, stock, scientific_name, care, featured) VALUES
    ('Monstera Deliciosa', 'Planta de interior con hojas grandes y decorativas', cat_interior, 2500.00, 10, 'Monstera deliciosa', 'Riego moderado, luz indirecta', true),
    ('Pothos Dorado', 'Planta colgante ideal para principiantes', cat_interior, 1200.00, 15, 'Epipremnum aureum', 'Riego cuando la tierra esté seca', true),
    ('Lavanda', 'Planta aromática perfecta para jardines', cat_exterior, 800.00, 20, 'Lavandula angustifolia', 'Pleno sol, riego escaso', false),
    ('Maceta Terracota 20cm', 'Maceta clásica de terracota', cat_macetas, 450.00, 30, NULL, 'Lavar antes del primer uso', false)
    ON CONFLICT (name) DO NOTHING;
END $$;

-- =============================================================================
-- CONFIRMACIÓN FINAL
-- =============================================================================

-- Mostrar resumen final
SELECT 
    '✅ LIMPIEZA COMPLETA FINALIZADA' as status,
    (SELECT COUNT(*) FROM categories) as categorias_creadas,
    (SELECT COUNT(*) FROM products) as productos_creados,
    NOW() as timestamp_limpieza;

-- ✅ Limpieza de base de datos completada exitosamente!
-- 📊 Base de datos reseteada al estado inicial de desarrollo
-- 🔒 RLS configurado en modo desarrollo (acceso completo)
-- 📋 Datos básicos de ejemplo insertados

-- =============================================================================
-- NOTAS IMPORTANTES
-- =============================================================================
-- 
-- ✅ QUE HACE ESTE SCRIPT:
-- - Elimina TODOS los datos de todas las tablas
-- - Resetea políticas RLS a modo desarrollo
-- - Recrea estructura básica si es necesario
-- - Inserta datos básicos de ejemplo
-- - Configura triggers y funciones
--
-- ⚠️  CUANDO USAR:
-- - Al iniciar desarrollo desde cero
-- - Después de cambios importantes en el esquema
-- - Para limpiar datos de testing
-- - Cuando la DB esté en estado inconsistente
--
-- 🚨 NUNCA USAR EN PRODUCCIÓN
-- 
-- =============================================================================