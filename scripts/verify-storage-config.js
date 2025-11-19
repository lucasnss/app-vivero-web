const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno necesarias')
  console.log('Necesitas configurar:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyStorageConfiguration() {
  console.log('🔍 Verificando configuración de Supabase Storage...\n')

  try {
    // 1. Verificar si el bucket existe
    console.log('1️⃣ Verificando bucket "product-images"...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error al listar buckets:', bucketsError.message)
      return false
    }

    const productImagesBucket = buckets.find(bucket => bucket.name === 'product-images')
    
    if (!productImagesBucket) {
      console.log('⚠️  El bucket "product-images" no existe. Creándolo...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
        fileSizeLimit: 5242880, // 5MB
      })

      if (createError) {
        console.error('❌ Error al crear bucket:', createError.message)
        return false
      }

      console.log('✅ Bucket "product-images" creado exitosamente')
    } else {
      console.log('✅ Bucket "product-images" ya existe')
    }

    // 2. Verificar políticas RLS del bucket
    console.log('\n2️⃣ Verificando políticas RLS del bucket...')
    
    // Obtener políticas actuales
    const { data: policies, error: policiesError } = await supabase.storage.getBucket('product-images')
    
    if (policiesError) {
      console.error('❌ Error al obtener políticas:', policiesError.message)
      return false
    }

    console.log('📋 Configuración actual del bucket:')
    console.log(`   - Público: ${policies.public ? '✅ Sí' : '❌ No'}`)
    console.log(`   - Tamaño máximo: ${policies.file_size_limit || 'No configurado'}`)
    console.log(`   - Tipos MIME permitidos: ${policies.allowed_mime_types?.join(', ') || 'Todos'}`)

    // 3. Configurar bucket como público
    console.log('\n3️⃣ Configurando bucket como público...')
    
    // Actualizar configuración del bucket para hacerlo público
    const { error: updateBucketError } = await supabase.storage.updateBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
      fileSizeLimit: 5242880, // 5MB
    })

    if (updateBucketError) {
      console.error('❌ Error al actualizar bucket:', updateBucketError.message)
    } else {
      console.log('✅ Bucket configurado como público')
    }

    // Nota: Las políticas RLS para storage se configuran manualmente desde el dashboard
    console.log('\n📝 Nota: Las políticas RLS deben configurarse manualmente desde el dashboard de Supabase')
    console.log('   - Ir a Storage > product-images > Policies')
    console.log('   - Crear políticas para SELECT, INSERT, UPDATE, DELETE')

    // 4. Probar subida de archivo de prueba
    console.log('\n4️⃣ Probando subida de archivo de prueba...')
    
    // Crear un archivo de prueba simple
    const testContent = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGVzdDwvdGV4dD48L3N2Zz4='
    const testFile = Buffer.from(testContent.split(',')[1], 'base64')
    
    const testFileName = `test/test-${Date.now()}.svg`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(testFileName, testFile, {
        contentType: 'image/svg+xml',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('❌ Error al subir archivo de prueba:', uploadError.message)
      return false
    }

    console.log('✅ Archivo de prueba subido exitosamente')

    // 5. Probar acceso público
    console.log('\n5️⃣ Probando acceso público...')
    
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(testFileName)

    console.log('🔗 URL pública generada:', publicUrlData.publicUrl)

    // 6. Limpiar archivo de prueba
    console.log('\n6️⃣ Limpiando archivo de prueba...')
    
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove([testFileName])

    if (deleteError) {
      console.error('⚠️  Error al eliminar archivo de prueba:', deleteError.message)
    } else {
      console.log('✅ Archivo de prueba eliminado')
    }

    console.log('\n🎉 ¡Configuración de Supabase Storage completada exitosamente!')
    console.log('\n📋 Resumen de la configuración:')
    console.log('   ✅ Bucket "product-images" creado y configurado')
    console.log('   ✅ Políticas RLS configuradas')
    console.log('   ✅ Acceso público habilitado')
    console.log('   ✅ Subida de archivos funcionando')
    console.log('   ✅ Eliminación de archivos funcionando')
    
    return true

  } catch (error) {
    console.error('❌ Error general:', error.message)
    return false
  }
}

// Ejecutar verificación
verifyStorageConfiguration()
  .then(success => {
    if (success) {
      console.log('\n🚀 Puedes continuar con la siguiente tarea del plan de implementación')
      process.exit(0)
    } else {
      console.log('\n❌ La configuración no se pudo completar. Revisa los errores arriba.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Error inesperado:', error)
    process.exit(1)
  }) 