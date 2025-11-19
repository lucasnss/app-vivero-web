-- 🚀 SCRIPT: Generar Órdenes de Prueba con Estados Distribuidos
-- Proyecto: ViveroWeb
-- Objetivo: Crear al menos 8 órdenes de cada estado para testing
-- Fecha: 2025-01-07

-- =============================================================================
-- 📋 LIMPIEZA PREVIA (OPCIONAL)
-- =============================================================================

-- Descomentar si quieres limpiar órdenes existentes
-- DELETE FROM order_items;
-- DELETE FROM orders;

-- =============================================================================
-- 🎯 GENERACIÓN DE ÓRDENES DE PRUEBA
-- =============================================================================

-- 1. ÓRDENES COMPLETADAS (8 órdenes)
INSERT INTO orders (
  customer_info,
  status,
  total_amount,
  shipping_address,
  payment_method,
  payment_status,
  fulfillment_status,
  shipping_method,
  created_at,
  updated_at
) VALUES
-- Completadas - Entregadas
(
  '{"name": "María González", "email": "maria.gonzalez@email.com", "phone": "11-1234-5678"}',
  'delivered',
  15000.00,
  '{"street": "Av. Corrientes", "number": "1234", "city": "Buenos Aires", "state": "CABA", "zip": "1043"}',
  'mercadopago',
  'approved',
  'delivered',
  'delivery',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
),
(
  '{"name": "Carlos López", "email": "carlos.lopez@email.com", "phone": "11-2345-6789"}',
  'delivered',
  8500.00,
  '{"street": "Calle Florida", "number": "567", "city": "Buenos Aires", "state": "CABA", "zip": "1005"}',
  'mercadopago',
  'approved',
  'delivered',
  'delivery',
  NOW() - INTERVAL '29 days',
  NOW() - INTERVAL '29 days'
),
(
  '{"name": "Ana Martínez", "email": "ana.martinez@email.com", "phone": "11-3456-7890"}',
  'delivered',
  12000.00,
  '{"street": "Av. Santa Fe", "number": "890", "city": "Buenos Aires", "state": "CABA", "zip": "1059"}',
  'mercadopago',
  'approved',
  'delivered',
  'pickup',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '28 days'
),
(
  '{"name": "Roberto Silva", "email": "roberto.silva@email.com", "phone": "11-4567-8901"}',
  'delivered',
  9500.00,
  '{"street": "Calle Lavalle", "number": "234", "city": "Buenos Aires", "state": "CABA", "zip": "1047"}',
  'mercadopago',
  'approved',
  'delivered',
  'delivery',
  NOW() - INTERVAL '27 days',
  NOW() - INTERVAL '27 days'
),
(
  '{"name": "Lucía Fernández", "email": "lucia.fernandez@email.com", "phone": "11-5678-9012"}',
  'delivered',
  18000.00,
  '{"street": "Av. Córdoba", "number": "456", "city": "Buenos Aires", "state": "CABA", "zip": "1054"}',
  'mercadopago',
  'approved',
  'delivered',
  'pickup',
  NOW() - INTERVAL '26 days',
  NOW() - INTERVAL '26 days'
),
(
  '{"name": "Diego Rodríguez", "email": "diego.rodriguez@email.com", "phone": "11-6789-0123"}',
  'delivered',
  7500.00,
  '{"street": "Calle Sarmiento", "number": "789", "city": "Buenos Aires", "state": "CABA", "zip": "1041"}',
  'mercadopago',
  'approved',
  'delivered',
  'delivery',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '25 days'
),
(
  '{"name": "Carmen Herrera", "email": "carmen.herrera@email.com", "phone": "11-7890-1234"}',
  'delivered',
  11000.00,
  '{"street": "Av. Callao", "number": "321", "city": "Buenos Aires", "state": "CABA", "zip": "1022"}',
  'mercadopago',
  'approved',
  'delivered',
  'pickup',
  NOW() - INTERVAL '24 days',
  NOW() - INTERVAL '24 days'
),
(
  '{"name": "Fernando Torres", "email": "fernando.torres@email.com", "phone": "11-8901-2345"}',
  'delivered',
  13500.00,
  '{"street": "Calle Tucumán", "number": "654", "city": "Buenos Aires", "state": "CABA", "zip": "1049"}',
  'mercadopago',
  'approved',
  'delivered',
  'delivery',
  NOW() - INTERVAL '23 days',
  NOW() - INTERVAL '23 days'
);

