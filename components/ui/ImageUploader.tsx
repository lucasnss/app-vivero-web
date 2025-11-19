'use client'

import * as React from 'react'
import { AdvancedImageUploader } from './AdvancedImageUploader'
import { DEFAULT_IMAGE_CONFIG } from '../../src/types/product'
import { formatFileSize } from '../../src/lib/imageValidations'

export interface ImageUploaderProps {
  maxImages?: number
  acceptedFormats?: string[]
  maxSize?: number
  onImagesChange: (files: File[]) => void
  disabled?: boolean
  className?: string
  showProgress?: boolean
  showFileInfo?: boolean
}

/**
 * @deprecated Use AdvancedImageUploader instead
 */
export const ImageUploader = React.forwardRef<HTMLDivElement, ImageUploaderProps>(
  ({ 
    maxImages = DEFAULT_IMAGE_CONFIG.maxImages,
    acceptedFormats = DEFAULT_IMAGE_CONFIG.allowedFormats,
    maxSize = DEFAULT_IMAGE_CONFIG.maxSize,
    onImagesChange,
    disabled = false,
    className,
    showProgress = true,
    showFileInfo = true
  }, ref) => {
    // Convertir props del componente antiguo al nuevo formato
    return (
      <AdvancedImageUploader
        ref={ref}
        maxImages={maxImages}
        maxFileSize={maxSize}
        acceptedTypes={acceptedFormats}
        onImagesChange={onImagesChange}
        disabled={disabled}
        className={className}
        showProgress={showProgress}
        showPreview={showFileInfo}
        autoOptimize={true}
        dragDropText={`Arrastra imágenes aquí o haz clic para seleccionar (Máx. ${maxImages})`}
      />
    )
  }
)

ImageUploader.displayName = 'ImageUploader' 

// Re-exportar el componente avanzado para facilitar la migración
export { AdvancedImageUploader }