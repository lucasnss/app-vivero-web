-- Script para modificar la restricción NOT NULL de customer_info en la tabla orders
-- Este script corrige el error "null value in column customer_info of relation orders violates not-null constraint"
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

-- 2. Verificar si la columna customer_info existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_info'
    ) THEN
        RAISE EXCEPTION 'La columna customer_info no existe en la tabla orders';
    END IF;
END $$;

-- 3. Modificar la columna customer_info para permitir valores NULL
ALTER TABLE orders 
ALTER COLUMN customer_info DROP NOT NULL;

-- 4. Agregar un valor por defecto (objeto JSON vacío) para customer_info
ALTER TABLE orders 
ALTER COLUMN customer_info SET DEFAULT '{}';

-- 5. Actualizar registros existentes que tengan NULL en customer_info
UPDATE orders
SET customer_info = '{}'
WHERE customer_info IS NULL;

-- 6. Verificar que la restricción se ha modificado correctamente
SELECT column_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'customer_info';

-- 7. Mensaje de confirmación
SELECT 
  '✅ ACTUALIZACIÓN COMPLETADA' as status,
  'Restricción NOT NULL eliminada de customer_info en tabla orders' as description,
  NOW() as completed_at;