-- 2. ÓRDENES PAGO OK · ENVÍO PENDIENTE (8 órdenes)
INSERT INTO orders (
  customer_info,
  status,
  total_amount,
  shipping_address,
  payment_method,
  payment_status,
  fulfillment_status,
  shipping_method,
  created_at,
  updated_at
) VALUES
(
  '{"name": "Patricia Morales", "email": "patricia.morales@email.com", "phone": "11-9012-3456"}',
  'shipped',
  16000.00,
  '{"street": "Av. Belgrano", "number": "987", "city": "Buenos Aires", "state": "CABA", "zip": "1092"}',
  'mercadopago',
  'approved',
  'awaiting_shipment',
  'delivery',
  NOW() - INTERVAL '22 days',
  NOW() - INTERVAL '22 days'
),
(
  '{"name": "Hugo Jiménez", "email": "hugo.jimenez@email.com", "phone": "11-0123-4567"}',
  'shipped',
  9200.00,
  '{"street": "Calle Moreno", "number": "147", "city": "Buenos Aires", "state": "CABA", "zip": "1091"}',
  'mercadopago',
  'approved',
  'awaiting_shipment',
  'delivery',
  NOW() - INTERVAL '21 days',
  NOW() - INTERVAL '21 days'
),
(
  '{"name": "Isabel Castro", "email": "isabel.castro@email.com", "phone": "11-1234-5678"}',
  'shipped',
  14000.00,
  '{"street": "Av. Independencia", "number": "258", "city": "Buenos Aires", "state": "CABA", "zip": "1075"}',
  'mercadopago',
  'approved',
  'awaiting_shipment',
  'delivery',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),
(
  '{"name": "Miguel Ruiz", "email": "miguel.ruiz@email.com", "phone": "11-2345-6789"}',
  'shipped',
  7800.00,
  '{"street": "Calle San Juan", "number": "369", "city": "Buenos Aires", "state": "CABA", "zip": "1143"}',
  'mercadopago',
  'approved',
  'awaiting_shipment',
  'delivery',
  NOW() - INTERVAL '19 days',
  NOW() - INTERVAL '19 days'
),
(
  '{"name": "Rosa Vega", "email": "rosa.vega@email.com", "phone": "11-3456-7890"}',
  'shipped',
  12500.00,
  '{"street": "Av. San Juan", "number": "741", "city": "Buenos Aires", "state": "CABA", "zip": "1143"}',
  'mercadopago',
  'approved',
  'awaiting_shipment',
  'delivery',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days'
),
(
  '{"name": "Alberto Mendoza", "email": "alberto.mendoza@email.com", "phone": "11-4567-8901"}',
  'shipped',
  9900.00,
  '{"street": "Calle Boedo", "number": "852", "city": "Buenos Aires", "state": "CABA", "zip": "1264"}',
  'mercadopago',
  'approved',
  'awaiting_shipment',
  'delivery',
  NOW() - INTERVAL '17 days',
  NOW() - INTERVAL '17 days'
),
(
  '{"name": "Elena Ríos", "email": "elena.rios@email.com", "phone": "11-5678-9012"}',
  'shipped',
  17000.00,
  '{"street": "Av. Boedo", "number": "963", "city": "Buenos Aires", "state": "CABA", "zip": "1264"}',
  'mercadopago',
  'approved',
  'awaiting_shipment',
  'delivery',
  NOW() - INTERVAL '16 days',
  NOW() - INTERVAL '16 days'
),
(
  '{"name": "Ricardo Paredes", "email": "ricardo.paredes@email.com", "phone": "11-6789-0123"}',
  'shipped',
  8800.00,
  '{"street": "Calle Independencia", "number": "147", "city": "Buenos Aires", "state": "CABA", "zip": "1075"}',
  'mercadopago',
  'approved',
  'awaiting_shipment',
  'delivery',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
);

