-- ========================================
-- SCRIPTS SQL PARA IMPLEMENTAR payment_source
-- ========================================
-- Ejecutar EN ORDEN en Supabase SQL Editor
-- Copiar y pegar cada bloque separadamente


-- ========================================
-- 1. VERIFICACIÓN PREVIA
-- ========================================

-- Ver estructura actual de tabla orders
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY column_name;

-- Verificar si la columna payment_source YA existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'payment_source';
-- Si retorna nada → No existe, continuar con PASO 2
-- Si retorna 'payment_source' → YA EXISTE, ir a PASO 3


-- ========================================
-- 2. AGREGAR COLUMNA payment_source (SI NO EXISTE)
-- ========================================

-- OPCIÓN A: Si la columna no existe, agregar
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_source VARCHAR(10) DEFAULT 'real';

-- Agregar constraint para validar valores
ALTER TABLE orders 
ADD CONSTRAINT check_payment_source 
CHECK (payment_source IN ('real', 'test'));

-- Verificar que se agregó correctamente
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'payment_source';


-- ========================================
-- 3. CREAR ÍNDICES PARA BÚSQUEDAS RÁPIDAS
-- ========================================

-- Índice simple en payment_source
CREATE INDEX IF NOT EXISTS idx_orders_payment_source 
ON orders(payment_source, created_at DESC);

-- Índice compuesto para filtros comunes del admin
CREATE INDEX IF NOT EXISTS idx_orders_payment_source_status 
ON orders(payment_source, status, created_at DESC);

-- Índice para búsquedas por tipo + email
CREATE INDEX IF NOT EXISTS idx_orders_payment_source_email 
ON orders(payment_source, customer_email, created_at DESC);

-- Verificar que los índices se crearon
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'orders' AND indexname LIKE '%payment_source%';


-- ========================================
-- 4. ASEGURAR QUE TODAS LAS ÓRDENES EXISTENTES TENGAN payment_source
-- ========================================

-- Ver estado actual
SELECT COUNT(*) as total, payment_source 
FROM orders 
GROUP BY payment_source;

-- Si hay NULL, actualizar a 'real' (por defecto, asumimos que son reales)
UPDATE orders 
SET payment_source = 'real' 
WHERE payment_source IS NULL;

-- Verificar de nuevo
SELECT COUNT(*) as total, payment_source 
FROM orders 
GROUP BY payment_source
ORDER BY payment_source;


-- ========================================
-- 5. VERIFICACIÓN FINAL
-- ========================================

-- Ver estructura completa de tabla orders
\d+ orders;

-- Ver muestra de órdenes con el nuevo campo
SELECT 
  id,
  customer_email,
  payment_source,
  created_at,
  total_amount
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- Si todo está bien, verás:
-- - Columna payment_source existe ✅
-- - Tiene DEFAULT 'real' ✅
-- - Todas las órdenes tienen payment_source ('real' o 'test') ✅
-- - Los índices están creados ✅


-- ========================================
-- SCRIPTS DE LIMPIEZA (Ejecutar después)
-- ========================================

-- ANTES DE LIMPIAR: Ver cuántas órdenes test hay
SELECT COUNT(*) as total_test_orders 
FROM orders 
WHERE payment_source = 'test';

-- ANTES DE LIMPIAR: Ver detalles de órdenes test
SELECT 
  id,
  customer_email,
  created_at,
  total_amount,
  payment_status
FROM orders 
WHERE payment_source = 'test' 
ORDER BY created_at DESC;


-- ========================================
-- OPCIÓN A: BORRAR TODAS LAS ÓRDENES TEST
-- ========================================

DELETE FROM orders 
WHERE payment_source = 'test';

-- Verificar resultado
SELECT COUNT(*) as remaining_test_orders 
FROM orders 
WHERE payment_source = 'test';


-- ========================================
-- OPCIÓN B: BORRAR SOLO LAS ANTIGUAS (> 7 DÍAS)
-- ========================================

DELETE FROM orders 
WHERE payment_source = 'test' 
  AND created_at < NOW() - INTERVAL '7 days';

-- Verificar resultado
SELECT COUNT(*) as remaining_test_orders 
FROM orders 
WHERE payment_source = 'test' AND created_at >= NOW() - INTERVAL '7 days';


-- ========================================
-- OPCIÓN C: BORRAR PERO GUARDAR LAS 10 MÁS RECIENTES
-- ========================================

DELETE FROM orders 
WHERE payment_source = 'test' 
  AND id NOT IN (
    SELECT id 
    FROM orders 
    WHERE payment_source = 'test' 
    ORDER BY created_at DESC 
    LIMIT 10
  );

-- Verificar resultado
SELECT COUNT(*) as remaining_test_orders 
FROM orders 
WHERE payment_source = 'test';


-- ========================================
-- QUERIES ÚTILES PARA MONITOREO
-- ========================================

-- Ver balance test vs real
SELECT 
  payment_source,
  COUNT(*) as cantidad,
  SUM(total_amount) as total_vendido,
  AVG(total_amount) as promedio
FROM orders
GROUP BY payment_source;

-- Ver órdenes test más recientes
SELECT 
  id,
  customer_email,
  created_at,
  total_amount,
  payment_status
FROM orders
WHERE payment_source = 'test'
ORDER BY created_at DESC
LIMIT 20;

-- Ver órdenes reales completadas
SELECT 
  id,
  customer_email,
  created_at,
  total_amount,
  payment_status,
  fulfillment_status
FROM orders
WHERE payment_source = 'real' AND status = 'paid'
ORDER BY created_at DESC
LIMIT 20;

-- Ver actividad reciente (test vs real)
SELECT 
  DATE(created_at) as fecha,
  payment_source,
  COUNT(*) as cantidad,
  SUM(total_amount) as total
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), payment_source
ORDER BY fecha DESC, payment_source;


