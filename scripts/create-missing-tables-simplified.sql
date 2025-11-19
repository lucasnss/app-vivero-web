-- Script SQL para crear tablas faltantes en ViveroWeb (VERSIÓN SIMPLIFICADA)
-- Ejecutar este script en la interfaz de Supabase (SQL Editor)
-- SOLO ADMIN E INVITADOS - SIN REGISTRO DE USUARIOS

-- 1. Crear tabla orders (adaptada para invitados)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Información del cliente (invitado) guardada directamente en el pedido
  customer_info JSONB NOT NULL, -- {name, email, phone, address}
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL NOT NULL CHECK (total_amount > 0),
  shipping_address JSONB NOT NULL,
  payment_method TEXT,
  notes TEXT,
  -- Campos para el admin
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla order_items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL NOT NULL CHECK (unit_price > 0),
  subtotal DECIMAL NOT NULL CHECK (subtotal > 0),
  -- Guardar snapshot del producto por si cambia después
  product_snapshot JSONB, -- {name, image, category, etc.}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla admin_users (solo para admins)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin')),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders USING GIN ((customer_info->>'email'));
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Crear triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- También agregar triggers a tablas existentes si no los tienen
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Insertar admin por defecto (cambiar credenciales después)
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES (
  'admin@viveroweb.com',
  '$2b$10$example_hash_change_this', -- CAMBIAR POR HASH REAL
  'Administrador',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Comentarios sobre las tablas creadas
COMMENT ON TABLE orders IS 'Pedidos de clientes invitados con información embebida';
COMMENT ON TABLE order_items IS 'Items de pedidos con snapshot de productos';
COMMENT ON TABLE admin_users IS 'Usuarios administradores del sistema';

-- Comentarios sobre columnas importantes
COMMENT ON COLUMN orders.customer_info IS 'Información del cliente: {name, email, phone, address}';
COMMENT ON COLUMN orders.shipping_address IS 'Dirección de envío específica para este pedido';
COMMENT ON COLUMN order_items.product_snapshot IS 'Copia de la información del producto al momento del pedido';
COMMENT ON COLUMN admin_users.role IS 'Rol del admin: admin'; 