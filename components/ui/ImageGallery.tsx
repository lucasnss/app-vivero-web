"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ImageGallery as NewImageGallery, ImageLightbox, type ImageItem } from "./ImageLightbox"

export interface ImageGalleryProps {
  images: string[]
  currentIndex?: number
  onImageChange?: (index: number) => void
  className?: string
  showCounter?: boolean
  showNavigation?: boolean
  allowZoom?: boolean
}

/**
 * @deprecated Use the new ImageGallery from ImageLightbox instead
 */
export const ImageGallery = React.forwardRef<HTMLDivElement, ImageGalleryProps>(
  ({ 
    images, 
    currentIndex = 0, 
    onImageChange,
    className,
    showCounter = true,
    showNavigation = true,
    allowZoom = true,
    ...props 
  }, ref) => {
    // Convertir props del componente antiguo al nuevo formato
    const imageItems: ImageItem[] = images.map((src, index) => ({
      src,
      alt: `Imagen ${index + 1}`,
    }))

    // Usar el nuevo componente con las props adaptadas
    return (
      <NewImageGallery
        ref={ref}
        images={imageItems}
        columns={1}
        className={className}
        lightboxProps={{
          initialIndex: currentIndex,
          showThumbnails: images.length > 1,
          showImageInfo: showCounter,
          allowDownload: false,
        }}
        {...props}
      />
    )
  }
)

ImageGallery.displayName = 'ImageGallery'

// Re-exportar los nuevos componentes para facilitar la migración
export { ImageLightbox, NewImageGallery as EnhancedImageGallery }