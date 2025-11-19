-- Script de migración para agregar campos de Mercado Pago a tabla orders
-- Ejecutar este script en Supabase SQL Editor
-- Fecha: Enero 2025
-- Autor: Sistema ViveroWeb - Integración Mercado Pago

-- ==========================================
-- AGREGAR CAMPOS DE MERCADO PAGO A ORDERS
-- ==========================================

-- 1. Agregar campos para información de pago de Mercado Pago
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(50) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS comprobante_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_comprador VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'pending';

-- 2. Agregar campos adicionales para mejor control
ALTER TABLE orders ADD COLUMN IF NOT EXISTS preference_id VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS merchant_order_id VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_reference VARCHAR(100);

-- 3. Crear comentarios para documentar los campos
COMMENT ON COLUMN orders.payment_id IS 'ID del pago de Mercado Pago';
COMMENT ON COLUMN orders.comprobante_url IS 'URL del comprobante de pago (para métodos offline)';
COMMENT ON COLUMN orders.metodo_pago IS 'Método de pago usado (visa, mastercard, rapipago, etc.)';
COMMENT ON COLUMN orders.email_comprador IS 'Email del comprador (puede diferir del customer_info)';
COMMENT ON COLUMN orders.fecha_pago IS 'Fecha y hora de aprobación del pago';
COMMENT ON COLUMN orders.payment_status IS 'Estado del pago: pending, approved, rejected, cancelled, in_process';
COMMENT ON COLUMN orders.preference_id IS 'ID de la preferencia de pago de Mercado Pago';
COMMENT ON COLUMN orders.payment_type IS 'Tipo de pago: credit_card, debit_card, ticket, bank_transfer, etc.';
COMMENT ON COLUMN orders.merchant_order_id IS 'ID de la orden de comercio de Mercado Pago';
COMMENT ON COLUMN orders.external_reference IS 'Referencia externa para vincular con otros sistemas';

-- 4. Crear índices para performance en consultas de pagos
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_preference_id ON orders(preference_id);
CREATE INDEX IF NOT EXISTS idx_orders_email_comprador ON orders(email_comprador);
CREATE INDEX IF NOT EXISTS idx_orders_fecha_pago ON orders(fecha_pago DESC);

-- 5. Agregar constraint para validar payment_status
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS chk_payment_status 
  CHECK (payment_status IN ('pending', 'approved', 'rejected', 'cancelled', 'in_process', 'authorized', 'refunded'));

-- 6. Crear índice compuesto para consultas del admin
CREATE INDEX IF NOT EXISTS idx_orders_admin_view ON orders(payment_status, created_at DESC);

-- ==========================================
-- ACTUALIZAR DATOS EXISTENTES (OPCIONAL)
-- ==========================================

-- Actualizar orders existentes con payment_status = 'pending' si no tienen el campo
UPDATE orders 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;

-- ==========================================
-- VERIFICACIÓN DE LA MIGRACIÓN
-- ==========================================

-- Verificar que los campos se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN (
    'payment_id', 
    'comprobante_url', 
    'metodo_pago', 
    'email_comprador', 
    'fecha_pago', 
    'payment_status',
    'preference_id',
    'payment_type',
    'merchant_order_id',
    'external_reference'
  )
ORDER BY column_name;

-- Verificar índices creados
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'orders' 
  AND indexname LIKE '%payment%'
ORDER BY indexname;

-- Contar orders existentes para verificar
SELECT 
  COUNT(*) as total_orders,
  COUNT(payment_id) as orders_with_payment_id,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_orders
FROM orders;

-- ==========================================
-- NOTAS DE LA MIGRACIÓN
-- ==========================================

/*
CAMPOS AGREGADOS:
- payment_id: ID único del pago en Mercado Pago (puede ser NULL para pedidos sin MP)
- comprobante_url: URL del comprobante para métodos offline (Rapipago, Pago Fácil)
- metodo_pago: Método específico usado (visa, mastercard, rapipago, etc.)
- email_comprador: Email del comprador en MP (puede diferir del customer_info)
- fecha_pago: Timestamp de cuando se aprobó el pago
- payment_status: Estado actual del pago según MP
- preference_id: ID de la preferencia creada
- payment_type: Tipo de pago (tarjeta, ticket, transferencia)
- merchant_order_id: ID de orden comercial de MP
- external_reference: Para vincular con otros sistemas

COMPATIBILIDAD:
- Todos los campos son NULL por defecto excepto payment_status = 'pending'
- Orders existentes siguen funcionando sin modificación
- El sistema puede manejar orders con y sin información de MP

PERFORMANCE:
- Índices creados para consultas frecuentes
- Índice compuesto para vista de admin
- Constraints para validar datos

SEGURIDAD:
- payment_id es UNIQUE para evitar duplicados
- Constraints para validar estados válidos
- Campos documentados con comentarios
*/