-- 3. ÓRDENES PAGO OK · LISTO PARA RETIRAR (8 órdenes)
INSERT INTO orders (
  customer_info,
  status,
  total_amount,
  shipping_address,
  payment_method,
  payment_status,
  fulfillment_status,
  shipping_method,
  created_at,
  updated_at
) VALUES
(
  '{"name": "Sofía Navarro", "email": "sofia.navarro@email.com", "phone": "11-7890-1234"}',
  'processing',
  13200.00,
  '{"street": "Av. Jujuy", "number": "258", "city": "Buenos Aires", "state": "CABA", "zip": "1080"}',
  'mercadopago',
  'approved',
  'awaiting_pickup',
  'pickup',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days'
),
(
  '{"name": "Gabriel Ortega", "email": "gabriel.ortega@email.com", "phone": "11-8901-2345"}',
  'processing',
  7600.00,
  '{"street": "Calle Jujuy", "number": "369", "city": "Buenos Aires", "state": "CABA", "zip": "1080"}',
  'mercadopago',
  'approved',
  'awaiting_pickup',
  'pickup',
  NOW() - INTERVAL '13 days',
  NOW() - INTERVAL '13 days'
),
(
  '{"name": "Valentina Soto", "email": "valentina.soto@email.com", "phone": "11-9012-3456"}',
  'processing',
  18900.00,
  '{"street": "Av. Entre Ríos", "number": "741", "city": "Buenos Aires", "state": "CABA", "zip": "1075"}',
  'mercadopago',
  'approved',
  'awaiting_pickup',
  'pickup',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days'
),
(
  '{"name": "Andrés Contreras", "email": "andres.contreras@email.com", "phone": "11-0123-4567"}',
  'processing',
  10400.00,
  '{"street": "Calle Entre Ríos", "number": "852", "city": "Buenos Aires", "state": "CABA", "zip": "1075"}',
  'mercadopago',
  'approved',
  'awaiting_pickup',
  'pickup',
  NOW() - INTERVAL '11 days',
  NOW() - INTERVAL '11 days'
),
(
  '{"name": "Camila Valenzuela", "email": "camila.valenzuela@email.com", "phone": "11-1234-5678"}',
  'processing',
  15600.00,
  '{"street": "Av. San Juan", "number": "963", "city": "Buenos Aires", "state": "CABA", "zip": "1143"}',
  'mercadopago',
  'approved',
  'awaiting_pickup',
  'pickup',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
),
(
  '{"name": "Daniel Fuentes", "email": "daniel.fuentes@email.com", "phone": "11-2345-6789"}',
  'processing',
  8200.00,
  '{"street": "Calle San Juan", "number": "147", "city": "Buenos Aires", "state": "CABA", "zip": "1143"}',
  'mercadopago',
  'approved',
  'awaiting_pickup',
  'pickup',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days'
),
(
  '{"name": "Natalia Salazar", "email": "natalia.salazar@email.com", "phone": "11-3456-7890"}',
  'processing',
  11300.00,
  '{"street": "Av. Boedo", "number": "258", "city": "Buenos Aires", "state": "CABA", "zip": "1264"}',
  'mercadopago',
  'approved',
  'awaiting_pickup',
  'pickup',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
),
(
  '{"name": "Francisco Cárdenas", "email": "francisco.cardenas@email.com", "phone": "11-4567-8901"}',
  'processing',
  9400.00,
  '{"street": "Calle Boedo", "number": "369", "city": "Buenos Aires", "state": "CABA", "zip": "1264"}',
  'mercadopago',
  'approved',
  'awaiting_pickup',
  'pickup',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
);

-- 4. ÓRDENES PENDIENTES (8 órdenes)
INSERT INTO orders (
  customer_info,
  status,
  total_amount,
  shipping_address,
  payment_method,
  payment_status,
  fulfillment_status,
  shipping_method,
  created_at,
  updated_at
) VALUES
(
  '{"name": "Carolina Miranda", "email": "carolina.miranda@email.com", "phone": "11-5678-9012"}',
  'pending',
  14500.00,
  '{"street": "Av. La Plata", "number": "741", "city": "Buenos Aires", "state": "CABA", "zip": "1274"}',
  'mercadopago',
  'pending',
  'none',
  'delivery',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
),
(
  '{"name": "Javier Acosta", "email": "javier.acosta@email.com", "phone": "11-6789-0123"}',
  'pending',
  6800.00,
  '{"street": "Calle La Plata", "number": "852", "city": "Buenos Aires", "state": "CABA", "zip": "1274"}',
  'mercadopago',
  'in_process',
  'none',
  'pickup',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),
(
  '{"name": "Mariana Rojas", "email": "mariana.rojas@email.com", "phone": "11-7890-1234"}',
  'pending',
  17200.00,
  '{"street": "Av. Caseros", "number": "963", "city": "Buenos Aires", "state": "CABA", "zip": "1264"}',
  'mercadopago',
  'authorized',
  'none',
  'delivery',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
),
(
  '{"name": "Sebastián Méndez", "email": "sebastian.mendez@email.com", "phone": "11-8901-2345"}',
  'pending',
  9100.00,
  '{"street": "Calle Caseros", "number": "147", "city": "Buenos Aires", "state": "CABA", "zip": "1264"}',
  'mercadopago',
  'pending',
  'none',
  'pickup',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),
