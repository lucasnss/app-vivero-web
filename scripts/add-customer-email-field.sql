-- Script para agregar el campo customer_email a la tabla orders
-- Este script corrige el error "Could not find the 'customer_email' column of 'orders'"
-- Ejecutar este script en Supabase SQL Editor

-- 1. Verificar si la tabla orders existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'orders'
    ) THEN
        RAISE EXCEPTION 'La tabla orders no existe';
    END IF;
END $$;

-- 2. Agregar el campo customer_email si no existe
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(100);

-- 3. Agregar campos adicionales para información del cliente
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

-- 4. Migrar datos desde customer_info (si existe y tiene datos)
-- Solo ejecutar si customer_info existe y customer_email está vacío
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_info'
    ) THEN
        -- Actualizar customer_email desde customer_info
        UPDATE orders
        SET customer_email = customer_info->>'email'
        WHERE customer_email IS NULL AND customer_info->>'email' IS NOT NULL;
        
        -- Actualizar customer_name desde customer_info
        UPDATE orders
        SET customer_name = customer_info->>'name'
        WHERE customer_name IS NULL AND customer_info->>'name' IS NOT NULL;
        
        -- Actualizar customer_phone desde customer_info
        UPDATE orders
        SET customer_phone = customer_info->>'phone'
        WHERE customer_phone IS NULL AND customer_info->>'phone' IS NOT NULL;
    END IF;
END $$;

-- 5. Crear índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);

-- 6. Agregar comentarios para documentar los campos
COMMENT ON COLUMN orders.customer_email IS 'Email del cliente que realiza el pedido';
COMMENT ON COLUMN orders.customer_name IS 'Nombre del cliente que realiza el pedido';
COMMENT ON COLUMN orders.customer_phone IS 'Teléfono del cliente que realiza el pedido';

-- 7. Verificar que los campos se agregaron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('customer_email', 'customer_name', 'customer_phone')
ORDER BY column_name;

-- Mensaje de confirmación
SELECT 
  '✅ ACTUALIZACIÓN COMPLETADA' as status,
  'Campo customer_email agregado a tabla orders' as description,
  NOW() as completed_at;