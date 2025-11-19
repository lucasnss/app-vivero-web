import { ImageValidationResult, ImageConfig, DEFAULT_IMAGE_CONFIG } from '../types/product'

// Re-exportar tipos e interfaces para facilitar las importaciones
export { DEFAULT_IMAGE_CONFIG, type ImageConfig } from '../types/product'

/**
 * Valida el formato de una imagen
 * @param file Archivo de imagen a validar
 * @param allowedFormats Formatos permitidos (opcional, usa configuración por defecto)
 * @returns Resultado de validación
 */
export function validateImageFormat(
  file: File, 
  allowedFormats: string[] = DEFAULT_IMAGE_CONFIG.allowedFormats
): ImageValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Verificar que el archivo existe
  if (!file) {
    return {
      isValid: false,
      errors: ['No se proporcionó ningún archivo']
    }
  }

  // Verificar que el archivo tenga las propiedades necesarias
  if (!file.type) {
    errors.push('El archivo no tiene tipo MIME válido')
  } else {
    // Verificar tipo MIME
    if (!allowedFormats.includes(file.type)) {
      errors.push(`Formato no soportado: ${file.type}. Formatos permitidos: ${allowedFormats.join(', ')}`)
    }
  }

  // Verificar extensión del archivo
  if (!file.name) {
    errors.push('El archivo no tiene nombre válido')
  } else {
    const fileName = file.name.toLowerCase()
    const validExtensions = allowedFormats.map(format => {
      switch (format) {
        case 'image/jpeg': return '.jpg'
        case 'image/png': return '.png'
        case 'image/webp': return '.webp'
        case 'image/gif': return '.gif'
        case 'image/svg+xml': return '.svg'
        default: return ''
      }
    }).filter(ext => ext)

    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    if (!hasValidExtension) {
      warnings.push(`Extensión de archivo no reconocida. Extensiones recomendadas: ${validExtensions.join(', ')}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Valida el tamaño de una imagen
 * @param file Archivo de imagen a validar
 * @param maxSize Tamaño máximo en bytes (opcional, usa configuración por defecto)
 * @returns Resultado de validación
 */
export function validateImageSize(
  file: File, 
  maxSize: number = DEFAULT_IMAGE_CONFIG.maxSize
): ImageValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!file) {
    return {
      isValid: false,
      errors: ['No se proporcionó ningún archivo']
    }
  }

  const fileSize = file.size
  const maxSizeMB = maxSize / (1024 * 1024)

  if (fileSize > maxSize) {
    errors.push(`El archivo es demasiado grande: ${(fileSize / (1024 * 1024)).toFixed(2)}MB. Máximo permitido: ${maxSizeMB}MB`)
  }

  // Advertencia si el archivo es muy grande pero dentro del límite
  if (fileSize > maxSize * 0.8) {
    warnings.push(`El archivo es grande (${(fileSize / (1024 * 1024)).toFixed(2)}MB). Considera comprimirlo para mejor rendimiento.`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings // Siempre devolver el array de warnings, incluso si está vacío
  }
}

/**
 * Valida las dimensiones de una imagen
 * @param file Archivo de imagen a validar
 * @param minWidth Ancho mínimo (opcional, usa configuración por defecto)
 * @param minHeight Alto mínimo (opcional, usa configuración por defecto)
 * @returns Promise con resultado de validación
 */
export function validateImageDimensions(
  file: File,
  minWidth: number = DEFAULT_IMAGE_CONFIG.minDimensions.width,
  minHeight: number = DEFAULT_IMAGE_CONFIG.minDimensions.height
): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    const errors: string[] = []
    const warnings: string[] = []

    if (!file) {
      resolve({
        isValid: false,
        errors: ['No se proporcionó ningún archivo']
      })
      return
    }

    // Crear URL temporal para la imagen
    const imageUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(imageUrl) // Limpiar URL temporal

      const { width, height } = img

      // Validar dimensiones mínimas
      if (width < minWidth || height < minHeight) {
        errors.push(`Dimensiones insuficientes: ${width}x${height}px. Mínimo requerido: ${minWidth}x${minHeight}px`)
      }

      // Advertencia si las dimensiones son muy pequeñas pero dentro del límite
      if (width < minWidth * 1.5 || height < minHeight * 1.5) {
        warnings.push(`Dimensiones pequeñas: ${width}x${height}px. Recomendado: ${DEFAULT_IMAGE_CONFIG.recommendedDimensions.width}x${DEFAULT_IMAGE_CONFIG.recommendedDimensions.height}px`)
      }

      // Advertencia si la imagen es muy grande
      if (width > 2000 || height > 2000) {
        warnings.push(`Dimensiones muy grandes: ${width}x${height}px. Considera redimensionar para mejor rendimiento.`)
      }

      resolve({
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      resolve({
        isValid: false,
        errors: ['No se pudo cargar la imagen para validar dimensiones']
      })
    }

    img.src = imageUrl
  })
}

/**
 * Genera un preview de una imagen
 * @param file Archivo de imagen
 * @param maxWidth Ancho máximo del preview (opcional)
 * @param maxHeight Alto máximo del preview (opcional)
 * @returns Promise con URL del preview
 */
export function generateImagePreview(
  file: File,
  maxWidth: number = 300,
  maxHeight: number = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No se proporcionó ningún archivo'))
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calcular dimensiones del preview manteniendo proporción
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Configurar canvas
      canvas.width = width
      canvas.height = height

      // Dibujar imagen redimensionada
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        const previewUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(previewUrl)
      } else {
        reject(new Error('No se pudo crear el contexto del canvas'))
      }
    }

    img.onerror = () => {
      reject(new Error('No se pudo cargar la imagen'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Valida múltiples aspectos de una imagen
 * @param file Archivo de imagen a validar
 * @param config Configuración de validación (opcional)
 * @returns Promise con resultado completo de validación
 */
export async function validateImage(
  file: File,
  config: Partial<ImageConfig> = {}
): Promise<ImageValidationResult> {
  const mergedConfig = { ...DEFAULT_IMAGE_CONFIG, ...config }
  const errors: string[] = []
  const warnings: string[] = []

  // Validar formato
  const formatValidation = validateImageFormat(file, mergedConfig.allowedFormats)
  errors.push(...formatValidation.errors)
  if (formatValidation.warnings) warnings.push(...formatValidation.warnings)

  // Validar tamaño
  const sizeValidation = validateImageSize(file, mergedConfig.maxSize)
  errors.push(...sizeValidation.errors)
  if (sizeValidation.warnings) warnings.push(...sizeValidation.warnings)

  // Validar dimensiones (solo si es una imagen válida hasta ahora)
  if (formatValidation.isValid) {
    const dimensionValidation = await validateImageDimensions(
      file,
      mergedConfig.minDimensions.width,
      mergedConfig.minDimensions.height
    )
    errors.push(...dimensionValidation.errors)
    if (dimensionValidation.warnings) warnings.push(...dimensionValidation.warnings)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Valida múltiples archivos de imagen
 * @param files Array de archivos a validar
 * @param config Configuración de validación (opcional)
 * @returns Promise con resultados de validación
 */
export async function validateMultipleImages(
  files: File[],
  config: Partial<ImageConfig> = {}
): Promise<{
  results: ImageValidationResult[]
  overallValid: boolean
  totalErrors: number
  totalWarnings: number
}> {
  const mergedConfig = { ...DEFAULT_IMAGE_CONFIG, ...config }
  const results: ImageValidationResult[] = []
  let totalErrors = 0
  let totalWarnings = 0

  // Validar límite de archivos
  if (files.length > mergedConfig.maxImages) {
    return {
      results: [{
        isValid: false,
        errors: [`Demasiadas imágenes: ${files.length}. Máximo permitido: ${mergedConfig.maxImages}`]
      }],
      overallValid: false,
      totalErrors: 1,
      totalWarnings: 0
    }
  }

  // Validar cada archivo
  for (const file of files) {
    const validation = await validateImage(file, mergedConfig)
    results.push(validation)
    
    totalErrors += validation.errors.length
    if (validation.warnings) totalWarnings += validation.warnings.length
  }

  return {
    results,
    overallValid: totalErrors === 0,
    totalErrors,
    totalWarnings
  }
}

/**
 * Comprime una imagen antes de subir
 * @param file Archivo de imagen a comprimir
 * @param quality Calidad de compresión (0-1, opcional)
 * @param maxWidth Ancho máximo (opcional)
 * @param maxHeight Alto máximo (opcional)
 * @returns Promise con archivo comprimido
 */
export function compressImage(
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      let { width, height } = img

      // Redimensionar si es necesario
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('No se pudo comprimir la imagen'))
            }
          },
          file.type,
          quality
        )
      } else {
        reject(new Error('No se pudo crear el contexto del canvas'))
      }
    }

    img.onerror = () => {
      reject(new Error('No se pudo cargar la imagen para comprimir'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Obtiene información básica de una imagen
 * @param file Archivo de imagen
 * @returns Promise con información de la imagen
 */
export function getImageInfo(file: File): Promise<{
  name: string
  size: number
  type: string
  width?: number
  height?: number
  lastModified: Date
}> {
  return new Promise((resolve, reject) => {
    const info = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    }

    // Obtener dimensiones si es posible
    if (file.type.startsWith('image/')) {
      const img = new Image()
      
      img.onload = () => {
        resolve({
          ...info,
          width: img.width,
          height: img.height
        })
      }

      img.onerror = () => {
        resolve(info) // Resolver sin dimensiones si no se pueden obtener
      }

      img.src = URL.createObjectURL(file)
    } else {
      resolve(info)
    }
  })
}

/**
 * Convierte un archivo a base64
 * @param file Archivo a convertir
 * @returns Promise con string base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Error al convertir archivo a base64'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Verifica si un archivo es una imagen válida
 * @param file Archivo a verificar
 * @returns true si es una imagen válida
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Obtiene la extensión de un archivo
 * @param fileName Nombre del archivo
 * @returns Extensión del archivo (sin el punto)
 */
export function getFileExtension(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return ''
  }
  
  // Si el nombre comienza con punto, es un archivo oculto sin extensión
  if (fileName.startsWith('.') && !fileName.substring(1).includes('.')) {
    return ''
  }
  
  const parts = fileName.split('.')
  // Si no hay punto o solo hay un punto al inicio, no hay extensión
  if (parts.length <= 1 || (parts.length === 2 && parts[0] === '')) {
    return ''
  }
  
  const ext = parts.pop()?.toLowerCase() || ''
  return ext ? `.${ext}` : ''
}

/**
 * Formatea el tamaño de un archivo para mostrar
 * @param bytes Tamaño en bytes
 * @returns String formateado (ej: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 