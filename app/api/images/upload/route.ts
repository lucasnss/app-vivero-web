import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/src/lib/supabaseClient'
import { validateImage, DEFAULT_IMAGE_CONFIG } from '@/src/lib/imageValidations'

// Bucket de Supabase Storage
const BUCKET_NAME = 'product-images'

/**
 * POST /api/images/upload
 * Sube una imagen al almacenamiento
 */
export async function POST(request: NextRequest) {
  try {

    // Procesar formulario multipart
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'products'

    // Validar que se proporcionó un archivo
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar archivo antes de subir
    const validationResult = await validateImage(file)
    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Archivo inválido: ${validationResult.errors.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${folder}/${timestamp}-${randomStr}.${fileExt}`

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) {
      console.error('Error al subir archivo:', error)
      return NextResponse.json(
        { success: false, error: `Error al subir archivo: ${error.message}` },
        { status: 500 }
      )
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    // Registrar actividad de subida (opcional)
    console.log(`✅ Imagen subida exitosamente: ${fileName}`)

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrlData.publicUrl,
        path: fileName,
        publicUrl: publicUrlData.publicUrl
      }
    })
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Error al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      },
      { status: 500 }
    )
  }
}

/**
 * Límite de tamaño para subida de archivos
 * Aumentado a 10MB para permitir imágenes de alta calidad
 */
export const maxDuration = 60