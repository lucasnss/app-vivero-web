-- 🚀 MIGRACIÓN: Sistema de Estados Unificado de Órdenes
-- Proyecto: ViveroWeb
-- Fecha: 2024-12-19
-- Objetivo: Implementar estados de pago y logística unificados

-- =============================================================================
-- 📋 ANÁLISIS DEL ESTADO ACTUAL
-- =============================================================================

-- ✅ Campos EXISTENTES en tabla orders:
--   - payment_status VARCHAR(30) DEFAULT 'pending'
--   - status TEXT DEFAULT 'pending' (confuso, mezcla pago + logística)
--   - payment_id, comprobante_url, metodo_pago, etc.

-- ❌ Campos FALTANTES:
--   - fulfillment_status TEXT (estados logísticos)
--   - shipping_method TEXT (método de envío)

-- =============================================================================
-- 🔧 PASO 1: AGREGAR CAMPOS FALTANTES
-- =============================================================================

-- Agregar campo fulfillment_status para estados logísticos
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'none' 
CHECK (fulfillment_status IN (
  'none',                    -- Sin estado logístico definido
  'awaiting_shipment',       -- Pago OK, esperando envío
  'awaiting_pickup',         -- Pago OK, listo para retirar
  'shipped',                 -- Enviado (opcional, para tracking)
  'delivered',               -- Entregado
  'pickup_completed',        -- Retirado por cliente
  'cancelled_by_admin'       -- Cancelado operativamente por admin
));

-- Agregar campo shipping_method para método de envío
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_method TEXT DEFAULT 'pickup' 
CHECK (shipping_method IN ('delivery', 'pickup'));

-- Agregar campo ticket_url para comprobantes offline
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS ticket_url TEXT;

-- =============================================================================
-- 🔧 PASO 2: ACTUALIZAR ENUMS EXISTENTES
-- =============================================================================

-- Actualizar el enum de status para que sea más claro
-- (Mantener compatibilidad hacia atrás)
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
  'pending',      -- Pendiente de pago
  'confirmed',    -- Confirmado (pago OK)
  'processing',   -- En procesamiento
  'shipped',      -- Enviado
  'delivered',    -- Entregado
  'cancelled'     -- Cancelado
));

-- Actualizar el enum de payment_status para ser más específico
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN (
  'pending',    -- Pendiente de pago
  'approved',   -- Pago aprobado
  'rejected',   -- Pago rechazado
  'cancelled',  -- Pago cancelado
  'in_process', -- Pago en proceso
  'authorized', -- Pago autorizado
  'refunded'    -- Pago reembolsado
));

-- =============================================================================
-- 🔧 PASO 3: CREAR ÍNDICES OPTIMIZADOS
-- =============================================================================

-- Índice compuesto para consultas del admin
CREATE INDEX IF NOT EXISTS idx_orders_admin_view 
ON orders(payment_status, fulfillment_status, created_at);

-- Índice para filtros por método de envío
CREATE INDEX IF NOT EXISTS idx_orders_shipping_method 
ON orders(shipping_method);

-- Índice para estados logísticos
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status 
ON orders(fulfillment_status);

-- =============================================================================
-- 🔧 PASO 4: ACTUALIZAR DATOS EXISTENTES
-- =============================================================================

-- Establecer valores por defecto para órdenes existentes
UPDATE orders 
SET 
  fulfillment_status = 'none',
  shipping_method = 'pickup'
WHERE fulfillment_status IS NULL OR shipping_method IS NULL;

-- Si hay órdenes con payment_status = 'approved', establecer fulfillment_status apropiado
UPDATE orders 
SET fulfillment_status = 'awaiting_pickup'
WHERE payment_status = 'approved' 
  AND fulfillment_status = 'none' 
  AND shipping_method = 'pickup';

UPDATE orders 
SET fulfillment_status = 'awaiting_shipment'
WHERE payment_status = 'approved' 
  AND fulfillment_status = 'none' 
  AND shipping_method = 'delivery';

-- =============================================================================
-- 🔧 PASO 5: CREAR FUNCIÓN DE ACTUALIZACIÓN AUTOMÁTICA
-- =============================================================================

-- Función para actualizar fulfillment_status automáticamente cuando cambia payment_status
CREATE OR REPLACE FUNCTION update_fulfillment_on_payment_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si el pago fue aprobado y no hay fulfillment definido
  IF NEW.payment_status = 'approved' AND OLD.payment_status != 'approved' THEN
    -- Si es pickup y no hay fulfillment definido, marcar como listo para retirar
    IF NEW.shipping_method = 'pickup' AND (NEW.fulfillment_status = 'none' OR NEW.fulfillment_status IS NULL) THEN
      NEW.fulfillment_status = 'awaiting_pickup';
    -- Si es delivery y no hay fulfillment definido, marcar como esperando envío
    ELSIF NEW.shipping_method = 'delivery' AND (NEW.fulfillment_status = 'none' OR NEW.fulfillment_status IS NULL) THEN
      NEW.fulfillment_status = 'awaiting_shipment';
    END IF;
  END IF;
  
  -- Actualizar timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para ejecutar la función automáticamente
DROP TRIGGER IF EXISTS trigger_update_fulfillment ON orders;
CREATE TRIGGER trigger_update_fulfillment
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_fulfillment_on_payment_change();

-- =============================================================================
-- 🔧 PASO 6: VERIFICAR MIGRACIÓN
-- =============================================================================

-- Verificar que los campos se crearon correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('fulfillment_status', 'shipping_method', 'ticket_url')
ORDER BY column_name;

-- Verificar índices creados
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'orders' 
  AND indexname LIKE 'idx_orders_%'
ORDER BY indexname;

-- Verificar trigger
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders';

-- =============================================================================
-- ✅ MIGRACIÓN COMPLETADA
-- =============================================================================

-- La tabla orders ahora tiene:
-- ✅ payment_status: Estados de pago específicos
-- ✅ fulfillment_status: Estados logísticos específicos  
-- ✅ shipping_method: Método de envío (delivery/pickup)
-- ✅ Índices optimizados para consultas del admin
-- ✅ Trigger automático para actualizar fulfillment_status
-- ✅ Compatibilidad hacia atrás con datos existentes

COMMENT ON COLUMN orders.fulfillment_status IS 'Estado logístico de la orden (envío/retiro)';
COMMENT ON COLUMN orders.shipping_method IS 'Método de envío: delivery (domicilio) o pickup (retiro)';
COMMENT ON COLUMN orders.ticket_url IS 'URL del comprobante offline si existe';
COMMENT ON COLUMN orders.payment_status IS 'Estado específico del pago en Mercado Pago';
COMMENT ON COLUMN orders.status IS 'Estado general de la orden (legacy, mantener compatibilidad)';
