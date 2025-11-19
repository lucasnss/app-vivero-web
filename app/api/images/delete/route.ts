import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/src/lib/supabaseClient'

// Bucket de Supabase Storage
const BUCKET_NAME = 'product-images'

/**
 * DELETE /api/images/delete
 * Elimina una imagen del almacenamiento
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, path } = body

    // Validar que se proporcionó URL o path
    if (!url && !path) {
      return NextResponse.json(
        { success: false, error: 'Se requiere URL o path de la imagen' },
        { status: 400 }
      )
    }

    // Extraer el nombre del archivo de la URL o usar el path directamente
    let fileName: string
    
    if (url) {
      // Es una URL completa, extraer el path del archivo
      const urlParts = url.split('/storage/v1/object/public/' + BUCKET_NAME + '/')
      if (urlParts.length !== 2) {
        return NextResponse.json(
          { success: false, error: 'URL de imagen inválida' },
          { status: 400 }
        )
      }
      fileName = urlParts[1]
    } else {
      // Usar el path proporcionado
      fileName = path
    }

    // Eliminar archivo de Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName])

    if (error) {
      console.error('Error al eliminar imagen:', error)
      return NextResponse.json(
        { success: false, error: `Error al eliminar imagen: ${error.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ Imagen eliminada exitosamente: ${fileName}`)

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar imagen:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Error al eliminar imagen: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/images/delete
 * Elimina múltiples imágenes del almacenamiento
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { images } = body

    // Validar que se proporcionó un array de imágenes
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Se requiere un array de imágenes' },
        { status: 400 }
      )
    }

    // Procesar cada imagen para obtener el nombre del archivo
    const filesToDelete: string[] = []
    
    for (const image of images) {
      if (typeof image === 'string') {
        if (image.includes('/storage/v1/object/public/' + BUCKET_NAME + '/')) {
          // Es una URL completa, extraer el path del archivo
          const urlParts = image.split('/storage/v1/object/public/' + BUCKET_NAME + '/')
          if (urlParts.length === 2) {
            filesToDelete.push(urlParts[1])
          }
        } else {
          // Asumir que es un path relativo
          filesToDelete.push(image)
        }
      }
    }

    if (filesToDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron imágenes válidas para eliminar' },
        { status: 400 }
      )
    }

    // Eliminar archivos de Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filesToDelete)

    if (error) {
      console.error('Error al eliminar imágenes:', error)
      return NextResponse.json(
        { success: false, error: `Error al eliminar imágenes: ${error.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ ${filesToDelete.length} imágenes eliminadas exitosamente`)

    return NextResponse.json({
      success: true,
      message: `${filesToDelete.length} imágenes eliminadas exitosamente`,
      deletedCount: filesToDelete.length
    })
  } catch (error) {
    console.error('Error al eliminar imágenes:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Error al eliminar imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      },
      { status: 500 }
    )
  }
}