-- 🚀 INSERTAR CATEGORÍAS EN SUPABASE - VIVERO WEB
-- Script para insertar todas las categorías del vivero
-- Ejecutar en el SQL Editor de Supabase

-- =============================================================================
-- 📋 CATEGORÍAS A INSERTAR
-- =============================================================================

-- Limpiar categorías existentes (opcional - comentar si quieres mantener las existentes)
-- DELETE FROM categories;

-- Insertar categorías principales
INSERT INTO categories (id, name, description, icon, color, slug, featured, display_order, is_active) VALUES
-- Plantas
('550e8400-e29b-41d4-a716-446655440001', 'Plantas de interior', 'Plantas ideales para decorar espacios interiores', '🌿', 'bg-green-100 text-green-800', 'plantas-interior', true, 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'Plantas con flores', 'Plantas que producen hermosas flores', '🌸', 'bg-pink-100 text-pink-800', 'plantas-flores', true, 2, true),
('550e8400-e29b-41d4-a716-446655440003', 'Palmeras', 'Palmeras de diferentes tamaños y variedades', '🌴', 'bg-yellow-100 text-yellow-800', 'palmeras', false, 3, true),
('550e8400-e29b-41d4-a716-446655440004', 'Árboles', 'Árboles para jardines y espacios exteriores', '🌳', 'bg-brown-100 text-brown-800', 'arboles', false, 4, true),
('550e8400-e29b-41d4-a716-446655440005', 'Coníferas', 'Árboles y arbustos coníferos', '🌲', 'bg-green-100 text-green-800', 'coniferas', false, 5, true),
('550e8400-e29b-41d4-a716-446655440006', 'Arbustos', 'Arbustos ornamentales y decorativos', '🌿', 'bg-green-100 text-green-800', 'arbustos', false, 6, true),
('550e8400-e29b-41d4-a716-446655440007', 'Frutales', 'Árboles y plantas que producen frutos', '🍎', 'bg-red-100 text-red-800', 'frutales', false, 7, true),

-- Macetas
('550e8400-e29b-41d4-a716-446655440008', 'Macetas', 'Macetas de diferentes materiales y tamaños', '🪴', 'bg-blue-100 text-blue-800', 'macetas', true, 8, true),

-- Productos de jardinería
('550e8400-e29b-41d4-a716-446655440009', 'Fertilizantes', 'Fertilizantes y nutrientes para plantas', '🌱', 'bg-green-100 text-green-800', 'fertilizantes', false, 9, true),
('550e8400-e29b-41d4-a716-446655440010', 'Tierras y sustratos', 'Tierras y sustratos especializados', '🌍', 'bg-brown-100 text-brown-800', 'tierras-sustratos', false, 10, true),
('550e8400-e29b-41d4-a716-446655440011', 'Productos químicos', 'Productos químicos para el cuidado de plantas', '🧪', 'bg-yellow-100 text-yellow-800', 'productos-quimicos', false, 11, true),
('550e8400-e29b-41d4-a716-446655440012', 'Insumos de jardinería', 'Herramientas e insumos para jardinería', '🛠️', 'bg-blue-100 text-blue-800', 'insumos-jardineria', false, 12, true),

-- Decoración y souvenirs
('550e8400-e29b-41d4-a716-446655440013', 'Atrapasueños', 'Atrapasueños artesanales', '🕸️', 'bg-purple-100 text-purple-800', 'atrapasuenos', false, 13, true),
('550e8400-e29b-41d4-a716-446655440014', 'Adornos de jardín', 'Adornos y decoraciones para jardín', '🎨', 'bg-pink-100 text-pink-800', 'adornos-jardin', false, 14, true),
('550e8400-e29b-41d4-a716-446655440015', 'Souvenirs', 'Souvenirs y regalos relacionados con plantas', '🎁', 'bg-red-100 text-red-800', 'souvenirs', false, 15, true)

ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  slug = EXCLUDED.slug,
  featured = EXCLUDED.featured,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- =============================================================================
-- ✅ VERIFICACIÓN
-- =============================================================================

-- Verificar que se insertaron correctamente
SELECT 
  id, 
  name, 
  slug, 
  featured, 
  display_order, 
  is_active,
  created_at
FROM categories 
ORDER BY display_order, name;

-- Contar total de categorías
SELECT COUNT(*) as total_categories FROM categories; 