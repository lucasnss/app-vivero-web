-- Script SQL para configurar Row Level Security (RLS) en ViveroWeb (VERSIÓN SIMPLIFICADA)
-- Ejecutar este script en la interfaz de Supabase (SQL Editor)
-- SOLO ADMIN E INVITADOS - SIN REGISTRO DE USUARIOS

-- 1. Activar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para tabla PRODUCTS
-- Lectura pública (todos pueden ver productos)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Solo admins autenticados pueden crear productos
CREATE POLICY "Only authenticated admins can create products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.is_active = true
    )
  );

-- Solo admins autenticados pueden actualizar productos
CREATE POLICY "Only authenticated admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.is_active = true
    )
  );

-- Solo admins pueden eliminar productos
CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.role = 'admin'
      AND admin_users.is_active = true
    )
  );

-- 3. Políticas para tabla CATEGORIES
-- Lectura pública (todos pueden ver categorías)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Solo admins pueden crear categorías
CREATE POLICY "Only authenticated admins can create categories" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.is_active = true
    )
  );

-- Solo admins pueden actualizar categorías
CREATE POLICY "Only authenticated admins can update categories" ON categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.is_active = true
    )
  );

-- Solo admins pueden eliminar categorías
CREATE POLICY "Only admins can delete categories" ON categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.role = 'admin'
      AND admin_users.is_active = true
    )
  );

-- 4. Políticas para tabla ORDERS
-- Solo admins pueden ver todos los pedidos
CREATE POLICY "Only admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.is_active = true
    )
  );

-- Cualquiera puede crear pedidos (invitados)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden actualizar pedidos
CREATE POLICY "Only admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.is_active = true
    )
  );

-- Solo admins pueden eliminar pedidos
CREATE POLICY "Only admins can delete orders" ON orders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.role = 'admin'
      AND admin_users.is_active = true
    )
  );

-- 5. Políticas para tabla ORDER_ITEMS
-- Solo admins pueden ver items de pedidos
CREATE POLICY "Only admins can view order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.is_active = true
    )
  );

-- Cualquiera puede crear items de pedidos (al crear el pedido)
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden actualizar items de pedidos
CREATE POLICY "Only admins can update order items" ON order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.is_active = true
    )
  );

-- Solo admins pueden eliminar items de pedidos
CREATE POLICY "Only admins can delete order items" ON order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.role = 'admin'
      AND admin_users.is_active = true
    )
  );

-- 6. Políticas para tabla ADMIN_USERS
-- Solo admins pueden ver otros admins
CREATE POLICY "Only admins can view admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.id::text = auth.jwt()->>'sub'
      AND au.role = 'admin'
      AND au.is_active = true
    )
  );

-- Solo admins pueden crear nuevos admins
CREATE POLICY "Only admins can create admin users" ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.id::text = auth.jwt()->>'sub'
      AND au.role = 'admin'
      AND au.is_active = true
    )
  );

-- Admins pueden actualizar perfiles
CREATE POLICY "Admins can update admin users" ON admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.id::text = auth.jwt()->>'sub'
      AND au.role = 'admin'
      AND au.is_active = true
    )
  );

-- Solo admins pueden eliminar admins
CREATE POLICY "Only admins can delete admin users" ON admin_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.id::text = auth.jwt()->>'sub'
      AND au.role = 'admin'
      AND au.is_active = true
    )
  );

-- 7. Políticas para tabla ACTIVITY_LOGS
-- Solo admins pueden ver logs
CREATE POLICY "Only admins can view activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.is_active = true
    )
  );

-- El sistema puede crear logs libremente
CREATE POLICY "System can create activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden actualizar logs
CREATE POLICY "Only admins can update activity logs" ON activity_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.role = 'admin'
      AND admin_users.is_active = true
    )
  );

-- Solo admins pueden eliminar logs
CREATE POLICY "Only admins can delete activity logs" ON activity_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.jwt()->>'sub'
      AND admin_users.role = 'admin'
      AND admin_users.is_active = true
    )
  );

-- Comentarios sobre las políticas
COMMENT ON TABLE products IS 'RLS: Lectura pública, escritura solo admins autenticados';
COMMENT ON TABLE categories IS 'RLS: Lectura pública, escritura solo admins autenticados';
COMMENT ON TABLE orders IS 'RLS: Creación pública (invitados), lectura/gestión solo admins';
COMMENT ON TABLE order_items IS 'RLS: Creación pública, gestión solo admins';
COMMENT ON TABLE admin_users IS 'RLS: Solo admins pueden acceder';
COMMENT ON TABLE activity_logs IS 'RLS: Solo admins pueden leer, sistema puede escribir'; 