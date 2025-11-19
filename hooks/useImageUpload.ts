"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  uploadImage, 
  uploadMultipleImages, 
  deleteImage, 
  deleteMultipleImages,
  ImageUploadError,
  type UploadOptions,
  type MultipleUploadResult 
} from '@/lib/uploadImage'
import { ImageService } from '@/src/services/imageService'
import { 
  validateImage, 
  validateMultipleImages, 
  generateImagePreview,
  DEFAULT_IMAGE_CONFIG,
  type ImageConfig,
  compressImage
} from '@/lib/imageValidations'
import { 
  type ImageUploadState, 
  type ImagePreview 
} from '@/types/product'

// Configuración del hook
export interface UseImageUploadConfig {
  maxImages?: number
  validateOnAdd?: boolean
  autoUpload?: boolean
  folder?: string
  validationConfig?: Partial<ImageConfig>
  onUploadStart?: () => void
  onUploadComplete?: (urls: string[]) => void
  onUploadError?: (error: string) => void
  onImageAdd?: (image: ImageUploadState) => void
  onImageRemove?: (index: number) => void
}

// Estado del hook
export interface UseImageUploadState {
  // Estado principal
  images: ImageUploadState[]
  existingImages: ImagePreview[]
  uploading: boolean
  uploadProgress: number
  errors: string[]
  warnings: string[]
  
  // Métrica de estado
  totalImages: number
  hasChanges: boolean
  canUpload: boolean
  isValid: boolean
}

// Resultado del hook
export interface UseImageUploadActions {
  // Gestión de archivos
  addImages: (files: File[]) => Promise<void>
  removeImage: (index: number) => void
  removeImageByUrl: (url: string) => void
  clearImages: () => void
  replaceImage: (index: number, file: File) => Promise<void>
  
  // Subida de imágenes
  uploadImages: (folder?: string) => Promise<string[]>
  uploadSingleImage: (index: number, folder?: string) => Promise<string>
  
  // Gestión de imágenes existentes
  setExistingImages: (images: ImagePreview[]) => void
  deleteExistingImage: (url: string) => Promise<void>
  reorderImages: (newOrder: ImagePreview[]) => void
  
  // Utilidades
  validateAll: () => Promise<boolean>
  getUploadedUrls: () => string[]
  resetState: () => void
  
  // Estado computado
  getTotalImageCount: () => number
  getErrorsForImage: (index: number) => string[]
  hasImage: (url: string) => boolean
  
  // Nuevas funciones con ImageService
  compressImage: (file: File, quality?: number) => Promise<File>
  generateThumbnail: (file: File, size?: number) => Promise<string>
  listServerImages: (folder?: string) => Promise<any[]>
  validateImageWithService: (file: File) => Promise<boolean>
  uploadWithService: (file: File) => Promise<string | null>
  uploadMultipleWithService: (files: File[]) => Promise<{
    successful: string[]
    failed: Array<{ file: File; error: string }>
  }>
  deleteWithService: (urlOrPath: string) => Promise<boolean>
}

