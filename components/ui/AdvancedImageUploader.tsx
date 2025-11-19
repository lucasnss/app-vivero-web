"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ClientImageOptimizer } from '@/src/lib/clientImageOptimization'
import Image from 'next/image'

interface AdvancedImageUploaderProps {
  maxImages?: number
  maxFileSize?: number // en bytes
  acceptedTypes?: string[]
  onImagesChange?: (files: File[]) => void
  onUpload?: (files: File[]) => Promise<string[]>
  autoOptimize?: boolean
  showPreview?: boolean
  showProgress?: boolean
  dragDropText?: string
  className?: string
  disabled?: boolean
}

interface FileWithPreview extends File {
  preview?: string
  optimized?: boolean
  compressionRatio?: number
}

export function AdvancedImageUploader({
  maxImages = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  onImagesChange,
  onUpload,
  autoOptimize = true,
  showPreview = true,
  showProgress = true,
  dragDropText = 'Arrastra imágenes aquí o haz clic para seleccionar',
  className = '',
  disabled = false
}: AdvancedImageUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [optimizationStats, setOptimizationStats] = useState<{
    originalSize: number
    compressedSize: number
    savings: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Cleanup URLs cuando el componente se desmonta
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no válido: ${file.type}`
    }
    if (file.size > maxFileSize) {
      return `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máximo ${(maxFileSize / 1024 / 1024).toFixed(1)}MB)`
    }
    return null
  }, [acceptedTypes, maxFileSize])

  const processFiles = useCallback(async (newFiles: File[]) => {
    setIsProcessing(true)
    setErrors([])
    
    const validFiles: FileWithPreview[] = []
    const fileErrors: string[] = []
    let totalOriginalSize = 0
    let totalCompressedSize = 0

    for (const file of newFiles) {
      // Validar archivo
      const error = validateFile(file)
      if (error) {
        fileErrors.push(`${file.name}: ${error}`)
        continue
      }

      // Verificar límite de archivos
      if (files.length + validFiles.length >= maxImages) {
        fileErrors.push(`Máximo ${maxImages} imágenes permitidas`)
        break
      }

      try {
        let processedFile: FileWithPreview = file as FileWithPreview

        // Optimizar imagen si está habilitado
        if (autoOptimize) {
          const result = await ClientImageOptimizer.autoOptimize(file)
          processedFile = result.file as FileWithPreview
          processedFile.optimized = true
          processedFile.compressionRatio = result.compressionRatio
          
          totalOriginalSize += result.originalSize
          totalCompressedSize += result.compressedSize
        } else {
          totalOriginalSize += file.size
          totalCompressedSize += file.size
        }

        // Generar preview
        if (showPreview) {
          processedFile.preview = URL.createObjectURL(processedFile)
        }

        validFiles.push(processedFile)
      } catch (error) {
        fileErrors.push(`${file.name}: Error procesando imagen`)
        console.error('Error processing file:', error)
      }
    }

    // Actualizar estadísticas de optimización
    if (autoOptimize && totalOriginalSize > 0) {
      const savings = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
      setOptimizationStats({
        originalSize: totalOriginalSize,
        compressedSize: totalCompressedSize,
        savings
      })
    }

    setFiles(prev => {
      const newFiles = [...prev, ...validFiles]
      onImagesChange?.(newFiles)
      return newFiles
    })
    setErrors(fileErrors)
    setIsProcessing(false)
  }, [files.length, maxImages, validateFile, autoOptimize, showPreview, onImagesChange])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles)
    }
    // Reset input value para permitir seleccionar el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFiles])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const droppedFiles = Array.from(event.dataTransfer.files)
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles)
    }
  }, [processFiles, disabled])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index)
      onImagesChange?.(newFiles)
      return newFiles
    })
  }, [onImagesChange])

  const handleUpload = useCallback(async () => {
    if (!onUpload || files.length === 0) return

    try {
      setIsProcessing(true)
      setUploadProgress(0)

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const urls = await onUpload(files)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Limpiar archivos después de subir exitosamente
      setTimeout(() => {
        setFiles([])
        setUploadProgress(0)
        setOptimizationStats(null)
      }, 1000)

      return urls
    } catch (error) {
      setErrors(['Error subiendo imágenes'])
      console.error('Upload error:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [files, onUpload])

  const formatFileSize = (bytes: number): string => {
    return (bytes / 1024 / 1024).toFixed(1) + 'MB'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zona de Drop */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            ) : (
              <Upload className="w-8 h-8 text-gray-500" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isProcessing ? 'Procesando imágenes...' : dragDropText}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Máximo {maxImages} imágenes, {formatFileSize(maxFileSize)} por archivo
            </p>
            {autoOptimize && (
              <Badge variant="secondary" className="mt-2">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Optimización automática habilitada
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas de optimización */}
      {optimizationStats && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Optimización completada: {formatFileSize(optimizationStats.originalSize)} → {formatFileSize(optimizationStats.compressedSize)}
            <Badge variant="outline" className="ml-2">
              {optimizationStats.savings.toFixed(1)}% de ahorro
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview de archivos */}
      {showPreview && files.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            Imágenes seleccionadas ({files.length}/{maxImages})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {file.preview ? (
                    <Image
                      src={file.preview}
                      alt={file.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {file.optimized && file.compressionRatio && (
                    <Badge variant="secondary" className="text-xs">
                      -{file.compressionRatio.toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progreso de subida */}
      {showProgress && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subiendo imágenes...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Botones de acción */}
      {files.length > 0 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setFiles([])}
            disabled={isProcessing}
          >
            Limpiar todo
          </Button>
          
          {onUpload && (
            <Button
              onClick={handleUpload}
              disabled={isProcessing || files.length === 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir {files.length} imagen{files.length !== 1 ? 'es' : ''}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedImageUploader
