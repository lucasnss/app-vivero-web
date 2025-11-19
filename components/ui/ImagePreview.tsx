'use client'

import * as React from 'react'
import { useState, useCallback } from 'react'
import { 
  X, 
  Star, 
  StarOff, 
  Move, 
  ZoomIn, 
  Trash2, 
  Image as ImageIcon,
  AlertCircle 
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Badge } from './badge'
import { Alert, AlertDescription } from './alert'
import { Dialog, DialogContent, DialogTrigger } from './dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import { ImagePreview as ImagePreviewType } from '../../src/types/product'

export interface ImagePreviewProps {
  images: ImagePreviewType[]
  onDelete: (imageUrl: string) => void
  onReorder: (newOrder: ImagePreviewType[]) => void
  onSetMain: (imageUrl: string) => void
  disabled?: boolean
  className?: string
  showMainIndicator?: boolean
  showReorderButtons?: boolean
  showZoomButton?: boolean
  maxImages?: number
}

export const ImagePreview = React.memo(React.forwardRef<HTMLDivElement, ImagePreviewProps>(
  ({ 
    images,
    onDelete,
    onReorder,
    onSetMain,
    disabled = false,
    className,
    showMainIndicator = true,
    showReorderButtons = true,
    showZoomButton = true,
    maxImages = 3
  }, ref) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [zoomImage, setZoomImage] = useState<string | null>(null)

    // Función para manejar el inicio del drag
    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
      if (disabled) return
      setDraggedIndex(index)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/html', index.toString())
    }, [disabled])

    // Función para manejar el drag over
    const handleDragOver = useCallback((e: React.DragEvent) => {
      if (disabled) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }, [disabled])

    // Función para manejar el drop
    const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
      if (disabled || draggedIndex === null) return
      e.preventDefault()
      
      if (draggedIndex === dropIndex) return

      // Usar una función callback para obtener el estado actual de images
      const currentImages = images  // ImagePreviewType[]
      const [draggedItem] = currentImages.splice(draggedIndex, 1)
      currentImages.splice(dropIndex, 0, draggedItem)
      
      // Actualizar orders
      currentImages.forEach((img, index) => {
        img.order = index
      })
      
      onReorder(currentImages)
      setDraggedIndex(null)
    }, [disabled, draggedIndex, onReorder, images])  // Agregar images a dependencias si necesario, pero con memo es ok

    // Función para manejar el drag end
    const handleDragEnd = useCallback(() => {
      setDraggedIndex(null)
    }, [])

    // Función para eliminar imagen
    const handleDelete = useCallback((imageUrl: string) => {
      if (disabled) return
      onDelete(imageUrl)
    }, [disabled, onDelete])

    // Función para establecer imagen principal
    const handleSetMain = useCallback((imageUrl: string) => {
      if (disabled) return
      onSetMain(imageUrl)
    }, [disabled, onSetMain])

    // Función para abrir zoom
    const handleZoom = useCallback((imageUrl: string) => {
      setZoomImage(imageUrl)
    }, [])

    // Función para cerrar zoom
    const handleCloseZoom = useCallback(() => {
      setZoomImage(null)
    }, [])

    // Función para manejar mouse enter
    const handleMouseEnter = useCallback((index: number) => {
      setHoveredIndex(index)
    }, [])

    // Función para manejar mouse leave
    const handleMouseLeave = useCallback(() => {
      setHoveredIndex(null)
    }, [])

    if (images.length === 0) {
      return (
        <div className={cn("flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50", className)}>
          <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center">
            No hay imágenes para mostrar
          </p>
        </div>
      )
    }

    return (
      <TooltipProvider>
        <div ref={ref} className={cn("space-y-4", className)}>
          {/* Contador de imágenes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {images.length} / {maxImages} imágenes
              </Badge>
              {images.some(img => img.isMain) && (
                <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                  <Star className="w-3 h-3 mr-1" />
                  Principal
                </Badge>
              )}
            </div>
          </div>

          {/* Grid de imágenes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <Card
                key={`${image.url}-${index}`}
                className={cn(
                  "relative group overflow-hidden transition-all duration-200",
                  draggedIndex === index && "opacity-50 scale-95",
                  hoveredIndex === index && "ring-2 ring-blue-500",
                  disabled && "opacity-60 cursor-not-allowed"
                )}
                draggable={!disabled && showReorderButtons}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <CardContent className="p-0">
                  {/* Imagen */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={image.url}
                      alt={`Imagen ${index + 1} del producto`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.jpg'
                      }}
                    />
                    
                    {/* Overlay con controles */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* Botón de zoom */}
                        {showZoomButton && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                onClick={() => handleZoom(image.url)}
                                disabled={disabled}
                              >
                                <ZoomIn className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ampliar imagen</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* Botón de eliminar */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation(); // Evitar que el click burbujee al contenedor del formulario
                                handleDelete(image.url);
                              }}
                              disabled={disabled}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar imagen</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Indicador de imagen principal */}
                    {showMainIndicator && image.isMain && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Principal
                        </Badge>
                      </div>
                    )}

                    {/* Número de orden */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-black/70 text-white">
                        {index + 1}
                      </Badge>
                    </div>

                    {/* Indicador de drag */}
                    {showReorderButtons && !disabled && (
                      <div className="absolute bottom-2 left-2">
                        <div className="p-1 bg-black/50 rounded cursor-move">
                          <Move className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controles inferiores */}
                  <div className="p-3 space-y-2">
                    {/* Botón para establecer como principal */}
                    {showMainIndicator && !image.isMain && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar que el click burbujee al contenedor del formulario
                          handleSetMain(image.url);
                        }}
                        disabled={disabled}
                      >
                        <StarOff className="w-4 h-4 mr-2" />
                        Establecer como principal
                      </Button>
                    )}

                    {/* Información de la imagen */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="truncate" title={image.url}>
                        {image.url.split('/').pop() || 'Imagen'}
                      </p>
                      <p>Orden: {image.order}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instrucciones de reordenamiento */}
          {showReorderButtons && !disabled && images.length > 1 && (
            <Alert>
              <Move className="h-4 w-4" />
              <AlertDescription>
                Arrastra las imágenes para reordenarlas. La primera imagen será la principal.
              </AlertDescription>
            </Alert>
          )}

          {/* Dialog para zoom */}
          <Dialog open={!!zoomImage} onOpenChange={handleCloseZoom}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              {zoomImage && (
                <div className="relative">
                  <img
                    src={zoomImage}
                    alt="Vista ampliada"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-4 right-4"
                    onClick={handleCloseZoom}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    )
  }
))

ImagePreview.displayName = 'ImagePreview' 