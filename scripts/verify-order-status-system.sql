-- 🔍 VERIFICACIÓN: Sistema de Estados Unificado de Órdenes
-- Proyecto: ViveroWeb
-- Fecha: 2024-12-19
-- Objetivo: Verificar que la migración se ejecutó correctamente

-- =============================================================================
-- 📋 VERIFICACIÓN DE CAMPOS AGREGADOS
-- =============================================================================

-- Verificar que los campos se crearon correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  CASE 
    WHEN column_name = 'fulfillment_status' THEN 'Estado logístico de la orden'
    WHEN column_name = 'shipping_method' THEN 'Método de envío (delivery/pickup)'
    WHEN column_name = 'ticket_url' THEN 'URL del comprobante offline'
    ELSE 'Campo existente'
  END as descripcion
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('fulfillment_status', 'shipping_method', 'ticket_url')
ORDER BY column_name;

-- =============================================================================
-- 📋 VERIFICACIÓN DE CONSTRAINTS
-- =============================================================================

-- Verificar constraints de fulfillment_status
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%fulfillment_status%';

-- Verificar constraints de shipping_method
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%shipping_method%';

-- =============================================================================
-- 📋 VERIFICACIÓN DE ÍNDICES
-- =============================================================================

-- Verificar índices creados
SELECT 
  indexname, 
  indexdef,
  CASE 
    WHEN indexname = 'idx_orders_admin_view' THEN 'Índice compuesto para admin'
    WHEN indexname = 'idx_orders_shipping_method' THEN 'Índice para método de envío'
    WHEN indexname = 'idx_orders_fulfillment_status' THEN 'Índice para estado logístico'
    ELSE 'Otro índice'
  END as descripcion
FROM pg_indexes 
WHERE tablename = 'orders' 
  AND indexname LIKE 'idx_orders_%'
ORDER BY indexname;

-- =============================================================================
-- 📋 VERIFICACIÓN DE TRIGGERS
-- =============================================================================

-- Verificar trigger de actualización automática
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement,
  CASE 
    WHEN trigger_name = 'trigger_update_fulfillment' THEN 'Trigger para actualizar fulfillment_status automáticamente'
    ELSE 'Otro trigger'
  END as descripcion
FROM information_schema.triggers 
WHERE event_object_table = 'orders';

-- =============================================================================
-- 📋 VERIFICACIÓN DE FUNCIONES
-- =============================================================================

-- Verificar función de actualización automática
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_fulfillment_on_payment_change';

-- =============================================================================
-- 📋 VERIFICACIÓN DE DATOS EXISTENTES
-- =============================================================================

-- Verificar valores por defecto en órdenes existentes
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN fulfillment_status IS NOT NULL THEN 1 END) as orders_with_fulfillment,
  COUNT(CASE WHEN shipping_method IS NOT NULL THEN 1 END) as orders_with_shipping_method,
  COUNT(CASE WHEN fulfillment_status = 'none' THEN 1 END) as orders_with_none_status,
  COUNT(CASE WHEN shipping_method = 'pickup' THEN 1 END) as orders_with_pickup
FROM orders;

-- Verificar distribución de estados de pago
SELECT 
  payment_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as percentage
FROM orders 
GROUP BY payment_status 
ORDER BY count DESC;

-- Verificar distribución de estados logísticos
SELECT 
  COALESCE(fulfillment_status, 'NULL') as fulfillment_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as percentage
FROM orders 
GROUP BY fulfillment_status 
ORDER BY count DESC;

-- Verificar distribución de métodos de envío
SELECT 
  COALESCE(shipping_method, 'NULL') as shipping_method,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as percentage
FROM orders 
GROUP BY shipping_method 
ORDER BY count DESC;

-- =============================================================================
-- 📋 VERIFICACIÓN DE COMPATIBILIDAD
-- =============================================================================

-- Verificar que las órdenes existentes mantienen compatibilidad
SELECT 
  'Órdenes con payment_status = approved' as check_type,
  COUNT(*) as count
FROM orders 
WHERE payment_status = 'approved'

UNION ALL

SELECT 
  'Órdenes con fulfillment_status automático' as check_type,
  COUNT(*) as count
FROM orders 
WHERE payment_status = 'approved' 
  AND fulfillment_status IN ('awaiting_shipment', 'awaiting_pickup')

UNION ALL

SELECT 
  'Órdenes con shipping_method = delivery' as check_type,
  COUNT(*) as count
FROM orders 
WHERE shipping_method = 'delivery'

UNION ALL

SELECT 
  'Órdenes con shipping_method = pickup' as check_type,
  COUNT(*) as count
FROM orders 
WHERE shipping_method = 'pickup';

-- =============================================================================
-- 📋 VERIFICACIÓN DE PERFORMANCE
-- =============================================================================

-- Verificar que los índices están siendo utilizados
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders 
WHERE payment_status = 'approved' 
  AND fulfillment_status = 'awaiting_shipment'
ORDER BY created_at DESC
LIMIT 10;

-- =============================================================================
-- ✅ RESUMEN DE VERIFICACIÓN
-- =============================================================================

-- Si todo está correcto, deberías ver:
-- ✅ 3 campos nuevos: fulfillment_status, shipping_method, ticket_url
-- ✅ 3 índices nuevos: idx_orders_admin_view, idx_orders_shipping_method, idx_orders_fulfillment_status
-- ✅ 1 trigger: trigger_update_fulfillment
-- ✅ 1 función: update_fulfillment_on_payment_change
-- ✅ Constraints de validación en fulfillment_status y shipping_method
-- ✅ Datos existentes con valores por defecto apropiados
-- ✅ Compatibilidad hacia atrás mantenida

-- Si hay algún problema, revisar:
-- ❌ Campos faltantes: Ejecutar migración nuevamente
-- ❌ Índices faltantes: Verificar permisos de usuario
-- ❌ Trigger no funciona: Verificar función y permisos
-- ❌ Datos inconsistentes: Ejecutar UPDATE statements de la migración
