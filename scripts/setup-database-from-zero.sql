-- 🚀 SETUP BASE DE DATOS DESDE CERO - VIVERO WEB
-- Proyecto optimizado: Solo Administradores + Invitados
-- Ejecutar después de "Reset Project" en Supabase
-- Compatible con el estado actual del código

-- =============================================================================
-- 📋 TABLAS A CREAR
-- =============================================================================
-- ✅ products - Catálogo de productos
-- ✅ categories - Categorías de productos  
-- ✅ activity_logs - Logs del sistema
-- ✅ orders - Pedidos de invitados
-- ✅ order_items - Items de cada pedido
-- ✅ admins - Administradores del sistema (renombrado para claridad)
-- =============================================================================

-- =============================================================================
-- 1. TABLA CATEGORÍAS
-- =============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  slug TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. TABLA PRODUCTOS
-- =============================================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
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

-- =============================================================================
-- 3. TABLA ADMINISTRADORES (SIMPLIFICADA)
-- =============================================================================

CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin')),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. TABLA PEDIDOS (PARA INVITADOS)
-- =============================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_info JSONB NOT NULL, -- {name, email, phone, address}
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL NOT NULL CHECK (total_amount > 0),
  shipping_address JSONB NOT NULL,
  payment_method TEXT,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. TABLA ITEMS DE PEDIDOS
-- =============================================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL NOT NULL CHECK (unit_price > 0),
  subtotal DECIMAL NOT NULL CHECK (subtotal > 0),
  product_snapshot JSONB, -- Snapshot del producto al momento del pedido
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. TABLA LOGS DE ACTIVIDAD
-- =============================================================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID, -- Referencia flexible (puede ser admin u otro)
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices de categories
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_featured ON categories(featured);

-- Índices de products
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock);

-- Índices de admins
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);

-- Índices de orders
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_email ON orders ((customer_info->>'email'));


-- Índices de order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Índices de activity_logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- =============================================================================
-- 8. FUNCIÓN DE UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- 9. TRIGGERS DE UPDATED_AT
-- =============================================================================

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at 
  BEFORE UPDATE ON admins 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 10. CONFIGURAR RLS PARA DESARROLLO
-- =============================================================================

-- Activar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo (acceso completo)
CREATE POLICY "dev_products_full_access" ON products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "dev_categories_full_access" ON categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "dev_orders_full_access" ON orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "dev_order_items_full_access" ON order_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "dev_admins_full_access" ON admins
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "dev_activity_logs_full_access" ON activity_logs
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 11. DATOS INICIALES
-- =============================================================================

-- Insertar categorías básicas
INSERT INTO categories (name, description, display_order, featured) VALUES
('Plantas de Interior', 'Plantas ideales para decorar espacios interiores', 1, true),
('Plantas de Exterior', 'Plantas resistentes para jardines y balcones', 2, true),
('Macetas y Contenedores', 'Macetas de diferentes tamaños y materiales', 3, false),
('Herramientas de Jardinería', 'Herramientas básicas para el cuidado de plantas', 4, false),
('Sustratos y Fertilizantes', 'Tierra, abonos y productos para el crecimiento', 5, false)
ON CONFLICT (name) DO NOTHING;

-- Insertar productos básicos
DO $$
DECLARE
    cat_interior UUID;
    cat_exterior UUID;
    cat_macetas UUID;
BEGIN
    SELECT id INTO cat_interior FROM categories WHERE name = 'Plantas de Interior' LIMIT 1;
    SELECT id INTO cat_exterior FROM categories WHERE name = 'Plantas de Exterior' LIMIT 1;
    SELECT id INTO cat_macetas FROM categories WHERE name = 'Macetas y Contenedores' LIMIT 1;
    
    INSERT INTO products (name, description, category_id, price, stock, scientific_name, care, featured) VALUES
    ('Monstera Deliciosa', 'Planta de interior con hojas grandes y decorativas', cat_interior, 2500.00, 10, 'Monstera deliciosa', 'Riego moderado, luz indirecta', true),
    ('Pothos Dorado', 'Planta colgante ideal para principiantes', cat_interior, 1200.00, 15, 'Epipremnum aureum', 'Riego cuando la tierra esté seca', true),
    ('Lavanda', 'Planta aromática perfecta para jardines', cat_exterior, 800.00, 20, 'Lavandula angustifolia', 'Pleno sol, riego escaso', false),
    ('Maceta Terracota 20cm', 'Maceta clásica de terracota', cat_macetas, 450.00, 30, NULL, 'Lavar antes del primer uso', false),
    ('Suculenta Mix', 'Variedad de suculentas pequeñas', cat_interior, 350.00, 25, 'Succulent mix', 'Riego escaso, mucha luz', true)
    ON CONFLICT (name) DO NOTHING;
END $$;

-- Insertar admin por defecto
INSERT INTO admins (email, full_name, password_hash, role) VALUES
('admin@vivero.com', 'Administrador', '$2b$10$FtTabHO0BsDerKBruAAVWOHaTP9wuL9nowU5LRpC/KKOIEygQoNN2', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 12. COMENTARIOS DESCRIPTIVOS
-- =============================================================================

COMMENT ON TABLE categories IS 'Categorías de productos del vivero';
COMMENT ON TABLE products IS 'Catálogo de productos disponibles';
COMMENT ON TABLE admins IS 'Administradores del sistema (solo tipo de usuario)';
COMMENT ON TABLE orders IS 'Pedidos de clientes invitados (sin registro)';
COMMENT ON TABLE order_items IS 'Items individuales de cada pedido';
COMMENT ON TABLE activity_logs IS 'Registro de actividades del sistema';

COMMENT ON COLUMN orders.customer_info IS 'Información del cliente: {name, email, phone, address}';
COMMENT ON COLUMN order_items.product_snapshot IS 'Snapshot del producto al momento del pedido';
COMMENT ON COLUMN admins.role IS 'Rol del administrador: solo admin';

-- =============================================================================
-- CONFIRMACIÓN FINAL
-- =============================================================================

SELECT 
    '✅ BASE DE DATOS CONFIGURADA DESDE CERO' as status,
    (SELECT COUNT(*) FROM categories) as categorias_creadas,
    (SELECT COUNT(*) FROM products) as productos_creados,
    (SELECT COUNT(*) FROM admins) as admins_creados,
    NOW() as timestamp_setup;

-- =============================================================================
-- 📋 PRÓXIMO PASO: ACTUALIZAR CÓDIGO
-- =============================================================================
-- 
-- ⚠️  IMPORTANTE: Después de ejecutar este script, necesitas actualizar:
-- 
-- 📝 adminAuthService.ts - Cambiar 'users' por 'admins':
--   .from('users') → .from('admins')
-- 
-- 📝 adminService.ts - Cambiar todas las referencias:
--   .from('users') → .from('admins')
-- 
-- ✅ El resto del código debería funcionar sin cambios
-- 
-- 🔑 Admin por defecto creado:
--   Email: admin@vivero.com
--   Password: admin123
-- 
-- =============================================================================