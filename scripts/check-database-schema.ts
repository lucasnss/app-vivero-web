// Cargar variables de entorno del archivo .env.local
import dotenv from 'dotenv'
import path from 'path'

// Cargar .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

// Crear cliente de Supabase con las variables cargadas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabaseSchema() {
  console.log('🔍 Verificando esquema de base de datos de Supabase...\n')

  try {
    // Lista de tablas que esperamos tener
    const expectedTables = [
      'products',
      'categories', 
      'activity_logs',
      'orders',
      'order_items',
      'users'
    ]

    console.log('📋 Verificando existencia de tablas:\n')

    for (const tableName of expectedTables) {
      try {
        // Intentar hacer una consulta simple para verificar si la tabla existe
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .limit(1)

        if (error) {
          if (error.code === '42P01') {
            console.log(`❌ Tabla '${tableName}': NO EXISTE`)
          } else {
            console.log(`⚠️  Tabla '${tableName}': ERROR - ${error.message}`)
          }
        } else {
          console.log(`✅ Tabla '${tableName}': EXISTE`)
          
          // Si la tabla existe, mostrar algunas estadísticas
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          
          console.log(`   📊 Registros: ${count || 0}`)
        }
      } catch (err) {
        console.log(`❌ Tabla '${tableName}': ERROR AL VERIFICAR - ${err}`)
      }
    }

    console.log('\n🔍 Verificando estructura de tablas existentes:\n')

    // Verificar estructura detallada de tablas existentes
    const existingTables = ['products', 'categories', 'activity_logs']
    
    for (const tableName of existingTables) {
      try {
        console.log(`\n📋 Estructura de tabla '${tableName}':`);
        
        // Obtener un registro de ejemplo para ver la estructura
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
          .single()

        if (data) {
          const columns = Object.keys(data)
          console.log(`   Columnas (${columns.length}): ${columns.join(', ')}`)
          
          // Mostrar tipos de datos básicos
          console.log('   Tipos de datos:')
          for (const [key, value] of Object.entries(data)) {
            const type = value === null ? 'null' : typeof value
            console.log(`     ${key}: ${type}`)
          }
        } else if (error) {
          console.log(`   ⚠️ No se pudo obtener estructura: ${error.message}`)
        } else {
          console.log('   📝 Tabla vacía (sin registros para analizar)')
        }
      } catch (err) {
        console.log(`   ❌ Error al analizar tabla: ${err}`)
      }
    }

    console.log('\n🎯 Resumen del esquema de base de datos:')
    console.log('=======================================')
    
    // Resumen final
    const { data: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    const { data: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      
    const { data: logsCount } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })

    console.log(`✅ Productos: ${productsCount?.length || 0} registros`)
    console.log(`✅ Categorías: ${categoriesCount?.length || 0} registros`)
    console.log(`✅ Activity Logs: ${logsCount?.length || 0} registros`)
    
    // Verificar tablas faltantes
    console.log('\n❌ Tablas faltantes que necesitan crearse:')
    console.log('- orders (para pedidos)')
    console.log('- order_items (para items de pedidos)')
    console.log('- users (extensión de auth.users)')

  } catch (error) {
    console.error('💥 Error durante la verificación:', error)
  }
}

// Ejecutar verificación
checkDatabaseSchema()

export { checkDatabaseSchema } 