// Hook principal
export function useImageUpload(config: UseImageUploadConfig = {}): [UseImageUploadState, UseImageUploadActions] {
  const {
    maxImages = DEFAULT_IMAGE_CONFIG.maxImages,
    validateOnAdd = true,
    autoUpload = false,
    folder = 'products',
    validationConfig = {},
    onUploadStart,
    onUploadComplete,
    onUploadError,
    onImageAdd,
    onImageRemove
  } = config

  // Estados principales
  const [images, setImages] = useState<ImageUploadState[]>([])
  const [existingImages, setExistingImages] = useState<ImagePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])

  // Referencias para limpieza
  const previewUrls = useRef<string[]>([])

  // Configuración de validación
  const validationOptions = {
    ...DEFAULT_IMAGE_CONFIG,
    maxImages,
    ...validationConfig
  }

  // Limpieza de URLs de preview al desmontar
  useEffect(() => {
    return () => {
      previewUrls.current.forEach(url => {
        try {
          URL.revokeObjectURL(url)
        } catch {
          // Ignorar errores de limpieza
        }
      })
    }
  }, [])

  // Estado computado
  const state: UseImageUploadState = {
    images,
    existingImages,
    uploading,
    uploadProgress,
    errors,
    warnings,
    totalImages: images.length + existingImages.length,
    hasChanges: images.length > 0,
    canUpload: images.length > 0 && !uploading && errors.length === 0,
    isValid: errors.length === 0 && (images.length + existingImages.length) <= maxImages
  }

  // Función para agregar imágenes
  const addImages = useCallback(async (files: File[]): Promise<void> => {
    try {
      setErrors([])
      setWarnings([])

      // Validar límite total de imágenes
      const totalAfterAdd = images.length + files.length
      if (totalAfterAdd > maxImages) {
        const error = `Demasiadas imágenes. Máximo permitido: ${maxImages}. Total después de agregar: ${totalAfterAdd}`
        setErrors([error])
        onUploadError?.(error)
        return
      }

      // Validar archivos si está habilitado
      if (validateOnAdd) {
        const validation = await validateMultipleImages(files, validationOptions)
        
        if (!validation.overallValid) {
          const errorMessages = validation.results
            .filter(r => !r.isValid)
            .map(r => r.errors.join(', '))
          setErrors(errorMessages)
          return
        }

        if (validation.totalWarnings > 0) {
          const warningMessages = validation.results
            .filter(r => r.warnings && r.warnings.length > 0)
            .map(r => r.warnings!.join(', '))
          setWarnings(warningMessages)
        }
      }

      // Crear estados de imagen con preview
      const newImages: ImageUploadState[] = []
      
      for (const file of files) {
        try {
          // Comprimir imagen antes de procesar
          const compressedFile = await compressImage(file, 0.8, 1200, 1200)
          
          const preview = await generateImagePreview(compressedFile)
          previewUrls.current.push(preview)
          
          const imageState: ImageUploadState = {
            file: compressedFile,  // Usar file comprimido
            preview,
            uploading: false,
            error: undefined,
            progress: 0
          }
          
          newImages.push(imageState)
          onImageAdd?.(imageState)
        } catch (error) {
          // Si falla compresión, usar original
          const preview = await generateImagePreview(file)
          previewUrls.current.push(preview)
          
          const imageState: ImageUploadState = {
            file,  // Usar original si falla compresión
            preview,
            uploading: false,
            error: undefined,
            progress: 0
          }
          
          newImages.push(imageState)
          onImageAdd?.(imageState)
          
          console.warn(`No se pudo comprimir ${file.name}, usando original:`, error)
        }
      }

      // Agregar al estado
      setImages(prev => [...prev, ...newImages])

      // Auto-upload si está habilitado
      if (autoUpload && newImages.length > 0) {
        await uploadImages(folder)
      }

    } catch (error) {
      const errorMessage = `Error agregando imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`
      setErrors([errorMessage])
      onUploadError?.(errorMessage)
    }
  }, [images, existingImages, maxImages, validateOnAdd, validationOptions, autoUpload, folder, onUploadError, onImageAdd])

  // Función para remover imagen por índice
  const removeImage = useCallback((index: number): void => {
    if (index < 0 || index >= images.length) return

    setImages(prev => {
      const newImages = [...prev]
      const removedImage = newImages[index]
      
      // Limpiar URL de preview
      if (removedImage.preview && previewUrls.current.includes(removedImage.preview)) {
        try {
          URL.revokeObjectURL(removedImage.preview)
        } catch {
          // Ignorar errores de limpieza
        }
        previewUrls.current = previewUrls.current.filter(url => url !== removedImage.preview)
      }
      
      newImages.splice(index, 1)
      onImageRemove?.(index)
      
      return newImages
    })
    
    // Limpiar errores si ya no hay imágenes
    if (images.length === 1) {
      setErrors([])
      setWarnings([])
    }
  }, [images, onImageRemove])

  // Función para remover imagen por URL
  const removeImageByUrl = useCallback((url: string): void => {
    const index = images.findIndex(img => img.preview === url)
    if (index !== -1) {
      removeImage(index)
    }
  }, [images, removeImage])

  // Función para limpiar todas las imágenes
  const clearImages = useCallback((): void => {
    // Limpiar URLs de preview
    previewUrls.current.forEach(url => {
      try {
        URL.revokeObjectURL(url)
      } catch {
        // Ignorar errores de limpieza
      }
    })
    previewUrls.current = []
    
    setImages([])
    setErrors([])
    setWarnings([])
    setUploadProgress(0)
  }, [])

  // Función para reemplazar imagen
  const replaceImage = useCallback(async (index: number, file: File): Promise<void> => {
    if (index < 0 || index >= images.length) return

    try {
      // Validar nuevo archivo
      if (validateOnAdd) {
        const validation = await validateImage(file, validationOptions)
        if (!validation.isValid) {
          setErrors([`Archivo inválido: ${validation.errors.join(', ')}`])
          return
        }
      }

      // Generar nuevo preview
      const preview = await generateImagePreview(file)
      previewUrls.current.push(preview)

      setImages(prev => {
        const newImages = [...prev]
        const oldImage = newImages[index]
        
        // Limpiar preview anterior
        if (oldImage.preview && previewUrls.current.includes(oldImage.preview)) {
          try {
            URL.revokeObjectURL(oldImage.preview)
          } catch {
            // Ignorar errores de limpieza
          }
          previewUrls.current = previewUrls.current.filter(url => url !== oldImage.preview)
        }
        
        // Crear nueva imagen
        newImages[index] = {
          file,
          preview,
          uploading: false,
          error: undefined,
          progress: 0
        }
        
        return newImages
      })

      setErrors([])
    } catch (error) {
      const errorMessage = `Error reemplazando imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`
      setErrors([errorMessage])
    }
  }, [images, validateOnAdd, validationOptions])

  // Función para subir todas las imágenes
  const uploadImages = useCallback(async (uploadFolder: string = folder): Promise<string[]> => {
    if (images.length === 0) return []

    try {
      setUploading(true)
      setUploadProgress(0)
      onUploadStart?.()

      // Actualizar estado de imágenes a "uploading"
      setImages(prev => prev.map(img => ({ ...img, uploading: true, error: undefined })))

      const files = images.map(img => img.file)
      const uploadOptions: UploadOptions = {
        folder: uploadFolder,
        validateFile: !validateOnAdd, // Si ya validamos al agregar, no validar de nuevo
        validationConfig: validationOptions
      }

      const result: MultipleUploadResult = await uploadMultipleImages(files, uploadOptions)

      // Actualizar progreso
      setUploadProgress(100)

      // Manejar errores de subida
      if (result.failed.length > 0) {
        const failedErrors = result.failed.map(f => `${f.fileName}: ${f.error}`)
        setErrors(failedErrors)
        
        // Actualizar estado de imágenes fallidas
        setImages(prev => prev.map((img, index) => {
          const failed = result.failed.find(f => f.fileName === img.file.name)
          return {
            ...img,
            uploading: false,
            error: failed?.error
          }
        }))

        if (result.successful.length === 0) {
          throw new Error(`Todas las subidas fallaron: ${failedErrors.join(', ')}`)
        }
      } else {
        // Todas las subidas exitosas
        setImages(prev => prev.map(img => ({ ...img, uploading: false, error: undefined })))
        setErrors([])
      }

      onUploadComplete?.(result.successful)
      return result.successful

    } catch (error) {
      const errorMessage = error instanceof ImageUploadError 
        ? error.message 
        : `Error subiendo imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`
      
      setErrors([errorMessage])
      onUploadError?.(errorMessage)
      
      // Resetear estado de upload
      setImages(prev => prev.map(img => ({ ...img, uploading: false })))
      
      throw error
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [images, folder, validateOnAdd, validationOptions, onUploadStart, onUploadComplete, onUploadError])

  // Función para subir imagen individual
  const uploadSingleImage = useCallback(async (index: number, uploadFolder: string = folder): Promise<string> => {
    if (index < 0 || index >= images.length) {
      throw new Error('Índice de imagen inválido')
    }

    const imageState = images[index]
    
    try {
      // Actualizar estado de la imagen específica
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, uploading: true, error: undefined } : img
      ))

      const uploadOptions: UploadOptions = {
        folder: uploadFolder,
        validateFile: !validateOnAdd,
        validationConfig: validationOptions
      }

      const url = await uploadImage(imageState.file, uploadOptions)

      // Actualizar estado de éxito
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, uploading: false, error: undefined } : img
      ))

      return url

    } catch (error) {
      const errorMessage = error instanceof ImageUploadError 
        ? error.message 
        : `Error subiendo imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`

      // Actualizar estado de error
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, uploading: false, error: errorMessage } : img
      ))

      throw error
    }
  }, [images, folder, validateOnAdd, validationOptions])

  // Función para establecer imágenes existentes
  const setExistingImagesAction = useCallback((newExistingImages: ImagePreview[]): void => {
    setExistingImages(newExistingImages)
  }, [])

  // Función para eliminar imagen existente
  const deleteExistingImage = useCallback(async (url: string): Promise<void> => {
    try {
      await deleteImage(url)
      setExistingImages(prev => prev.filter(img => img.url !== url))
    } catch (error) {
      const errorMessage = `Error eliminando imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`
      setErrors(prev => [...prev, errorMessage])
      throw error
    }
  }, [])

  // Función para reordenar imágenes existentes
  const reorderImages = useCallback((newOrder: ImagePreview[]): void => {
    setExistingImages(newOrder)
  }, [])

  // Función para validar todas las imágenes
  const validateAll = useCallback(async (): Promise<boolean> => {
    if (images.length === 0) return true

    try {
      const files = images.map(img => img.file)
      const validation = await validateMultipleImages(files, validationOptions)
      
      if (!validation.overallValid) {
        const errorMessages = validation.results
          .filter(r => !r.isValid)
          .map((r, index) => `Imagen ${index + 1}: ${r.errors.join(', ')}`)
        setErrors(errorMessages)
        return false
      }

      setErrors([])
      return true
    } catch (error) {
      const errorMessage = `Error validando imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`
      setErrors([errorMessage])
      return false
    }
  }, [images, validationOptions])

  // Función para obtener URLs subidas
  const getUploadedUrls = useCallback((): string[] => {
    return existingImages.map(img => img.url)
  }, [existingImages])

  // Función para resetear estado
  const resetState = useCallback((): void => {
    clearImages()
    setExistingImages([])
    setUploadProgress(0)
  }, [clearImages])

  // Función para obtener total de imágenes
  const getTotalImageCount = useCallback((): number => {
    return images.length + existingImages.length
  }, [images.length, existingImages.length])

  // Función para obtener errores de imagen específica
  const getErrorsForImage = useCallback((index: number): string[] => {
    if (index < 0 || index >= images.length) return []
    const imageState = images[index]
    return imageState.error ? [imageState.error] : []
  }, [images])

  // Función para verificar si existe una imagen
  const hasImage = useCallback((url: string): boolean => {
    return existingImages.some(img => img.url === url) || 
           images.some(img => img.preview === url)
  }, [existingImages, images])

  // ========== NUEVAS FUNCIONES CON IMAGESERVICE ==========

  // Comprimir imagen antes de subir
  const compressImage = useCallback(async (file: File, quality: number = 0.8): Promise<File> => {
    try {
      return await ImageService.compressImage(file, quality)
    } catch (error) {
      console.error('Error comprimiendo imagen:', error)
      return file // Devolver archivo original si falla
    }
  }, [])

  // Generar thumbnail de imagen
  const generateThumbnail = useCallback(async (file: File, size: number = 150): Promise<string> => {
    try {
      return await ImageService.generateThumbnail(file, size)
    } catch (error) {
      console.error('Error generando thumbnail:', error)
      throw error
    }
  }, [])

  // Listar imágenes disponibles en el servidor
  const listServerImages = useCallback(async (folder: string = 'products'): Promise<any[]> => {
    try {
      const response = await ImageService.listImages(folder)
      if (response.success && response.data) {
        return response.data.images
      }
      return []
    } catch (error) {
      console.error('Error obteniendo imágenes del servidor:', error)
      return []
    }
  }, [])

  // Validar imagen usando el nuevo servicio
  const validateImageWithService = useCallback(async (file: File): Promise<boolean> => {
    try {
      const validation = await ImageService.validateImage(file)
      if (!validation.isValid) {
        setErrors(prev => [...prev, validation.error || 'Error de validación'])
        return false
      }
      return true
    } catch (error) {
      const errorMessage = `Error validando imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`
      setErrors(prev => [...prev, errorMessage])
      return false
    }
  }, [])

  // Subir usando el nuevo servicio de imágenes
  const uploadWithService = useCallback(async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      const response = await ImageService.uploadImage(file, config.folder)
      
      if (response.success && response.data) {
        return response.data.url
      } else {
        throw new Error(response.error || 'Error desconocido')
      }
    } catch (error) {
      const errorMessage = `Error subiendo imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`
      setErrors(prev => [...prev, errorMessage])
      return null
    } finally {
      setUploading(false)
    }
  }, [config.folder])

  // Subir múltiples imágenes con progreso
  const uploadMultipleWithService = useCallback(async (files: File[]): Promise<{
    successful: string[]
    failed: Array<{ file: File; error: string }>
  }> => {
    try {
      setUploading(true)
      setUploadProgress(0)

      const response = await ImageService.uploadMultipleImages(
        files,
        config.folder,
        (progress, current, total) => {
          setUploadProgress(progress)
          config.onUploadStart?.()
        }
      )

      const successful = response.successful
        .map(r => r.data?.url)
        .filter((url): url is string => Boolean(url))

      if (response.failed.length > 0) {
        const errorMessages = response.failed.map(f => 
          `${f.file.name}: ${f.error}`
        )
        setErrors(prev => [...prev, ...errorMessages])
      }

      if (successful.length > 0) {
        config.onUploadComplete?.(successful)
      }

      return {
        successful,
        failed: response.failed
      }
    } catch (error) {
      const errorMessage = `Error subiendo imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`
      setErrors(prev => [...prev, errorMessage])
      return { successful: [], failed: [] }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [config.folder, config.onUploadStart, config.onUploadComplete])

  // Eliminar imagen usando el nuevo servicio
  const deleteWithService = useCallback(async (urlOrPath: string): Promise<boolean> => {
    try {
      const response = await ImageService.deleteImage(urlOrPath)
      if (!response.success) {
        throw new Error(response.error || 'Error eliminando imagen')
      }
      return true
    } catch (error) {
      const errorMessage = `Error eliminando imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`
      setErrors(prev => [...prev, errorMessage])
      return false
    }
  }, [])

  // Acciones del hook
  const actions: UseImageUploadActions = {
    addImages,
    removeImage,
    removeImageByUrl,
    clearImages,
    replaceImage,
    uploadImages,
    uploadSingleImage,
    setExistingImages: setExistingImagesAction,
    deleteExistingImage,
    reorderImages,
    validateAll,
    getUploadedUrls,
    resetState,
    getTotalImageCount,
    getErrorsForImage,
    hasImage,
    // Nuevas funciones con ImageService
    compressImage,
    generateThumbnail,
    listServerImages,
    validateImageWithService,
    uploadWithService,
    uploadMultipleWithService,
    deleteWithService
  }

  return [state, actions]
}