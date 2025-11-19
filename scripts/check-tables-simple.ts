import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkTables() {
  console.log('🔍 Verificando tablas faltantes...\n')

  const tablesToCheck = ['orders', 'order_items', 'users']
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1)
        
      if (error) {
        console.log(`❌ Tabla '${table}': NO EXISTE (${error.code})`)
      } else {
        console.log(`✅ Tabla '${table}': EXISTE`)
      }
    } catch (err) {
      console.log(`❌ Tabla '${table}': ERROR`)
    }
  }
}

checkTables().catch(console.error) 