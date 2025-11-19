/**
 * Script para probar la carga de detalles de órdenes
 * 
 * Ejecutar:
 * node scripts/test-order-detail.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variables de entorno no configuradas')
  console.error('Asegúrate de que .env.local existe en la carpeta Fronted')
  console.error('y contiene:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=...')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testOrderDetail() {
  console.log('🔍 Probando carga de detalles de órdenes...\n')
  
  try {
    // 1. Obtener todas las órdenes
    console.log('📦 Paso 1: Obteniendo órdenes...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError)
      return
    }
    
    if (!orders || orders.length === 0) {
      console.log('⚠️ No hay órdenes en la base de datos')
      return
    }
    
    console.log(`✅ Encontradas ${orders.length} órdenes\n`)
    
    // 2. Mostrar resumen de órdenes
    orders.forEach((order, index) => {
      console.log(`\n📋 Orden ${index + 1}:`)
      console.log(`   ID: ${order.id}`)
      console.log(`   Cliente: ${order.customer_name || 'Sin nombre'}`)
      console.log(`   Email: ${order.customer_email || 'Sin email'}`)
      console.log(`   Teléfono: ${order.customer_phone || 'Sin teléfono'}`)
      console.log(`   Total: $${order.total_amount}`)
      console.log(`   Fecha: ${order.created_at}`)
      console.log(`   Payment Status: ${order.payment_status || 'N/A'}`)
      console.log(`   Fulfillment Status: ${order.fulfillment_status || 'N/A'}`)
      console.log(`   Shipping Method: ${order.shipping_method || 'N/A'}`)
      console.log(`   Shipping Address: ${order.shipping_address ? 'SÍ' : 'NO'}`)
      if (order.shipping_address) {
        console.log(`      → ${JSON.stringify(order.shipping_address, null, 2)}`)
      }
      console.log(`   Customer Info: ${order.customer_info ? 'SÍ' : 'NO'}`)
      if (order.customer_info) {
        console.log(`      → ${JSON.stringify(order.customer_info, null, 2)}`)
      }
    })
    
    // 3. Probar obtener detalle con items de la primera orden
    if (orders.length > 0) {
      const firstOrderId = orders[0].id
      console.log(`\n\n🔍 Paso 2: Obteniendo detalle CON ITEMS de la orden ${firstOrderId}...\n`)
      
      const { data: orderWithItems, error: itemsError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            products (
              name,
              image,
              category_id
            )
          )
        `)
        .eq('id', firstOrderId)
        .single()
      
      if (itemsError) {
        console.error('❌ Error obteniendo detalle con items:', itemsError)
        return
      }
      
      console.log('✅ Detalle de orden obtenido:')
      console.log(`   ID: ${orderWithItems.id}`)
      console.log(`   Cliente: ${orderWithItems.customer_name}`)
      console.log(`   Email: ${orderWithItems.customer_email}`)
      console.log(`   Total: $${orderWithItems.total_amount}`)
      console.log(`   Items: ${orderWithItems.items?.length || 0}`)
      
      if (orderWithItems.items && orderWithItems.items.length > 0) {
        console.log('\n📦 Productos en la orden:')
        orderWithItems.items.forEach((item, index) => {
          console.log(`\n   ${index + 1}. ${item.products?.name || 'Producto sin nombre'}`)
          console.log(`      - ID: ${item.id}`)
          console.log(`      - Product ID: ${item.product_id}`)
          console.log(`      - Cantidad: ${item.quantity}`)
          console.log(`      - Precio unitario: $${item.unit_price}`)
          console.log(`      - Subtotal: $${item.subtotal}`)
          console.log(`      - Imagen: ${item.products?.image || 'Sin imagen'}`)
        })
      } else {
        console.log('⚠️ No hay items en esta orden')
      }
      
      // 4. Verificar si hay items en order_items
      console.log(`\n\n🔍 Paso 3: Verificando items en tabla order_items...`)
      const { data: allItems, error: allItemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', firstOrderId)
      
      if (allItemsError) {
        console.error('❌ Error:', allItemsError)
      } else {
        console.log(`✅ Items encontrados en order_items: ${allItems?.length || 0}`)
        if (allItems && allItems.length > 0) {
          allItems.forEach((item, index) => {
            console.log(`   ${index + 1}. Product ID: ${item.product_id}, Qty: ${item.quantity}, Price: $${item.unit_price}`)
          })
        }
      }
    }
    
    console.log('\n\n✅ Prueba completada')
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

// Ejecutar la prueba
testOrderDetail()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

