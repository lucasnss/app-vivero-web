import { supabase } from './supabaseClient'
import { validateImage, DEFAULT_IMAGE_CONFIG, type ImageConfig } from './imageValidations'

// Configuración del bucket
const BUCKET_NAME = 'product-images'

// Clase de error personalizada para operaciones de imágenes
export class ImageUploadError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_FORMAT' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED' | 'STORAGE_ERROR' | 'VALIDATION_FAILED',
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ImageUploadError'
  }
}

// Interfaz para opciones de subida
export interface UploadOptions {
  folder?: string
  validateFile?: boolean
  validationConfig?: Partial<ImageConfig>
}

// Interfaz para resultado de subida múltiple
export interface MultipleUploadResult {
  successful: string[]
  failed: { fileName: string, error: string }[]
  totalUploaded: number
  totalFiles: number
}

/**
 * Genera un nombre único para el archivo
 * @param originalName Nombre original del archivo
 * @param folder Carpeta de destino
 * @returns Nombre único del archivo
 */
function generateFileName(originalName: string, folder: string): string {
  const fileExt = originalName.split('.').pop()?.toLowerCase() || ''
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${folder}/${timestamp}-${randomStr}.${fileExt}`
}

/**
 * Sube una imagen a Supabase Storage con validaciones opcionales
 * @param file Archivo de imagen a subir
 * @param options Opciones de configuración
 * @returns URL pública de la imagen subida
 */
export async function uploadImage(
  file: File, 
  options: UploadOptions = {}
): Promise<string> {
  const { 
    folder = 'products', 
    validateFile = true, 
    validationConfig = {} 
  } = options

  try {
    // Validar archivo si está habilitado
    if (validateFile) {
      const validationResult = await validateImage(file, {
        ...DEFAULT_IMAGE_CONFIG,
        ...validationConfig
      })
      
      if (!validationResult.isValid) {
        throw new ImageUploadError(
          `Archivo inválido: ${validationResult.errors.join(', ')}`,
          'VALIDATION_FAILED'
        )
      }
    }

    const fileName = generateFileName(file.name, folder)

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (error) {
      throw new ImageUploadError(
        `Error al subir archivo: ${error.message}`,
        'UPLOAD_FAILED',
        error
      )
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)
      
    if (!publicUrlData.publicUrl) {
      throw new ImageUploadError(
        'Error al generar URL pública',
        'STORAGE_ERROR'
      )
    }

    console.log(`✅ Imagen subida exitosamente: ${fileName}`)
    return publicUrlData.publicUrl

  } catch (error) {
    if (error instanceof ImageUploadError) {
      throw error
    }
    
    console.error(`❌ Error al subir imagen ${file.name}:`, error)
    throw new ImageUploadError(
      `Error inesperado al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      'STORAGE_ERROR',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Sube múltiples imágenes en paralelo
 * @param files Array de archivos a subir
 * @param options Opciones de configuración
 * @returns Resultado detallado de la subida múltiple
 */
export async function uploadMultipleImages(
  files: File[],
  options: UploadOptions = {}
): Promise<MultipleUploadResult> {
  const { folder = 'products' } = options
  
  console.log(`🔄 Iniciando subida de ${files.length} imágenes...`)
  
  // Validar límite de archivos
  if (files.length > DEFAULT_IMAGE_CONFIG.maxImages) {
    throw new ImageUploadError(
      `Demasiadas imágenes: ${files.length}. Máximo permitido: ${DEFAULT_IMAGE_CONFIG.maxImages}`,
      'VALIDATION_FAILED'
    )
  }

  const successful: string[] = []
  const failed: { fileName: string, error: string }[] = []

  // Subir archivos en paralelo
  const uploadPromises = files.map(async (file) => {
    try {
      const url = await uploadImage(file, { ...options, folder })
      successful.push(url)
      return { success: true, url, fileName: file.name }
    } catch (error) {
      const errorMessage = error instanceof ImageUploadError 
        ? error.message 
        : `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      
      failed.push({ fileName: file.name, error: errorMessage })
      return { success: false, error: errorMessage, fileName: file.name }
    }
  })

  await Promise.all(uploadPromises)

  console.log(`✅ Subida completada: ${successful.length}/${files.length} exitosas`)
  
  return {
    successful,
    failed,
    totalUploaded: successful.length,
    totalFiles: files.length
  }
}

/**
 * Elimina una imagen de Supabase Storage
 * @param imageUrl URL completa de la imagen o nombre del archivo
 * @returns Promise que se resuelve cuando la imagen es eliminada
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extraer el nombre del archivo de la URL
    let fileName: string
    
    if (imageUrl.includes('/storage/v1/object/public/')) {
      // Es una URL completa, extraer el path del archivo
      const urlParts = imageUrl.split('/storage/v1/object/public/' + BUCKET_NAME + '/')
      if (urlParts.length !== 2) {
        throw new ImageUploadError(
          'URL de imagen inválida',
          'VALIDATION_FAILED'
        )
      }
      fileName = urlParts[1]
    } else {
      // Asumir que es un path relativo
      fileName = imageUrl
    }

    console.log(`🗑️ Eliminando imagen: ${fileName}`)

    // Eliminar archivo de Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName])

    if (error) {
      throw new ImageUploadError(
        `Error al eliminar imagen: ${error.message}`,
        'STORAGE_ERROR',
        error
      )
    }

    console.log(`✅ Imagen eliminada exitosamente: ${fileName}`)

  } catch (error) {
    if (error instanceof ImageUploadError) {
      throw error
    }
    
    console.error(`❌ Error al eliminar imagen ${imageUrl}:`, error)
    throw new ImageUploadError(
      `Error inesperado al eliminar imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      'STORAGE_ERROR',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Elimina múltiples imágenes en paralelo
 * @param imageUrls Array de URLs de imágenes a eliminar
 * @returns Resultado detallado de la eliminación múltiple
 */
export async function deleteMultipleImages(
  imageUrls: string[]
): Promise<{ successful: string[], failed: { url: string, error: string }[] }> {
  console.log(`🗑️ Eliminando ${imageUrls.length} imágenes...`)
  
  const successful: string[] = []
  const failed: { url: string, error: string }[] = []

  const deletePromises = imageUrls.map(async (url) => {
    try {
      await deleteImage(url)
      successful.push(url)
    } catch (error) {
      const errorMessage = error instanceof ImageUploadError 
        ? error.message 
        : `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      
      failed.push({ url, error: errorMessage })
    }
  })

  await Promise.all(deletePromises)

  console.log(`✅ Eliminación completada: ${successful.length}/${imageUrls.length} exitosas`)
  
  return { successful, failed }
}

/**
 * Obtiene el nombre del archivo desde una URL de Supabase Storage
 * @param imageUrl URL completa de la imagen
 * @returns Nombre del archivo o null si la URL es inválida
 */
export function getFileNameFromUrl(imageUrl: string): string | null {
  try {
    if (imageUrl.includes('/storage/v1/object/public/')) {
      const urlParts = imageUrl.split('/storage/v1/object/public/' + BUCKET_NAME + '/')
      return urlParts.length === 2 ? urlParts[1] : null
    }
    return null
  } catch {
    return null
  }
}

/**
 * Verifica si una URL de imagen existe en el storage
 * @param imageUrl URL de la imagen a verificar
 * @returns true si la imagen existe, false en caso contrario
 */
export async function imageExists(imageUrl: string): Promise<boolean> {
  try {
    const fileName = getFileNameFromUrl(imageUrl)
    if (!fileName) return false

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(fileName.split('/')[0], {
        search: fileName.split('/').pop()
      })

    return !error && data && data.length > 0
  } catch {
    return false
  }
}

// Mantener compatibilidad con la función original (DEPRECATED)
export async function uploadImageLegacy(file: File, folder: string = 'products'): Promise<string> {
  console.warn('⚠️ uploadImageLegacy is deprecated. Use uploadImage with options instead.')
  return uploadImage(file, { folder, validateFile: false })
}