(
  '{"name": "Adriana Guzmán", "email": "adriana.guzman@email.com", "phone": "11-9012-3456"}',
  'pending',
  12800.00,
  '{"street": "Av. Chiclana", "number": "258", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'in_process',
  'none',
  'delivery',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  '{"name": "Roberto Espinoza", "email": "roberto.espinoza@email.com", "phone": "11-0123-4567"}',
  'pending',
  7900.00,
  '{"street": "Calle Chiclana", "number": "369", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'authorized',
  'none',
  'pickup',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  '{"name": "Claudia Ramírez", "email": "claudia.ramirez@email.com", "phone": "11-1234-5678"}',
  'pending',
  16300.00,
  '{"street": "Av. Carabobo", "number": "741", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'pending',
  'none',
  'delivery',
  NOW(),
  NOW()
),
(
  '{"name": "Mauricio Flores", "email": "mauricio.flores@email.com", "phone": "11-2345-6789"}',
  'pending',
  8700.00,
  '{"street": "Calle Carabobo", "number": "852", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'in_process',
  'none',
  'pickup',
  NOW(),
  NOW()
);

-- 5. ÓRDENES RECHAZADAS (8 órdenes)
INSERT INTO orders (
  customer_info,
  status,
  total_amount,
  shipping_address,
  payment_method,
  payment_status,
  fulfillment_status,
  shipping_method,
  created_at,
  updated_at
) VALUES
(
  '{"name": "Verónica Herrera", "email": "veronica.herrera@email.com", "phone": "11-3456-7890"}',
  'cancelled',
  12100.00,
  '{"street": "Av. Directorio", "number": "963", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'rejected',
  'none',
  'delivery',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '25 days'
),
(
  '{"name": "Felipe Castro", "email": "felipe.castro@email.com", "phone": "11-4567-8901"}',
  'cancelled',
  7300.00,
  '{"street": "Calle Directorio", "number": "147", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'rejected',
  'none',
  'pickup',
  NOW() - INTERVAL '24 days',
  NOW() - INTERVAL '24 days'
),
(
  '{"name": "Gabriela Morales", "email": "gabriela.morales@email.com", "phone": "11-5678-9012"}',
  'cancelled',
  15800.00,
  '{"street": "Av. Liniers", "number": "258", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'rejected',
  'none',
  'delivery',
  NOW() - INTERVAL '23 days',
  NOW() - INTERVAL '23 days'
),
(
  '{"name": "Héctor Silva", "email": "hector.silva@email.com", "phone": "11-6789-0123"}',
  'cancelled',
  8400.00,
  '{"street": "Calle Liniers", "number": "369", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'rejected',
  'none',
  'pickup',
  NOW() - INTERVAL '22 days',
  NOW() - INTERVAL '22 days'
),
(
  '{"name": "Rosa Mendoza", "email": "rosa.mendoza@email.com", "phone": "11-7890-1234"}',
  'cancelled',
  13900.00,
  '{"street": "Av. Segurola", "number": "741", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'rejected',
  'none',
  'delivery',
  NOW() - INTERVAL '21 days',
  NOW() - INTERVAL '21 days'
),
(
  '{"name": "Alberto Torres", "email": "alberto.torres@email.com", "phone": "11-8901-2345"}',
  'cancelled',
  9600.00,
  '{"street": "Calle Segurola", "number": "852", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'rejected',
  'none',
  'pickup',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),
(
  '{"name": "Elena Ríos", "email": "elena.rios@email.com", "phone": "11-9012-3456"}',
  'cancelled',
  16700.00,
  '{"street": "Av. Emilio Castro", "number": "963", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'rejected',
  'none',
  'delivery',
  NOW() - INTERVAL '19 days',
  NOW() - INTERVAL '19 days'
),
(
  '{"name": "Ricardo Paredes", "email": "ricardo.paredes@email.com", "phone": "11-0123-4567"}',
  'cancelled',
  7800.00,
  '{"street": "Calle Emilio Castro", "number": "147", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'rejected',
  'none',
  'pickup',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days'
);

