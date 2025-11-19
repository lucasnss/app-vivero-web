// 🎨 Optimización de Imágenes del Lado del Cliente
// Proyecto: ViveroWeb
// Objetivo: Comprimir y optimizar imágenes antes de subir al servidor

export interface CompressionOptions {
  quality?: number // 0.1 a 1.0
  maxWidth?: number
  maxHeight?: number
  format?: 'webp' | 'jpeg' | 'png'
  maintainAspectRatio?: boolean
}

export interface OptimizationResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  dimensions: {
    width: number
    height: number
  }
}

/**
 * Utilidades para optimización de imágenes en el cliente
 */
export class ClientImageOptimizer {
  private static readonly DEFAULT_OPTIONS: Required<CompressionOptions> = {
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 1200,
    format: 'webp',
    maintainAspectRatio: true
  }

  /**
   * Comprimir una imagen manteniendo calidad visual
   */
  static async compressImage(
    file: File, 
    options: CompressionOptions = {}
  ): Promise<OptimizationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      if (!ctx) {
        reject(new Error('No se pudo crear contexto de canvas'))
        return
      }

      img.onload = () => {
        try {
          // Calcular nuevas dimensiones
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            opts.maxWidth, 
            opts.maxHeight, 
            opts.maintainAspectRatio
          )

          canvas.width = width
          canvas.height = height

          // Configurar contexto para mejor calidad
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height)

          // Convertir a formato deseado
          const mimeType = this.getMimeType(opts.format)
          
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Error generando imagen comprimida'))
              return
            }

            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now()
            })

            const compressionRatio = ((file.size - blob.size) / file.size) * 100

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio,
              dimensions: { width, height }
            })
          }, mimeType, opts.quality)

        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Error cargando imagen'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Comprimir múltiples imágenes en lotes
   */
  static async compressMultipleImages(
    files: File[],
    options: CompressionOptions = {},
    onProgress?: (progress: number, current: number, total: number) => void
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.compressImage(files[i], options)
        results.push(result)
        
        const progress = ((i + 1) / files.length) * 100
        onProgress?.(progress, i + 1, files.length)
      } catch (error) {
        console.error(`Error comprimiendo imagen ${files[i].name}:`, error)
        // Crear resultado con archivo original si falla la compresión
        const img = await this.getImageDimensions(files[i])
        results.push({
          file: files[i],
          originalSize: files[i].size,
          compressedSize: files[i].size,
          compressionRatio: 0,
          dimensions: img
        })
      }
    }

    return results
  }

  /**
   * Generar thumbnail cuadrado optimizado
   */
  static async generateThumbnail(
    file: File,
    size: number = 150,
    quality: number = 0.7
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      if (!ctx) {
        reject(new Error('No se pudo crear contexto de canvas'))
        return
      }

      img.onload = () => {
        canvas.width = size
        canvas.height = size

        // Calcular crop centrado
        const scale = Math.max(size / img.width, size / img.height)
        const x = (size / 2) - (img.width / 2) * scale
        const y = (size / 2) - (img.height / 2) * scale

        // Configurar calidad
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Dibujar imagen centrada y recortada
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

        // Convertir a data URL
        const dataUrl = canvas.toDataURL('image/webp', quality)
        resolve(dataUrl)
      }

      img.onerror = () => reject(new Error('Error generando thumbnail'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Convertir imagen a formato WebP optimizado
   */
  static async convertToWebP(
    file: File,
    quality: number = 0.8
  ): Promise<File> {
    if (file.type === 'image/webp') {
      return file // Ya es WebP
    }

    const result = await this.compressImage(file, {
      format: 'webp',
      quality,
      maxWidth: 1920,
      maxHeight: 1920
    })

    return result.file
  }

  /**
   * Validar y optimizar imagen automáticamente
   */
  static async autoOptimize(
    file: File,
    targetSize: number = 1024 * 1024 // 1MB por defecto
  ): Promise<OptimizationResult> {
    // Si la imagen ya es pequeña, solo convertir a WebP
    if (file.size <= targetSize) {
      return await this.compressImage(file, {
        format: 'webp',
        quality: 0.9,
        maxWidth: 1920,
        maxHeight: 1920
      })
    }

    // Calcular calidad necesaria para alcanzar el tamaño objetivo
    let quality = 0.8
    let result = await this.compressImage(file, { quality, format: 'webp' })

    // Ajustar calidad iterativamente si es necesario
    let attempts = 0
    while (result.compressedSize > targetSize && quality > 0.3 && attempts < 5) {
      quality -= 0.1
      result = await this.compressImage(file, { quality, format: 'webp' })
      attempts++
    }

    return result
  }

  /**
   * Generar múltiples tamaños de la misma imagen
   */
  static async generateResponsiveImages(
    file: File,
    sizes: number[] = [400, 800, 1200],
    quality: number = 0.8
  ): Promise<{ size: number; file: File; dimensions: { width: number; height: number } }[]> {
    const results = []

    for (const size of sizes) {
      try {
        const result = await this.compressImage(file, {
          maxWidth: size,
          maxHeight: size,
          quality,
          format: 'webp'
        })

        results.push({
          size,
          file: result.file,
          dimensions: result.dimensions
        })
      } catch (error) {
        console.error(`Error generando imagen de tamaño ${size}:`, error)
      }
    }

    return results
  }

  // ========== UTILIDADES PRIVADAS ==========

  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean
  ): { width: number; height: number } {
    if (!maintainAspectRatio) {
      return {
        width: Math.min(originalWidth, maxWidth),
        height: Math.min(originalHeight, maxHeight)
      }
    }

    const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight)
    
    if (ratio >= 1) {
      return { width: originalWidth, height: originalHeight }
    }

    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    }
  }

  private static getMimeType(format: 'webp' | 'jpeg' | 'png'): string {
    switch (format) {
      case 'webp': return 'image/webp'
      case 'jpeg': return 'image/jpeg'
      case 'png': return 'image/png'
      default: return 'image/webp'
    }
  }

  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = () => reject(new Error('Error obteniendo dimensiones'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Obtener información detallada de una imagen
   */
  static async getImageInfo(file: File): Promise<{
    name: string
    size: number
    type: string
    dimensions: { width: number; height: number }
    aspectRatio: number
    megapixels: number
  }> {
    const dimensions = await this.getImageDimensions(file)
    
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      dimensions,
      aspectRatio: dimensions.width / dimensions.height,
      megapixels: (dimensions.width * dimensions.height) / 1000000
    }
  }
}

export default ClientImageOptimizer