-- 6. ÓRDENES CANCELADAS (8 órdenes)
INSERT INTO orders (
  customer_info,
  status,
  total_amount,
  shipping_address,
  payment_method,
  payment_status,
  fulfillment_status,
  shipping_method,
  created_at,
  updated_at
) VALUES
(
  '{"name": "Sofía Navarro", "email": "sofia.navarro@email.com", "phone": "11-1234-5678"}',
  'cancelled',
  14200.00,
  '{"street": "Av. Juan B. Justo", "number": "258", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'cancelled',
  'none',
  'delivery',
  NOW() - INTERVAL '17 days',
  NOW() - INTERVAL '17 days'
),
(
  '{"name": "Gabriel Ortega", "email": "gabriel.ortega@email.com", "phone": "11-2345-6789"}',
  'cancelled',
  8100.00,
  '{"street": "Calle Juan B. Justo", "number": "369", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'refunded',
  'none',
  'pickup',
  NOW() - INTERVAL '16 days',
  NOW() - INTERVAL '16 days'
),
(
  '{"name": "Valentina Soto", "email": "valentina.soto@email.com", "phone": "11-3456-7890"}',
  'cancelled',
  17500.00,
  '{"street": "Av. San Pedrito", "number": "741", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'cancelled',
  'none',
  'delivery',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
),
(
  '{"name": "Andrés Contreras", "email": "andres.contreras@email.com", "phone": "11-4567-8901"}',
  'cancelled',
  9200.00,
  '{"street": "Calle San Pedrito", "number": "852", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'refunded',
  'none',
  'pickup',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days'
),
(
  '{"name": "Camila Valenzuela", "email": "camila.valenzuela@email.com", "phone": "11-5678-9012"}',
  'cancelled',
  13300.00,
  '{"street": "Av. Varela", "number": "963", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'cancelled',
  'none',
  'delivery',
  NOW() - INTERVAL '13 days',
  NOW() - INTERVAL '13 days'
),
(
  '{"name": "Daniel Fuentes", "email": "daniel.fuentes@email.com", "phone": "11-6789-0123"}',
  'cancelled',
  6800.00,
  '{"street": "Calle Varela", "number": "147", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'refunded',
  'none',
  'pickup',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days'
),
(
  '{"name": "Natalia Salazar", "email": "natalia.salazar@email.com", "phone": "11-7890-1234"}',
  'cancelled',
  18900.00,
  '{"street": "Av. Riestra", "number": "258", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'cancelled',
  'none',
  'delivery',
  NOW() - INTERVAL '11 days',
  NOW() - INTERVAL '11 days'
),
(
  '{"name": "Francisco Cárdenas", "email": "francisco.cardenas@email.com", "phone": "11-8901-2345"}',
  'cancelled',
  10400.00,
  '{"street": "Calle Riestra", "number": "369", "city": "Buenos Aires", "state": "CABA", "zip": "1405"}',
  'mercadopago',
  'refunded',
  'none',
  'pickup',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
);

-- =============================================================================
-- 📊 VERIFICACIÓN FINAL
-- =============================================================================

-- Verificar el total de órdenes creadas
SELECT 
  'Total de órdenes' as descripcion,
  COUNT(*) as cantidad
FROM orders;

-- Verificar distribución por estado UI
SELECT 
  CASE 
    WHEN payment_status = 'approved' AND fulfillment_status = 'delivered' THEN 'Completado'
    WHEN payment_status = 'approved' AND fulfillment_status = 'awaiting_shipment' THEN 'Pago OK · Envío pendiente'
    WHEN payment_status = 'approved' AND fulfillment_status = 'awaiting_pickup' THEN 'Pago OK · Listo para retirar'
    WHEN payment_status IN ('pending', 'in_process', 'authorized') THEN 'Pendiente'
    WHEN payment_status = 'rejected' THEN 'Rechazado'
    WHEN payment_status IN ('cancelled', 'refunded') THEN 'Cancelado'
    ELSE 'Otro'
  END as estado_ui,
  COUNT(*) as cantidad
FROM orders
GROUP BY 
  CASE 
    WHEN payment_status = 'approved' AND fulfillment_status = 'delivered' THEN 'Completado'
    WHEN payment_status = 'approved' AND fulfillment_status = 'awaiting_shipment' THEN 'Pago OK · Envío pendiente'
    WHEN payment_status = 'approved' AND fulfillment_status = 'awaiting_pickup' THEN 'Pago OK · Listo para retirar'
    WHEN payment_status IN ('pending', 'in_process', 'authorized') THEN 'Pendiente'
    WHEN payment_status = 'rejected' THEN 'Rechazado'
    WHEN payment_status IN ('cancelled', 'refunded') THEN 'Cancelado'
    ELSE 'Otro'
  END
ORDER BY cantidad DESC;
